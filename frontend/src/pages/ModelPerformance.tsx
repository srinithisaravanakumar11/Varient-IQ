import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import { clsx } from 'clsx';
import {
  PageHeader, SectionHeader, LimitationBox, InfoBox, MetricCard,
} from '../components/shared';
import {
  baselineModels, annotatedComparison, variantTypeBreakdown,
  snvGroupResults, lgbmHyperparams,
  temporalResults,
} from '../data/researchData';
import {
  CHART_FOREST, CHART_TERRACOTTA, CHART_SAGE, CHART_WARM_GRAY,
  CHART_PLUM, CHART_AMBER, useTheme
} from '../theme';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#DED9CC] dark:border-[#2E3E34] bg-[#FFFEFA] dark:bg-[#1D2A23] px-3.5 py-2.5 text-xs shadow-md max-w-xs">
      <div className="text-[#292D29] dark:text-[#EAE7DD] font-heading font-bold mb-1.5 truncate">{label}</div>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex gap-2 items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color || p.fill }} />
              <span className="text-[#72776E] dark:text-[#9FA59A] truncate">{p.name}:</span>
            </div>
            <span className="text-[#292D29] dark:text-[#EAE7DD] font-mono font-semibold ml-2 flex-shrink-0">
              {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type Tab = 'models' | 'annotations' | 'variants' | 'temporal' | 'confidence' | 'tuning';

const TABS: { id: Tab; label: string }[] = [
  { id: 'models', label: 'Architecture Comparison' },
  { id: 'annotations', label: 'Annotation Ablation' },
  { id: 'variants', label: 'Variant Types' },
  { id: 'temporal', label: 'Temporal Generalization' },
  { id: 'confidence', label: 'Label Quality' },
  { id: 'tuning', label: 'Hyperparameter Tuning' },
];

function ModelComparisonTab() {
  const { isDark } = useTheme();
  const cForest = isDark ? '#3F6553' : CHART_FOREST;
  const cTerracotta = isDark ? '#D08264' : CHART_TERRACOTTA;
  const cAmber = isDark ? '#D4A853' : CHART_AMBER;
  const cPlum = isDark ? '#8A6075' : CHART_PLUM;

  const calibrationData = baselineModels.map(m => ({
    model: m.model.replace('Logistic Regression', 'LR').replace('Random Forest', 'RF'),
    ECE: m.ece,
    Brier: m.brier,
  }));

  const ciData = baselineModels.map(m => ({
    model: m.model.replace('Logistic Regression', 'LR').replace('Random Forest', 'RF'),
    'ROC-AUC mean': m.rocAuc,
    'CI low': m.rocAucCi[0],
    'CI high': m.rocAucCi[1],
  }));

  return (
    <div className="space-y-6">
      <InfoBox title="Statistical Provenance">
        baseline_results.json — Mean across 3 random seeds, 95% bootstrap CI (1,000 resamples), chromosome hold-out test partition. All models trained on 181 ClinVar-only baseline features.
      </InfoBox>

      {/* Metrics table */}
      <div className="card overflow-x-auto !p-0">
        <div className="p-4 border-b border-[#DED9CC] dark:border-[#2E3E34]">
          <SectionHeader title="ClinVar-Only Baseline Architecture Metrics" subtitle="Mean ± std over 3 seeds on hold-out test set" className="!mb-0" />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA]/60 dark:bg-[#141C17]/60">
              {['Model', 'ROC-AUC', 'PR-AUC', 'F1 Score', 'Precision', 'Recall', 'Brier Score', 'ECE Calibration'].map(h => (
                <th key={h} className="table-header px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {baselineModels.map(m => (
              <tr key={m.model} className="table-row">
                <td className="px-4 py-3 text-[#292D29] dark:text-[#EAE7DD] font-heading font-semibold text-xs">{m.model}</td>
                <td className="px-4 py-3 font-mono text-[#243D32] dark:text-[#8FA385] font-bold text-xs">{m.rocAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#B96F52] dark:text-[#D08264] font-bold text-xs">{m.prAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#292D29] dark:text-[#EAE7DD] text-xs">{m.f1.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#72776E] dark:text-[#9FA59A] text-xs">{m.precision.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#72776E] dark:text-[#9FA59A] text-xs">{m.recall.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#72776E] dark:text-[#9FA59A] text-xs">{m.brier.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: m.ece > 0.1 ? cAmber : cForest }}>
                  {m.ece.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calibration and CIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <SectionHeader title="Calibration Rigor (ECE & Brier Score)" subtitle="Lower is better for both uncertainty metrics" />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calibrationData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 0.16]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="ECE" fill={cAmber} radius={[3, 3, 0, 0]} name="Expected Calibration Error (ECE)" />
                <Bar dataKey="Brier" fill={cPlum} radius={[3, 3, 0, 0]} name="Brier Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A]">
            LightGBM and XGBoost achieve tight probability calibration (ECE ≈ 0.036–0.044), while uncalibrated Logistic Regression produces higher drift (ECE ≈ 0.119).
          </div>
        </div>

        <div className="card space-y-3">
          <SectionHeader title="95% Bootstrap Confidence Intervals" subtitle="Seed 0 hold-out (ROC-AUC bounds)" />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ciData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 11 }} />
                <YAxis domain={[0.77, 0.83]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ROC-AUC mean" fill={cForest} radius={[3, 3, 0, 0]} name="ROC-AUC (Mean)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A]">
            Bootstrap confidence intervals span ±0.003–0.005; models overlap statistically without external biological features.
          </div>
        </div>
      </div>

      <LimitationBox items={[
        'Overlapping Bounds: All 5 architectures perform within each other\'s 95% bootstrap confidence intervals.',
        'Deterministic Seed Stability: Logistic Regression and XGBoost exhibit near-zero variance across seeds; LightGBM has ±0.002 std.',
        'Hardware Consistency: Training benchmarks measured under standardized single-core CPU execution.',
      ]} />
    </div>
  );
}

function AnnotationAblationTab() {
  const { isDark } = useTheme();
  const cForest = isDark ? '#3F6553' : CHART_FOREST;
  const cTerracotta = isDark ? '#D08264' : CHART_TERRACOTTA;
  const cPlum = isDark ? '#8A6075' : CHART_PLUM;

  const chartData = annotatedComparison.map(fs => ({
    featureSet: fs.featureSet,
    'LightGBM ROC-AUC': fs.models.LightGBM?.rocAuc,
    'XGBoost ROC-AUC': fs.models.XGBoost?.rocAuc,
    'LR ROC-AUC': fs.models['Logistic Regression']?.rocAuc,
  }));

  return (
    <div className="space-y-6">
      <InfoBox title="Annotation Synthesis">
        annotated_results.json — 3 random seeds, LightGBM / XGBoost / Logistic Regression compared across 4 successive feature combinations.
      </InfoBox>

      <div className="card space-y-4">
        <SectionHeader title="ROC-AUC Progression Across Biological Feature Sets" subtitle="Evaluating incremental lift from gnomAD constraint and AlphaMissense" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="featureSet" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
              <YAxis domain={[0.79, 0.89]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 6 }} />
              <Bar dataKey="LightGBM ROC-AUC" fill={cForest} radius={[3, 3, 0, 0]} />
              <Bar dataKey="XGBoost ROC-AUC" fill={cTerracotta} radius={[3, 3, 0, 0]} />
              <Bar dataKey="LR ROC-AUC" fill={cPlum} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto !p-0">
        <div className="p-4 border-b border-[#DED9CC] dark:border-[#2E3E34]">
          <SectionHeader title="Feature Set Progression Matrix" subtitle="Detailed ROC-AUC and PR-AUC breakdown across models" className="!mb-0" />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA]/60 dark:bg-[#141C17]/60">
              <th className="table-header px-4 py-3 text-left">Feature Set</th>
              <th className="table-header px-4 py-3 text-left">Columns</th>
              <th className="table-header px-4 py-3 text-left" colSpan={2}>LightGBM</th>
              <th className="table-header px-4 py-3 text-left" colSpan={2}>XGBoost</th>
              <th className="table-header px-4 py-3 text-left" colSpan={2}>Logistic Regression</th>
            </tr>
            <tr className="border-b border-[#DED9CC]/60 dark:border-[#2E3E34]/60 bg-[#F5F2EA]/30 dark:bg-[#141C17]/30 text-[10px]">
              <th className="px-4 py-1" colSpan={2} />
              <th className="px-4 py-1 font-mono text-[#72776E]">ROC</th>
              <th className="px-4 py-1 font-mono text-[#72776E]">PR</th>
              <th className="px-4 py-1 font-mono text-[#72776E]">ROC</th>
              <th className="px-4 py-1 font-mono text-[#72776E]">PR</th>
              <th className="px-4 py-1 font-mono text-[#72776E]">ROC</th>
              <th className="px-4 py-1 font-mono text-[#72776E]">PR</th>
            </tr>
          </thead>
          <tbody>
            {annotatedComparison.map(fs => (
              <tr key={fs.featureSet} className="table-row">
                <td className="px-4 py-3 text-[#292D29] dark:text-[#EAE7DD] font-heading font-semibold">{fs.featureSet}</td>
                <td className="px-4 py-3 font-mono text-[#72776E]">{fs.nFeatures}</td>
                <td className="px-4 py-3 font-mono text-[#243D32] dark:text-[#8FA385] font-bold">{fs.models.LightGBM?.rocAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#B96F52] dark:text-[#D08264]">{fs.models.LightGBM?.prAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#243D32] dark:text-[#8FA385] font-bold">{fs.models.XGBoost?.rocAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#B96F52] dark:text-[#D08264]">{fs.models.XGBoost?.prAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#243D32] dark:text-[#8FA385] font-bold">{fs.models['Logistic Regression']?.rocAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#B96F52] dark:text-[#D08264]">{fs.models['Logistic Regression']?.prAuc.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LimitationBox items={[
        'Asymmetric Driver: AlphaMissense drives almost all external lift (+0.057 ROC-AUC); gnomAD constraint contributes +0.010 on its own.',
        'Flag Information Leak: The presence of has_am itself conveys structural variant information.',
        'Academic Non-Commercial License: AlphaMissense data is governed by CC BY-NC-SA 4.0.',
      ]} />
    </div>
  );
}

function VariantTypesTab() {
  const { isDark } = useTheme();
  const cForest = isDark ? '#3F6553' : CHART_FOREST;
  const cSage = isDark ? '#8FA385' : CHART_SAGE;
  const cGray = isDark ? '#B4B0A4' : CHART_WARM_GRAY;

  const barData = variantTypeBreakdown.map(v => ({
    type: v.type.replace('Single Nucleotide Variant', 'SNV'),
    'ROC-AUC': v.rocAuc,
    'PR-AUC': v.prAuc,
  }));

  const snvData = snvGroupResults.map(g => ({
    group: g.group,
    'ClinVar only': g.clinvarOnly.rocAuc,
    'With annotations': g.withAnnotations.rocAuc,
  }));

  return (
    <div className="space-y-6">
      <InfoBox title="Prevalence Sensitivity">
        baseline_report.md & snv_report.json. PR-AUC is bounded by positive class prevalence. Deletions and duplications have high prior (70–78%), yielding high PR-AUC independently of model strength.
      </InfoBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <SectionHeader title="ROC-AUC by Variant Taxonomy" subtitle="LightGBM baseline features" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 20, left: 75, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0.5, 1.0]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ROC-AUC" fill={cSage} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card space-y-3">
          <SectionHeader title="Annotation Subgroup Comparison" subtitle="ClinVar only vs With annotations (ROC-AUC)" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snvData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                <YAxis domain={[0.60, 1.0]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="ClinVar only" fill={cGray} radius={[3, 3, 0, 0]} />
                <Bar dataKey="With annotations" fill={cForest} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto !p-0">
        <div className="p-4 border-b border-[#DED9CC] dark:border-[#2E3E34]">
          <SectionHeader title="Per-Type Quantitative Statistics" subtitle="LightGBM ClinVar-only baseline breakdown" className="!mb-0" />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA]/60 dark:bg-[#141C17]/60">
              {['Variant Class', 'Count (n)', 'Pathogenic %', 'ROC-AUC', 'PR-AUC', 'F1 Score'].map(h => (
                <th key={h} className="table-header px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variantTypeBreakdown.map(v => (
              <tr key={v.type} className="table-row">
                <td className="px-4 py-3 text-[#292D29] dark:text-[#EAE7DD] font-medium">{v.type}</td>
                <td className="px-4 py-3 font-mono text-[#72776E]">{v.n.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: v.pathogenicRate > 0.5 ? '#B96F52' : '#84977A' }}>
                  {(v.pathogenicRate * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 font-mono text-[#243D32] dark:text-[#8FA385] font-bold">{v.rocAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#B96F52] dark:text-[#D08264]">{v.prAuc.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#72776E]">{v.f1.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LimitationBox items={[
        'Prevalence Distortion: PR-AUC is governed by class imbalance; avoid direct PR comparisons across variant classes.',
        'Structural Lifting: Global ROC is elevated by deletions/duplications which carry 70–86% pathogenic rates.',
      ]} />
    </div>
  );
}

function TemporalTab() {
  const { isDark } = useTheme();
  const cForest = isDark ? '#3F6553' : CHART_FOREST;

  const summaryData = [
    { label: 'ClinVar only — All New Variants', rocAuc: 0.870, prAuc: 0.738 },
    { label: '+ Both Annotations — All New', rocAuc: 0.902, prAuc: 0.806, featured: true },
    { label: '+ Annotations — Scored Missense', rocAuc: 0.987, prAuc: 0.971, featured: true },
  ];

  return (
    <div className="space-y-6">
      <InfoBox title="Prospective Setup">
        temporal_results.json — LightGBM trained on 2025-10 ClinVar release, evaluated on 201,812 variants that first appear in the 2026-10 release.
      </InfoBox>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryData.map(s => (
          <MetricCard
            key={s.label}
            label={s.label}
            value={s.rocAuc.toFixed(3)}
            sub={`PR-AUC: ${s.prAuc.toFixed(3)}`}
            badge="Prospective"
            badgeVariant="terracotta"
            featured={s.featured}
          />
        ))}
      </div>

      <div className="card space-y-3">
        <SectionHeader title="Prospective Generalization Stability" subtitle="Model evaluation on 201,812 variants submitted between 2025 and 2026" />
        <div className="p-4 rounded-lg bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34] text-xs leading-relaxed space-y-2">
          <p className="text-[#292D29] dark:text-[#EAE7DD] font-semibold">
            Prospective Evaluation Finding:
          </p>
          <p className="text-[#72776E] dark:text-[#9FA59A]">
            Model generalization holds up cleanly over chronological releases. Full annotated model achieves 0.902 ROC-AUC on 201,812 newly added variants, with prospective scored missense variants reaching 0.987 ROC-AUC. Absolute figures are higher than chromosome hold-out because new variants frequently occupy previously cataloged disease genes.
          </p>
        </div>
      </div>

      <LimitationBox items={[
        'Gene Linkage: New variants mostly fall in genes previously seen in earlier ClinVar releases.',
        'Reclassifications Excluded: Variants whose classifications changed between releases were omitted.',
      ]} />
    </div>
  );
}

function LabelQualityTab() {
  const { isDark } = useTheme();
  const cForest = isDark ? '#3F6553' : CHART_FOREST;
  const cGray = isDark ? '#B4B0A4' : CHART_WARM_GRAY;

  const data = [
    { group: 'High-confidence (2+ stars)', n: 34457, clinvarOnly: 0.787, withAnnotations: 0.869 },
    { group: 'Single submitter (1 star)', n: 101064, clinvarOnly: 0.814, withAnnotations: 0.875 },
    { group: 'All test variants', n: 135521, clinvarOnly: 0.810, withAnnotations: 0.872 },
  ];

  return (
    <div className="space-y-6">
      <InfoBox title="Label Curation Sensitivity">
        high_confidence_report.md — Testing whether model performance is driven by noise in single-submitter ClinVar annotations.
      </InfoBox>

      <div className="card space-y-3">
        <SectionHeader title="ROC-AUC by Curation Stringency" subtitle="LightGBM trained on all labels vs evaluated on expert-curated subsets" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} />
              <YAxis domain={[0.75, 0.90]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="clinvarOnly" name="ClinVar only" fill={cGray} radius={[3, 3, 0, 0]} />
              <Bar dataKey="withAnnotations" name="With annotations" fill={cForest} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA]/60 dark:bg-[#141C17]/60">
              {['Curation Cohort', 'Sample Size (n)', 'ClinVar Only ROC', 'With Annotations ROC', 'Net Lift'].map(h => (
                <th key={h} className="table-header px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.group} className="table-row">
                <td className="px-4 py-3 text-[#292D29] dark:text-[#EAE7DD] font-medium">{row.group}</td>
                <td className="px-4 py-3 font-mono text-[#72776E]">{row.n.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-[#72776E]">{row.clinvarOnly.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#243D32] dark:text-[#8FA385] font-bold">{row.withAnnotations.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-[#B96F52] dark:text-[#D08264] font-bold">+{(row.withAnnotations - row.clinvarOnly).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LimitationBox items={[
        'Robust to Noise: Accuracy on 2+ star expert records is 0.869 with annotations — demonstrating models do not rely on label noise.',
        'Data Volume Value: Training strictly on 2+ star records hurts performance due to an 80% loss in training rows.',
      ]} />
    </div>
  );
}

function TuningTab() {
  const { isDark } = useTheme();
  const cForest = isDark ? '#3F6553' : CHART_FOREST;
  const cTerracotta = isDark ? '#D08264' : CHART_TERRACOTTA;

  const tuningCompare = [
    { label: 'LightGBM Default', rocAuc: 0.868, prAuc: 0.764 },
    { label: 'LightGBM Tuned (Best)', rocAuc: 0.874, prAuc: 0.772 },
    { label: 'XGBoost Default', rocAuc: 0.872, prAuc: 0.767 },
    { label: 'XGBoost Tuned', rocAuc: 0.871, prAuc: 0.767 },
  ];

  return (
    <div className="space-y-6">
      <InfoBox title="Optimization Sweep">
        tuning_results.json & tuning_report.md — Chromosome-grouped 4-fold cross-validation sweep over 13 LightGBM configurations and probability calibration.
      </InfoBox>

      <div className="card space-y-3">
        <SectionHeader title="Default vs Tuned Test Metrics" subtitle="Test performance after chromosome-grouped CV optimization (+ both feature set)" />
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tuningCompare} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0.85, 0.89]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(3)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="rocAuc" name="ROC-AUC" fill={cForest} radius={[3, 3, 0, 0]} />
              <Bar dataKey="prAuc" name="PR-AUC" fill={cTerracotta} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto !p-0">
        <div className="p-4 border-b border-[#DED9CC] dark:border-[#2E3E34]">
          <SectionHeader title="LightGBM Hyperparameter CV Ranking" subtitle="Top search configurations on grouped CV" className="!mb-0" />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA]/60 dark:bg-[#141C17]/60">
              {['Rank', 'CV PR-AUC', 'Fold Spread', 'Status', 'Hyperparameters'].map(h => (
                <th key={h} className="table-header px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lgbmHyperparams.map(row => (
              <tr key={row.rank} className={clsx('table-row', row.rank === 1 && 'bg-[#B96F52]/5')}>
                <td className="px-4 py-3 font-mono font-bold text-[#292D29] dark:text-[#EAE7DD]">{row.rank}</td>
                <td className="px-4 py-3 font-mono text-[#243D32] dark:text-[#8FA385] font-bold">{row.cvPrAuc.toFixed(4)}</td>
                <td className="px-4 py-3 font-mono text-[#72776E]">±{row.cvStd.toFixed(4)}</td>
                <td className="px-4 py-3">
                  {row.isDefault ? (
                    <span className="badge badge-neutral">default</span>
                  ) : (
                    row.rank === 1 && <span className="badge badge-terracotta">optimal</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[#72776E] text-[11px] truncate max-w-md">{row.params}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LimitationBox items={[
        'Narrow Optimization Spread: All 13 LightGBM configurations land within ±0.003 CV PR-AUC; fold spread is ±0.017.',
        'Isotonic Calibration Benefit: Probability calibration cuts validation ECE from 0.08 down to 0.02.',
      ]} />
    </div>
  );
}

export default function ModelPerformance() {
  const [tab, setTab] = useState<Tab>('models');

  return (
    <div className="page-enter space-y-6 max-w-7xl">
      <PageHeader
        title="Model Performance Lab"
        description="Scientific analysis of stored empirical results from baseline architectures, annotation ablations, variant taxonomy breakdowns, temporal prospective checks, and hyperparameter tuning sweeps."
      />

      {/* Botanical Tab Bar */}
      <div className="flex gap-1.5 flex-wrap p-1.5 rounded-xl border border-[#DED9CC] dark:border-[#2E3E34] bg-[#FFFEFA] dark:bg-[#1D2A23] shadow-sm">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-3.5 py-2 rounded-lg text-xs font-heading font-semibold transition-all duration-150',
              tab === t.id
                ? 'bg-[#243D32] dark:bg-[#2E4D40] text-[#FFFEFA] shadow-sm'
                : 'text-[#72776E] dark:text-[#9FA59A] hover:text-[#292D29] dark:hover:text-[#EAE7DD] hover:bg-[#DED9CC]/30 dark:hover:bg-[#2E3E34]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tab === 'models' && <ModelComparisonTab />}
        {tab === 'annotations' && <AnnotationAblationTab />}
        {tab === 'variants' && <VariantTypesTab />}
        {tab === 'temporal' && <TemporalTab />}
        {tab === 'confidence' && <LabelQualityTab />}
        {tab === 'tuning' && <TuningTab />}
      </div>
    </div>
  );
}
