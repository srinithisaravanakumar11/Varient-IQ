import {
  AlertTriangle, ShieldAlert, BookOpen, Dna, FileCheck,
  ExternalLink, CheckCircle, Scale, Database, Cpu, Layers
} from 'lucide-react';
import { PageHeader, SectionHeader, LimitationBox, InfoBox } from '../components/shared';

const citations = [
  {
    title: 'Accurate proteome-wide missense variant effect prediction with AlphaMissense',
    authors: 'Cheng, J., Novati, G., Pan, J., Bycroft, C., Žídek, A., Keel, A., ... & Balakrishnan, S.',
    journal: 'Science 381, eadg7492 (2023)',
    doi: '10.1126/science.adg7492',
    link: 'https://doi.org/10.1126/science.adg7492',
    license: 'CC BY-NC-SA 4.0 (Non-commercial research only)',
  },
  {
    title: 'The mutational constraint spectrum quantified from variation in 141,456 humans',
    authors: 'Karczewski, K. J., Francioli, L. C., Tiao, G., Cummings, B. B., Alföldi, J., Wang, Q., ... & MacArthur, D. G.',
    journal: 'Nature 581, 434–443 (2020)',
    doi: '10.1038/s41586-020-2308-7',
    link: 'https://doi.org/10.1038/s41586-020-2308-7',
    license: 'Open Access / Broad Institute gnomAD Terms',
  },
  {
    title: 'ClinVar: public archive of interpretations of clinically relevant variants',
    authors: 'Landrum, M. J., Lee, J. M., Benson, M., Brown, G., Chao, C., Chitipothu, S., ... & Kattman, B. L.',
    journal: 'Nucleic Acids Research 44, D862–D868 (2016)',
    doi: '10.1093/nar/gkv1222',
    link: 'https://doi.org/10.1093/nar/gkv1222',
    license: 'Public Domain / NCBI NIH',
  },
];

const technicalAudits = [
  { title: 'Zero Train/Test Overlap', desc: 'Partitioned by chromosome: train (1–18), val (19–20), test (21, 22, X). Zero identical variant keys appear across sets.' },
  { title: 'Out-of-Fold Gene Priors', desc: 'Gene-level target encodings are computed exclusively out-of-fold to eliminate gene-identity memorization.' },
  { title: 'Bootstrap Confidence Bounds', desc: 'All reported evaluation metrics include 95% bootstrap confidence intervals derived from 1,000 resamples.' },
  { title: 'Prospective Temporal Validation', desc: 'Models trained on historical 2025 releases are verified against 201,812 newly submitted 2026 variants.' },
];

export default function AboutLimitations() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <PageHeader
        title="About VariantIQ & Scientific Limitations"
        description="Scientific disclosure of research objectives, regulatory boundaries, data provenance, and algorithmic constraints."
        badge="Academic Research Only"
      />

      {/* Prominent Regulatory / Clinical Disclaimer Banner */}
      <div className="p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm uppercase tracking-wider">
          <ShieldAlert size={20} className="text-amber-400 flex-shrink-0" />
          <span>Research Platform — Not a Clinically Validated Diagnostic Medical Device</span>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">
          VariantIQ is an exploratory machine-learning benchmark platform designed strictly for computational genomics research,
          algorithmic comparison, and functional variant prioritization. It has <strong>not</strong> been reviewed, cleared, or approved
          by the U.S. FDA, EMA, or any other health authority. It must <strong>not</strong> be utilized as the basis for clinical diagnosis,
          patient stratification, therapeutic decision-making, or genetic counseling.
        </p>
        <div className="text-xs text-amber-300/80 pt-1 font-mono">
          Intended Use: In silico research and methodology benchmarking only. CLIA / CAP validated protocols required for clinical utility.
        </div>
      </div>

      {/* Key Methodological Realities */}
      <div className="space-y-4">
        <SectionHeader
          title="Essential Scientific Takeaways & Data Realities"
          subtitle="Critical observations established across the VariantIQ benchmark suite"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 space-y-2 border-l-4 border-l-teal-500">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Dna size={16} className="text-teal-400" />
              AlphaMissense Drives Annotation Lift
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              External biological features lift overall ROC-AUC from 0.812 to 0.871. However, subpopulation disaggregation reveals that
              this entire gain is concentrated within missense SNVs (ROC-AUC 0.729 → 0.962). Unscored SNVs and structural variants show zero
              statistically significant improvement from the current annotation library.
            </p>
          </div>

          <div className="card p-5 space-y-2 border-l-4 border-l-cyan-500">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers size={16} className="text-cyan-400" />
              The 15.4% Coverage Boundary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              AlphaMissense scores are available for only 15.4% of variants in our test hold-out (20,800 missense SNVs). For the remaining
              84.6% of variants (frameshifts, stop-gained, indels, and non-coding alterations), predictions depend entirely on genomic
              coordinates and gene-level constraint.
            </p>
          </div>

          <div className="card p-5 space-y-2 border-l-4 border-l-amber-500">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Scale size={16} className="text-amber-400" />
              Label Quality & Submitter Bias
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ClinVar records vary widely in curation rigor (from single clinical submitters to expert panels). Our sensitivity audit
              demonstrated that models trained across all 1.4M variants generalize effectively to expert-reviewed (2+ star) variants
              (ROC-AUC 0.869) without succumbing to noise artefacts.
            </p>
          </div>

          <div className="card p-5 space-y-2 border-l-4 border-l-indigo-500">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cpu size={16} className="text-indigo-400" />
              Model Architecture Invariance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When supplied with state-of-the-art annotations, linear Logistic Regression (ROC-AUC 0.872, PR-AUC 0.775) performs
              competitively with deep MLPs and gradient-boosted trees (LightGBM 0.871, XGBoost 0.873). High-quality biological representations
              trump algorithmic complexity.
            </p>
          </div>
        </div>
      </div>

      {/* Rigorous Leakage Prevention */}
      <div className="card p-6 space-y-4">
        <SectionHeader
          title="Data Integrity & Leakage Prevention Measures"
          subtitle="Procedures implemented in src/audit_splits.py and src/gene_encoding.py"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technicalAudits.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-navy-950/60 border border-navy-700/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                <CheckCircle size={14} className="text-teal-400" />
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* External Data Sources & Literature Citations */}
      <div className="space-y-4">
        <SectionHeader
          title="Scientific Data Sources & Literature Citations"
          subtitle="All biological datasets incorporated into VariantIQ"
        />

        <div className="space-y-3">
          {citations.map((c, i) => (
            <div key={i} className="card p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-100">{c.title}</h3>
                <a
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-mono flex-shrink-0"
                >
                  <span>DOI: {c.doi}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-xs text-slate-400">{c.authors}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-navy-800">
                <span className="text-slate-300 font-medium">{c.journal}</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400 font-mono text-[11px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                  {c.license}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Limitations */}
      <LimitationBox
        title="Comprehensive Evaluation Disclosures"
        items={[
          'Non-Commercial License: AlphaMissense predictions are licensed under CC BY-NC-SA 4.0, restricting commercial deployment.',
          'Missingness Asymmetry: Missing annotation flags (has_am) inadvertently supply structural variant type information.',
          'Prospective Prior Transfer: Temporal evaluation tests variants sharing disease genes with training data, which inflates apparent performance relative to de novo chromosome splits.',
          'Calibration Stability: While isotonic calibration drops validation ECE to 0.02, probability calibration may experience drift across patient sub-cohorts with divergent disease prevalences.',
        ]}
      />
    </div>
  );
}
