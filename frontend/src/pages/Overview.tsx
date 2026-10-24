import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  LineChart, Line,
} from 'recharts';
import { TrendingUp, Database, Microscope, Layers, AlertTriangle, Activity } from 'lucide-react';
import { MetricCard, SectionHeader, LimitationBox, InfoBox, PageHeader } from '../components/shared';
import {
  datasetSizes, headlineResults, baselineModels, variantTypeBreakdown,
  snvGroupResults, annotationCoverage,
} from '../data/researchData';

const TEAL = '#2dd4bf';
const CYAN = '#22d3ee';
const BLUE = '#60a5fa';
const AMBER = '#fbbf24';
const SLATE = '#64748b';

// Custom tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-2 text-xs shadow-xl">
      <div className="text-slate-300 font-medium mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-slate-100 font-mono">{typeof p.value === 'number' ? p.value.toFixed(3) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  // Prepare chart data
  const stageChartData = headlineResults.map(r => ({
    stage: r.stage.replace('features (5 models)', '').replace('+ both, tuned LightGBM (best)', '+ both, tuned (best)').trim(),
    'ROC-AUC': r.rocAuc,
    'PR-AUC': r.prAuc,
  }));

  const modelCompareData = baselineModels.map(m => ({
    model: m.model.replace('Logistic Regression', 'LR').replace('Random Forest', 'RF'),
    'ROC-AUC': m.rocAuc,
    'PR-AUC': m.prAuc,
    'F1': m.f1,
  }));

  const variantTypeData = variantTypeBreakdown.map(v => ({
    type: v.type.replace('Single Nucleotide Variant', 'SNV'),
    n: v.n,
    'ROC-AUC': v.rocAuc,
    'PR-AUC': v.prAuc,
    pathogenicRate: +(v.pathogenicRate * 100).toFixed(1),
  }));

  const annotationGainData = snvGroupResults.map(g => ({
    group: g.group,
    'ClinVar only': +(g.clinvarOnly.rocAuc),
    'With annotations': +(g.withAnnotations.rocAuc),
    gain: +(g.gain).toFixed(3),
  }));

  const classDistribution = [
    { name: 'Benign', value: Math.round(datasetSizes.test * (1 - 0.246)), pct: '75.4%', color: TEAL },
    { name: 'Pathogenic', value: Math.round(datasetSizes.test * 0.246), pct: '24.6%', color: AMBER },
  ];

  return (
    <div className="page-enter space-y-8">
      <PageHeader
        title="Overview Dashboard"
        badge="v0.3 Research"
        description="VariantIQ predicts ClinVar variant pathogenicity using chromosome hold-out validation. Results are stored research evaluations, not live predictions. Best ROC-AUC: 0.874, Best PR-AUC: 0.779 (tuned LightGBM + AlphaMissense + gnomAD)."
      />

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Test Set Variants"
          value="135,521"
          sub="Chr 21, 22, X, Y, MT"
          badge="Chromosome hold-out"
          badgeVariant="teal"
        />
        <MetricCard
          label="Best ROC-AUC"
          value="0.874"
          sub="Tuned LightGBM + both annotations"
          badge="Stored result"
          badgeVariant="cyan"
        />
        <MetricCard
          label="Best PR-AUC"
          value="0.779"
          sub="Tuned LightGBM + both annotations"
          badge="Stored result"
          badgeVariant="cyan"
        />
        <MetricCard
          label="Training Variants"
          value="1.4M"
          sub="Chr 1–17"
          badge="ClinVar"
          badgeVariant="slate"
        />
      </div>

      {/* Dataset statistics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Validation Set"
          value="151,323"
          sub="Chr 18–20"
        />
        <MetricCard
          label="AlphaMissense Coverage"
          value="15.4%"
          sub="~20,800 missense SNVs"
          valueColor="text-amber-400"
          badge="Partial"
          badgeVariant="amber"
        />
        <MetricCard
          label="Seeds Evaluated"
          value="3"
          sub="Bootstrap CI: 200 resamples"
        />
        <MetricCard
          label="Models Compared"
          value="5"
          sub="LR, RF, XGBoost, MLP, LightGBM"
        />
      </div>

      {/* Annotation progression chart */}
      <div className="card">
        <SectionHeader
          title="Annotation Enhancement Progression"
          subtitle="Best model ROC-AUC and PR-AUC across feature sets — stored evaluation results from annotated_results.json"
        />
        <div className="h-72 chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stageChartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={70} />
              <YAxis domain={[0.65, 0.90]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="ROC-AUC" stroke={TEAL} strokeWidth={2} dot={{ r: 5, fill: TEAL }} />
              <Line type="monotone" dataKey="PR-AUC" stroke={CYAN} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 5, fill: CYAN }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model comparison */}
        <div className="card">
          <SectionHeader
            title="ClinVar-Only Model Comparison"
            subtitle="5 models, mean over 3 seeds — baseline_results.json"
          />
          <div className="h-64 chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelCompareData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 10 }} />
                <YAxis domain={[0.60, 0.82]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="ROC-AUC" fill={TEAL} radius={[3, 3, 0, 0]} />
                <Bar dataKey="PR-AUC" fill={BLUE} radius={[3, 3, 0, 0]} />
                <Bar dataKey="F1" fill={SLATE} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InfoBox title="Note">
            Models are within bootstrap CI (±0.003–0.005) — no single model is clearly best. LightGBM has best calibration (ECE ≈ 0.036).
          </InfoBox>
        </div>

        {/* Variant type breakdown */}
        <div className="card">
          <SectionHeader
            title="Variant-Type ROC-AUC (LightGBM)"
            subtitle="Performance varies strongly by variant type and class prevalence"
          />
          <div className="h-64 chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={variantTypeData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0.5, 1.0]} tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(2)} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={75} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ROC-AUC" fill={TEAL} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Note: PR-AUC differs greatly by pathogenic prevalence. SNVs (16.7% pathogenic) have low PR-AUC (0.454); deletions (78.1%) have 0.880.
          </div>
        </div>
      </div>

      {/* Annotation gain per variant group */}
      <div className="card">
        <SectionHeader
          title="Annotation Gain by Variant Subgroup"
          subtitle="ROC-AUC: ClinVar-only vs with both annotations — snv_report.json"
        />
        <div className="h-64 chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={annotationGainData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} />
              <YAxis domain={[0.60, 1.0]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="ClinVar only" fill={SLATE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="With annotations" fill={TEAL} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-navy-900/60 border border-navy-700/50">
          <div className="text-xs text-slate-300 font-medium mb-1">Key finding from README</div>
          <div className="text-xs text-slate-400">
            Nearly all improvement comes from AlphaMissense on scored missense SNVs (+0.233 ROC-AUC).
            The ~85% of variants without AlphaMissense scores get essentially no benefit from annotations.
          </div>
        </div>
      </div>

      {/* Dataset and coverage cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-teal-400" />
            <span className="text-sm font-semibold text-slate-200">Dataset Split</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Train (chr 1–17)', value: '1,415,482', pct: 84 },
              { label: 'Validation (chr 18–20)', value: '151,323', pct: 9 },
              { label: 'Test (chr 21,22,X,Y,MT)', value: '135,521', pct: 8 },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-300 font-mono">{row.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500">Chromosome hold-out prevents neighbour leakage</div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Microscope size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">Annotation Coverage</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">AlphaMissense scored</span>
                <span className="text-amber-400 font-mono">15.4%</span>
              </div>
              <div className="h-1.5 rounded-full bg-navy-700">
                <div className="h-full rounded-full bg-amber-500" style={{ width: '15.4%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Without AM scores</span>
                <span className="text-slate-400 font-mono">84.6%</span>
              </div>
              <div className="h-1.5 rounded-full bg-navy-700">
                <div className="h-full rounded-full bg-slate-600" style={{ width: '84.6%' }} />
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">AlphaMissense: CC BY-NC-SA 4.0, non-commercial only</div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            <span className="text-sm font-semibold text-slate-200">Class Distribution (Test)</span>
          </div>
          <div className="space-y-3">
            {classDistribution.map(c => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{c.name}</span>
                  <span className="font-mono" style={{ color: c.color }}>{c.pct}</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-700">
                  <div className="h-full rounded-full" style={{ background: c.color, width: c.pct }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500">n = 135,521 test variants</div>
        </div>
      </div>

      {/* Limitations */}
      <LimitationBox items={[
        'Not a clinically validated tool — for research purposes only.',
        '85% of variants receive no benefit from current annotation set (non-missense SNVs, deletions, duplications, indels).',
        'Chromosome hold-out is a single split; fold-to-fold spread is ±0.017 PR-AUC.',
        'ClinVar labels depend on submitters and review status — label noise exists.',
        'Temporal check covers newly added variants only, not reclassified ones.',
        'No trained model is currently deployed for live inference (research pipeline only).',
      ]} />
    </div>
  );
}
