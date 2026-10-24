import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line,
} from 'recharts';
import { Database, Microscope, Activity } from 'lucide-react';
import { MetricCard, SectionHeader, LimitationBox, InfoBox, PageHeader } from '../components/shared';
import {
  datasetSizes, headlineResults, baselineModels, variantTypeBreakdown,
  snvGroupResults,
} from '../data/researchData';
import {
  CHART_FOREST, CHART_TERRACOTTA, CHART_SAGE, CHART_WARM_GRAY,
  CHART_PLUM, CHART_AMBER, useTheme
} from '../theme';

// Botanical editorial chart tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#DED9CC] dark:border-[#2E3E34] bg-[#FFFEFA] dark:bg-[#1D2A23] px-3.5 py-2.5 text-xs shadow-md">
      <div className="text-[#292D29] dark:text-[#EAE7DD] font-heading font-bold mb-1.5">{label}</div>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex gap-2 items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color || p.fill }} />
              <span className="text-[#72776E] dark:text-[#9FA59A]">{p.name}:</span>
            </div>
            <span className="text-[#292D29] dark:text-[#EAE7DD] font-mono font-semibold ml-3">
              {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { isDark } = useTheme();

  const cForest = isDark ? '#3F6553' : CHART_FOREST;
  const cTerracotta = isDark ? '#D08264' : CHART_TERRACOTTA;
  const cSage = isDark ? '#8FA385' : CHART_SAGE;
  const cGray = isDark ? '#B4B0A4' : CHART_WARM_GRAY;
  const cAmber = isDark ? '#D4A853' : CHART_AMBER;
  const cPlum = isDark ? '#8A6075' : CHART_PLUM;

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
    { name: 'Benign', value: Math.round(datasetSizes.test * (1 - 0.246)), pct: '75.4%', color: cSage },
    { name: 'Pathogenic', value: Math.round(datasetSizes.test * 0.246), pct: '24.6%', color: cTerracotta },
  ];

  return (
    <div className="page-enter space-y-8 max-w-7xl">
      <PageHeader
        title="Overview Dashboard"
        badge="v0.3 Research Platform"
        description="VariantIQ benchmarks variant pathogenicity classification using strict chromosome-isolated hold-out validation. Results represent reproducible computational experiments from peer-review pipelines."
      />

      {/* Visual Hierarchy: Key Headline Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Best ROC-AUC"
          value="0.874"
          sub="Tuned LightGBM + both annotations"
          badge="Top Benchmark"
          badgeVariant="terracotta"
          featured={true}
        />
        <MetricCard
          label="Best PR-AUC"
          value="0.779"
          sub="Tuned LightGBM + both annotations"
          badge="High Precision"
          badgeVariant="terracotta"
          featured={true}
        />
        <MetricCard
          label="Test Hold-Out"
          value="135,521"
          sub="Chromosomes 21, 22, X"
          badge="Zero Overlap"
          badgeVariant="sage"
        />
        <MetricCard
          label="Training Variants"
          value="1,415,482"
          sub="Chromosomes 1–18 (ClinVar)"
          badge="Standard Set"
          badgeVariant="neutral"
        />
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Validation Set"
          value="151,323"
          sub="Chromosomes 19–20 (Tuning)"
          badgeVariant="neutral"
        />
        <MetricCard
          label="AlphaMissense Coverage"
          value="15.4%"
          sub="20,800 missense SNVs only"
          valueColor="text-[#8C661D] dark:text-[#D4A853]"
          badge="Missense Only"
          badgeVariant="amber"
        />
        <MetricCard
          label="Seeds Evaluated"
          value="3 Seeds"
          sub="Bootstrap CI (1,000 resamples)"
          badgeVariant="neutral"
        />
        <MetricCard
          label="Architectures"
          value="5 Families"
          sub="LR, RF, XGBoost, MLP, LightGBM"
          badgeVariant="neutral"
        />
      </div>

      {/* Primary Research Visualization: Annotation progression chart */}
      <div className="card space-y-4">
        <SectionHeader
          title="Annotation Enhancement Progression"
          subtitle="Ablation progression from raw ClinVar coordinates up to AlphaMissense and gnomAD v4.1 constraint"
        />
        <div className="h-80 chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stageChartData} margin={{ top: 10, right: 30, left: 0, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={55} />
              <YAxis domain={[0.65, 0.90]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 8 }} />
              <Line
                type="monotone"
                dataKey="ROC-AUC"
                stroke={cForest}
                strokeWidth={2.5}
                dot={{ r: 4.5, fill: cForest }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="PR-AUC"
                stroke={cTerracotta}
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4.5, fill: cTerracotta }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model comparison */}
        <div className="card space-y-3">
          <SectionHeader
            title="ClinVar-Only Architecture Comparison"
            subtitle="5 architectures on baseline ClinVar features (mean over 3 seeds)"
          />
          <div className="h-64 chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelCompareData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 11 }} />
                <YAxis domain={[0.55, 0.85]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="ROC-AUC" fill={cForest} radius={[3, 3, 0, 0]} />
                <Bar dataKey="PR-AUC" fill={cTerracotta} radius={[3, 3, 0, 0]} />
                <Bar dataKey="F1" fill={cGray} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InfoBox title="Model Invariance">
            All 5 baseline models perform within bootstrap confidence bounds (±0.004). Linear Logistic Regression matches tree models in discrimination, while LightGBM provides superior calibration (ECE ≈ 0.036).
          </InfoBox>
        </div>

        {/* Variant type breakdown */}
        <div className="card space-y-3">
          <SectionHeader
            title="Variant-Type ROC-AUC Disaggregation"
            subtitle="Performance varies strongly across molecular variant classes"
          />
          <div className="h-64 chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={variantTypeData} layout="vertical" margin={{ top: 10, right: 25, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0.5, 1.0]} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(2)} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="ROC-AUC" fill={cSage} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A] leading-relaxed pt-1">
            Note: Class prior determines PR-AUC bounds. Deletions (78.1% pathogenic prior) reach PR-AUC 0.880, while SNVs (16.7% prior) reach 0.454.
          </div>
        </div>
      </div>

      {/* Annotation gain per variant group */}
      <div className="card space-y-3">
        <SectionHeader
          title="Annotation Gain by Variant Subgroup"
          subtitle="ROC-AUC: Baseline ClinVar-only vs With External Annotations (snv_report.json)"
        />
        <div className="h-64 chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={annotationGainData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
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
        <div className="p-3.5 rounded-lg bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34] text-xs">
          <div className="font-heading font-semibold text-[#292D29] dark:text-[#EAE7DD] mb-0.5">Critical Research Insight</div>
          <p className="text-[#72776E] dark:text-[#9FA59A] leading-relaxed">
            Virtually all annotation improvement is concentrated within scored missense SNVs (+0.233 ROC-AUC). The remaining ~85% of variants (non-missense SNVs, deletions, duplications) receive near-zero lift from the current annotation library.
          </p>
        </div>
      </div>

      {/* Dataset and coverage cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#243D32] dark:text-[#8FA385]" />
            <span className="text-xs font-heading font-bold text-[#292D29] dark:text-[#EAE7DD] uppercase tracking-wider">Partition Allocation</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Train (chr 1–18)', value: '1,415,482', pct: 83.1, color: cForest },
              { label: 'Validation (chr 19–20)', value: '151,323', pct: 8.9, color: cSage },
              { label: 'Hold-Out Test (chr 21,22,X)', value: '135,521', pct: 8.0, color: cTerracotta },
            ].map(row => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#72776E] dark:text-[#9FA59A]">{row.label}</span>
                  <span className="text-[#292D29] dark:text-[#EAE7DD] font-mono font-medium">{row.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#DED9CC]/40 dark:bg-[#2E3E34] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A]">Chromosome hold-out eliminates intra-gene correlation leakage.</div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Microscope size={16} className="text-[#B68A3A]" />
            <span className="text-xs font-heading font-bold text-[#292D29] dark:text-[#EAE7DD] uppercase tracking-wider">Annotation Coverage</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#72776E] dark:text-[#9FA59A]">AlphaMissense Scored</span>
                <span className="text-[#8C661D] dark:text-[#E2BC6B] font-mono font-bold">15.4%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#DED9CC]/40 dark:bg-[#2E3E34] overflow-hidden">
                <div className="h-full rounded-full bg-[#B68A3A]" style={{ width: '15.4%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#72776E] dark:text-[#9FA59A]">Unassisted (Non-missense)</span>
                <span className="text-[#72776E] dark:text-[#9FA59A] font-mono font-medium">84.6%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#DED9CC]/40 dark:bg-[#2E3E34] overflow-hidden">
                <div className="h-full rounded-full bg-[#9E9B90]" style={{ width: '84.6%' }} />
              </div>
            </div>
          </div>
          <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A]">AlphaMissense is licensed for non-commercial academic research only.</div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#B96F52] dark:text-[#D08264]" />
            <span className="text-xs font-heading font-bold text-[#292D29] dark:text-[#EAE7DD] uppercase tracking-wider">Class Balance (Test Set)</span>
          </div>
          <div className="space-y-3">
            {classDistribution.map(c => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#72776E] dark:text-[#9FA59A]">{c.name}</span>
                  <span className="font-mono font-medium" style={{ color: c.color }}>{c.pct}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#DED9CC]/40 dark:bg-[#2E3E34] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: c.pct, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A]">Evaluation size: n = 135,521 variants.</div>
        </div>
      </div>

      {/* Limitations disclosure */}
      <LimitationBox items={[
        'Research Platform Only: VariantIQ is an exploratory machine-learning benchmark and is not clinically validated.',
        'Annotation Boundary: 84.6% of variants receive zero benefit from AlphaMissense structural modeling (indels, frameshifts, non-coding).',
        'Chromosome Partition Spread: Single chromosome hold-out split has a fold-to-fold cross-validation spread of ±0.017 PR-AUC.',
        'ClinVar Annotation Bias: Labels depend on submitter review status; single-submitter noise is cataloged in sensitivity audits.',
        'Offline Inference Only: Batch Python pipelines (src/train_models.py) must be executed locally for novel variant prediction.',
      ]} />
    </div>
  );
}
