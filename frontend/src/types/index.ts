// VariantIQ typed data access layer
// All values are sourced from output/data/*.json and output/reports/*.md
// Never mix live predictions with stored evaluation results.

export interface ModelMetrics {
  'ROC-AUC': number;
  'PR-AUC': number;
  F1: number;
  Precision: number;
  Recall: number;
  'Balanced Accuracy': number;
  Brier: number;
  ECE: number;
}

export interface ModelResult {
  mean: ModelMetrics;
  std: ModelMetrics;
  ci95_seed0: Record<keyof ModelMetrics, [number, number]>;
}

export interface FeatureSetResult {
  n_features: number;
  models: {
    LightGBM?: ModelResult;
    XGBoost?: ModelResult;
    'Logistic Regression'?: ModelResult;
  };
}

export interface AnnotatedResults {
  generated: string;
  seeds: number;
  settings: {
    'ClinVar only': FeatureSetResult;
    '+ gnomAD constraint': FeatureSetResult;
    '+ AlphaMissense': FeatureSetResult;
    '+ both': FeatureSetResult;
  };
  scored_missense_subset: {
    n: number;
    pathogenic_rate: number;
    metrics_seed0: Record<string, Record<string, { 'ROC-AUC': number; 'PR-AUC': number; F1: number }>>;
  };
  test_coverage_has_am: number;
  runtime_minutes: number;
}

export interface BaselineDatasetSizes {
  train: number;
  val: number;
  test: number;
}

export interface BaselineModelRow {
  model: string;
  rocAuc: number;
  prAuc: number;
  f1: number;
  precision: number;
  recall: number;
  balancedAccuracy: number;
  brier: number;
  ece: number;
  rocAucCi: [number, number];
  prAucCi: [number, number];
}

export interface VariantTypeBreakdown {
  type: string;
  n: number;
  pathogenicRate: number;
  rocAuc: number;
  prAuc: number;
  f1: number;
}

export interface SNVGroupResult {
  n: number;
  pathogenic_rate: number;
  metrics: Record<string, {
    'ROC-AUC': number;
    'PR-AUC': number;
    F1: number;
    'ROC-AUC_ci': [number, number];
    'PR-AUC_ci': [number, number];
  }>;
}

export interface TuningHyperparamResult {
  rank: number;
  cvPrAuc: number;
  cvStd: number;
  isDefault: boolean;
  params: string;
}

export interface TemporalSubgroup {
  n: number;
  pathogenic_rate: number;
  'ROC-AUC': number;
  'PR-AUC': number;
  F1: number;
  'ROC-AUC_ci': [number, number];
  'PR-AUC_ci': [number, number];
}

export interface TemporalFeatureSet {
  n_old_release: number;
  n_current_release: number;
  n_train: number;
  n_test_new: number;
  test_pathogenic_rate: number;
  models: Record<string, Record<string, TemporalSubgroup>>;
}

export interface DemoVariant {
  id: string;
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
  gene: string;
  variantType: string;
  clinvarClassification: 'Pathogenic' | 'Likely pathogenic' | 'Benign' | 'Likely benign' | 'Uncertain significance';
  reviewStatus: string;
  reviewStars: number;
  hasAlphaMissense: boolean;
  alphaMissenseScore?: number;
  hasGnomad: boolean;
  gnomadLoeuf?: number;
  gnomadPli?: number;
  source: 'demonstration';
  note: string;
}
