# Test performance by variant group (seed 0, threshold from validation)

ClinVar-only vs ClinVar + AlphaMissense + gnomAD constraint. 95% bootstrap CIs in brackets.

## scored missense SNV (n = 20,800, 37.1% pathogenic)

| Features | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|
| ClinVar only | LightGBM | 0.729 [0.723, 0.735] | 0.657 [0.648, 0.668] | 0.448 |
| ClinVar only | Logistic Regression | 0.741 [0.735, 0.748] | 0.664 [0.656, 0.676] | 0.435 |
| + both | LightGBM | 0.962 [0.959, 0.964] | 0.938 [0.934, 0.943] | 0.880 |
| + both | Logistic Regression | 0.963 [0.960, 0.965] | 0.937 [0.933, 0.942] | 0.874 |

## other SNV (n = 95,150, 12.3% pathogenic)

| Features | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|
| ClinVar only | LightGBM | 0.700 [0.694, 0.705] | 0.378 [0.369, 0.387] | 0.338 |
| ClinVar only | Logistic Regression | 0.697 [0.692, 0.703] | 0.383 [0.374, 0.391] | 0.335 |
| + both | LightGBM | 0.708 [0.702, 0.713] | 0.380 [0.371, 0.388] | 0.361 |
| + both | Logistic Regression | 0.708 [0.702, 0.713] | 0.388 [0.379, 0.398] | 0.291 |

## non-SNV (n = 19,571, 71.3% pathogenic)

| Features | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|
| ClinVar only | LightGBM | 0.743 [0.735, 0.749] | 0.873 [0.867, 0.878] | 0.855 |
| ClinVar only | Logistic Regression | 0.706 [0.699, 0.714] | 0.858 [0.851, 0.864] | 0.834 |
| + both | LightGBM | 0.742 [0.736, 0.749] | 0.874 [0.868, 0.879] | 0.852 |
| + both | Logistic Regression | 0.702 [0.694, 0.711] | 0.856 [0.849, 0.861] | 0.835 |

## all SNV (n = 115,950, 16.7% pathogenic)

| Features | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|
| ClinVar only | LightGBM | 0.714 [0.710, 0.718] | 0.454 [0.447, 0.460] | 0.381 |
| ClinVar only | Logistic Regression | 0.721 [0.717, 0.725] | 0.466 [0.458, 0.472] | 0.375 |
| + both | LightGBM | 0.818 [0.814, 0.822] | 0.646 [0.639, 0.651] | 0.553 |
| + both | Logistic Regression | 0.819 [0.816, 0.823] | 0.658 [0.652, 0.664] | 0.597 |
