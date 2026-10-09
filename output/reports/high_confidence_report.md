# Label-quality sensitivity (chromosome hold-out, seed 0)

High confidence = 2+ review stars. 95% bootstrap CIs (100 resamples) in brackets.

## Test rows: high-confidence (2+ stars) (n = 34,457, 25.7% pathogenic)

| Features | Trained on | ReviewStatus feature | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|---|---|
| ClinVar only | all labels | yes | LightGBM | 0.787 [0.780, 0.792] | 0.669 [0.657, 0.677] | 0.612 |
| ClinVar only | all labels | yes | Logistic Regression | 0.793 [0.788, 0.798] | 0.665 [0.654, 0.674] | 0.614 |
| ClinVar only | all labels | no | LightGBM | 0.790 [0.783, 0.794] | 0.669 [0.658, 0.678] | 0.615 |
| ClinVar only | all labels | no | Logistic Regression | 0.788 [0.782, 0.793] | 0.662 [0.651, 0.671] | 0.609 |
| ClinVar only | high-confidence only | yes | LightGBM | 0.774 [0.767, 0.780] | 0.660 [0.649, 0.669] | 0.616 |
| ClinVar only | high-confidence only | yes | Logistic Regression | 0.792 [0.786, 0.797] | 0.666 [0.655, 0.675] | 0.614 |
| ClinVar only | high-confidence only | no | LightGBM | 0.752 [0.745, 0.759] | 0.643 [0.630, 0.653] | 0.614 |
| ClinVar only | high-confidence only | no | Logistic Regression | 0.785 [0.779, 0.790] | 0.662 [0.651, 0.671] | 0.610 |
| + both | all labels | yes | LightGBM | 0.869 [0.863, 0.872] | 0.767 [0.758, 0.774] | 0.722 |
| + both | all labels | yes | Logistic Regression | 0.864 [0.859, 0.868] | 0.775 [0.766, 0.783] | 0.704 |
| + both | all labels | no | LightGBM | 0.867 [0.861, 0.870] | 0.763 [0.754, 0.770] | 0.673 |
| + both | all labels | no | Logistic Regression | 0.862 [0.857, 0.866] | 0.774 [0.765, 0.782] | 0.703 |
| + both | high-confidence only | yes | LightGBM | 0.865 [0.858, 0.869] | 0.770 [0.760, 0.778] | 0.698 |
| + both | high-confidence only | yes | Logistic Regression | 0.861 [0.856, 0.866] | 0.775 [0.766, 0.783] | 0.705 |
| + both | high-confidence only | no | LightGBM | 0.861 [0.854, 0.864] | 0.761 [0.751, 0.770] | 0.699 |
| + both | high-confidence only | no | Logistic Regression | 0.859 [0.854, 0.863] | 0.772 [0.763, 0.780] | 0.704 |

## Test rows: single submitter (1 star) (n = 101,064, 24.2% pathogenic)

| Features | Trained on | ReviewStatus feature | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|---|---|
| ClinVar only | all labels | yes | LightGBM | 0.814 [0.811, 0.817] | 0.684 [0.678, 0.689] | 0.645 |
| ClinVar only | all labels | yes | Logistic Regression | 0.820 [0.816, 0.822] | 0.691 [0.684, 0.695] | 0.636 |
| ClinVar only | all labels | no | LightGBM | 0.817 [0.813, 0.820] | 0.687 [0.682, 0.692] | 0.645 |
| ClinVar only | all labels | no | Logistic Regression | 0.822 [0.818, 0.824] | 0.692 [0.686, 0.697] | 0.638 |
| ClinVar only | high-confidence only | yes | LightGBM | 0.802 [0.799, 0.805] | 0.675 [0.669, 0.680] | 0.521 |
| ClinVar only | high-confidence only | yes | Logistic Regression | 0.817 [0.813, 0.819] | 0.689 [0.682, 0.694] | 0.636 |
| ClinVar only | high-confidence only | no | LightGBM | 0.769 [0.766, 0.773] | 0.653 [0.647, 0.658] | 0.642 |
| ClinVar only | high-confidence only | no | Logistic Regression | 0.817 [0.813, 0.819] | 0.689 [0.683, 0.695] | 0.639 |
| + both | all labels | yes | LightGBM | 0.875 [0.872, 0.877] | 0.774 [0.770, 0.778] | 0.668 |
| + both | all labels | yes | Logistic Regression | 0.873 [0.870, 0.876] | 0.773 [0.769, 0.778] | 0.728 |
| + both | all labels | no | LightGBM | 0.871 [0.869, 0.874] | 0.768 [0.764, 0.772] | 0.667 |
| + both | all labels | no | Logistic Regression | 0.873 [0.870, 0.876] | 0.774 [0.770, 0.778] | 0.729 |
| + both | high-confidence only | yes | LightGBM | 0.863 [0.860, 0.866] | 0.760 [0.755, 0.764] | 0.730 |
| + both | high-confidence only | yes | Logistic Regression | 0.868 [0.865, 0.871] | 0.769 [0.765, 0.774] | 0.727 |
| + both | high-confidence only | no | LightGBM | 0.859 [0.857, 0.862] | 0.756 [0.751, 0.760] | 0.726 |
| + both | high-confidence only | no | Logistic Regression | 0.868 [0.865, 0.871] | 0.769 [0.765, 0.773] | 0.728 |

## Test rows: all test (n = 135,521, 24.6% pathogenic)

| Features | Trained on | ReviewStatus feature | Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|---|---|---|
| ClinVar only | all labels | yes | LightGBM | 0.810 [0.808, 0.814] | 0.685 [0.682, 0.690] | 0.636 |
| ClinVar only | all labels | yes | Logistic Regression | 0.812 [0.810, 0.815] | 0.683 [0.679, 0.687] | 0.630 |
| ClinVar only | all labels | no | LightGBM | 0.809 [0.807, 0.812] | 0.683 [0.679, 0.687] | 0.636 |
| ClinVar only | all labels | no | Logistic Regression | 0.813 [0.810, 0.815] | 0.684 [0.680, 0.689] | 0.630 |
| ClinVar only | high-confidence only | yes | LightGBM | 0.785 [0.782, 0.788] | 0.668 [0.664, 0.673] | 0.539 |
| ClinVar only | high-confidence only | yes | Logistic Regression | 0.808 [0.806, 0.811] | 0.679 [0.675, 0.683] | 0.630 |
| ClinVar only | high-confidence only | no | LightGBM | 0.765 [0.762, 0.768] | 0.651 [0.648, 0.656] | 0.634 |
| ClinVar only | high-confidence only | no | Logistic Regression | 0.808 [0.806, 0.811] | 0.683 [0.678, 0.687] | 0.631 |
| + both | all labels | yes | LightGBM | 0.872 [0.870, 0.875] | 0.773 [0.769, 0.777] | 0.680 |
| + both | all labels | yes | Logistic Regression | 0.872 [0.870, 0.875] | 0.775 [0.771, 0.779] | 0.722 |
| + both | all labels | no | LightGBM | 0.870 [0.868, 0.872] | 0.767 [0.762, 0.770] | 0.668 |
| + both | all labels | no | Logistic Regression | 0.870 [0.867, 0.873] | 0.774 [0.770, 0.778] | 0.722 |
| + both | high-confidence only | yes | LightGBM | 0.863 [0.861, 0.866] | 0.762 [0.758, 0.766] | 0.722 |
| + both | high-confidence only | yes | Logistic Regression | 0.867 [0.865, 0.869] | 0.770 [0.766, 0.774] | 0.721 |
| + both | high-confidence only | no | LightGBM | 0.860 [0.858, 0.862] | 0.758 [0.754, 0.762] | 0.719 |
| + both | high-confidence only | no | Logistic Regression | 0.866 [0.863, 0.868] | 0.770 [0.766, 0.774] | 0.722 |

## Notes

- Prevalence differs between groups, so compare ROC-AUC across groups and PR-AUC only within a group.
- Not a clinically validated tool.
