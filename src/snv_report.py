"""Where do the annotations help? Break the chromosome hold-out test set into
variant groups and compare ClinVar-only against ClinVar + both annotations.

Groups: scored missense SNV (AlphaMissense has a score), other SNV, non-SNV
(deletions, duplications, indels, microsatellites, ...).

Outputs: output/data/snv_report.json, output/reports/snv_report.md
Usage:   python src/snv_report.py
"""
import json
from datetime import datetime

import numpy as np
import pandas as pd

from metrics import bootstrap_ci, point_metrics
from paths import DATA_DIR, ML_DATASET, REPORTS_DIR
from train_annotated import SETTINGS, run_setting

MODELS = ["LightGBM", "Logistic Regression"]
SNV = "single nucleotide variant"


def main():
    raw = pd.read_csv(ML_DATASET, low_memory=False)
    res = {lab: run_setting(raw, SETTINGS[lab], MODELS, seeds=1, boot=10)
           for lab in ("ClinVar only", "+ both")}
    t = res["+ both"]["_test"]
    groups = {
        "scored missense SNV": (t["has_am"] == 1).values,
        "other SNV": ((t["Type"] == SNV) & (t["has_am"] == 0)).values,
        "non-SNV": (t["Type"] != SNV).values,
        "all SNV": (t["Type"] == SNV).values,
    }
    out = {"generated": datetime.now().isoformat(), "groups": {}}
    for g, m in groups.items():
        y = t["y"].values[m]
        rows = {"n": int(m.sum()), "pathogenic_rate": float(y.mean()), "metrics": {}}
        for lab, r in res.items():
            for name in MODELS:
                p, thr = r["models"][name]["_probs0"][m], r["models"][name]["_thr0"]
                pm = point_metrics(y, p, thr)
                ci = bootstrap_ci(y, p, thr, n_boot=200)
                rows["metrics"][f"{lab} | {name}"] = {
                    "ROC-AUC": pm["ROC-AUC"], "PR-AUC": pm["PR-AUC"], "F1": pm["F1"],
                    "ROC-AUC_ci": ci["ROC-AUC"], "PR-AUC_ci": ci["PR-AUC"]}
        out["groups"][g] = rows
    (DATA_DIR / "snv_report.json").write_text(json.dumps(out, indent=2), encoding="utf-8")

    L = ["# Test performance by variant group (seed 0, threshold from validation)", "",
         "ClinVar-only vs ClinVar + AlphaMissense + gnomAD constraint. 95% bootstrap CIs in brackets.", ""]
    for g, v in out["groups"].items():
        L += [f"## {g} (n = {v['n']:,}, {v['pathogenic_rate']:.1%} pathogenic)", "",
              "| Features | Model | ROC-AUC | PR-AUC | F1 |", "|---|---|---|---|---|"]
        for k, m in v["metrics"].items():
            lab, name = k.split(" | ")
            L.append(f"| {lab} | {name} | {m['ROC-AUC']:.3f} [{m['ROC-AUC_ci'][0]:.3f}, {m['ROC-AUC_ci'][1]:.3f}] | "
                     f"{m['PR-AUC']:.3f} [{m['PR-AUC_ci'][0]:.3f}, {m['PR-AUC_ci'][1]:.3f}] | {m['F1']:.3f} |")
        L.append("")
    (REPORTS_DIR / "snv_report.md").write_text("\n".join(L), encoding="utf-8")
    print("wrote snv_report.json / snv_report.md")


if __name__ == "__main__":
    main()
