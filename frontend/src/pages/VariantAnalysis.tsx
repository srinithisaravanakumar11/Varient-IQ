import { useState } from 'react';
import { FlaskConical, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader, LimitationBox, InfoBox } from '../components/shared';

interface FormFields {
  chromosome: string;
  position: string;
  ref: string;
  alt: string;
  gene: string;
  variantType: string;
  reviewStatus: string;
  alphaMissenseScore: string;
  gnomadLoeuf: string;
  gnomadPli: string;
}

const emptyForm: FormFields = {
  chromosome: '', position: '', ref: '', alt: '', gene: '',
  variantType: '', reviewStatus: '', alphaMissenseScore: '', gnomadLoeuf: '', gnomadPli: '',
};

const VARIANT_TYPES = [
  'single nucleotide variant', 'deletion', 'insertion', 'duplication', 'indel', 'microsatellite',
];
const REVIEW_STATUSES = [
  'criteria provided, single submitter',
  'criteria provided, multiple submitters, no conflicts',
  'reviewed by expert panel',
  'practice guideline',
  'no assertion provided',
];

const chromosomes = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','X','Y','MT'];

function ValidationWarning({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-amber-400 mt-1">
      <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-slate-400 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export default function VariantAnalysis() {
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [submitted, setSubmitted] = useState(false);

  function set(key: keyof FormFields, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate(): boolean {
    const e: Partial<FormFields> = {};
    if (!form.chromosome) e.chromosome = 'Required';
    if (!form.position || isNaN(+form.position) || +form.position < 1) e.position = 'Must be a positive integer';
    if (!form.ref || !/^[ACGTN]+$/i.test(form.ref)) e.ref = 'Must contain only A, C, G, T, N';
    if (!form.alt || !/^[ACGTN]+$/i.test(form.alt)) e.alt = 'Must contain only A, C, G, T, N';
    if (!form.variantType) e.variantType = 'Required';
    if (form.alphaMissenseScore && (isNaN(+form.alphaMissenseScore) || +form.alphaMissenseScore < 0 || +form.alphaMissenseScore > 1)) {
      e.alphaMissenseScore = 'Must be between 0.0 and 1.0';
    }
    if (form.gnomadLoeuf && (isNaN(+form.gnomadLoeuf) || +form.gnomadLoeuf < 0)) {
      e.gnomadLoeuf = 'Must be a non-negative number';
    }
    if (form.gnomadPli && (isNaN(+form.gnomadPli) || +form.gnomadPli < 0 || +form.gnomadPli > 1)) {
      e.gnomadPli = 'Must be between 0.0 and 1.0';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  }

  function handleReset() {
    setForm(emptyForm);
    setErrors({});
    setSubmitted(false);
  }

  const hasAm = form.alphaMissenseScore && !errors.alphaMissenseScore;
  const hasGnomad = (form.gnomadLoeuf || form.gnomadPli) && !errors.gnomadLoeuf && !errors.gnomadPli;
  const isMissenseSNV = form.variantType === 'single nucleotide variant' && form.ref.length === 1 && form.alt.length === 1;

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Variant Analysis Workspace"
        description="Inspect available annotations for a variant of interest. This workspace is a research tool for reviewing ClinVar-style attributes and external annotations — no live model inference is currently available."
      />

      {/* Status banner */}
      <div className="rounded-xl border p-5 flex items-start gap-4"
        style={{ background: 'rgba(99,102,241,0.07)', borderColor: 'rgba(99,102,241,0.3)' }}>
        <div className="p-2.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <FlaskConical size={22} className="text-indigo-400" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="font-semibold text-indigo-300 text-sm">Live Inference Not Available — Research Pipeline Only</div>
          <div className="text-xs text-indigo-200/70 leading-relaxed space-y-1">
            <p>VariantIQ v0.3 is a research evaluation pipeline. The training scripts in <code className="text-indigo-300 font-mono">src/</code> produce stored results only — no serialised model artefact (<code className="text-indigo-300 font-mono">.pkl</code> / <code className="text-indigo-300 font-mono">.joblib</code>) is currently committed.</p>
            <p>To enable genuine individual-variant prediction, a FastAPI endpoint wrapping the trained model is required. Input/output schema, validation rules, and integration steps are documented in the About & Limitations page.</p>
            <p>The form below lets you explore what annotation data would be assembled — it does not run a real model.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input form */}
        <form className="lg:col-span-3 card space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <div className="text-sm font-semibold text-slate-200 mb-4">Variant Coordinates</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Chromosome</FieldLabel>
                <select className={clsx('select', errors.chromosome && 'border-red-500/60')} value={form.chromosome} onChange={e => set('chromosome', e.target.value)}>
                  <option value="">Select…</option>
                  {chromosomes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.chromosome && <ValidationWarning msg={errors.chromosome} />}
              </div>
              <div>
                <FieldLabel required>Position (VCF)</FieldLabel>
                <input className={clsx('input', errors.position && 'border-red-500/60')} type="number" placeholder="e.g. 43071077" value={form.position} onChange={e => set('position', e.target.value)} min={1} />
                {errors.position && <ValidationWarning msg={errors.position} />}
              </div>
              <div>
                <FieldLabel required>Ref allele</FieldLabel>
                <input className={clsx('input font-mono uppercase', errors.ref && 'border-red-500/60')} placeholder="e.g. C" value={form.ref} onChange={e => set('ref', e.target.value.toUpperCase())} maxLength={50} />
                {errors.ref && <ValidationWarning msg={errors.ref} />}
              </div>
              <div>
                <FieldLabel required>Alt allele</FieldLabel>
                <input className={clsx('input font-mono uppercase', errors.alt && 'border-red-500/60')} placeholder="e.g. T" value={form.alt} onChange={e => set('alt', e.target.value.toUpperCase())} maxLength={50} />
                {errors.alt && <ValidationWarning msg={errors.alt} />}
              </div>
            </div>
          </div>

          <div className="divider" />

          <div>
            <div className="text-sm font-semibold text-slate-200 mb-4">ClinVar Attributes</div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FieldLabel required>Variant Type</FieldLabel>
                <select className={clsx('select', errors.variantType && 'border-red-500/60')} value={form.variantType} onChange={e => set('variantType', e.target.value)}>
                  <option value="">Select…</option>
                  {VARIANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.variantType && <ValidationWarning msg={errors.variantType} />}
              </div>
              <div>
                <FieldLabel>Gene symbol</FieldLabel>
                <input className="input" placeholder="e.g. BRCA1" value={form.gene} onChange={e => set('gene', e.target.value)} />
              </div>
              <div>
                <FieldLabel>ClinVar review status</FieldLabel>
                <select className="select" value={form.reviewStatus} onChange={e => set('reviewStatus', e.target.value)}>
                  <option value="">Select…</option>
                  {REVIEW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div>
            <div className="text-sm font-semibold text-slate-200 mb-1">External Annotations <span className="text-slate-500 font-normal text-xs">(optional)</span></div>
            <div className="text-xs text-slate-500 mb-4">Leave blank if the annotation is unavailable. Missing values are treated as missing — not as evidence of benignity.</div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FieldLabel>AlphaMissense score <span className="text-slate-500">(0–1, missense SNVs only)</span></FieldLabel>
                <input className={clsx('input font-mono', errors.alphaMissenseScore && 'border-red-500/60')} type="number" step="0.001" min={0} max={1} placeholder="e.g. 0.923" value={form.alphaMissenseScore} onChange={e => set('alphaMissenseScore', e.target.value)} />
                {errors.alphaMissenseScore && <ValidationWarning msg={errors.alphaMissenseScore} />}
                {!isMissenseSNV && form.variantType && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
                    <AlertTriangle size={11} />
                    <span>AlphaMissense does not score this variant type — leave blank.</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>gnomAD LOEUF</FieldLabel>
                  <input className={clsx('input font-mono', errors.gnomadLoeuf && 'border-red-500/60')} type="number" step="0.01" min={0} placeholder="e.g. 0.29" value={form.gnomadLoeuf} onChange={e => set('gnomadLoeuf', e.target.value)} />
                  {errors.gnomadLoeuf && <ValidationWarning msg={errors.gnomadLoeuf} />}
                </div>
                <div>
                  <FieldLabel>gnomAD pLI</FieldLabel>
                  <input className={clsx('input font-mono', errors.gnomadPli && 'border-red-500/60')} type="number" step="0.001" min={0} max={1} placeholder="e.g. 0.999" value={form.gnomadPli} onChange={e => set('gnomadPli', e.target.value)} />
                  {errors.gnomadPli && <ValidationWarning msg={errors.gnomadPli} />}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              <CheckCircle size={16} />
              Assemble annotation profile
            </button>
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-4">
          {!submitted ? (
            <div className="card flex flex-col items-center justify-center text-center py-12">
              <div className="p-4 rounded-full bg-navy-700/50 mb-4">
                <FlaskConical size={28} className="text-slate-500" />
              </div>
              <div className="text-slate-400 font-medium">No profile assembled yet</div>
              <div className="text-slate-500 text-xs mt-1 max-w-xs">Fill in the required fields on the left and submit to see the annotation summary.</div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Annotation summary */}
              <div className="card space-y-4">
                <div className="text-sm font-semibold text-slate-200">Annotation Profile</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-navy-700/50">
                    <span className="text-slate-400">Location</span>
                    <span className="font-mono text-slate-200 text-xs">chr{form.chromosome}:{form.position} {form.ref}→{form.alt}</span>
                  </div>
                  {form.gene && (
                    <div className="flex justify-between items-center py-1.5 border-b border-navy-700/50">
                      <span className="text-slate-400">Gene</span>
                      <span className="text-teal-400 font-semibold">{form.gene}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1.5 border-b border-navy-700/50">
                    <span className="text-slate-400">Variant type</span>
                    <span className="text-slate-200 text-xs capitalize">{form.variantType}</span>
                  </div>
                  {form.reviewStatus && (
                    <div className="flex flex-col gap-1 py-1.5 border-b border-navy-700/50">
                      <span className="text-slate-400">Review status</span>
                      <span className="text-slate-300 text-xs">{form.reviewStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AlphaMissense card */}
              <div className={clsx('card space-y-2', !hasAm && 'border-amber-500/20')}>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AlphaMissense</div>
                {hasAm ? (
                  <>
                    <div className="text-2xl font-bold font-mono text-teal-400">{parseFloat(form.alphaMissenseScore).toFixed(3)}</div>
                    <div className="h-2 rounded-full bg-navy-700 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${parseFloat(form.alphaMissenseScore) * 100}%`,
                        background: parseFloat(form.alphaMissenseScore) > 0.5
                          ? 'linear-gradient(to right, #f87171, #ef4444)'
                          : 'linear-gradient(to right, #2dd4bf, #14b8a6)',
                      }} />
                    </div>
                    <div className="text-xs text-slate-500">0 = benign evidence · 1 = pathogenic evidence</div>
                    <div className="text-xs text-amber-400/80 flex items-start gap-1.5">
                      <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />
                      User-provided value only — not a model prediction. AlphaMissense CC BY-NC-SA 4.0.
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    <span>
                      {isMissenseSNV
                        ? 'No AlphaMissense score provided. Annotation would be missing.'
                        : 'Not applicable — AlphaMissense scores missense SNVs only.'}
                    </span>
                  </div>
                )}
              </div>

              {/* gnomAD card */}
              <div className={clsx('card space-y-2', !hasGnomad && 'border-amber-500/20')}>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">gnomAD v4.1 Gene Constraint</div>
                {hasGnomad ? (
                  <div className="grid grid-cols-2 gap-3">
                    {form.gnomadLoeuf && (
                      <div>
                        <div className="metric-label text-[10px]">LOEUF</div>
                        <div className="font-mono text-slate-200 text-lg">{parseFloat(form.gnomadLoeuf).toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">Lower = more constrained</div>
                      </div>
                    )}
                    {form.gnomadPli && (
                      <div>
                        <div className="metric-label text-[10px]">pLI</div>
                        <div className="font-mono text-slate-200 text-lg">{parseFloat(form.gnomadPli).toFixed(3)}</div>
                        <div className="text-[10px] text-slate-500">Higher = LoF intolerant</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    <span>No gnomAD constraint provided. Gene-level evidence would be missing.</span>
                  </div>
                )}
              </div>

              {/* Inference placeholder */}
              <div className="card border-dashed border-slate-600/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Info size={12} />
                  Model Prediction — Not Available
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  A trained model artefact is required to generate an estimated pathogenicity score. No serialised model is currently deployed. See the About & Limitations page for the FastAPI integration roadmap.
                </div>
                <div className="rounded-lg bg-navy-950/60 border border-navy-700/40 p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Expected endpoint (not yet live)</div>
                  <code className="text-[10px] font-mono text-slate-400">POST /api/v1/predict</code>
                  <div className="text-[10px] text-slate-600 mt-1">Returns: predicted_class, probability_pathogenic, model_version, missing_annotations</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <LimitationBox items={[
        'No live model inference is available. This workspace assembles annotation data only.',
        'Missing annotations are shown as missing — not interpreted as benign evidence.',
        'AlphaMissense is licensed CC BY-NC-SA 4.0 (non-commercial only).',
        'gnomAD constraint is gene-level and cannot predict the effect of a specific variant allele.',
        'User-entered values are not validated against published databases in this interface.',
        'This is a research tool. Never use model outputs as clinical diagnostic evidence.',
      ]} />
    </div>
  );
}
