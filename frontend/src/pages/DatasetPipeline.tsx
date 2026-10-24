import { useState } from 'react';
import {
  GitBranch, Database, ShieldCheck, CheckCircle2,
  FileCode2, Sparkles, Filter, ChevronRight,
  ExternalLink, Layers
} from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader, SectionHeader, MetricCard, LimitationBox, InfoBox } from '../components/shared';
import { datasetSizes } from '../data/researchData';

interface PipelineStage {
  id: string;
  name: string;
  subtitle: string;
  script: string;
  input: string;
  output: string;
  description: string;
  details: string[];
  metrics: { label: string; val: string }[];
}

const stages: PipelineStage[] = [
  {
    id: 'ingestion',
    name: '1. ClinVar Ingestion & Harmonization',
    subtitle: 'Raw variant normalization & binary labeling',
    script: 'src/preprocess_clinvar.py',
    input: 'ClinVar XML / VCF release dump (hg38)',
    output: '1,702,326 harmonized variant records',
    description: 'Extracts coordinates, alleles, clinical classifications, and review status. Harmonizes conflicting classifications and maps to binary clinical targets.',
    details: [
      'Positive class (1): "Pathogenic", "Likely pathogenic", "Pathogenic/Likely pathogenic"',
      'Negative class (0): "Benign", "Likely benign", "Benign/Likely benign"',
      'Variants of Uncertain Significance (VUS) and conflicting interpretations without consensus are held out from binary benchmark',
      'Normalized genomic coordinates (GRCh38 / hg38) with standardized INDEL left-alignment',
    ],
    metrics: [
      { label: 'Total Records', val: '1,702,326' },
      { label: 'Classes', val: 'Binary (P vs B)' },
      { label: 'Coordinate Frame', val: 'GRCh38 / hg38' },
    ],
  },
  {
    id: 'split',
    name: '2. Chromosome Hold-out Partitioning',
    subtitle: 'Leakage-resistant train / val / test allocation',
    script: 'src/audit_splits.py',
    input: '1,702,326 harmonized records',
    output: 'Train (83.1%) · Val (8.9%) · Test (8.0%)',
    description: 'Partitions variants strictly by chromosome to prevent genomic linkage and gene-memorization leakage between training and evaluation partitions.',
    details: [
      'Train split: Autosomes 1 through 18 (1,415,482 variants)',
      'Validation split: Chromosomes 19 and 20 (151,323 variants) for hyperparameter selection and threshold tuning',
      'Test split: Chromosomes 21, 22, and X (135,521 variants) for final unbiased model reporting',
      'Zero variant key overlap across splits (0 duplicate keys, 0 conflicting labels)',
      'Test rows whose gene appears in train: strictly 0.1% (5 of 1,557 test genes)',
    ],
    metrics: [
      { label: 'Train Set', val: '1,415,482 (83.1%)' },
      { label: 'Val Set', val: '151,323 (8.9%)' },
      { label: 'Test Set', val: '135,521 (8.0%)' },
      { label: 'Key Overlap', val: '0 (0.00%)' },
    ],
  },
  {
    id: 'encoding',
    name: '3. Feature Engineering & Gene Encoding',
    subtitle: 'Out-of-fold target encoding & sequence properties',
    script: 'src/features.py, src/gene_encoding.py',
    input: 'Variant metadata & chromosomal splits',
    output: '181 ClinVar baseline feature vectors',
    description: 'Constructs tabular representation from sequence coordinates, allele lengths, molecular variant types, and out-of-fold gene-level pathogenicity rates.',
    details: [
      'Variant structural metrics: REF length, ALT length, length delta, INDEL classification flags',
      'One-hot encoded variant consequences (missense, frameshift, nonsense, splice site, non-coding)',
      'ReviewStatus provenance indicator (0 to 4 review stars encoding submission stringency)',
      'Gene target encoding: calculated strictly Out-Of-Fold (OOF) on training data; validation and test sets receive frozen train-time priors',
    ],
    metrics: [
      { label: 'Baseline Features', val: '181 columns' },
      { label: 'Encoding Mode', val: 'Out-of-Fold' },
      { label: 'Review Signals', val: '0–4 Star Weights' },
    ],
  },
  {
    id: 'annotations',
    name: '4. External Annotation Joins',
    subtitle: 'AlphaMissense (hg38) & gnomAD v4.1 constraint',
    script: 'src/prepare_annotations.py, src/join_annotations.py',
    input: 'Splits + AlphaMissense TSV + gnomAD v4.1 constraint TSV',
    output: '187 feature vectors (+6 annotated columns)',
    description: 'Integrates state-of-the-art biological priors while strictly preserving test isolation and recording coverage status flags.',
    details: [
      'AlphaMissense: DeepMind structural pathogenicity scores (range 0.0–1.0) joined on chrom:pos:ref:alt',
      'Coverage indicator: has_am boolean flag explicitly tracks missense eligibility (15.4% of test set)',
      'Missing values: median imputed with explicit missingness binary indicator to prevent signal loss',
      'gnomAD v4.1: Gene-level constraint metrics (LOEUF score, pLI loss-of-function intolerance, missense z-score)',
    ],
    metrics: [
      { label: 'Total Features', val: '187 columns' },
      { label: 'AM Coverage', val: '15.4% (20.8k missense)' },
      { label: 'gnomAD Level', val: 'Gene Constraint' },
    ],
  },
  {
    id: 'training',
    name: '5. Model Training & Validation',
    subtitle: '5 diverse algorithms evaluated across 3 random seeds',
    script: 'src/train_models.py, src/train_annotated.py',
    input: 'Processed feature matrices (ClinVar vs +Annotated)',
    output: 'Trained model artifacts & calibrated probabilities',
    description: 'Trains tabular gradient boosting machines, linear regularized baselines, random forests, and deep MLPs with hyperparameter search.',
    details: [
      'LightGBM: GBDT with histogram binning, tuned learning rate (0.02) and max leaves (63)',
      'XGBoost: Exact greedy tree booster with L2 regularization',
      'Logistic Regression: L2-penalized linear baseline with standardized scaling',
      'Multi-Layer Perceptron: 3-layer dense neural network with ReLU activations and dropout',
      'Random Forest: 100-tree ensemble with balanced bootstrap subsampling',
    ],
    metrics: [
      { label: 'Architectures', val: '5 Model Families' },
      { label: 'Seeds', val: '3 Seeds per Setup' },
      { label: 'Thresholding', val: 'Val Max-F1 Tuned' },
    ],
  },
  {
    id: 'audit',
    name: '6. Multi-Angle Evaluation & Stress Testing',
    subtitle: 'Bootstrap CIs, temporal check, and subpopulation audits',
    script: 'src/temporal_eval.py, src/high_confidence.py, src/metrics.py',
    input: 'Test predictions across splits & releases',
    output: '7 scientific report artifacts & JSON results',
    description: 'Subjecting models to rigorous stress tests to detect hidden failure modes, label-noise vulnerabilities, and generalization barriers.',
    details: [
      '95% Bootstrap Confidence Intervals: 1,000 resamples for ROC-AUC, PR-AUC, and F1 stability',
      'Temporal Hold-out: Model trained on 2025-10 ClinVar tested on 201,812 newly emerging 2026-10 variants',
      'High-Confidence Audit: Sub-analysis on 2+ star expert-reviewed variants vs single-submitter rows',
      'Variant-Type Disaggregation: Isolated performance tracking for SNVs vs Deletions vs Indels',
    ],
    metrics: [
      { label: 'Bootstrap Iterations', val: '1,000 Replicates' },
      { label: 'Temporal New Test', val: '201,812 Variants' },
      { label: 'Confidence Subsets', val: 'Expert vs Single' },
    ],
  },
];

const splitAuditChecks = [
  { check: 'Rows on chromosomes in no split (excluded)', result: '0 (None)', status: 'pass' },
  { check: 'Duplicate variant keys in dataset', result: '0 (None)', status: 'pass' },
  { check: 'Variant keys with conflicting labels', result: '0 (Resolved)', status: 'pass' },
  { check: 'Train ∩ Val variant keys', result: '0 (Strict disjoint)', status: 'pass' },
  { check: 'Train ∩ Test variant keys', result: '0 (Strict disjoint)', status: 'pass' },
  { check: 'Val ∩ Test variant keys', result: '0 (Strict disjoint)', status: 'pass' },
  { check: 'Test genes also present in train', result: '5 of 1,557 (0.1%)', status: 'pass' },
  { check: 'Target encoding calculation method', result: 'Out-of-Fold (Leakage Free)', status: 'pass' },
];

const featureAllowlist = [
  { category: 'Genomic Coordinates', count: '4 features', example: 'PositionVCF, Stop, LengthDelta, IsIndel', notes: 'Harmonized to GRCh38 / hg38 canonical assembly' },
  { category: 'Variant Type', count: '8 features', example: 'SNV, Deletion, Duplication, Indel, Insertion, Microsatellite', notes: 'One-hot encoded sequence change taxonomy' },
  { category: 'Gene-Level Frequency', count: '6 features', example: 'GeneVariantCount, GenePathogenicRate, GeneBenignRate', notes: 'Computed strictly Out-of-Fold (OOF) to avoid memorization' },
  { category: 'Provenance / Review', count: '5 features', example: 'ReviewStatus, ReviewStars (0–4)', notes: 'Reflects submission stringency; tested with ablation' },
  { category: 'AlphaMissense (External)', count: '2 features', example: 'am_pathogenicity, has_am', notes: 'DeepMind 2023 missense predictions (CC BY-NC-SA 4.0)' },
  { category: 'gnomAD v4.1 (External)', count: '4 features', example: 'loeuf, pli, mis_z, syn_z', notes: 'Broad Institute gene-level constraint metrics' },
];

export default function DatasetPipeline() {
  const [selectedStage, setSelectedStage] = useState<string>(stages[0].id);
  const activeStage = stages.find(s => s.id === selectedStage) ?? stages[0];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Dataset & ML Pipeline Architecture"
        description="End-to-end data provenance, chromosome-isolated partitioning, leak-free feature engineering, and external biological annotation integration."
        badge="Reproducible Research"
      />

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Variants" value="1,702,326" sub="ClinVar current release" badge="All" badgeVariant="teal" />
        <MetricCard label="Training Set" value="1,415,482" sub="Chromosomes 1–18" badge="83.1%" badgeVariant="cyan" />
        <MetricCard label="Validation Set" value="151,323" sub="Chromosomes 19–20" badge="8.9%" badgeVariant="slate" />
        <MetricCard label="Hold-Out Test" value="135,521" sub="Chromosomes 21, 22, X" badge="8.0%" badgeVariant="slate" />
        <MetricCard label="AlphaMissense" value="15.4%" sub="Test coverage (missense)" badge="Annotation" badgeVariant="amber" />
        <MetricCard label="Key Overlap" value="0.00%" sub="Leakage verification" badge="Zero Leaks" badgeVariant="teal" />
      </div>

      {/* Interactive Pipeline Stages */}
      <div className="space-y-4">
        <SectionHeader
          title="Pipeline Execution Stages"
          subtitle="Click on any stage to inspect the processing logic, input/output contracts, and validation checkpoints."
        />

        {/* Stage selection tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {stages.map((st) => {
            const isSelected = st.id === selectedStage;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStage(st.id)}
                className={clsx(
                  'text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between',
                  isSelected
                    ? 'bg-teal-500/10 border-teal-500/50 shadow-lg shadow-teal-500/5'
                    : 'bg-navy-900/60 border-navy-700/60 hover:bg-navy-800/60 hover:border-navy-600'
                )}
              >
                <div>
                  <div className={clsx('text-xs font-semibold mb-1', isSelected ? 'text-teal-400' : 'text-slate-400')}>
                    {st.name.split('.')[0]}. Stage
                  </div>
                  <div className={clsx('text-xs font-medium leading-snug', isSelected ? 'text-slate-100' : 'text-slate-300')}>
                    {st.name.split('. ')[1]}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <FileCode2 size={12} className="text-teal-400/70" />
                  <span className="truncate">{st.script.split(',')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="card border border-navy-700/80 bg-navy-900/80 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-navy-700/60">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="badge badge-teal font-mono text-[11px]">ACTIVE STAGE</span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <FileCode2 size={13} className="text-teal-400" />
                  {activeStage.script}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">{activeStage.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{activeStage.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeStage.metrics.map((m, idx) => (
                <div key={idx} className="bg-navy-950/70 border border-navy-700/60 px-3.5 py-2 rounded-lg">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{m.label}</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">{m.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">Stage Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{activeStage.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">Technical Implementation</h4>
                <div className="space-y-2">
                  {activeStage.details.map((dt, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 size={15} className="text-teal-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{dt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-navy-950/60 border border-navy-700/70 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers size={13} className="text-teal-400" />
                Data I/O Contracts
              </h4>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-mono">Input Source</div>
                <div className="text-xs text-slate-200 mt-1 font-mono bg-navy-900/90 p-2 rounded border border-navy-800 break-all">
                  {activeStage.input}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-mono">Output Artifact</div>
                <div className="text-xs text-teal-300 mt-1 font-mono bg-navy-900/90 p-2 rounded border border-navy-800 break-all">
                  {activeStage.output}
                </div>
              </div>

              <div className="pt-2 border-t border-navy-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-teal-400" />
                  <span>Audited for leakage in CI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Audit & Leakage Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <SectionHeader
            title="Split Integrity & Leakage Audit"
            subtitle="Verification results from output/reports/split_audit.md"
          />

          <div className="space-y-2">
            {splitAuditChecks.map((chk, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-navy-950/50 border border-navy-700/50 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-teal-400 flex-shrink-0" />
                  <span className="text-slate-300">{chk.check}</span>
                </div>
                <span className="font-mono text-teal-300 font-medium px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                  {chk.result}
                </span>
              </div>
            ))}
          </div>

          <InfoBox title="Why Chromosome Separation Matters">
            Standard random K-fold CV suffers severe optimistic leakage in genomics because variants located in the same gene
            or linkage disequilibrium blocks share correlated attributes. Grouping by chromosome forces the model to evaluate on
            completely unseen genetic regions.
          </InfoBox>
        </div>

        <div className="card space-y-4">
          <SectionHeader
            title="Feature Engineering Allowlist"
            subtitle="187 total features categorized by provenance and biological mechanism"
          />

          <div className="space-y-2.5">
            {featureAllowlist.map((f, i) => (
              <div key={i} className="p-3 rounded-lg bg-navy-950/50 border border-navy-700/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{f.category}</span>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                    {f.count}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">{f.example}</div>
                <div className="text-[11px] text-slate-400 pt-0.5">{f.notes}</div>
              </div>
            ))}
          </div>

          <LimitationBox
            title="Pipeline Scope Limitations"
            items={[
              'AlphaMissense is licensed for non-commercial academic research only (CC BY-NC-SA 4.0).',
              'Only 15.4% of variants (missense SNVs) receive AlphaMissense predictions; the remaining 84.6% rely entirely on ClinVar and gnomAD gene constraint.',
              'gnomAD v4.1 constraint applies at the gene aggregate level, not variant-specific positions.',
            ]}
          />
        </div>
      </div>
    </div>
  );
}
