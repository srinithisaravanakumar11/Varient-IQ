import { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader, SectionHeader, DemoDataWarning, EmptyState, InfoBox } from '../components/shared';
import { demoVariants } from '../data/researchData';
import type { DemoVariant } from '../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type SortKey = keyof Pick<DemoVariant, 'chromosome' | 'position' | 'gene' | 'variantType' | 'clinvarClassification' | 'reviewStars'>;
type SortDir = 'asc' | 'desc';

function classificationColor(c: DemoVariant['clinvarClassification']) {
  switch (c) {
    case 'Pathogenic': return 'badge-red';
    case 'Likely pathogenic': return 'badge-amber';
    case 'Benign': return 'badge-teal';
    case 'Likely benign': return 'badge-cyan';
    default: return 'badge-slate';
  }
}

function ReviewStars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={clsx('w-2 h-2 rounded-sm', i <= n ? 'bg-amber-400' : 'bg-navy-700')} />
      ))}
    </div>
  );
}

function VariantDrawer({ variant, onClose }: { variant: DemoVariant; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-navy-900 border-l border-navy-700 overflow-y-auto animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700/60 sticky top-0 bg-navy-900 z-10">
          <div>
            <div className="font-semibold text-slate-100">{variant.gene} — {variant.id}</div>
            <div className="text-xs text-slate-400 font-mono">chr{variant.chromosome}:{variant.position} {variant.ref}→{variant.alt}</div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-navy-700/50">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <DemoDataWarning />

          <div className="grid grid-cols-2 gap-4">
            <div className="card !p-4">
              <div className="metric-label">Classification</div>
              <span className={clsx('badge mt-1', classificationColor(variant.clinvarClassification))}>{variant.clinvarClassification}</span>
            </div>
            <div className="card !p-4">
              <div className="metric-label">Review Stars</div>
              <div className="mt-1.5"><ReviewStars n={variant.reviewStars} /></div>
            </div>
            <div className="card !p-4">
              <div className="metric-label">Variant Type</div>
              <div className="text-slate-200 text-sm mt-1 capitalize">{variant.variantType}</div>
            </div>
            <div className="card !p-4">
              <div className="metric-label">Review Status</div>
              <div className="text-slate-300 text-xs mt-1 leading-tight">{variant.reviewStatus}</div>
            </div>
          </div>

          <div className="card !p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-200">AlphaMissense Annotation</div>
            {variant.hasAlphaMissense ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Score</span>
                  <span className="font-mono text-teal-400 font-bold">{variant.alphaMissenseScore?.toFixed(3)}</span>
                </div>
                <div className="h-2 rounded-full bg-navy-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(variant.alphaMissenseScore ?? 0) * 100}%`,
                      background: `linear-gradient(to right, ${(variant.alphaMissenseScore ?? 0) > 0.5 ? '#f87171' : '#2dd4bf'}, ${(variant.alphaMissenseScore ?? 0) > 0.5 ? '#ef4444' : '#14b8a6'})`,
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500">0 = benign evidence · 1 = pathogenic evidence (AlphaMissense scale)</div>
              </>
            ) : (
              <div className="text-xs text-amber-400 flex items-center gap-2">
                <span>⚠</span>
                <span>Not scored — variant is not a missense SNV in the AlphaMissense table</span>
              </div>
            )}
          </div>

          <div className="card !p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-200">gnomAD v4.1 Gene Constraint</div>
            {variant.hasGnomad ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="metric-label text-[10px]">LOEUF (loss-of-function)</div>
                  <div className="font-mono text-slate-200">{variant.gnomadLoeuf?.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">Lower = more constrained</div>
                </div>
                <div>
                  <div className="metric-label text-[10px]">pLI</div>
                  <div className="font-mono text-slate-200">{variant.gnomadPli?.toFixed(3)}</div>
                  <div className="text-[10px] text-slate-500">Higher = LoF intolerant</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-400 flex items-center gap-2">
                <span>⚠</span>
                <span>No gnomAD constraint data for this gene</span>
              </div>
            )}
          </div>

          <InfoBox title="Model Inference Status">
            No live inference pipeline is currently deployed for VariantIQ v0.3. The training scripts in <code className="text-teal-400 font-mono">src/</code> produce stored evaluation results only. Individual-variant prediction requires a saved model artefact and a FastAPI endpoint — see the About & Limitations page for the integration roadmap.
          </InfoBox>

          <div className="text-xs text-slate-500 p-3 bg-navy-950/50 rounded-lg border border-navy-800">
            <strong>Source note:</strong> {variant.note}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VariantExplorer() {
  const [search, setSearch] = useState('');
  const [chromosome, setChromosome] = useState('');
  const [variantType, setVariantType] = useState('');
  const [classification, setClassification] = useState('');
  const [hasAm, setHasAm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('chromosome');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<DemoVariant | null>(null);

  const chromosomes = [...new Set(demoVariants.map(v => v.chromosome))].sort((a, b) => {
    const numA = parseInt(a), numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });
  const variantTypes = [...new Set(demoVariants.map(v => v.variantType))];
  const classifications = [...new Set(demoVariants.map(v => v.clinvarClassification))];

  const filtered = useMemo(() => {
    let rows = [...demoVariants];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(v =>
        v.gene.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.chromosome.includes(q) ||
        v.clinvarClassification.toLowerCase().includes(q)
      );
    }
    if (chromosome) rows = rows.filter(v => v.chromosome === chromosome);
    if (variantType) rows = rows.filter(v => v.variantType === variantType);
    if (classification) rows = rows.filter(v => v.clinvarClassification === classification);
    if (hasAm === 'yes') rows = rows.filter(v => v.hasAlphaMissense);
    if (hasAm === 'no') rows = rows.filter(v => !v.hasAlphaMissense);

    rows.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [search, chromosome, variantType, classification, hasAm, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={12} className="text-slate-600" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-teal-400" /> : <ChevronDown size={12} className="text-teal-400" />;
  }

  const clearFilters = () => {
    setSearch(''); setChromosome(''); setVariantType(''); setClassification(''); setHasAm(''); setPage(0);
  };

  const hasActiveFilters = search || chromosome || variantType || classification || hasAm;

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Variant Explorer"
        description="Browse illustrative demonstration variant records with ClinVar-style attributes and annotation data. These records are for UI demonstration only — they do not represent verified ClinVar submissions."
      />

      <DemoDataWarning />

      {/* Filters */}
      <div className="card !p-4 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search gene, ID, chromosome, classification…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select className="select w-36" value={chromosome} onChange={e => { setChromosome(e.target.value); setPage(0); }}>
              <option value="">All chromosomes</option>
              {chromosomes.map(c => <option key={c} value={c}>Chr {c}</option>)}
            </select>
            <select className="select w-44" value={variantType} onChange={e => { setVariantType(e.target.value); setPage(0); }}>
              <option value="">All types</option>
              {variantTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="select w-48" value={classification} onChange={e => { setClassification(e.target.value); setPage(0); }}>
              <option value="">All classifications</option>
              {classifications.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="select w-40" value={hasAm} onChange={e => { setHasAm(e.target.value); setPage(0); }}>
              <option value="">Any AM status</option>
              <option value="yes">Has AlphaMissense</option>
              <option value="no">No AlphaMissense</option>
            </select>
            {hasActiveFilters && (
              <button className="btn-ghost text-xs flex items-center gap-1" onClick={clearFilters}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''} {hasActiveFilters ? '(filtered)' : ''}</span>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="select w-16 !py-1 !text-xs" value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(0); }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700/60">
                {([
                  ['chromosome', 'Chr', 'w-16'],
                  ['gene', 'Gene', 'w-24'],
                  ['position', 'Position', 'w-32'],
                  ['variantType', 'Type', 'w-40'],
                  ['clinvarClassification', 'Classification', 'w-44'],
                  ['reviewStars', 'Stars', 'w-20'],
                ] as [SortKey, string, string][]).map(([key, label, w]) => (
                  <th key={key} className={clsx('table-header px-4 py-3 text-left cursor-pointer select-none hover:text-teal-400 transition-colors', w)} onClick={() => toggleSort(key)}>
                    <div className="flex items-center gap-1">
                      {label} <SortIcon k={key} />
                    </div>
                  </th>
                ))}
                <th className="table-header px-4 py-3 text-left w-24">AM Score</th>
                <th className="table-header px-4 py-3 text-left w-20">gnomAD</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No records match the current filters.
                  </td>
                </tr>
              ) : (
                paged.map(v => (
                  <tr
                    key={v.id}
                    className="table-row cursor-pointer"
                    onClick={() => setSelected(v)}
                  >
                    <td className="px-4 py-3 font-mono text-slate-300 text-xs">{v.chromosome}</td>
                    <td className="px-4 py-3 font-semibold text-teal-400 text-sm">{v.gene}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">{v.position.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs capitalize">{v.variantType}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge text-[10px]', classificationColor(v.clinvarClassification))}>
                        {v.clinvarClassification}
                      </span>
                    </td>
                    <td className="px-4 py-3"><ReviewStars n={v.reviewStars} /></td>
                    <td className="px-4 py-3">
                      {v.hasAlphaMissense
                        ? <span className="font-mono text-teal-400 text-xs">{v.alphaMissenseScore?.toFixed(3)}</span>
                        : <span className="text-slate-600 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {v.hasGnomad
                        ? <span className="text-slate-400 text-xs">✓</span>
                        : <span className="text-slate-600 text-xs">—</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-navy-700/60">
          <div className="text-xs text-slate-500">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-navy-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => setPage(p => p - 1)} disabled={page === 0}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={clsx(
                  'w-7 h-7 rounded text-xs font-medium transition-colors',
                  i === page ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-navy-700/50',
                )}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-navy-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selected && <VariantDrawer variant={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
