/**
 * VariantIQ Data Access Layer
 *
 * All values are sourced from:
 *   output/data/baseline_results.json
 *   output/data/annotated_results.json
 *   output/data/snv_report.json
 *   output/data/temporal_results.json
 *   output/data/tuning_results.json
 *   output/data/high_confidence.json
 *   output/data/model_performance_comparison.csv
 *   output/reports/*.md
 *
 * Source reference: README.md, generated 2026-10-08 / 2026-10-09
 * No values are fabricated; unsupported measurements are absent.
 */

import type {
  BaselineModelRow,
  VariantTypeBreakdown,
  TuningHyperparamResult,
  DemoVariant,
} from '../types';

// ─── Dataset sizes (baseline_results.json § n) ─────────────────────────────
export const datasetSizes = {
  train: 1_415_482,
  val: 151_323,
  test: 135_521,
  totalClinvar: 1_702_326, // current release, temporal_results.json § n_current_release
  oldRelease: 1_513_756,   // temporal_results.json § n_old_release
  temporalNewVariants: 201_812, // temporal_results.json § n_test_new
};

// ─── Headline metrics (README § Headline results) ──────────────────────────
export const headlineResults = [
  { stage: 'ClinVar-only features (5 models)', rocAuc: 0.812, prAuc: 0.684 },
  { stage: '+ gnomAD gene constraint',         rocAuc: 0.821, prAuc: 0.691 },
  { stage: '+ AlphaMissense',                  rocAuc: 0.871, prAuc: 0.774 },
  { stage: '+ both annotations',               rocAuc: 0.873, prAuc: 0.775 },
  { stage: '+ both, tuned LightGBM (best)',    rocAuc: 0.874, prAuc: 0.779 },
] as const;

// ─── Baseline model comparison (model_performance_comparison.csv) ───────────
export const baselineModels: BaselineModelRow[] = [
  {
    model: 'Logistic Regression',
    rocAuc: 0.812, prAuc: 0.683, f1: 0.630, precision: 0.705, recall: 0.569,
    balancedAccuracy: 0.746, brier: 0.140, ece: 0.119,
    rocAucCi: [0.809, 0.815], prAucCi: [0.678, 0.687],
  },
  {
    model: 'Random Forest',
    rocAuc: 0.808, prAuc: 0.668, f1: 0.633, precision: 0.727, recall: 0.561,
    balancedAccuracy: 0.746, brier: 0.147, ece: 0.142,
    rocAucCi: [0.806, 0.811], prAucCi: [0.666, 0.674],
  },
  {
    model: 'XGBoost',
    rocAuc: 0.802, prAuc: 0.681, f1: 0.636, precision: 0.742, recall: 0.556,
    balancedAccuracy: 0.747, brier: 0.127, ece: 0.044,
    rocAucCi: [0.799, 0.805], prAucCi: [0.676, 0.685],
  },
  {
    model: 'MLP',
    rocAuc: 0.784, prAuc: 0.674, f1: 0.624, precision: 0.738, recall: 0.540,
    balancedAccuracy: 0.739, brier: 0.134, ece: 0.083,
    rocAucCi: [0.794, 0.800], prAucCi: [0.678, 0.686],
  },
  {
    model: 'LightGBM',
    rocAuc: 0.808, prAuc: 0.684, f1: 0.637, precision: 0.730, recall: 0.566,
    balancedAccuracy: 0.749, brier: 0.126, ece: 0.036,
    rocAucCi: [0.807, 0.814], prAucCi: [0.680, 0.689],
  },
];

// ─── Annotated model comparison (annotated_results.json) ────────────────────
export const annotatedComparison = [
  {
    featureSet: 'ClinVar only',
    nFeatures: 181,
    models: {
      LightGBM: { rocAuc: 0.808, prAuc: 0.684, f1: 0.637 },
      XGBoost: { rocAuc: 0.802, prAuc: 0.681, f1: 0.636 },
      'Logistic Regression': { rocAuc: 0.812, prAuc: 0.683, f1: 0.630 },
    },
  },
  {
    featureSet: '+ gnomAD constraint',
    nFeatures: 185,
    models: {
      LightGBM: { rocAuc: 0.821, prAuc: 0.691, f1: 0.614 },
      XGBoost: { rocAuc: 0.819, prAuc: 0.691, f1: 0.618 },
      'Logistic Regression': { rocAuc: 0.819, prAuc: 0.687, f1: 0.630 },
    },
  },
  {
    featureSet: '+ AlphaMissense',
    nFeatures: 183,
    models: {
      LightGBM: { rocAuc: 0.865, prAuc: 0.771, f1: 0.718 },
      XGBoost: { rocAuc: 0.867, prAuc: 0.771, f1: 0.725 },
      'Logistic Regression': { rocAuc: 0.871, prAuc: 0.774, f1: 0.720 },
    },
  },
  {
    featureSet: '+ both',
    nFeatures: 187,
    models: {
      LightGBM: { rocAuc: 0.871, prAuc: 0.773, f1: 0.679 },
      XGBoost: { rocAuc: 0.873, prAuc: 0.774, f1: 0.707 },
      'Logistic Regression': { rocAuc: 0.872, prAuc: 0.775, f1: 0.722 },
    },
  },
];

// ─── Variant-type breakdown (baseline_report.md, LightGBM) ──────────────────
export const variantTypeBreakdown: VariantTypeBreakdown[] = [
  { type: 'Single Nucleotide Variant', n: 115950, pathogenicRate: 0.167, rocAuc: 0.714, prAuc: 0.454, f1: 0.381 },
  { type: 'Deletion', n: 10705, pathogenicRate: 0.781, rocAuc: 0.669, prAuc: 0.880, f1: 0.882 },
  { type: 'Duplication', n: 4782, pathogenicRate: 0.709, rocAuc: 0.638, prAuc: 0.825, f1: 0.835 },
  { type: 'Indel', n: 705, pathogenicRate: 0.862, rocAuc: 0.853, prAuc: 0.972, f1: 0.926 },
  { type: 'Insertion', n: 868, pathogenicRate: 0.571, rocAuc: 0.702, prAuc: 0.770, f1: 0.747 },
  { type: 'Microsatellite', n: 2411, pathogenicRate: 0.448, rocAuc: 0.836, prAuc: 0.801, f1: 0.743 },
];

// ─── SNV group results (snv_report.json) ────────────────────────────────────
export const snvGroupResults = [
  {
    group: 'Scored missense SNV',
    n: 20800,
    pathogenicRate: 0.371,
    clinvarOnly: { rocAuc: 0.729, prAuc: 0.657 },
    withAnnotations: { rocAuc: 0.962, prAuc: 0.938 },
    gain: 0.233,
  },
  {
    group: 'Other SNV',
    n: 95150,
    pathogenicRate: 0.123,
    clinvarOnly: { rocAuc: 0.700, prAuc: 0.378 },
    withAnnotations: { rocAuc: 0.708, prAuc: 0.380 },
    gain: 0.008,
  },
  {
    group: 'Non-SNV',
    n: 19571,
    pathogenicRate: 0.713,
    clinvarOnly: { rocAuc: 0.743, prAuc: 0.873 },
    withAnnotations: { rocAuc: 0.742, prAuc: 0.874 },
    gain: -0.001,
  },
  {
    group: 'All SNV',
    n: 115950,
    pathogenicRate: 0.167,
    clinvarOnly: { rocAuc: 0.714, prAuc: 0.454 },
    withAnnotations: { rocAuc: 0.819, prAuc: 0.646 },
    gain: 0.105,
  },
];

// ─── Temporal evaluation (temporal_results.json, LightGBM) ──────────────────
export const temporalResults = [
  {
    featureSet: 'ClinVar only',
    groups: {
      'All new variants': { n: 201812, rocAuc: 0.870, prAuc: 0.738 },
      'New SNVs': { n: 171021, rocAuc: 0.794, prAuc: 0.466 },
      'New non-SNVs': { n: 30791, rocAuc: 0.823, prAuc: 0.914 },
    },
  },
  {
    featureSet: '+ both annotations',
    groups: {
      'All new variants': { n: 201812, rocAuc: 0.902, prAuc: 0.806 },
      'New SNVs': { n: 171021, rocAuc: 0.848, prAuc: 0.637 },
      'New non-SNVs': { n: 30791, rocAuc: 0.826, prAuc: 0.914 },
      'New scored missense SNVs': { n: 29515, rocAuc: 0.987, prAuc: 0.971 },
    },
  },
];

// ─── High-confidence label quality (high_confidence_report.md) ──────────────
export const highConfidenceResults = {
  highConfidenceRows: {
    n: 34457,
    pathogenicRate: 0.257,
    clinvarOnly_allLabels_LightGBM: { rocAuc: 0.787, prAuc: 0.669, f1: 0.612 },
    withAnnotations_allLabels_LightGBM: { rocAuc: 0.869, prAuc: 0.767, f1: 0.722 },
  },
  singleSubmitterRows: {
    n: 101064,
    pathogenicRate: 0.242,
    clinvarOnly_allLabels_LightGBM: { rocAuc: 0.814, prAuc: 0.684, f1: 0.645 },
    withAnnotations_allLabels_LightGBM: { rocAuc: 0.875, prAuc: 0.774, f1: 0.668 },
  },
};

// ─── Tuning results (tuning_report.md) ─────────────────────────────────────
export const lgbmHyperparams: TuningHyperparamResult[] = [
  { rank: 1, cvPrAuc: 0.7990, cvStd: 0.0178, isDefault: false,
    params: "n_estimators=500, lr=0.02, num_leaves=63, min_child_samples=50, subsample=0.85, colsample=0.8, λ=1.0" },
  { rank: 2, cvPrAuc: 0.7984, cvStd: 0.0175, isDefault: false,
    params: "n_estimators=500, lr=0.02, num_leaves=127, min_child_samples=100, subsample=0.85, colsample=0.8, λ=0.0" },
  { rank: 3, cvPrAuc: 0.7978, cvStd: 0.0173, isDefault: true,
    params: "n_estimators=300, lr=0.05, num_leaves=63, min_child_samples=20, subsample=1.0, colsample=1.0, λ=0.0" },
  { rank: 4, cvPrAuc: 0.7974, cvStd: 0.0175, isDefault: false,
    params: "n_estimators=150, lr=0.05, num_leaves=127, min_child_samples=50, subsample=0.7, colsample=0.8, λ=10.0" },
  { rank: 5, cvPrAuc: 0.7969, cvStd: 0.0164, isDefault: false,
    params: "n_estimators=500, lr=0.02, num_leaves=255, min_child_samples=20, subsample=0.85, colsample=0.6, λ=1.0" },
  { rank: 6, cvPrAuc: 0.7959, cvStd: 0.0168, isDefault: false,
    params: "n_estimators=500, lr=0.05, num_leaves=127, min_child_samples=50, subsample=1.0, colsample=0.8, λ=0.0" },
];

export const xgboostHyperparams: TuningHyperparamResult[] = [
  { rank: 1, cvPrAuc: 0.7979, cvStd: 0.0166, isDefault: false,
    params: "n_estimators=500, lr=0.03, max_depth=8, min_child=20, subsample=1.0, colsample=0.6, λ=1.0" },
  { rank: 2, cvPrAuc: 0.7975, cvStd: 0.0175, isDefault: false,
    params: "n_estimators=500, lr=0.03, max_depth=8, min_child=5, subsample=0.7, colsample=0.6, λ=10.0" },
  { rank: 3, cvPrAuc: 0.7966, cvStd: 0.0170, isDefault: false,
    params: "n_estimators=300, lr=0.03, max_depth=10, min_child=20, subsample=0.7, colsample=0.6, λ=10.0" },
  { rank: 4, cvPrAuc: 0.7965, cvStd: 0.0174, isDefault: true,
    params: "n_estimators=200, lr=0.05, max_depth=8, min_child=1, subsample=1.0, colsample=1.0, λ=1.0" },
];

// ─── Annotation coverage summary ─────────────────────────────────────────────
export const annotationCoverage = {
  alphaMissenseCoverageOfTest: 0.1535,  // annotated_results.json § test_coverage_has_am
  alphaMissenseScoredMissenseSNVs: 20800,
  gnomadCoverage: 'Gene-level (all genes with published constraint metrics)',
  notes: [
    'AlphaMissense scores ~15% of test set (missense SNVs only)',
    'gnomAD gene constraint applies at gene level; not variant-level',
    '~85% of variants receive no benefit from current annotation set',
  ],
};

// ─── Reports catalogue ────────────────────────────────────────────────────────
export const reportsCatalogue = [
  {
    id: 'baseline',
    title: 'ClinVar-Only Baseline Evaluation',
    generated: '2026-10-08T09:43:57',
    description: 'Five models trained on ClinVar-only features with chromosome hold-out split. Includes per-variant-type breakdown and ablation without gene features.',
    keyFindings: [
      'Best ROC-AUC 0.812 (Logistic Regression), best PR-AUC 0.684 (LightGBM)',
      'Models are within bootstrap CI of each other — no single best model',
      'Performance driven by variant type: SNVs have PR-AUC 0.454 vs 0.880+ for deletions',
      'ReviewStatus and gene features are the most informative ClinVar columns',
    ],
    limitations: [
      'ClinVar-only; no external biological annotations',
      'ReviewStatus is a proxy for label provenance and may inflate scores',
      'Not a clinically validated tool',
    ],
    path: 'output/reports/baseline_report.md',
  },
  {
    id: 'annotated',
    title: 'Annotation-Enhanced Evaluation',
    generated: '2026-10-09T10:35:05',
    description: 'Three models with AlphaMissense scores and gnomAD v4.1 gene constraint added. Evaluated across feature-set combinations.',
    keyFindings: [
      'AlphaMissense alone drives nearly all improvement: ROC-AUC 0.812 → 0.871',
      'gnomAD adds ~0.01 ROC-AUC on top of ClinVar baseline',
      'Both combined: best ROC-AUC 0.873, best PR-AUC 0.775',
      'AlphaMissense gain confirmed as non-leakage (validated against published results)',
    ],
    limitations: [
      'AlphaMissense CC BY-NC-SA 4.0 — non-commercial only',
      'Only 15% of test set has AlphaMissense scores',
      'has_am flag may contribute modest variant-type signal independently',
    ],
    path: 'output/reports/annotated_report.md',
  },
  {
    id: 'snv',
    title: 'Variant-Type Performance Breakdown',
    generated: '2026-10-09T10:41:52',
    description: 'Breakdown by variant subgroup: scored missense SNVs, other SNVs, non-SNVs.',
    keyFindings: [
      'Scored missense SNVs: ROC-AUC 0.73 → 0.96 with AlphaMissense',
      'Other SNVs: no meaningful improvement (0.70 → 0.71)',
      'Non-SNVs: no improvement from annotations (0.74 → 0.74)',
    ],
    limitations: [
      'gnomAD missense z-score affects only gene-level groupings',
      'Non-SNV variants have no AlphaMissense scores available',
    ],
    path: 'output/reports/snv_report.md',
  },
  {
    id: 'temporal',
    title: 'Temporal Generalization Check',
    generated: '2026-10-09T11:02:52',
    description: 'Model trained on 2025-10 ClinVar release, tested on 201,812 variants that newly appear in the 2026-10 release.',
    keyFindings: [
      'ClinVar-only: ROC-AUC 0.870, PR-AUC 0.738 on new variants',
      'With annotations: ROC-AUC 0.902, PR-AUC 0.806 (best)',
      'New scored missense SNVs reach ROC-AUC 0.987 with both annotations',
      'Higher absolute numbers than chromosome hold-out because new variants share genes',
    ],
    limitations: [
      'New variants mostly in genes seen during training — not fully independent',
      'Reclassified variants between releases are not covered',
      'Not equivalent to chromosome hold-out — not directly comparable',
    ],
    path: 'output/reports/temporal_report.md',
  },
  {
    id: 'high_confidence',
    title: 'Label-Quality Sensitivity Analysis',
    generated: '2026-10-09T11:19:40',
    description: 'Performance on high-confidence (2+ review stars) vs single-submitter test rows, with and without ReviewStatus feature.',
    keyFindings: [
      'Performance not an artefact of noisy labels',
      'ROC-AUC on 2+ star rows: 0.79 (ClinVar only) vs 0.87 (+ both)',
      'Training on high-confidence labels only does not improve results',
      'Dropping ReviewStatus costs ≤0.01 ROC-AUC',
    ],
    limitations: [
      'High-confidence subset has different class prevalence — PR-AUC not comparable across groups',
      'Not a clinically validated tool',
    ],
    path: 'output/reports/high_confidence_report.md',
  },
  {
    id: 'tuning',
    title: 'Hyperparameter Tuning Analysis',
    generated: '2026-10-09T12:09:19',
    description: 'Position ablation, threshold strategies, calibration comparison, and 13 LightGBM / 9 XGBoost config search using chromosome-grouped CV.',
    keyFindings: [
      'Position features (PositionVCF, Stop) help with ClinVar-only (+0.027 PR-AUC)',
      'All 13 LightGBM configs land within 0.793–0.799 CV PR-AUC (within fold spread ±0.017)',
      'Best tuned LightGBM: ROC-AUC 0.874, PR-AUC 0.779',
      'F1 threshold from validation is unstable; isotonic calibration cuts ECE 0.08→0.02',
    ],
    limitations: [
      'Hyperparameter differences are within noise given fold-to-fold spread',
      'Precision-targeted threshold (80% validation) transfers more reliably than F1 threshold',
    ],
    path: 'output/reports/tuning_report.md',
  },
  {
    id: 'split_audit',
    title: 'Data-Split Integrity Audit',
    generated: '2026-10-08',
    description: 'Verification of chromosome hold-out split integrity.',
    keyFindings: [
      'Zero variant-key overlap across train/val/test',
      'No duplicate or conflicting variant keys',
      'No unassigned chromosomes',
      'Gene encoding is out-of-fold for train, training-only for val/test',
    ],
    limitations: [],
    path: 'output/reports/split_audit.md',
  },
];

// ─── Demonstration variants ──────────────────────────────────────────────────
// These are illustrative records only. They do NOT represent real ClinVar
// submissions or verified biological evidence. Labels are for UI demonstration.
export const demoVariants: DemoVariant[] = [
  {
    id: 'DEMO-001', chromosome: '17', position: 43071077, ref: 'C', alt: 'T',
    gene: 'BRCA1', variantType: 'single nucleotide variant',
    clinvarClassification: 'Pathogenic', reviewStatus: 'reviewed by expert panel', reviewStars: 4,
    hasAlphaMissense: true, alphaMissenseScore: 0.923,
    hasGnomad: true, gnomadLoeuf: 0.29, gnomadPli: 0.999,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Not a verified ClinVar submission.',
  },
  {
    id: 'DEMO-002', chromosome: '13', position: 32906729, ref: 'A', alt: 'G',
    gene: 'BRCA2', variantType: 'single nucleotide variant',
    clinvarClassification: 'Benign', reviewStatus: 'criteria provided, multiple submitters, no conflicts', reviewStars: 2,
    hasAlphaMissense: true, alphaMissenseScore: 0.041,
    hasGnomad: true, gnomadLoeuf: 0.53, gnomadPli: 0.887,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Not a verified ClinVar submission.',
  },
  {
    id: 'DEMO-003', chromosome: '7', position: 117548628, ref: 'G', alt: 'A',
    gene: 'CFTR', variantType: 'single nucleotide variant',
    clinvarClassification: 'Pathogenic', reviewStatus: 'reviewed by expert panel', reviewStars: 4,
    hasAlphaMissense: true, alphaMissenseScore: 0.882,
    hasGnomad: true, gnomadLoeuf: 0.18, gnomadPli: 0.999,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Not a verified ClinVar submission.',
  },
  {
    id: 'DEMO-004', chromosome: '1', position: 43391820, ref: 'T', alt: 'C',
    gene: 'MUTYH', variantType: 'single nucleotide variant',
    clinvarClassification: 'Likely pathogenic', reviewStatus: 'criteria provided, single submitter', reviewStars: 1,
    hasAlphaMissense: false,
    hasGnomad: true, gnomadLoeuf: 0.74, gnomadPli: 0.621,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. No AlphaMissense score — variant not in scored missense set.',
  },
  {
    id: 'DEMO-005', chromosome: '3', position: 10183673, ref: 'AGTCG', alt: 'A',
    gene: 'VHL', variantType: 'deletion',
    clinvarClassification: 'Pathogenic', reviewStatus: 'reviewed by expert panel', reviewStars: 4,
    hasAlphaMissense: false,
    hasGnomad: true, gnomadLoeuf: 0.12, gnomadPli: 0.999,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Deletion — AlphaMissense does not score non-SNV variants.',
  },
  {
    id: 'DEMO-006', chromosome: '22', position: 29083684, ref: 'C', alt: 'T',
    gene: 'CHEK2', variantType: 'single nucleotide variant',
    clinvarClassification: 'Benign', reviewStatus: 'criteria provided, multiple submitters, no conflicts', reviewStars: 2,
    hasAlphaMissense: true, alphaMissenseScore: 0.038,
    hasGnomad: true, gnomadLoeuf: 0.61, gnomadPli: 0.764,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Not a verified ClinVar submission.',
  },
  {
    id: 'DEMO-007', chromosome: 'X', position: 153296726, ref: 'G', alt: 'A',
    gene: 'MECP2', variantType: 'single nucleotide variant',
    clinvarClassification: 'Pathogenic', reviewStatus: 'reviewed by expert panel', reviewStars: 4,
    hasAlphaMissense: true, alphaMissenseScore: 0.957,
    hasGnomad: true, gnomadLoeuf: 0.07, gnomadPli: 0.999,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Not a verified ClinVar submission.',
  },
  {
    id: 'DEMO-008', chromosome: '5', position: 112839929, ref: 'C', alt: 'T',
    gene: 'APC', variantType: 'single nucleotide variant',
    clinvarClassification: 'Uncertain significance', reviewStatus: 'criteria provided, single submitter', reviewStars: 1,
    hasAlphaMissense: true, alphaMissenseScore: 0.481,
    hasGnomad: true, gnomadLoeuf: 0.31, gnomadPli: 0.998,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Borderline AlphaMissense score.',
  },
  {
    id: 'DEMO-009', chromosome: '2', position: 47641560, ref: 'A', alt: 'ACTT',
    gene: 'MSH2', variantType: 'insertion',
    clinvarClassification: 'Pathogenic', reviewStatus: 'criteria provided, multiple submitters, no conflicts', reviewStars: 2,
    hasAlphaMissense: false,
    hasGnomad: true, gnomadLoeuf: 0.24, gnomadPli: 0.999,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. Insertion — AlphaMissense not applicable.',
  },
  {
    id: 'DEMO-010', chromosome: '21', position: 43786414, ref: 'G', alt: 'T',
    gene: 'ERG', variantType: 'single nucleotide variant',
    clinvarClassification: 'Likely benign', reviewStatus: 'criteria provided, single submitter', reviewStars: 1,
    hasAlphaMissense: true, alphaMissenseScore: 0.072,
    hasGnomad: false,
    source: 'demonstration',
    note: 'Illustrative demonstration record only. No gnomAD constraint data available for this gene.',
  },
];

// ─── Annotation coverage rates ────────────────────────────────────────────────
export const coverageSummary = {
  testSetSize: datasetSizes.test,
  pathogenicRate: 0.246,  // high_confidence.json § all test pathogenic_rate
  hasAlphaMissense: Math.round(datasetSizes.test * 0.1535), // ~20,800
  hasGnomad: 'Gene-level: majority of genes covered',
  missingAlphaMissense: Math.round(datasetSizes.test * (1 - 0.1535)),
  alphaMissenseCoverage: '15.4%',
};
