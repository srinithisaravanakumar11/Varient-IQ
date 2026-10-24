"""Label-quality sensitivity check: are the results driven by noisy single-submitter labels?

High confidence = ReviewStatus of 2+ stars (multiple submitters without conflict,
expert panel, practice guideline). Low = "criteria provided, single submitter".

For ClinVar-only and ClinVar + AlphaMissense + gnomAD features, and with/without
ReviewStatus as a feature, models are trained on (a) all labels or (b) only
high-confidence labels, and always tested on the chromosome hold-out split into
high-confidence, single-submitter, and all rows. The threshold is tuned on the
validation rows that match the training condition.

Outputs: output/data/high_confidence.json, output/reports/high_confidence_report.md
Usage:   python src/high_confidence.py
"""
import json
from datetime import datetime

import pandas as pd

from annotation_features import add_annotations
from features import CAT_COLS, NUM_BASE, NUM_GENE, engineer, impute, split
from gene_encoding import add_gene_features
from metrics import best_f1_threshold, bootstrap_ci, point_metrics
from paths import DATA_DIR, ML_DATASET, REPORTS_DIR
from train_annotated import SETTINGS
from train_models import build_models, design_matrices

MODELS = ["LightGBM", "Logistic Regression"]
LOW = "criteria provided, single submitter"


def frames(raw, flags, train_hc_only):
    df, extra = add_annotations(engineer(raw.copy()), **flags)
    train, val, test, _ = split(df)
    if train_hc_only:
        train, val = train[train["ReviewStatus"] != LOW].copy(), val[val["ReviewStatus"] != LOW].copy()
    add_gene_features(train, val, test)
    num_cols = NUM_BASE + NUM_GENE + extra
    impute(train, val, test, num_cols=num_cols)
    return train, val, test, num_cols


def main():
    raw = pd.read_csv(ML_DATASET, low_memory=False)
    out = {"generated": datetime.now().isoformat(), "runs": []}
    for feats in ("ClinVar only", "+ both"):
        for hc_only in (False, True):
            train, val, test, num_cols = frames(raw, SETTINGS[feats], hc_only)
            ytr, yva, yte = train["y"].values, val["y"].values, test["y"].values
            pw = (ytr == 0).sum() / max(1, (ytr == 1).sum())
            hc = (test["ReviewStatus"] != LOW).values
            groups = {"high-confidence (2+ stars)": hc, "single submitter (1 star)": ~hc, "all test": hc | ~hc}
            for with_review in (True, False):
                cats = CAT_COLS if with_review else [c for c in CAT_COLS if c != "ReviewStatus"]
                Xtr, Xva, Xte, _ = design_matrices(train, val, test, num_cols, cats)
                for name in MODELS:
                    m = build_models(0, pw)[name]
                    m.fit(Xtr, ytr)
                    thr = best_f1_threshold(yva, m.predict_proba(Xva)[:, 1])
                    pt = m.predict_proba(Xte)[:, 1]
                    row = {"features": feats, "train_on": "high-confidence only" if hc_only else "all labels",
                           "review_status_feature": with_review, "model": name, "n_train": len(train), "test": {}}
                    for g, mask in groups.items():
                        pm = point_metrics(yte[mask], pt[mask], thr)
                        ci = bootstrap_ci(yte[mask], pt[mask], thr, n_boot=100)
                        row["test"][g] = {"n": int(mask.sum()), "pathogenic_rate": float(yte[mask].mean()),
                                          "ROC-AUC": pm["ROC-AUC"], "PR-AUC": pm["PR-AUC"], "F1": pm["F1"],
                                          "ROC-AUC_ci": ci["ROC-AUC"], "PR-AUC_ci": ci["PR-AUC"]}
                    out["runs"].append(row)
                    t = row["test"]["high-confidence (2+ stars)"]
                    print(f"{feats:13s} train={row['train_on']:21s} review={with_review!s:5s} {name:20s} "
                          f"HC ROC={t['ROC-AUC']:.3f} PR={t['PR-AUC']:.3f}", flush=True)
    (DATA_DIR / "high_confidence.json").write_text(json.dumps(out, indent=2), encoding="utf-8")

    L = ["# Label-quality sensitivity (chromosome hold-out, seed 0)", "",
         "High confidence = 2+ review stars. 95% bootstrap CIs (100 resamples) in brackets.", ""]
    for g in ("high-confidence (2+ stars)", "single submitter (1 star)", "all test"):
        n = out["runs"][0]["test"][g]["n"]
        pr = out["runs"][0]["test"][g]["pathogenic_rate"]
        L += [f"## Test rows: {g} (n = {n:,}, {pr:.1%} pathogenic)", "",
              "| Features | Trained on | ReviewStatus feature | Model | ROC-AUC | PR-AUC | F1 |", "|---|---|---|---|---|---|---|"]
        for r in out["runs"]:
            t = r["test"][g]
            L.append(f"| {r['features']} | {r['train_on']} | {'yes' if r['review_status_feature'] else 'no'} | {r['model']} | "
                     f"{t['ROC-AUC']:.3f} [{t['ROC-AUC_ci'][0]:.3f}, {t['ROC-AUC_ci'][1]:.3f}] | "
                     f"{t['PR-AUC']:.3f} [{t['PR-AUC_ci'][0]:.3f}, {t['PR-AUC_ci'][1]:.3f}] | {t['F1']:.3f} |")
        L.append("")
    L += ["## Notes", "",
          "- Prevalence differs between groups, so compare ROC-AUC across groups and PR-AUC only within a group.",
          "- Not a clinically validated tool."]
    (REPORTS_DIR / "high_confidence_report.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print("wrote high_confidence.json / high_confidence_report.md")


if __name__ == "__main__":
    main()
