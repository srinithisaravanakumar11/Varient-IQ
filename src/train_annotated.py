"""Does adding REAL external annotations help? Same chromosome hold-out, same
validation-tuned threshold, same models as train_models.py.

Feature sets compared:
  ClinVar only            (identical to the baseline)
  + gnomAD constraint     gene-level LOEUF / pLI / missense z / missense o/e
  + AlphaMissense         missense-SNV score + has_am indicator
  + both

Outputs: output/data/annotated_results.json, output/reports/annotated_report.md
(the baseline files are left untouched).
Usage:   python src/train_annotated.py [--seeds 3] [--models LightGBM,XGBoost,"Logistic Regression"]
Needs:   python src/prepare_annotations.py to have been run.
"""
import argparse
import json
import time
import warnings
from datetime import datetime

import numpy as np
import pandas as pd

from annotation_features import add_annotations
from features import CAT_COLS, NUM_BASE, NUM_GENE, engineer, impute, split
from gene_encoding import add_gene_features
from metrics import bootstrap_ci, point_metrics, best_f1_threshold
from paths import DATA_DIR, ML_DATASET, REPORTS_DIR
from train_models import build_models, design_matrices

warnings.filterwarnings("ignore")
RESULTS_PATH = DATA_DIR / "annotated_results.json"
REPORT_PATH = REPORTS_DIR / "annotated_report.md"

SETTINGS = {
    "ClinVar only": dict(alphamissense=False, gene_constraint=False),
    "+ gnomAD constraint": dict(alphamissense=False, gene_constraint=True),
    "+ AlphaMissense": dict(alphamissense=True, gene_constraint=False),
    "+ both": dict(alphamissense=True, gene_constraint=True),
}


def build_frames(raw, **flags):
    df, extra = add_annotations(engineer(raw.copy()), **flags)
    train, val, test, _ = split(df)
    add_gene_features(train, val, test)
    num_cols = NUM_BASE + NUM_GENE + extra
    impute(train, val, test, num_cols=num_cols)
    return train, val, test, num_cols


def run_setting(raw, flags, models, seeds, boot):
    train, val, test, num_cols = build_frames(raw, **flags)
    ytr, yva, yte = train["y"].values, val["y"].values, test["y"].values
    pos_weight = (ytr == 0).sum() / max(1, (ytr == 1).sum())
    Xtr, Xva, Xte, _ = design_matrices(train, val, test, num_cols, CAT_COLS)
    out = {"n_features": int(Xtr.shape[1]), "models": {}}
    for name in models:
        runs, probs0, thr0 = [], None, None
        for seed in range(seeds):
            m = build_models(seed, pos_weight)[name]
            t0 = time.time()
            m.fit(Xtr, ytr)
            pv, pt = m.predict_proba(Xva)[:, 1], m.predict_proba(Xte)[:, 1]
            thr = best_f1_threshold(yva, pv)
            runs.append(point_metrics(yte, pt, thr))
            if seed == 0:
                probs0, thr0 = pt, thr
            print(f"  {name:20s} seed={seed} PR-AUC={runs[-1]['PR-AUC']:.4f} ROC={runs[-1]['ROC-AUC']:.4f} ({time.time() - t0:.0f}s)")
        out["models"][name] = {
            "mean": {k: float(np.mean([r[k] for r in runs])) for k in runs[0]},
            "std": {k: float(np.std([r[k] for r in runs])) for k in runs[0]},
            "ci95_seed0": bootstrap_ci(yte, probs0, thr0, n_boot=boot),
            "_probs0": probs0, "_thr0": thr0,
        }
    out["_test"] = test[["y", "Type"] + (["has_am"] if "has_am" in test else [])].reset_index(drop=True)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seeds", type=int, default=3)
    ap.add_argument("--boot", type=int, default=200)
    ap.add_argument("--models", default="LightGBM,XGBoost,Logistic Regression")
    args = ap.parse_args()
    models = [m.strip() for m in args.models.split(",")]

    raw = pd.read_csv(ML_DATASET, low_memory=False)
    res, t_start = {}, time.time()
    for label, flags in SETTINGS.items():
        print(f"== {label}")
        res[label] = run_setting(raw, flags, models, args.seeds, args.boot)

    # Subset view: missense SNVs that AlphaMissense scores (same rows for every setting).
    full = res["+ both"]["_test"]
    mask = full["has_am"].values == 1
    subset = {}
    for label, r in res.items():
        y = r["_test"]["y"].values
        # `has_am` only exists in AlphaMissense settings; rows are identical across
        # settings (same split), so reuse the mask from "+ both".
        subset[label] = {
            name: {k: v for k, v in point_metrics(y[mask], m["_probs0"][mask], m["_thr0"]).items()
                   if k in ("ROC-AUC", "PR-AUC", "F1")}
            for name, m in r["models"].items()}
    clean = {lab: {"n_features": r["n_features"],
                   "models": {n: {k: v for k, v in m.items() if not k.startswith("_")}
                              for n, m in r["models"].items()}} for lab, r in res.items()}
    out = {"generated": datetime.now().isoformat(), "seeds": args.seeds, "settings": clean,
           "scored_missense_subset": {"n": int(mask.sum()), "pathogenic_rate": float(full["y"].values[mask].mean()),
                                      "metrics_seed0": subset},
           "test_coverage_has_am": float(mask.mean()), "runtime_minutes": (time.time() - t_start) / 60}
    RESULTS_PATH.write_text(json.dumps(out, indent=2), encoding="utf-8")
    write_report(out)
    print(f"wrote {RESULTS_PATH} and {REPORT_PATH}")


def write_report(o):
    L = ["# Effect of real external annotations (chromosome hold-out)", "",
         f"Generated {o['generated']}. {o['seeds']} seeds; threshold tuned on validation (max F1). "
         "Annotations: AlphaMissense (hg38 scores) and gnomAD v4.1 gene constraint; see "
         "`data/annotations/SOURCES.md`.", "",
         "## Test metrics, all test variants (mean ± std over seeds)", "",
         "| Features | Model | ROC-AUC | PR-AUC | F1 | Precision | Recall |", "|---|---|---|---|---|---|---|"]
    for lab, s in o["settings"].items():
        for n, m in s["models"].items():
            L.append(f"| {lab} | {n} | " + " | ".join(
                f"{m['mean'][k]:.3f} ± {m['std'][k]:.3f}" for k in ("ROC-AUC", "PR-AUC", "F1", "Precision", "Recall")) + " |")
    sub = o["scored_missense_subset"]
    L += ["", f"## Subset: test variants AlphaMissense can score (n = {sub['n']:,}, "
          f"{o['test_coverage_has_am']:.1%} of test, {sub['pathogenic_rate']:.1%} pathogenic; seed 0)", "",
          "| Features | Model | ROC-AUC | PR-AUC | F1 |", "|---|---|---|---|---|"]
    for lab, d in sub["metrics_seed0"].items():
        for n, m in d.items():
            L.append(f"| {lab} | {n} | {m['ROC-AUC']:.3f} | {m['PR-AUC']:.3f} | {m['F1']:.3f} |")
    L += ["", "## Notes", "",
          "- AlphaMissense only scores missense SNVs; all other variants have a missing score (median-filled plus `has_am = 0`).",
          "- `has_am` marks missense SNVs, so part of any gain can come from knowing the variant is missense, not only from the score.",
          "- AlphaMissense data is licensed CC BY-NC-SA 4.0 (non-commercial).",
          "- Not a clinically validated tool."]
    REPORT_PATH.write_text("\n".join(L) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
