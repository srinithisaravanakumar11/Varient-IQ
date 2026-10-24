"""Three remaining tuning questions, all on the chromosome hold-out.

1. Position ablation   Do the raw `PositionVCF` / `Stop` numbers help or hurt across
                       chromosomes? (ClinVar-only and + AlphaMissense + gnomAD features.)
2. Threshold/calibration  The F1 threshold tuned on the validation chromosomes
                       transferred badly for some tree models. Compare: (a) max-F1 on
                       validation (current), (b) isotonic calibration fitted on half the
                       validation rows + threshold on the other half, (c) the lowest
                       threshold reaching 80% validation precision.
3. Hyperparameter search  Random search for LightGBM and XGBoost scored by chromosome-grouped
                       CV on the training chromosomes (a row subsample for speed), then
                       refit on all training rows. The test set is used once at the end.

Selection of the position setting and of the hyperparameters uses validation/CV only.
Outputs: output/data/tuning_results.json, output/reports/tuning_report.md
Usage:   python src/tuning.py [--lgb-configs 12] [--xgb-configs 8] [--search-rows 600000]
"""
import argparse
import json
import time
import warnings
from datetime import datetime

import lightgbm as lgb
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import average_precision_score, precision_recall_curve
from sklearn.model_selection import GroupKFold

from annotation_features import add_annotations
from features import CAT_COLS, NUM_BASE, NUM_GENE, engineer, impute, split
from gene_encoding import add_gene_features
from metrics import best_f1_threshold, bootstrap_ci, point_metrics
from paths import DATA_DIR, ML_DATASET, REPORTS_DIR
from train_annotated import SETTINGS
from train_models import build_models, design_matrices

warnings.filterwarnings("ignore")
NO_POS = [c for c in NUM_BASE if c not in ("PositionVCF", "Stop")]
LGB_DEFAULT = dict(n_estimators=300, learning_rate=0.05, num_leaves=63, min_child_samples=20,
                   subsample=1.0, colsample_bytree=1.0, reg_lambda=0.0)
XGB_DEFAULT = dict(n_estimators=200, learning_rate=0.05, max_depth=8, min_child_weight=1,
                   subsample=1.0, colsample_bytree=1.0, reg_lambda=1.0)


def say(*a):
    print(*a, flush=True)


def frames(raw, flags, num_base):
    df, extra = add_annotations(engineer(raw.copy()), **flags)
    train, val, test, _ = split(df)
    add_gene_features(train, val, test)
    num_cols = num_base + NUM_GENE + extra
    impute(train, val, test, num_cols=num_cols)
    X = design_matrices(train, val, test, num_cols, CAT_COLS)[:3]
    return train, val, test, X


def make_lgb(p, seed=0):
    return lgb.LGBMClassifier(**p, subsample_freq=1, class_weight="balanced", n_jobs=-1,
                              random_state=seed, verbose=-1)


def make_xgb(p, pos_weight, seed=0):
    return xgb.XGBClassifier(**p, scale_pos_weight=pos_weight, n_jobs=-1, eval_metric="logloss",
                             random_state=seed, tree_method="hist")


def fit_eval(model, X, y_tr, y_va, y_te, boot=100):
    Xtr, Xva, Xte = X
    model.fit(Xtr, y_tr)
    pv, pt = model.predict_proba(Xva)[:, 1], model.predict_proba(Xte)[:, 1]
    thr = best_f1_threshold(y_va, pv)
    return {"val": point_metrics(y_va, pv, thr), "test": point_metrics(y_te, pt, thr),
            "test_ci95": bootstrap_ci(y_te, pt, thr, n_boot=boot), "threshold": thr}, pv, pt


# ---------------------------------------------------------------- 1. position ablation
def position_ablation(raw):
    rows = []
    for feats in ("ClinVar only", "+ both"):
        for pos_label, nb in (("with position", NUM_BASE), ("without position", NO_POS)):
            train, val, test, X = frames(raw, SETTINGS[feats], nb)
            ytr, yva, yte = train["y"].values, val["y"].values, test["y"].values
            pw = (ytr == 0).sum() / max(1, (ytr == 1).sum())
            for name in ("LightGBM", "Logistic Regression"):
                r, _, _ = fit_eval(build_models(0, pw)[name], X, ytr, yva, yte)
                rows.append({"features": feats, "position": pos_label, "model": name,
                             "val": {k: r["val"][k] for k in ("ROC-AUC", "PR-AUC", "F1")},
                             "test": {k: r["test"][k] for k in ("ROC-AUC", "PR-AUC", "F1")},
                             "test_ci95": {k: r["test_ci95"][k] for k in ("ROC-AUC", "PR-AUC")}})
                say(f"[1] {feats:12s} {pos_label:16s} {name:20s} val PR={r['val']['PR-AUC']:.4f} "
                    f"test ROC={r['test']['ROC-AUC']:.4f} PR={r['test']['PR-AUC']:.4f}")
    # choose on VALIDATION PR-AUC of LightGBM with all features
    pick = {r["position"]: r["val"]["PR-AUC"] for r in rows if r["features"] == "+ both" and r["model"] == "LightGBM"}
    use_pos = pick["with position"] >= pick["without position"] + 0.002  # keep position only if clearly better
    return rows, (NUM_BASE if use_pos else NO_POS), ("with position" if use_pos else "without position")


# ---------------------------------------------------------------- 3. hyperparameter search
def sample_lgb(rng):
    return dict(n_estimators=int(rng.choice([150, 300, 500])), learning_rate=float(rng.choice([0.02, 0.05, 0.1])),
                num_leaves=int(rng.choice([15, 31, 63, 127, 255])), min_child_samples=int(rng.choice([20, 50, 100, 300])),
                subsample=float(rng.choice([0.7, 0.85, 1.0])), colsample_bytree=float(rng.choice([0.6, 0.8, 1.0])),
                reg_lambda=float(rng.choice([0.0, 1.0, 10.0])))


def sample_xgb(rng):
    return dict(n_estimators=int(rng.choice([150, 300, 500])), learning_rate=float(rng.choice([0.03, 0.05, 0.1])),
                max_depth=int(rng.choice([4, 6, 8, 10])), min_child_weight=float(rng.choice([1, 5, 20])),
                subsample=float(rng.choice([0.7, 1.0])), colsample_bytree=float(rng.choice([0.6, 1.0])),
                reg_lambda=float(rng.choice([1.0, 10.0])))


def cv_pr_auc(make, params, Xs, ys, groups):
    scores = []
    for tr, va in GroupKFold(n_splits=4).split(Xs, ys, groups):
        m = make(params)
        m.fit(Xs[tr], ys[tr])
        scores.append(average_precision_score(ys[va], m.predict_proba(Xs[va])[:, 1]))
    return float(np.mean(scores)), float(np.std(scores))


def search(kind, n_configs, train, X, ytr, search_rows, pos_weight):
    rng = np.random.default_rng(0)
    idx = rng.choice(len(train), size=min(search_rows, len(train)), replace=False)
    Xs, ys, groups = X[0][idx], ytr[idx], train["Chr_Str"].values[idx]
    make = (lambda p: make_lgb(p)) if kind == "LightGBM" else (lambda p: make_xgb(p, pos_weight))
    sampler, default = (sample_lgb, LGB_DEFAULT) if kind == "LightGBM" else (sample_xgb, XGB_DEFAULT)
    configs = [default] + [sampler(rng) for _ in range(n_configs)]
    out = []
    for i, p in enumerate(configs):
        t0 = time.time()
        mean, std = cv_pr_auc(make, p, Xs, ys, groups)
        out.append({"params": p, "cv_pr_auc": mean, "cv_pr_auc_std": std, "is_default": i == 0})
        say(f"[3] {kind} cfg {i:2d}{' (default)' if i == 0 else ''}: CV PR-AUC={mean:.4f}±{std:.4f} ({time.time() - t0:.0f}s) {p}")
    best = max(out, key=lambda r: r["cv_pr_auc"])
    return out, best


# ---------------------------------------------------------------- 2. thresholds / calibration
def threshold_strategies(yva, pv, yte, pt, seed=0):
    rng = np.random.default_rng(seed)
    half = rng.random(len(yva)) < 0.5
    res = {}
    thr_a = best_f1_threshold(yva, pv)
    res["(a) max-F1 on validation"] = point_metrics(yte, pt, thr_a)
    iso = IsotonicRegression(out_of_bounds="clip").fit(pv[half], yva[half])
    thr_b = best_f1_threshold(yva[~half], iso.predict(pv[~half]))
    res["(b) isotonic calibration + max-F1 on held-out half"] = point_metrics(yte, iso.predict(pt), thr_b)
    prec, rec, thr = precision_recall_curve(yva, pv)
    ok = np.where(prec[:-1] >= 0.80)[0]
    thr_c = float(thr[ok[0]]) if len(ok) else thr_a
    res["(c) lowest threshold with 80% validation precision"] = point_metrics(yte, pt, thr_c)
    res["reference: test-tuned threshold (not a valid method)"] = point_metrics(yte, pt, best_f1_threshold(yte, pt))
    return {k: {m: v[m] for m in ("Precision", "Recall", "F1", "Brier", "ECE")} for k, v in res.items()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lgb-configs", type=int, default=12)
    ap.add_argument("--xgb-configs", type=int, default=8)
    ap.add_argument("--search-rows", type=int, default=600_000)
    args = ap.parse_args()
    t_start = time.time()
    raw = pd.read_csv(ML_DATASET, low_memory=False)
    out = {"generated": datetime.now().isoformat()}

    out["position_ablation"], num_base, pos_choice = position_ablation(raw)
    out["position_choice_by_validation"] = pos_choice
    say(f"position setting chosen on validation: {pos_choice}")

    train, val, test, X = frames(raw, SETTINGS["+ both"], num_base)
    ytr, yva, yte = train["y"].values, val["y"].values, test["y"].values
    pw = (ytr == 0).sum() / max(1, (ytr == 1).sum())

    out["search"], final = {}, {}
    probs = {}
    for kind in ("LightGBM", "XGBoost"):
        n = args.lgb_configs if kind == "LightGBM" else args.xgb_configs
        results, best = search(kind, n, train, X, ytr, args.search_rows, pw)
        out["search"][kind] = {"configs": results, "best": best}
        make = (lambda p: make_lgb(p)) if kind == "LightGBM" else (lambda p: make_xgb(p, pw))
        default = LGB_DEFAULT if kind == "LightGBM" else XGB_DEFAULT
        final[kind] = {}
        for label, p in (("default", default), ("tuned", best["params"])):
            r, pv, pt = fit_eval(make(p), X, ytr, yva, yte)
            final[kind][label] = {"params": p, **{k: r[k] for k in ("val", "test", "test_ci95", "threshold")}}
            probs[(kind, label)] = (pv, pt)
            say(f"[3] final {kind} {label}: test ROC={r['test']['ROC-AUC']:.4f} PR={r['test']['PR-AUC']:.4f} F1={r['test']['F1']:.4f}")
    out["final_models"] = final

    out["thresholds"] = {}
    for label, flags in SETTINGS.items():  # default LightGBM on every feature set
        tr2, va2, te2, X2 = frames(raw, flags, num_base)
        y2tr, y2va, y2te = tr2["y"].values, va2["y"].values, te2["y"].values
        m = make_lgb(LGB_DEFAULT)
        m.fit(X2[0], y2tr)
        out["thresholds"][f"default LightGBM, {label}"] = threshold_strategies(
            y2va, m.predict_proba(X2[1])[:, 1], y2te, m.predict_proba(X2[2])[:, 1])
        say(f"[2] done {label}")
    for kind in ("LightGBM", "XGBoost"):
        pv, pt = probs[(kind, "tuned")]
        out["thresholds"][f"tuned {kind}, + both"] = threshold_strategies(yva, pv, yte, pt)

    out["runtime_minutes"] = (time.time() - t_start) / 60
    (DATA_DIR / "tuning_results.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    write_report(out)
    say("wrote tuning_results.json / tuning_report.md")


def write_report(o):
    L = ["# Tuning results (chromosome hold-out)", "", f"Generated {o['generated']}.", "",
         "## 1. Raw position features (`PositionVCF`, `Stop`)", "",
         "| Features | Position | Model | Val PR-AUC | Test ROC-AUC | Test PR-AUC | Test F1 |", "|---|---|---|---|---|---|---|"]
    for r in o["position_ablation"]:
        c = r["test_ci95"]
        L.append(f"| {r['features']} | {r['position']} | {r['model']} | {r['val']['PR-AUC']:.3f} | "
                 f"{r['test']['ROC-AUC']:.3f} [{c['ROC-AUC'][0]:.3f}, {c['ROC-AUC'][1]:.3f}] | "
                 f"{r['test']['PR-AUC']:.3f} [{c['PR-AUC'][0]:.3f}, {c['PR-AUC'][1]:.3f}] | {r['test']['F1']:.3f} |")
    L += ["", f"Setting chosen on validation PR-AUC (position kept only if it beats removal by 0.002): **{o['position_choice_by_validation']}**.", "",
          "## 2. Thresholds and calibration (test metrics)", "",
          "| Model / features | Strategy | Precision | Recall | F1 | Brier | ECE |", "|---|---|---|---|---|---|---|"]
    for name, strat in o["thresholds"].items():
        for s, m in strat.items():
            L.append(f"| {name} | {s} | {m['Precision']:.3f} | {m['Recall']:.3f} | {m['F1']:.3f} | {m['Brier']:.3f} | {m['ECE']:.3f} |")
    L += ["", "## 3. Hyperparameter search (chromosome-grouped 4-fold CV on a training subsample, PR-AUC)", ""]
    for kind, s in o["search"].items():
        cfgs = sorted(s["configs"], key=lambda r: -r["cv_pr_auc"])
        L += [f"### {kind}", "", "| Rank | CV PR-AUC | Default? | Parameters |", "|---|---|---|---|"]
        for i, c in enumerate(cfgs[:6], 1):
            L.append(f"| {i} | {c['cv_pr_auc']:.4f} ± {c['cv_pr_auc_std']:.4f} | {'yes' if c['is_default'] else ''} | `{c['params']}` |")
        L.append("")
    L += ["### Refit on all training rows, test metrics", "",
          "| Model | Setting | ROC-AUC | PR-AUC | F1 | Precision | Recall |", "|---|---|---|---|---|---|---|"]
    for kind, d in o["final_models"].items():
        for label, r in d.items():
            c = r["test_ci95"]
            L.append(f"| {kind} | {label} | {r['test']['ROC-AUC']:.3f} [{c['ROC-AUC'][0]:.3f}, {c['ROC-AUC'][1]:.3f}] | "
                     f"{r['test']['PR-AUC']:.3f} [{c['PR-AUC'][0]:.3f}, {c['PR-AUC'][1]:.3f}] | {r['test']['F1']:.3f} | "
                     f"{r['test']['Precision']:.3f} | {r['test']['Recall']:.3f} |")
    L += ["", "## Notes", "",
          "- The search uses a row subsample and the out-of-fold gene encoding built on all training rows, so CV is slightly optimistic for every config equally.",
          "- The test set is used once per final model; configs and the position setting are chosen on CV/validation only.",
          "- Not a clinically validated tool."]
    (REPORTS_DIR / "tuning_report.md").write_text("\n".join(L) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
