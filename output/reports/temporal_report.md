# Temporal validation: train on older release, test on newly added variants

Train: 1,362,291 variants from the older release (random 10% held out to pick the threshold). Test: 201,812 variants present in the current release but not the older one (23.1% pathogenic). 95% bootstrap CIs in brackets.

## ClinVar only

| Model | Group | n | Pathogenic rate | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|---|---|
| LightGBM | all new variants | 201,812 | 23.1% | 0.870 [0.869, 0.872] | 0.738 [0.735, 0.742] | 0.662 |
| LightGBM | new SNVs | 171,021 | 14.2% | 0.794 [0.791, 0.797] | 0.466 [0.460, 0.473] | 0.372 |
| LightGBM | new non-SNVs | 30,791 | 72.6% | 0.823 [0.818, 0.829] | 0.914 [0.910, 0.917] | 0.878 |
| Logistic Regression | all new variants | 201,812 | 23.1% | 0.860 [0.859, 0.862] | 0.723 [0.720, 0.728] | 0.643 |
| Logistic Regression | new SNVs | 171,021 | 14.2% | 0.780 [0.777, 0.783] | 0.449 [0.444, 0.455] | 0.341 |
| Logistic Regression | new non-SNVs | 30,791 | 72.6% | 0.785 [0.780, 0.790] | 0.898 [0.894, 0.902] | 0.859 |

## + both

| Model | Group | n | Pathogenic rate | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|---|---|
| LightGBM | all new variants | 201,812 | 23.1% | 0.902 [0.900, 0.903] | 0.806 [0.803, 0.809] | 0.737 |
| LightGBM | new SNVs | 171,021 | 14.2% | 0.848 [0.846, 0.851] | 0.637 [0.632, 0.643] | 0.552 |
| LightGBM | new non-SNVs | 30,791 | 72.6% | 0.826 [0.820, 0.831] | 0.914 [0.910, 0.917] | 0.881 |
| LightGBM | new scored missense SNVs | 29,515 | 28.9% | 0.987 [0.985, 0.988] | 0.971 [0.968, 0.973] | 0.918 |
| Logistic Regression | all new variants | 201,812 | 23.1% | 0.895 [0.893, 0.896] | 0.789 [0.786, 0.793] | 0.717 |
| Logistic Regression | new SNVs | 171,021 | 14.2% | 0.839 [0.835, 0.842] | 0.616 [0.610, 0.622] | 0.528 |
| Logistic Regression | new non-SNVs | 30,791 | 72.6% | 0.791 [0.785, 0.796] | 0.900 [0.896, 0.904] | 0.860 |
| Logistic Regression | new scored missense SNVs | 29,515 | 28.9% | 0.975 [0.974, 0.977] | 0.944 [0.940, 0.948] | 0.885 |

## Caveats

- Variants whose label changed between releases (reclassified) are not tested here, only newly added variants.
- New submissions differ in type mix and review status from older ones, so prevalence shifts between train and test.
- Random (not chromosome) split inside the old release is used only to choose the threshold.
- Not a clinically validated tool.
