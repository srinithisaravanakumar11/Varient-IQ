"""Temporal validation: train on an OLDER ClinVar release, test on variants that
are NEW in the current release (key not present in the old release), scored
with their current labels.

Inputs
  data/archive/out/clinvar_ml_dataset.csv   old release, from
      python src/preprocess_clinvar.py --input data/archive/variant_summary_2025-10.txt.gz --output-dir data/archive/out
  output/data/clinvar_ml_dataset.csv        current release
Training uses ALL chromosomes of the old release (90%); a random 10% of it picks
the decision threshold. AlphaMissense/gnomAD tables were prepared from the
current release's keys, so old variants that were later withdrawn have no score.

Outputs: output/data/temporal_results.json, output/reports/temporal_report.md
Usage:   python src/temporal_eval.py
"""
import json
from datetime import datetime

import numpy as np
import pandas as pd

from annotation_features import add_annotations
from features import CAT_COLS, NUM_BASE, NUM_GENE, engineer, impute
from gene_encoding import add_gene_features
from metrics import best_f1_threshold, bootstrap_ci, point_metrics
from paths import DATA_DIR, ML_DATASET, REPORTS_DIR, ROOT
from train_annotated import SETTINGS
from train_models import build_models, design_matrices

OLD = ROOT / "data" / "archive" / "out" / "clinvar_ml_dataset.csv"
MODELS = ["LightGBM", "Logistic Regression"]
SNV = "single nucleotide variant"


def frames(old, cur, flags):
    old, cur = engineer(old.copy()), engineer(cur.copy())
    new = cur[~cur["variant_key"].isin(set(old["variant_key"]))].copy()
    old, extra = add_annotations(old, **flags)
    new, _ = add_annotations(new, **flags)
    rng = np.random.default_rng(0)
    is_val = rng.random(len(old)) < 0.10
    train, val = old[~is_val].copy(), old[is_val].copy()
    add_gene_features(train, val, new)
    num_cols = NUM_BASE + NUM_GENE + extra
    impute(train, val, new, num_cols=num_cols)
    return train, val, new, num_cols, len(old), len(cur)


def main():
    if not OLD.exists():
        raise SystemExit(f"{OLD} missing - preprocess the archived release first (see docstring).")
    old = pd.read_csv(OLD, low_memory=False)
    cur = pd.read_csv(ML_DATASET, low_memory=False)
    out = {"generated": datetime.now().isoformat(), "settings": {}}
    for lab in ("ClinVar only", "+ both"):
        train, val, new, num_cols, n_old, n_cur = frames(old, cur, SETTINGS[lab])
        ytr, yva, yte = train["y"].values, val["y"].values, new["y"].values
        pw = (ytr == 0).sum() / max(1, (ytr == 1).sum())
        Xtr, Xva, Xte, _ = design_matrices(train, val, new, num_cols, CAT_COLS)
        print(f"== {lab}: train={len(train):,} val={len(val):,} new-variant test={len(new):,} "
              f"({yte.mean():.1%} pathogenic)")
        res = {"n_old_release": n_old, "n_current_release": n_cur, "n_train": len(train), "n_test_new": len(new),
               "test_pathogenic_rate": float(yte.mean()), "models": {}}
        groups = {"all new variants": np.ones(len(new), bool), "new SNVs": (new["Type"] == SNV).values,
                  "new non-SNVs": (new["Type"] != SNV).values}
        if "has_am" in new:
            groups["new scored missense SNVs"] = (new["has_am"] == 1).values
        for name in MODELS:
            m = build_models(0, pw)[name]
            m.fit(Xtr, ytr)
            thr = best_f1_threshold(yva, m.predict_proba(Xva)[:, 1])
            pt = m.predict_proba(Xte)[:, 1]
            res["models"][name] = {}
            for g, mask in groups.items():
                if mask.sum() < 200 or yte[mask].min() == yte[mask].max():
                    continue
                pm = point_metrics(yte[mask], pt[mask], thr)
                ci = bootstrap_ci(yte[mask], pt[mask], thr, n_boot=200)
                res["models"][name][g] = {"n": int(mask.sum()), "pathogenic_rate": float(yte[mask].mean()),
                                          **{k: pm[k] for k in ("ROC-AUC", "PR-AUC", "F1")},
                                          "ROC-AUC_ci": ci["ROC-AUC"], "PR-AUC_ci": ci["PR-AUC"]}
                print(f"  {name:20s} {g:26s} n={mask.sum():>7,} ROC={pm['ROC-AUC']:.3f} PR={pm['PR-AUC']:.3f}")
        out["settings"][lab] = res
    (DATA_DIR / "temporal_results.json").write_text(json.dumps(out, indent=2), encoding="utf-8")

    first = next(iter(out["settings"].values()))
    L = ["# Temporal validation: train on older release, test on newly added variants", "",
         f"Train: {first['n_train']:,} variants from the older release (random 10% held out to pick the threshold). "
         f"Test: {first['n_test_new']:,} variants present in the current release but not the older one "
         f"({first['test_pathogenic_rate']:.1%} pathogenic). 95% bootstrap CIs in brackets.", ""]
    for lab, s in out["settings"].items():
        L += [f"## {lab}", "", "| Model | Group | n | Pathogenic rate | ROC-AUC | PR-AUC | F1 |", "|---|---|---|---|---|---|---|"]
        for name, gs in s["models"].items():
            for g, v in gs.items():
                L.append(f"| {name} | {g} | {v['n']:,} | {v['pathogenic_rate']:.1%} | "
                         f"{v['ROC-AUC']:.3f} [{v['ROC-AUC_ci'][0]:.3f}, {v['ROC-AUC_ci'][1]:.3f}] | "
                         f"{v['PR-AUC']:.3f} [{v['PR-AUC_ci'][0]:.3f}, {v['PR-AUC_ci'][1]:.3f}] | {v['F1']:.3f} |")
        L.append("")
    L += ["## Caveats", "",
          "- Variants whose label changed between releases (reclassified) are not tested here, only newly added variants.",
          "- New submissions differ in type mix and review status from older ones, so prevalence shifts between train and test.",
          "- Random (not chromosome) split inside the old release is used only to choose the threshold.",
          "- Not a clinically validated tool."]
    (REPORTS_DIR / "temporal_report.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print("wrote temporal_results.json / temporal_report.md")


if __name__ == "__main__":
    main()
