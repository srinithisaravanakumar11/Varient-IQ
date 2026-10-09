# Tuning results (chromosome hold-out)

Generated 2026-10-09T12:09:19.911919.

## 1. Raw position features (`PositionVCF`, `Stop`)

| Features | Position | Model | Val PR-AUC | Test ROC-AUC | Test PR-AUC | Test F1 |
|---|---|---|---|---|---|---|
| ClinVar only | with position | LightGBM | 0.580 | 0.810 [0.808, 0.814] | 0.685 [0.682, 0.690] | 0.636 |
| ClinVar only | with position | Logistic Regression | 0.575 | 0.812 [0.810, 0.815] | 0.683 [0.679, 0.687] | 0.630 |
| ClinVar only | without position | LightGBM | 0.557 | 0.806 [0.804, 0.809] | 0.658 [0.654, 0.662] | 0.636 |
| ClinVar only | without position | Logistic Regression | 0.552 | 0.804 [0.802, 0.807] | 0.653 [0.650, 0.658] | 0.621 |
| + both | with position | LightGBM | 0.683 | 0.872 [0.870, 0.875] | 0.773 [0.769, 0.777] | 0.680 |
| + both | with position | Logistic Regression | 0.685 | 0.872 [0.870, 0.875] | 0.775 [0.771, 0.779] | 0.722 |
| + both | without position | LightGBM | 0.683 | 0.868 [0.866, 0.871] | 0.764 [0.760, 0.768] | 0.679 |
| + both | without position | Logistic Regression | 0.686 | 0.873 [0.870, 0.875] | 0.768 [0.764, 0.772] | 0.722 |

Setting chosen on validation PR-AUC (position kept only if it beats removal by 0.002): **without position**.

## 2. Thresholds and calibration (test metrics)

| Model / features | Strategy | Precision | Recall | F1 | Brier | ECE |
|---|---|---|---|---|---|---|
| default LightGBM, ClinVar only | (a) max-F1 on validation | 0.718 | 0.572 | 0.636 | 0.126 | 0.038 |
| default LightGBM, ClinVar only | (b) isotonic calibration + max-F1 on held-out half | 0.718 | 0.572 | 0.636 | 0.130 | 0.069 |
| default LightGBM, ClinVar only | (c) lowest threshold with 80% validation precision | 0.874 | 0.264 | 0.406 | 0.126 | 0.038 |
| default LightGBM, ClinVar only | reference: test-tuned threshold (not a valid method) | 0.732 | 0.566 | 0.638 | 0.126 | 0.038 |
| default LightGBM, + gnomAD constraint | (a) max-F1 on validation | 0.536 | 0.717 | 0.613 | 0.131 | 0.081 |
| default LightGBM, + gnomAD constraint | (b) isotonic calibration + max-F1 on held-out half | 0.536 | 0.717 | 0.613 | 0.126 | 0.046 |
| default LightGBM, + gnomAD constraint | (c) lowest threshold with 80% validation precision | 0.788 | 0.454 | 0.576 | 0.131 | 0.081 |
| default LightGBM, + gnomAD constraint | reference: test-tuned threshold (not a valid method) | 0.750 | 0.547 | 0.632 | 0.131 | 0.081 |
| default LightGBM, + AlphaMissense | (a) max-F1 on validation | 0.812 | 0.644 | 0.718 | 0.109 | 0.074 |
| default LightGBM, + AlphaMissense | (b) isotonic calibration + max-F1 on held-out half | 0.812 | 0.644 | 0.718 | 0.105 | 0.057 |
| default LightGBM, + AlphaMissense | (c) lowest threshold with 80% validation precision | 0.905 | 0.373 | 0.528 | 0.109 | 0.074 |
| default LightGBM, + AlphaMissense | reference: test-tuned threshold (not a valid method) | 0.761 | 0.701 | 0.730 | 0.109 | 0.074 |
| default LightGBM, + both | (a) max-F1 on validation | 0.603 | 0.776 | 0.679 | 0.110 | 0.074 |
| default LightGBM, + both | (b) isotonic calibration + max-F1 on held-out half | 0.603 | 0.776 | 0.679 | 0.102 | 0.024 |
| default LightGBM, + both | (c) lowest threshold with 80% validation precision | 0.818 | 0.579 | 0.678 | 0.110 | 0.074 |
| default LightGBM, + both | reference: test-tuned threshold (not a valid method) | 0.774 | 0.691 | 0.730 | 0.110 | 0.074 |
| tuned LightGBM, + both | (a) max-F1 on validation | 0.757 | 0.709 | 0.732 | 0.108 | 0.081 |
| tuned LightGBM, + both | (b) isotonic calibration + max-F1 on held-out half | 0.757 | 0.709 | 0.732 | 0.100 | 0.019 |
| tuned LightGBM, + both | (c) lowest threshold with 80% validation precision | 0.830 | 0.592 | 0.691 | 0.108 | 0.081 |
| tuned LightGBM, + both | reference: test-tuned threshold (not a valid method) | 0.772 | 0.702 | 0.735 | 0.108 | 0.081 |
| tuned XGBoost, + both | (a) max-F1 on validation | 0.577 | 0.794 | 0.668 | 0.110 | 0.082 |
| tuned XGBoost, + both | (b) isotonic calibration + max-F1 on held-out half | 0.577 | 0.794 | 0.668 | 0.103 | 0.029 |
| tuned XGBoost, + both | (c) lowest threshold with 80% validation precision | 0.818 | 0.573 | 0.674 | 0.110 | 0.082 |
| tuned XGBoost, + both | reference: test-tuned threshold (not a valid method) | 0.762 | 0.702 | 0.731 | 0.110 | 0.082 |

## 3. Hyperparameter search (chromosome-grouped 4-fold CV on a training subsample, PR-AUC)

### LightGBM

| Rank | CV PR-AUC | Default? | Parameters |
|---|---|---|---|
| 1 | 0.7990 ± 0.0178 |  | `{'n_estimators': 500, 'learning_rate': 0.02, 'num_leaves': 63, 'min_child_samples': 50, 'subsample': 0.85, 'colsample_bytree': 0.8, 'reg_lambda': 1.0}` |
| 2 | 0.7984 ± 0.0175 |  | `{'n_estimators': 500, 'learning_rate': 0.02, 'num_leaves': 127, 'min_child_samples': 100, 'subsample': 0.85, 'colsample_bytree': 0.8, 'reg_lambda': 0.0}` |
| 3 | 0.7978 ± 0.0173 | yes | `{'n_estimators': 300, 'learning_rate': 0.05, 'num_leaves': 63, 'min_child_samples': 20, 'subsample': 1.0, 'colsample_bytree': 1.0, 'reg_lambda': 0.0}` |
| 4 | 0.7974 ± 0.0175 |  | `{'n_estimators': 150, 'learning_rate': 0.05, 'num_leaves': 127, 'min_child_samples': 50, 'subsample': 0.7, 'colsample_bytree': 0.8, 'reg_lambda': 10.0}` |
| 5 | 0.7969 ± 0.0164 |  | `{'n_estimators': 500, 'learning_rate': 0.02, 'num_leaves': 255, 'min_child_samples': 20, 'subsample': 0.85, 'colsample_bytree': 0.6, 'reg_lambda': 1.0}` |
| 6 | 0.7959 ± 0.0168 |  | `{'n_estimators': 500, 'learning_rate': 0.05, 'num_leaves': 127, 'min_child_samples': 50, 'subsample': 1.0, 'colsample_bytree': 0.8, 'reg_lambda': 0.0}` |

### XGBoost

| Rank | CV PR-AUC | Default? | Parameters |
|---|---|---|---|
| 1 | 0.7979 ± 0.0166 |  | `{'n_estimators': 500, 'learning_rate': 0.03, 'max_depth': 8, 'min_child_weight': 20.0, 'subsample': 1.0, 'colsample_bytree': 0.6, 'reg_lambda': 1.0}` |
| 2 | 0.7975 ± 0.0175 |  | `{'n_estimators': 500, 'learning_rate': 0.03, 'max_depth': 8, 'min_child_weight': 5.0, 'subsample': 0.7, 'colsample_bytree': 0.6, 'reg_lambda': 10.0}` |
| 3 | 0.7966 ± 0.0170 |  | `{'n_estimators': 300, 'learning_rate': 0.03, 'max_depth': 10, 'min_child_weight': 20.0, 'subsample': 0.7, 'colsample_bytree': 0.6, 'reg_lambda': 10.0}` |
| 4 | 0.7965 ± 0.0174 | yes | `{'n_estimators': 200, 'learning_rate': 0.05, 'max_depth': 8, 'min_child_weight': 1, 'subsample': 1.0, 'colsample_bytree': 1.0, 'reg_lambda': 1.0}` |
| 5 | 0.7961 ± 0.0161 |  | `{'n_estimators': 500, 'learning_rate': 0.05, 'max_depth': 8, 'min_child_weight': 1.0, 'subsample': 1.0, 'colsample_bytree': 1.0, 'reg_lambda': 1.0}` |
| 6 | 0.7952 ± 0.0168 |  | `{'n_estimators': 150, 'learning_rate': 0.1, 'max_depth': 10, 'min_child_weight': 20.0, 'subsample': 1.0, 'colsample_bytree': 1.0, 'reg_lambda': 10.0}` |

### Refit on all training rows, test metrics

| Model | Setting | ROC-AUC | PR-AUC | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| LightGBM | default | 0.868 [0.866, 0.871] | 0.764 [0.760, 0.768] | 0.679 | 0.603 | 0.776 |
| LightGBM | tuned | 0.874 [0.872, 0.876] | 0.772 [0.768, 0.775] | 0.732 | 0.757 | 0.709 |
| XGBoost | default | 0.872 [0.870, 0.875] | 0.767 [0.763, 0.771] | 0.729 | 0.765 | 0.696 |
| XGBoost | tuned | 0.871 [0.869, 0.873] | 0.767 [0.764, 0.772] | 0.668 | 0.577 | 0.794 |

## Notes

- The search uses a row subsample and the out-of-fold gene encoding built on all training rows, so CV is slightly optimistic for every config equally.
- The test set is used once per final model; configs and the position setting are chosen on CV/validation only.
- Not a clinically validated tool.
