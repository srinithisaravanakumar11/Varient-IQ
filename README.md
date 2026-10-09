# VariantIQ: ClinVar Variant Pathogenicity Prediction

Binary classification (Pathogenic vs Benign) of ~1.7 million ClinVar variants.
The project builds a leakage-free baseline from ClinVar's own columns, then tests
whether **real external annotations** (AlphaMissense, gnomAD constraint) help, and
stress-tests the result across variant types, ClinVar releases, label quality and
tuning choices. Everything uses a **chromosome hold-out**, validation-tuned
thresholds, multiple seeds and bootstrap confidence intervals.

Current release: **v0.3**. Research code, not a clinically validated tool.

> **Honesty note.** An earlier version of this project reported near-perfect
> scores (PR-AUC ≈ 0.9998) using gnomAD/CADD/SIFT/PolyPhen/phastCons values that
> were *simulated from the label*, plus random "sequence" features. Those results
> were invalid; see [docs/phase8_leakage_audit.md](docs/phase8_leakage_audit.md).
> That pipeline was removed and rebuilt. No value in the current results is
> simulated: annotations are looked up from published tables, and variants
> without a score stay missing.

## Headline results

Test = chromosomes 21, 22, X, Y, MT (135,521 variants; train chr 1-17 = 1,415,482;
validation chr 18-20 = 151,323).

| Stage | Best ROC-AUC | Best PR-AUC |
|---|---|---|
| ClinVar-only features (5 models) | 0.812 | 0.684 |
| + gnomAD gene constraint | 0.821 | 0.691 |
| + AlphaMissense | 0.871 | 0.774 |
| + both | 0.873 | 0.775 |
| + both, tuned LightGBM | **0.874** | **0.779** |

What to take away:

- ClinVar's own columns top out around 0.81 ROC-AUC, and no model is clearly best.
- **Nearly all of the improvement comes from AlphaMissense on missense SNVs.** About
  85% of test variants (other SNVs, deletions, duplications, indels) get no benefit.
- Tuning and model choice move results by about 0.01 or less; with AlphaMissense
  a plain Logistic Regression matches the boosted trees. The limit is information,
  not modelling.

## Pipeline

1. **Dataset** (`preprocess_clinvar.py`): clean the ClinVar `variant_summary`, keep
   clear Pathogenic / Benign labels, drop duplicates and conflicts.
2. **Split** (`features.py`): chromosome hold-out. Neighbouring variants are
   similar, so a random split would let models memorise neighbours.
3. **Features:** label-free ClinVar columns (position, allele lengths, transition/
   transversion, variant type, origin, review status) plus out-of-fold gene
   encodings (`gene_encoding.py`).
4. **Annotations** (`prepare_annotations.py`, `annotation_features.py`):
   AlphaMissense score (+ `has_am` flag) and gnomAD v4.1 gene constraint (LOEUF,
   pLI, missense z, missense o/e). Missing values are median-filled on train only.
   AlphaMissense's `am_class` is not used because its cut-offs were calibrated on
   ClinVar labels.
5. **Models:** Logistic Regression, Random Forest, XGBoost, MLP, LightGBM. The
   threshold is tuned on validation (max F1), never on test.
6. **Evaluation:** mean ± std over seeds, 95% bootstrap CIs, calibration (Brier,
   ECE), per-variant-group breakdowns.

## Results in detail

### 1. ClinVar-only baseline

Mean over 3 seeds. Full tables: [output/reports/baseline_report.md](output/reports/baseline_report.md).

| Model | ROC-AUC | PR-AUC | F1 | Precision | Recall |
|---|---|---|---|---|---|
| Logistic Regression | 0.812 | 0.683 | 0.630 | 0.705 | 0.569 |
| Random Forest | 0.808 | 0.668 | 0.633 | 0.727 | 0.561 |
| XGBoost | 0.802 | 0.681 | 0.636 | 0.742 | 0.556 |
| MLP | 0.784 | 0.674 | 0.624 | 0.738 | 0.540 |
| LightGBM | 0.808 | 0.684 | 0.637 | 0.730 | 0.566 |

- Bootstrap 95% CIs are about ±0.003-0.005, so the models are close.
- **Performance is driven by variant type:** the test set is 86% SNVs (16.7%
  pathogenic; PR-AUC only 0.454), while deletions/duplications are 70-80%
  pathogenic, which lifts the aggregate.
- Gene features add little (only 0.1% of test rows have a gene seen in training);
  dropping `ReviewStatus` as well gives ROC-AUC 0.796.
- Logistic Regression / Random Forest are poorly calibrated (ECE 0.12-0.14);
  XGBoost and LightGBM are better (ECE ≈ 0.04).

### 2. Adding real annotations

3 seeds, LightGBM / XGBoost / Logistic Regression. Full tables:
[output/reports/annotated_report.md](output/reports/annotated_report.md).

| Features (best of 3 models) | ROC-AUC | PR-AUC |
|---|---|---|
| ClinVar only | 0.812 | 0.684 |
| + gnomAD constraint | 0.821 | 0.691 |
| + AlphaMissense | 0.871 | 0.774 |
| + both | 0.873 | 0.775 |

- AlphaMissense scores 13% of ClinVar SNVs (15% of the test set). On those, ROC-AUC
  rises from about 0.73 to 0.96, in line with the AlphaMissense paper's ClinVar
  results, so it is not label leakage.
- `has_am` also tells the model a variant is missense, so a small part of the gain
  may come from that rather than the score.
- gnomAD constraint adds about +0.01 ROC-AUC.

### 3. Where the annotations help

[output/reports/snv_report.md](output/reports/snv_report.md) (`src/snv_report.py`),
ROC-AUC, ClinVar-only → with annotations:

| Test group | n | ROC-AUC |
|---|---|---|
| Scored missense SNV | 20,800 | 0.73 → 0.96 |
| Other SNV | 95,150 | 0.70 → 0.71 |
| Non-SNV | 19,571 | 0.74 → 0.74 |
| All SNV | 115,950 | 0.71 → 0.82 |

### 4. Temporal check

[output/reports/temporal_report.md](output/reports/temporal_report.md)
(`src/temporal_eval.py`): train on the 2025-10 ClinVar release, test on 201,812
variants that first appear in the current (2026-10) release.

| Features (LightGBM) | ROC-AUC | PR-AUC |
|---|---|---|
| ClinVar only | 0.870 | 0.738 |
| + AlphaMissense + gnomAD | 0.902 | 0.806 |

The gain holds on new variants (scored missense SNVs reach ROC-AUC 0.99; non-SNVs
stay at 0.82). Absolute numbers are higher than the chromosome hold-out because new
variants mostly fall in genes already seen in training, so the two are not directly
comparable. Variants reclassified between releases are not covered.

### 5. Label-quality check

[output/reports/high_confidence_report.md](output/reports/high_confidence_report.md)
(`src/high_confidence.py`): test rows split into 2+ review stars (34,457) and
single submitter (101,064), training on all labels or only 2+ star labels, with and
without `ReviewStatus`.

- Not an artefact of noisy labels: ROC-AUC on 2+ star rows is 0.79 (ClinVar only)
  vs 0.81 on single-submitter rows.
- The annotation gain holds on 2+ star rows: ROC-AUC 0.79 → 0.87, PR-AUC 0.67 → 0.77.
- Training only on 2+ star labels does not help.
- Dropping `ReviewStatus` costs at most 0.01 ROC-AUC when training on all labels.

### 6. Tuning

[output/reports/tuning_report.md](output/reports/tuning_report.md) (`src/tuning.py`).

- **Raw position (`PositionVCF`, `Stop`)** helps with ClinVar-only features (test
  PR-AUC 0.685 vs 0.658) and slightly with annotations (0.774 vs 0.764), so it is kept.
- **Hyperparameter search** (13 LightGBM / 9 XGBoost configs, chromosome-grouped CV):
  every config lands within 0.793-0.799 CV PR-AUC against a fold spread of 0.017, so
  differences are within noise. Best tuned LightGBM: ROC-AUC 0.874, PR-AUC 0.779
  (default 0.7735). Tuned XGBoost equals its default (PR-AUC 0.767).
- **Thresholds:** the F1 threshold picked on the validation chromosomes is unstable
  (the same model family swings from F1 0.67 to 0.73 while ROC/PR-AUC match), so quote
  ROC/PR-AUC as headline numbers. A precision-targeted threshold (80% on validation
  gave 0.82-0.83 test precision) transferred more reliably, and isotonic calibration
  cut ECE from about 0.08 to 0.02 without changing decisions.

## Data-integrity checks

[output/reports/split_audit.md](output/reports/split_audit.md): no duplicate or
conflicting variant keys, zero variant-key overlap across train/val/test, no
unassigned chromosomes. Gene target encoding is out-of-fold for training rows and
training-only for validation/test (`src/gene_encoding.py`, unit-tested).

## Reproducing

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt pytest   # Linux/macOS: .venv/bin/pip
export PYTHONUTF8=1    # Windows PowerShell: $env:PYTHONUTF8 = "1"

# 1. ClinVar baseline
# Download variant_summary.txt.gz from
# https://ftp.ncbi.nlm.nih.gov/pub/clinvar/tab_delimited/ into the project root.
# The copy used for the reported results was saved on 2026-10-08 (official release
# date not recorded).
python src/preprocess_clinvar.py        # -> output/data/clinvar_ml_dataset.csv
python src/audit_splits.py              # -> output/reports/split_audit.md
python src/train_models.py              # ~2 h on CPU; smoke test: --seeds 1 --max-train 200000
pytest

# 2. Annotations: download into data/annotations/ (see data/annotations/SOURCES.md)
#   AlphaMissense_hg38.tsv.gz (643 MB)
#     https://storage.googleapis.com/dm_alphamissense/AlphaMissense_hg38.tsv.gz
#   gnomad.v4.1.constraint_metrics.tsv (96 MB)
#     https://storage.googleapis.com/gcp-public-data--gnomad/release/4.1/constraint/gnomad.v4.1.constraint_metrics.tsv
python src/prepare_annotations.py
python src/train_annotated.py           # ~35 min
python src/snv_report.py
python src/high_confidence.py
python src/tuning.py                    # ~1 h

# 3. Temporal check: download variant_summary_2025-10.txt.gz (384 MB) from
#    https://ftp.ncbi.nlm.nih.gov/pub/clinvar/tab_delimited/archive/ into data/archive/
python src/preprocess_clinvar.py --input data/archive/variant_summary_2025-10.txt.gz --output-dir data/archive/out
python src/temporal_eval.py

# Optional: regenerate plots (not committed)
python src/plot_model_evaluation_graphs.py
```

Large inputs and generated datasets (`variant_summary.txt.gz`, `output/data/*.csv`,
`data/annotations/*`, `data/archive/`, `.venv/`) are gitignored.

## Layout

| Path | Purpose |
|---|---|
| `src/paths.py` | All file locations |
| `src/preprocess_clinvar.py` | Clean ClinVar, binary label |
| `src/features.py` | Label-free feature engineering and chromosome split |
| `src/gene_encoding.py` | Leakage-safe gene features |
| `src/metrics.py` | Threshold selection, bootstrap CIs, calibration |
| `src/train_models.py` | ClinVar-only benchmark, ablation, report |
| `src/audit_splits.py` | Split-integrity audit |
| `src/prepare_annotations.py`, `annotation_features.py`, `train_annotated.py` | Prepare real external annotations, attach them, compare feature sets |
| `src/snv_report.py` | Per-variant-group report |
| `src/temporal_eval.py` | Train on an older release, test on new variants |
| `src/high_confidence.py` | Label-quality sensitivity check (review-star groups) |
| `src/tuning.py` | Position ablation, threshold/calibration comparison, hyperparameter search |
| `src/join_annotations.py` | Join variant-keyed annotation tables to the dataset (never simulates) |
| `src/plot_model_evaluation_graphs.py` | Optional: regenerate figures from `baseline_results.json` |
| `tests/` | pytest suite (CI in `.github/workflows`) |
| `docs/` | Historical leakage audit of the removed pipeline (`phase8_*`) and Phase 12 local-VEP feasibility notes (`phase12_*`) |
| `output/reports/` | All generated reports (baseline, annotated, snv, temporal, high-confidence, tuning) |
| `data/annotations/SOURCES.md` | Source, version and licence of each external table |

## Licences and data sources

- ClinVar: public domain (NCBI).
- gnomAD v4.1 constraint: open under gnomAD terms of use.
- **AlphaMissense: CC BY-NC-SA 4.0, non-commercial use only.** Do not use models that
  include it in a commercial product without checking the licence.

## Limitations and next steps

- The 85% of variants AlphaMissense cannot score (non-missense SNVs, deletions,
  duplications, indels) are unchanged by the annotations. Conservation scores
  (phastCons / phyloP bigWig, 5.9-9.9 GB) are the planned next feature set; reading
  them remotely is far too slow, so they require a full download. A local Ensembl VEP
  install was assessed in
  [docs/phase12_local_annotation_feasibility.md](docs/phase12_local_annotation_feasibility.md)
  and is blocked on disk space at that time.
- No real reference-sequence features or sequence CNN (requires the GRCh38 reference).
- No independent external cohort; the temporal check covers only newly added ClinVar
  variants, not reclassified ones.
- ClinVar labels depend on submitters and review status (label noise and provenance).
- The chromosome hold-out is a single split; fold-to-fold spread across training
  chromosomes is about ±0.017 PR-AUC.
- Not a clinically validated tool.
