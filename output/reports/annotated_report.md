# Effect of real external annotations (chromosome hold-out)

Generated 2026-10-09T10:35:05.115589. 3 seeds; threshold tuned on validation (max F1). Annotations: AlphaMissense (hg38 scores) and gnomAD v4.1 gene constraint; see `data/annotations/SOURCES.md`.

## Test metrics, all test variants (mean ± std over seeds)

| Features | Model | ROC-AUC | PR-AUC | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| ClinVar only | LightGBM | 0.808 ± 0.002 | 0.684 ± 0.001 | 0.637 ± 0.001 | 0.730 ± 0.009 | 0.566 ± 0.003 |
| ClinVar only | XGBoost | 0.802 ± 0.000 | 0.681 ± 0.000 | 0.636 ± 0.000 | 0.742 ± 0.000 | 0.556 ± 0.000 |
| ClinVar only | Logistic Regression | 0.812 ± 0.000 | 0.683 ± 0.000 | 0.630 ± 0.000 | 0.705 ± 0.000 | 0.569 ± 0.000 |
| + gnomAD constraint | LightGBM | 0.821 ± 0.001 | 0.691 ± 0.002 | 0.614 ± 0.000 | 0.537 ± 0.003 | 0.718 ± 0.006 |
| + gnomAD constraint | XGBoost | 0.819 ± 0.000 | 0.691 ± 0.000 | 0.618 ± 0.000 | 0.561 ± 0.000 | 0.689 ± 0.000 |
| + gnomAD constraint | Logistic Regression | 0.819 ± 0.000 | 0.687 ± 0.000 | 0.630 ± 0.000 | 0.704 ± 0.000 | 0.570 ± 0.000 |
| + AlphaMissense | LightGBM | 0.865 ± 0.001 | 0.771 ± 0.000 | 0.718 ± 0.003 | 0.812 ± 0.004 | 0.644 ± 0.007 |
| + AlphaMissense | XGBoost | 0.867 ± 0.000 | 0.771 ± 0.000 | 0.725 ± 0.000 | 0.793 ± 0.000 | 0.668 ± 0.000 |
| + AlphaMissense | Logistic Regression | 0.871 ± 0.000 | 0.774 ± 0.000 | 0.720 ± 0.000 | 0.778 ± 0.000 | 0.670 ± 0.000 |
| + both | LightGBM | 0.871 ± 0.001 | 0.773 ± 0.000 | 0.679 ± 0.002 | 0.609 ± 0.008 | 0.767 ± 0.007 |
| + both | XGBoost | 0.873 ± 0.000 | 0.774 ± 0.000 | 0.707 ± 0.000 | 0.694 ± 0.000 | 0.721 ± 0.000 |
| + both | Logistic Regression | 0.872 ± 0.000 | 0.775 ± 0.000 | 0.722 ± 0.000 | 0.761 ± 0.000 | 0.687 ± 0.000 |

## Subset: test variants AlphaMissense can score (n = 20,800, 15.3% of test, 37.1% pathogenic; seed 0)

| Features | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|
| ClinVar only | LightGBM | 0.729 | 0.657 | 0.448 |
| ClinVar only | XGBoost | 0.726 | 0.662 | 0.430 |
| ClinVar only | Logistic Regression | 0.741 | 0.664 | 0.435 |
| + gnomAD constraint | LightGBM | 0.760 | 0.681 | 0.600 |
| + gnomAD constraint | XGBoost | 0.756 | 0.682 | 0.585 |
| + gnomAD constraint | Logistic Regression | 0.749 | 0.669 | 0.440 |
| + AlphaMissense | LightGBM | 0.962 | 0.937 | 0.849 |
| + AlphaMissense | XGBoost | 0.961 | 0.936 | 0.863 |
| + AlphaMissense | Logistic Regression | 0.962 | 0.936 | 0.872 |
| + both | LightGBM | 0.962 | 0.938 | 0.880 |
| + both | XGBoost | 0.962 | 0.941 | 0.873 |
| + both | Logistic Regression | 0.963 | 0.937 | 0.874 |

## Notes

- AlphaMissense only scores missense SNVs; all other variants have a missing score (median-filled plus `has_am = 0`).
- `has_am` marks missense SNVs, so part of any gain can come from knowing the variant is missense, not only from the score.
- AlphaMissense data is licensed CC BY-NC-SA 4.0 (non-commercial).
- Not a clinically validated tool.
