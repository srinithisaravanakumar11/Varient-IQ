import React, { useState } from 'react';
import { FlaskConical, AlertTriangle, CheckCircle, Info, Bookmark } from 'lucide-react';
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

const PRESETS: { label: string; data: Partial<FormFields> }[] = [
  {
    label: 'BRCA1 (Missense SNV)',
    data: {
      chromosome: '17', position: '43071077', ref: 'C', alt: 'T', gene: 'BRCA1',
      variantType: 'single nucleotide variant', reviewStatus: 'reviewed by expert panel',
      alphaMissenseScore: '0.923', gnomadLoeuf: '0.29', gnomadPli: '0.999',
    },
  },
  {
    label: 'CFTR (Pathogenic SNV)',
    data: {
      chromosome: '7', position: '117548628', ref: 'G', alt: 'A', gene: 'CFTR',
      variantType: 'single nucleotide variant', reviewStatus: 'reviewed by expert panel',
      alphaMissenseScore: '0.882', gnomadLoeuf: '0.18', gnomadPli: '0.999',
    },
  },
  {
    label: 'VHL (Deletion — No AM)',
    data: {
      chromosome: '3', position: '10183673', ref: 'AGTCG', alt: 'A', gene: 'VHL',
      variantType: 'deletion', reviewStatus: 'reviewed by expert panel',
      alphaMissenseScore: '', gnomadLoeuf: '0.12', gnomadPli: '0.999',
    },
  },
];

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
    <div className="flex items-start gap-1.5 text-xs text-[#B68A3A] mt-1">
      <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-heading font-semibold text-[#292D29] dark:text-[#EAE7DD] mb-1.5">
      {children}{required && <span className="text-[#B96F52] ml-0.5">*</span>}
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

  function applyPreset(presetData: Partial<FormFields>) {
    setForm({ ...emptyForm, ...presetData });
    setErrors({});
    setSubmitted(false);
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
    <div className="page-enter space-y-6 max-w-7xl">
      <PageHeader
        title="Variant Analysis Workspace"
        description="Inspect annotation profiles for specific genomic coordinates. This workspace illustrates how biological priors are assembled for feature matrices — live automated inference requires offline execution with local model weights."
      />

      {/* Editorial Research Status Banner */}
      <div className="rounded-xl border border-[#DED9CC] dark:border-[#2E3E34] p-5 flex items-start gap-4 bg-[#FFFEFA] dark:bg-[#1D2A23] shadow-sm">
        <div className="p-2.5 rounded-lg bg-[rgba(182,138,58,0.12)] text-[#8C661D] dark:text-[#E2BC6B] flex-shrink-0">
          <FlaskConical size={22} />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="font-heading font-bold text-[#8C661D] dark:text-[#E2BC6B] text-sm">
            Live Web Inference Not Available — Research Benchmark Suite Only
          </div>
          <div className="text-xs text-[#72776E] dark:text-[#9FA59A] leading-relaxed space-y-1">
            <p>
              VariantIQ is an offline research benchmark. Python training scripts in <code className="text-[#243D32] dark:text-[#D08264] font-mono font-semibold">src/train_models.py</code> generate verified statistical evaluation outputs.
            </p>
            <p>
              The workspace below simulates the annotation assembly process (coordinate normalization, AlphaMissense join, gnomAD constraint retrieval).
            </p>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-heading font-bold text-[#72776E] dark:text-[#9FA59A] flex items-center gap-1">
          <Bookmark size={13} className="text-[#B96F52]" />
          Quick Presets:
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyPreset(p.data)}
            className="px-2.5 py-1 rounded-md border border-[#DED9CC] dark:border-[#2E3E34] bg-[#FFFEFA] dark:bg-[#1D2A23] text-[#292D29] dark:text-[#EAE7DD] hover:border-[#B96F52] hover:text-[#B96F52] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input form */}
        <form className="lg:col-span-3 card space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD] mb-3">
              1. Genomic Coordinates (GRCh38)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Chromosome</FieldLabel>
                <select className={clsx('select', errors.chromosome && '!border-[#B96F52]')} value={form.chromosome} onChange={e => set('chromosome', e.target.value)}>
                  <option value="">Select chromosome…</option>
                  {chromosomes.map(c => <option key={c} value={c}>Chr {c}</option>)}
                </select>
                {errors.chromosome && <ValidationWarning msg={errors.chromosome} />}
              </div>
              <div>
                <FieldLabel required>Position (VCF 1-based)</FieldLabel>
                <input className={clsx('input font-mono', errors.position && '!border-[#B96F52]')} type="number" placeholder="e.g. 43071077" value={form.position} onChange={e => set('position', e.target.value)} min={1} />
                {errors.position && <ValidationWarning msg={errors.position} />}
              </div>
              <div>
                <FieldLabel required>Reference Allele (REF)</FieldLabel>
                <input className={clsx('input font-mono uppercase', errors.ref && '!border-[#B96F52]')} placeholder="e.g. C" value={form.ref} onChange={e => set('ref', e.target.value.toUpperCase())} maxLength={50} />
                {errors.ref && <ValidationWarning msg={errors.ref} />}
              </div>
              <div>
                <FieldLabel required>Alternate Allele (ALT)</FieldLabel>
                <input className={clsx('input font-mono uppercase', errors.alt && '!border-[#B96F52]')} placeholder="e.g. T" value={form.alt} onChange={e => set('alt', e.target.value.toUpperCase())} maxLength={50} />
                {errors.alt && <ValidationWarning msg={errors.alt} />}
              </div>
            </div>
          </div>

          <div className="divider" />

          <div>
            <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD] mb-3">
              2. ClinVar Phenotypic Attributes
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FieldLabel required>Variant Structural Type</FieldLabel>
                <select className={clsx('select', errors.variantType && '!border-[#B96F52]')} value={form.variantType} onChange={e => set('variantType', e.target.value)}>
                  <option value="">Select variant type…</option>
                  {VARIANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.variantType && <ValidationWarning msg={errors.variantType} />}
              </div>
              <div>
                <FieldLabel>Gene Symbol</FieldLabel>
                <input className="input uppercase font-heading font-semibold" placeholder="e.g. BRCA1" value={form.gene} onChange={e => set('gene', e.target.value.toUpperCase())} />
              </div>
              <div>
                <FieldLabel>ClinVar Review Status</FieldLabel>
                <select className="select" value={form.reviewStatus} onChange={e => set('reviewStatus', e.target.value)}>
                  <option value="">Select review level…</option>
                  {REVIEW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div>
            <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD] mb-1">
              3. External Biological Annotations <span className="text-[#72776E] dark:text-[#9FA59A] font-normal font-sans">(optional)</span>
            </div>
            <p className="text-xs text-[#72776E] dark:text-[#9FA59A] mb-3">
              Leave blank if annotation is unavailable. Missing values are encoded explicitly and not treated as evidence of benignity.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FieldLabel>AlphaMissense Score (0.00–1.00, missense SNVs only)</FieldLabel>
                <input className={clsx('input font-mono', errors.alphaMissenseScore && '!border-[#B96F52]')} type="number" step="0.001" min={0} max={1} placeholder="e.g. 0.923" value={form.alphaMissenseScore} onChange={e => set('alphaMissenseScore', e.target.value)} />
                {errors.alphaMissenseScore && <ValidationWarning msg={errors.alphaMissenseScore} />}
                {!isMissenseSNV && form.variantType && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[#8C661D] dark:text-[#E2BC6B]">
                    <AlertTriangle size={11} />
                    <span>AlphaMissense does not score this variant class — score should remain null.</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>gnomAD LOEUF (Gene LoF)</FieldLabel>
                  <input className={clsx('input font-mono', errors.gnomadLoeuf && '!border-[#B96F52]')} type="number" step="0.01" min={0} placeholder="e.g. 0.29" value={form.gnomadLoeuf} onChange={e => set('gnomadLoeuf', e.target.value)} />
                  {errors.gnomadLoeuf && <ValidationWarning msg={errors.gnomadLoeuf} />}
                </div>
                <div>
                  <FieldLabel>gnomAD pLI (Intolerance)</FieldLabel>
                  <input className={clsx('input font-mono', errors.gnomadPli && '!border-[#B96F52]')} type="number" step="0.001" min={0} max={1} placeholder="e.g. 0.999" value={form.gnomadPli} onChange={e => set('gnomadPli', e.target.value)} />
                  {errors.gnomadPli && <ValidationWarning msg={errors.gnomadPli} />}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary flex-1">
              <CheckCircle size={15} />
              Assemble Annotation Profile
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-4">
          {!submitted ? (
            <div className="card flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="p-3.5 rounded-full bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34] text-[#84977A]">
                <FlaskConical size={26} />
              </div>
              <div className="text-[#292D29] dark:text-[#EAE7DD] font-heading font-semibold text-sm">No Profile Assembled</div>
              <div className="text-[#72776E] dark:text-[#9FA59A] text-xs max-w-xs leading-relaxed">
                Select a quick preset above or fill in coordinates to inspect the assembled annotation profile.
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Annotation summary card */}
              <div className="card space-y-3">
                <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD]">
                  Assembled Feature Vector
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#DED9CC]/60 dark:border-[#2E3E34]/60">
                    <span className="text-[#72776E] dark:text-[#9FA59A]">Locus</span>
                    <span className="font-mono text-[#292D29] dark:text-[#EAE7DD] font-medium">chr{form.chromosome}:{form.position} {form.ref}→{form.alt}</span>
                  </div>
                  {form.gene && (
                    <div className="flex justify-between items-center py-1.5 border-b border-[#DED9CC]/60 dark:border-[#2E3E34]/60">
                      <span className="text-[#72776E] dark:text-[#9FA59A]">Gene Target</span>
                      <span className="text-[#243D32] dark:text-[#8FA385] font-heading font-bold">{form.gene}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1.5 border-b border-[#DED9CC]/60 dark:border-[#2E3E34]/60">
                    <span className="text-[#72776E] dark:text-[#9FA59A]">Variant Class</span>
                    <span className="text-[#292D29] dark:text-[#EAE7DD] capitalize font-medium">{form.variantType}</span>
                  </div>
                  {form.reviewStatus && (
                    <div className="flex flex-col gap-0.5 py-1.5 border-b border-[#DED9CC]/60 dark:border-[#2E3E34]/60">
                      <span className="text-[#72776E] dark:text-[#9FA59A]">Review Status</span>
                      <span className="text-[#292D29] dark:text-[#EAE7DD]">{form.reviewStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AlphaMissense card */}
              <div className="card space-y-2.5">
                <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD]">
                  AlphaMissense Structural Signal
                </div>
                {hasAm ? (
                  <>
                    <div className="text-2xl font-bold font-mono text-[#B96F52] dark:text-[#D08264]">
                      {parseFloat(form.alphaMissenseScore).toFixed(3)}
                    </div>
                    <div className="h-2 rounded-full bg-[#DED9CC]/50 dark:bg-[#2E3E34] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${parseFloat(form.alphaMissenseScore) * 100}%`,
                          backgroundColor: parseFloat(form.alphaMissenseScore) > 0.5 ? '#B96F52' : '#84977A',
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A]">0.00 (Benign) to 1.00 (Pathogenic)</div>
                  </>
                ) : (
                  <div className="text-xs text-[#8C661D] dark:text-[#E2BC6B] p-2.5 rounded-md bg-[rgba(182,138,58,0.08)] border border-[rgba(182,138,58,0.25)] flex items-start gap-2">
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    <span>
                      {isMissenseSNV
                        ? 'No AlphaMissense score entered; encoded as missing (has_am = 0).'
                        : 'AlphaMissense unassisted: variant is not a missense SNV.'}
                    </span>
                  </div>
                )}
              </div>

              {/* gnomAD card */}
              <div className="card space-y-2.5">
                <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD]">
                  gnomAD v4.1 Gene Constraint
                </div>
                {hasGnomad ? (
                  <div className="grid grid-cols-2 gap-3">
                    {form.gnomadLoeuf && (
                      <div className="p-2 rounded bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34]">
                        <div className="metric-label text-[10px]">LOEUF</div>
                        <div className="font-mono text-[#292D29] dark:text-[#EAE7DD] font-semibold text-base mt-0.5">
                          {parseFloat(form.gnomadLoeuf).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {form.gnomadPli && (
                      <div className="p-2 rounded bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34]">
                        <div className="metric-label text-[10px]">pLI</div>
                        <div className="font-mono text-[#292D29] dark:text-[#EAE7DD] font-semibold text-base mt-0.5">
                          {parseFloat(form.gnomadPli).toFixed(3)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#8C661D] dark:text-[#E2BC6B] p-2.5 rounded-md bg-[rgba(182,138,58,0.08)] border border-[rgba(182,138,58,0.25)] flex items-center gap-2">
                    <AlertTriangle size={12} />
                    <span>No gnomAD constraint provided. Gene-level priors will be missing.</span>
                  </div>
                )}
              </div>

              {/* Offline pipeline note */}
              <div className="card border-dashed border-[#DED9CC] dark:border-[#2E3E34] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#72776E] dark:text-[#9FA59A] uppercase tracking-wider">
                  <Info size={13} className="text-[#84977A]" />
                  <span>Batch Python Pipeline Integration</span>
                </div>
                <p className="text-xs text-[#72776E] dark:text-[#9FA59A] leading-relaxed">
                  To score this variant using the tuned LightGBM model, execute the evaluation script with your input VCF:
                </p>
                <div className="rounded-md bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34] p-2.5 font-mono text-[11px] text-[#292D29] dark:text-[#EAE7DD] overflow-x-auto">
                  python src/train_models.py --predict-custom
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <LimitationBox items={[
        'Research Profiler Only: No live web-based neural net or tree model prediction is running.',
        'Null Asymmetry: Missing annotations are handled explicitly with binary indicators and not treated as benign proof.',
        'AlphaMissense Non-Commercial: AlphaMissense data is distributed under CC BY-NC-SA 4.0.',
        'Regulatory Boundary: Computational annotations must not be used as clinical diagnostic criteria.',
      ]} />
    </div>
  );
}
