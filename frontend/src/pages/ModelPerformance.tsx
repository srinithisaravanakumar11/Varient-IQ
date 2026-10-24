import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ScatterChart, Scatter, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, ReferenceLine,
} from 'recharts';
import { clsx } from 'clsx';
import {
  PageHeader, SectionHeader, LimitationBox, InfoBox, MetricCard,
} from '../components/shared';
import {
  baselineModels, annotatedComparison, variantTypeBreakdown,
  snvGroupResults, lgbmHyperparams, xgboostHyperparams,
  highConfidenceResults, temporalResults,
} from '../data/researchData';

const TEAL = '#2dd4bf';
const CYAN = '#22d3ee';
const BLUE = '#60a5fa';
const AMBER = '#fbbf24';
const SLATE = '#475569';
const VIOLET = '#a78bfa';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs shadow-xl max-w-xs">
      <div className="text-slate-300 font-medium mb-1 truncate">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
          <span className="text-slate-400 truncate">{p.name}:</span>
          <span className="text-slate-100 font-mono flex-shrink-0">{typeof p.value === 'number' ? p.value.toFixed(3) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

type Tab = 'models' | 'annotations' | 'variants' | 'temporal' | 'confidence' | 'tuning';

const TABS: { id: Tab; label: string }[] = [
  { id: 'models', label: 'Model Comparison' },
  { id: 'annotations', label: 'Annotation Ablation' },
  { id: 'variants', label: 'Variant Types' },
  { id: 'temporal', label: 'Temporal' },
  { id: 'confidence', label: 'Label Quality' },
  { id: 'tuning', label: 'Hyperparameter Tuning' },
];

function ModelComparisonTab() {
  const radarData = baselineModels.map(m => ({
    model: m.model.replace('Logistic Regression', 'LR').replace('Random Forest', 'RF'),
    'ROC-AUC': +(m.rocAuc * 100).toFixed(1),
    'PR-AUC': +(m.prAuc * 100).toFixed(1),
    'F1': +(m.f1 * 100).toFixed(1),
    Precision: +(m.precision * 100).toFixed(1),
    Recall: +(m.recall * 100).toFixed(1),
  }));

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
    'PR-AUC mean': m.prAuc,
    'PR CI low': m.prAucCi[0],
    'PR CI high': m.prAucCi[1],
  }));

  return (
    <div className="space-y-6">
      <InfoBox title="Source">
        baseline_results.json — mean over 3 seeds, 95% bootstrap CI (200 resamples), chromosome hold-out test set.
        Training time is mean over seeds. All models use ClinVar-only features (181 features).
      </InfoBox>

      {/* Metrics table */}
      <div className="card overflow-x-auto">
        <SectionHeader title="ClinVar-Only Baseline Metrics" subtitle="Mean ± std over 3 seeds" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700/60">
              {['Model', 'ROC-AUC', 'PR-AUC', 'F1', 'Precision', 'Recall', 'Brier', 'ECE', 'Train time (s)'].map(h => (
                <th key={h} className="table-header px-3 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {baselineModels.map(m => (
              <tr key={m.model} className="table-row">
                <td className="px-3 py-2.5 text-slate-200 font-medium text-xs">{m.model}</td>
                <td className="px-3 py-2.5 font-mono text-teal-400 text-xs">{m.rocAuc.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-cyan-400 text-xs">{m.prAuc.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{m.f1.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{m.precision.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{m.recall.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400 text-xs">{m.brier.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-xs" style={{ color: m.ece > 0.1 ? AMBER : TEAL }}>{m.ece.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400 text-xs">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calibration chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <SectionHeader title="Calibration (ECE & Brier Score)" subtitle="Lower is better for both metrics" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calibrationData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 0.16]} tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="ECE" fill={AMBER} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Brier" fill={VIOLET} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            XGBoost and LightGBM are better calibrated (ECE ≈ 0.04). LR and RF have ECE 0.12–0.14 — probabilities are less reliable.
          </div>
        </div>

        <div className="card">
          <SectionHeader title="95% Bootstrap Confidence Intervals" subtitle="Seed 0 (ROC-AUC)" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ciData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 10 }} />
                <YAxis domain={[0.77, 0.82]} tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ROC-AUC mean" fill={TEAL} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Bootstrap CIs are ±0.003–0.005 — models are not statistically distinguishable on this metric.
          </div>
        </div>
      </div>

      <LimitationBox items={[
        'Bootstrap CI is ±0.003–0.005; models are within each other\'s confidence intervals.',
        'Random seed variation for XGBoost / LR is negligible (≈0); only LightGBM and RF vary across seeds.',
        'Training time measured on a single CPU; varies with hardware.',
      ]} />
    </div>
  );
}

function AnnotationAblationTab() {
  const chartData = annotatedComparison.map(fs => ({
    featureSet: fs.featureSet,
    'LightGBM ROC-AUC': fs.models.LightGBM?.rocAuc,
    'XGBoost ROC-AUC': fs.models.XGBoost?.rocAuc,
    'LR ROC-AUC': fs.models['Logistic Regression']?.rocAuc,
    'LightGBM PR-AUC': fs.models.LightGBM?.prAuc,
    'XGBoost PR-AUC': fs.models.XGBoost?.prAuc,
    'LR PR-AUC': fs.models['Logistic Regression']?.prAuc,
  }));

  return (
    <div className="space-y-6">
      <InfoBox title="Source">
        annotated_results.json — 3 seeds, LightGBM / XGBoost / Logistic Regression across 4 feature sets.
        All values represent stored test-set evaluation metrics.
      </InfoBox>

      <div className="card">
        <SectionHeader title="ROC-AUC Across Feature Sets" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="featureSet" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={65} />
              <YAxis domain={[0.79, 0.88]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="LightGBM ROC-AUC" fill={TEAL} radius={[3, 3, 0, 0]} />
              <Bar dataKey="XGBoost ROC-AUC" fill={BLUE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="LR ROC-AUC" fill={VIOLET} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <SectionHeader title="Feature Set Comparison Table" subtitle="Best-of-3-models values from annotated_results.json" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700/60">
              <th className="table-header px-3 py-3 text-left">Feature Set</th>
              <th className="table-header px-3 py-3 text-left">n Features</th>
              {['LightGBM', 'XGBoost', 'Logistic Regression'].map(m => (
                <th key={m} className="table-header px-3 py-3 text-left" colSpan={2}>{m}</th>
              ))}
            </tr>
            <tr className="border-b border-navy-700/40">
              <th className="px-3 py-1" colSpan={2} />
              {['LightGBM', 'XGBoost', 'Logistic Regression'].map(m => (
                <><th key={`${m}-roc`} className="table-header px-3 py-1 text-left text-[10px]">ROC-AUC</th>
                <th key={`${m}-pr`} className="table-header px-3 py-1 text-left text-[10px]">PR-AUC</th></>
              ))}
            </tr>
          </thead>
          <tbody>
            {annotatedComparison.map(fs => (
              <tr key={fs.featureSet} className="table-row">
                <td className="px-3 py-2.5 text-slate-200 text-xs">{fs.featureSet}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400 text-xs">{fs.nFeatures}</td>
                {(['LightGBM', 'XGBoost', 'Logistic Regression'] as const).map(m => (
                  <>
                    <td key={`${fs.featureSet}-${m}-roc`} className="px-3 py-2.5 font-mono text-teal-400 text-xs">{fs.models[m]?.rocAuc.toFixed(3)}</td>
                    <td key={`${fs.featureSet}-${m}-pr`} className="px-3 py-2.5 font-mono text-cyan-400 text-xs">{fs.models[m]?.prAuc.toFixed(3)}</td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LimitationBox items={[
        'AlphaMissense drives nearly all improvement; gnomAD adds only ~0.01 ROC-AUC.',
        'has_am flag may contribute a small amount of gain independently from the score.',
        '85% of variants get no benefit from current annotations.',
        'AlphaMissense: CC BY-NC-SA 4.0 — non-commercial use only.',
      ]} />
    </div>
  );
}

function VariantTypesTab() {
  const barData = variantTypeBreakdown.map(v => ({
    type: v.type.replace('Single Nucleotide Variant', 'SNV'),
    'ROC-AUC': v.rocAuc,
    'PR-AUC': v.prAuc,
    'Pathogenic %': +(v.pathogenicRate * 100).toFixed(1),
  }));

  const snvData = snvGroupResults.map(g => ({
    group: g.group,
    'ClinVar only': g.clinvarOnly.rocAuc,
    'With annotations': g.withAnnotations.rocAuc,
  }));

  return (
    <div className="space-y-6">
      <InfoBox title="Source">
        baseline_report.md (per-variant-type, LightGBM ClinVar-only) and snv_report.json (annotation gain by subgroup).
        PR-AUC is heavily influenced by pathogenic prevalence — compare only within a variant type.
      </InfoBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <SectionHeader title="ROC-AUC by Variant Type" subtitle="LightGBM, ClinVar-only features" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0.5, 1.0]} tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(2)} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={95} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ROC-AUC" fill={TEAL} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <SectionHeader title="Annotation Gain by Subgroup" subtitle="ClinVar only vs with both annotations (ROC-AUC)" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snvData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" tick={{ fontSize: 10 }} />
                <YAxis domain={[0.60, 1.0]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="ClinVar only" fill={SLATE} radius={[3, 3, 0, 0]} />
                <Bar dataKey="With annotations" fill={TEAL} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <SectionHeader title="Per-Type Details" subtitle="LightGBM ClinVar-only, baseline_report.md" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700/60">
              {['Variant Type', 'n', 'Pathogenic %', 'ROC-AUC', 'PR-AUC', 'F1'].map(h => (
                <th key={h} className="table-header px-3 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variantTypeBreakdown.map(v => (
              <tr key={v.type} className="table-row">
                <td className="px-3 py-2.5 text-slate-200 text-xs">{v.type}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400 text-xs">{v.n.toLocaleString()}</td>
                <td className="px-3 py-2.5 font-mono text-xs" style={{ color: v.pathogenicRate > 0.5 ? AMBER : TEAL }}>
                  {(v.pathogenicRate * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2.5 font-mono text-teal-400 text-xs">{v.rocAuc.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-cyan-400 text-xs">{v.prAuc.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{v.f1.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LimitationBox items={[
        'PR-AUC is dominated by pathogenic class prevalence — do not compare PR-AUC across different variant types.',
        'Aggregate ROC-AUC is lifted by deletions/duplications which are 70–80% pathogenic.',
        'SNVs (86% of test set) have PR-AUC 0.454 with ClinVar-only features.',
      ]} />
    </div>
  );
}

function TemporalTab() {
  const chartData = temporalResults.flatMap(fs =>
    Object.entries(fs.groups).map(([group, m]) => ({
      featureSet: fs.featureSet,
      group,
      'ROC-AUC': m.rocAuc,
      'PR-AUC': m.prAuc,
      n: m.n,
    }))
  );

  const summaryData = [
    { label: 'ClinVar only — all new', rocAuc: 0.870, prAuc: 0.738 },
    { label: '+ annotations — all new', rocAuc: 0.902, prAuc: 0.806 },
    { label: '+ annotations — scored missense', rocAuc: 0.987, prAuc: 0.971 },
  ];

  return (
    <div className="space-y-6">
      <InfoBox title="Source">
        temporal_results.json — LightGBM trained on 2025-10 ClinVar release, tested on 201,812 new variants in 2026-10 release.
        Absolute scores are higher than chromosome hold-out because new variants share genes with training data.
      </InfoBox>

      <div className="grid grid-cols-3 gap-4">
        {summaryData.map(s => (
          <MetricCard key={s.label} label={s.label} value={s.rocAuc.toFixed(3)}
            sub={`PR-AUC: ${s.prAuc.toFixed(3)}`} />
        ))}
      </div>

      <div className="card">
        <SectionHeader title="Temporal Evaluation Results" subtitle="LightGBM — by subgroup and feature set" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.filter(d => d.featureSet === 'ClinVar only' || d.group.includes('all') || d.group.includes('All') || d.group === '+ annotations')}
              margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={65} />
              <YAxis domain={[0.45, 1.0]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="ROC-AUC" fill={TEAL} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <LimitationBox items={[
        'New variants mostly fall in genes already seen during training — not independent of training data.',
        'Temporal check covers newly added ClinVar variants only, not reclassified ones.',
        'Absolute numbers are not directly comparable to chromosome hold-out results.',
        'Scored missense SNVs reach ROC-AUC 0.987 — driven by AlphaMissense on a new set of missense variants.',
      ]} />
    </div>
  );
}

function LabelQualityTab() {
  const data = [
    { group: 'High-confidence (2+ stars)', n: 34457, clinvarOnly: 0.787, withAnnotations: 0.869 },
    { group: 'Single submitter (1 star)', n: 101064, clinvarOnly: 0.814, withAnnotations: 0.875 },
    { group: 'All test', n: 135521, clinvarOnly: 0.810, withAnnotations: 0.872 },
  ];

  return (
    <div className="space-y-6">
      <InfoBox title="Source">
        high_confidence_report.md — seed 0, LightGBM, trained on all labels.
        ROC-AUC is comparable across groups; PR-AUC is not (different class prevalences).
      </InfoBox>

      <div className="card">
        <SectionHeader title="ROC-AUC by Label Quality" subtitle="LightGBM, all labels, with/without annotations" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" tick={{ fontSize: 10 }} />
              <YAxis domain={[0.75, 0.90]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="clinvarOnly" name="ClinVar only" fill={SLATE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="withAnnotations" name="With annotations" fill={TEAL} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700/60">
              {['Group', 'n', 'ClinVar only ROC-AUC', 'With annotations ROC-AUC', 'Gain'].map(h => (
                <th key={h} className="table-header px-3 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.group} className="table-row">
                <td className="px-3 py-2.5 text-slate-200 text-xs">{row.group}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400 text-xs">{row.n.toLocaleString()}</td>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{row.clinvarOnly.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-teal-400 text-xs">{row.withAnnotations.toFixed(3)}</td>
                <td className="px-3 py-2.5 font-mono text-cyan-400 text-xs">+{(row.withAnnotations - row.clinvarOnly).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LimitationBox items={[
        'ROC-AUC on high-confidence (2+ star) rows is 0.79 vs 0.81 on single submitter — not driven by noisy labels.',
        'Training on high-confidence labels only does not help (likely too few training examples).',
        'Dropping ReviewStatus costs ≤0.01 ROC-AUC — result is not an artefact of using the status column.',
      ]} />
    </div>
  );
}

function TuningTab() {
  const tuningCompare = [
    { label: 'LightGBM default', rocAuc: 0.868, prAuc: 0.764 },
    { label: 'LightGBM tuned', rocAuc: 0.874, prAuc: 0.772 },
    { label: 'XGBoost default', rocAuc: 0.872, prAuc: 0.767 },
    { label: 'XGBoost tuned', rocAuc: 0.871, prAuc: 0.767 },
  ];

  return (
    <div className="space-y-6">
      <InfoBox title="Source">
        tuning_results.json / tuning_report.md — chromosome-grouped 4-fold CV, annotated feature set (+ both), position ablation, threshold and calibration comparison.
      </InfoBox>

      <div className="card">
        <SectionHeader title="Default vs Tuned Test Metrics" subtitle="Annotated features (+ both), test ROC-AUC" />
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tuningCompare} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0.86, 0.88]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(3)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="rocAuc" name="ROC-AUC" fill={TEAL} radius={[3, 3, 0, 0]} />
              <Bar dataKey="prAuc" name="PR-AUC" fill={CYAN} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Hyperparameter tuning gains ≈+0.006 ROC-AUC and ≈+0.008 PR-AUC over defaults — within fold-spread noise (±0.017 PR-AUC).
        </div>
      </div>

      {/* LightGBM search results */}
      <div className="card overflow-x-auto">
        <SectionHeader title="LightGBM Hyperparameter Search" subtitle="13 configs, chromosome-grouped 4-fold CV, + both feature set" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700/60">
              {['Rank', 'CV PR-AUC', 'Std', 'Default?', 'Parameters'].map(h => (
                <th key={h} className="table-header px-3 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lgbmHyperparams.map(row => (
              <tr key={row.rank} className={clsx('table-row', row.isDefault && 'bg-teal-500/5')}>
                <td className="px-3 py-2.5 font-mono text-slate-300 text-xs">{row.rank}</td>
                <td className="px-3 py-2.5 font-mono text-teal-400 text-xs">{row.cvPrAuc.toFixed(4)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400 text-xs">±{row.cvStd.toFixed(4)}</td>
                <td className="px-3 py-2.5 text-xs">{row.isDefault && <span className="badge-teal badge">default</span>}</td>
                <td className="px-3 py-2.5 font-mono text-slate-400 text-xs">{row.params}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-slate-500 mt-2">
          All configs land within 0.793–0.799 CV PR-AUC vs fold spread ±0.017 — differences are within noise.
        </div>
      </div>

      <LimitationBox items={[
        'All 13 LightGBM configs land within ±0.003 of each other — hyperparameter choice matters less than annotation coverage.',
        'F1 threshold from validation is unstable; precision-targeted threshold (80% on validation) transferred more reliably.',
        'Isotonic calibration cuts ECE from ~0.08 to 0.02 without changing decisions.',
        'Search uses a row subsample — CV is slightly optimistic for all configs equally.',
      ]} />
    </div>
  );
}

export default function ModelPerformance() {
  const [tab, setTab] = useState<Tab>('models');

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Model Performance Lab"
        description="Interactive analysis of stored evaluation results from baseline, annotated, temporal, label-quality, and hyperparameter experiments. All data sourced from output/data/*.json and output/reports/*.md."
      />

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap bg-navy-900/50 rounded-xl p-1 border border-navy-700/40">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
              tab === t.id
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700/50',
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
