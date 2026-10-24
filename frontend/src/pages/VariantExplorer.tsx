import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader, DemoDataWarning, InfoBox } from '../components/shared';
import { demoVariants } from '../data/researchData';
import type { DemoVariant } from '../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type SortKey = keyof Pick<DemoVariant, 'chromosome' | 'position' | 'gene' | 'variantType' | 'clinvarClassification' | 'reviewStars'>;
type SortDir = 'asc' | 'desc';

function classificationBadgeClass(c: DemoVariant['clinvarClassification']) {
  switch (c) {
    case 'Pathogenic': return 'badge-terracotta';
    case 'Likely pathogenic': return 'badge-amber';
    case 'Benign': return 'badge-sage';
    case 'Likely benign': return 'badge-forest';
    default: return 'badge-neutral';
  }
}

function ReviewStars({ n }: { n: number }) {
  return (
    <div className="flex gap-1" title={`${n} review star${n !== 1 ? 's' : ''}`}>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={clsx(
            'w-2 h-2 rounded-sm',
            i <= n
              ? 'bg-[#B68A3A] dark:bg-[#D4A853]'
              : 'bg-[#DED9CC] dark:bg-[#2E3E34]'
          )}
        />
      ))}
    </div>
  );
}

function VariantDrawer({ variant, onClose }: { variant: DemoVariant; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-[#292D29]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-[#FFFEFA] dark:bg-[#1D2A23] border-l border-[#DED9CC] dark:border-[#2E3E34] text-[#292D29] dark:text-[#EAE7DD] overflow-y-auto animate-slide-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DED9CC] dark:border-[#2E3E34] sticky top-0 bg-[#F5F2EA] dark:bg-[#141C17] z-10">
          <div>
            <div className="font-heading font-bold text-[#292D29] dark:text-[#EAE7DD] text-base">{variant.gene} — {variant.id}</div>
            <div className="text-xs text-[#72776E] dark:text-[#9FA59A] font-mono mt-0.5">chr{variant.chromosome}:{variant.position.toLocaleString()} {variant.ref}→{variant.alt}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#72776E] hover:text-[#292D29] dark:text-[#9FA59A] dark:hover:text-[#EAE7DD] rounded-md hover:bg-[#DED9CC]/40 dark:hover:bg-[#2E3E34]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <DemoDataWarning />

          {/* Core attributes grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card !p-3.5 space-y-1">
              <div className="metric-label text-[10px]">ClinVar Classification</div>
              <span className={clsx('badge mt-0.5', classificationBadgeClass(variant.clinvarClassification))}>
                {variant.clinvarClassification}
              </span>
            </div>
            <div className="card !p-3.5 space-y-1">
              <div className="metric-label text-[10px]">Review Confidence</div>
              <div className="pt-1"><ReviewStars n={variant.reviewStars} /></div>
            </div>
            <div className="card !p-3.5 space-y-1">
              <div className="metric-label text-[10px]">Variant Type</div>
              <div className="text-sm font-medium capitalize text-[#292D29] dark:text-[#EAE7DD]">{variant.variantType}</div>
            </div>
            <div className="card !p-3.5 space-y-1">
              <div className="metric-label text-[10px]">Curation Stringency</div>
              <div className="text-xs text-[#72776E] dark:text-[#9FA59A] leading-tight">{variant.reviewStatus}</div>
            </div>
          </div>

          {/* AlphaMissense section */}
          <div className="card !p-4 space-y-3">
            <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD]">
              AlphaMissense Functional Score
            </div>
            {variant.hasAlphaMissense ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#72776E] dark:text-[#9FA59A]">Pathogenicity Probability</span>
                  <span className="font-mono text-[#B96F52] dark:text-[#D08264] font-bold text-sm">
                    {variant.alphaMissenseScore?.toFixed(3)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#DED9CC]/50 dark:bg-[#2E3E34] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(variant.alphaMissenseScore ?? 0) * 100}%`,
                      backgroundColor: (variant.alphaMissenseScore ?? 0) > 0.5 ? '#B96F52' : '#84977A',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#72776E] dark:text-[#9FA59A] font-mono">
                  <span>0.00 (Benign)</span>
                  <span>1.00 (Pathogenic)</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#8C661D] dark:text-[#D4A853] p-2.5 rounded-md bg-[rgba(182,138,58,0.08)] border border-[rgba(182,138,58,0.25)] flex items-start gap-2">
                <span className="font-bold">⚠</span>
                <span>Unassisted: AlphaMissense evaluates only missense SNVs. This variant receives median imputation with has_am = 0.</span>
              </div>
            )}
          </div>

          {/* gnomAD constraint */}
          <div className="card !p-4 space-y-3">
            <div className="text-xs font-heading font-bold uppercase tracking-wider text-[#292D29] dark:text-[#EAE7DD]">
              gnomAD v4.1 Gene Constraint
            </div>
            {variant.hasGnomad ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-md bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34]">
                  <div className="metric-label text-[10px]">LOEUF Score</div>
                  <div className="font-mono text-sm font-semibold text-[#292D29] dark:text-[#EAE7DD] mt-0.5">
                    {variant.gnomadLoeuf?.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#72776E] dark:text-[#9FA59A] mt-0.5">&lt;0.6 indicates high LoF constraint</div>
                </div>
                <div className="p-2.5 rounded-md bg-[#F5F2EA] dark:bg-[#141C17] border border-[#DED9CC] dark:border-[#2E3E34]">
                  <div className="metric-label text-[10px]">pLI Intolerance</div>
                  <div className="font-mono text-sm font-semibold text-[#292D29] dark:text-[#EAE7DD] mt-0.5">
                    {variant.gnomadPli?.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-[#72776E] dark:text-[#9FA59A] mt-0.5">&gt;0.9 indicates LoF intolerance</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#8C661D] dark:text-[#D4A853] p-2.5 rounded-md bg-[rgba(182,138,58,0.08)] border border-[rgba(182,138,58,0.25)] flex items-center gap-2">
                <span>⚠</span>
                <span>No gnomAD constraint record cataloged for this gene locus</span>
              </div>
            )}
          </div>

          <InfoBox title="Research Inference Status">
            Live clinical predictions are intentionally unavailable in the web UI. VariantIQ provides verified benchmark metrics from offline model training pipelines. Real inference requires running <code className="font-mono text-[#B96F52] dark:text-[#D08264]">src/train_models.py</code> with local model weights.
          </InfoBox>

          <div className="text-xs text-[#72776E] dark:text-[#9FA59A] p-3 bg-[#F5F2EA] dark:bg-[#141C17] rounded-lg border border-[#DED9CC] dark:border-[#2E3E34]">
            <strong>Curator note:</strong> {variant.note}
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
    if (sortKey !== k) return <ChevronUp size={12} className="text-[#9E9B90]" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#B96F52]" /> : <ChevronDown size={12} className="text-[#B96F52]" />;
  }

  const clearFilters = () => {
    setSearch(''); setChromosome(''); setVariantType(''); setClassification(''); setHasAm(''); setPage(0);
  };

  const hasActiveFilters = search || chromosome || variantType || classification || hasAm;

  return (
    <div className="page-enter space-y-6 max-w-7xl">
      <PageHeader
        title="Variant Explorer"
        description="Inspect illustrative demonstration variant records with ClinVar attributes, AlphaMissense predictions, and gnomAD constraint scores. Click any row to view specimen details."
      />

      <DemoDataWarning />

      {/* Botanical Filters Card */}
      <div className="card !p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72776E]" />
            <input
              className="input pl-9"
              placeholder="Search gene symbol, ID, chromosome, classification…"
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
              <option value="">All variant types</option>
              {variantTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="select w-48" value={classification} onChange={e => { setClassification(e.target.value); setPage(0); }}>
              <option value="">All classifications</option>
              {classifications.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="select w-40" value={hasAm} onChange={e => { setHasAm(e.target.value); setPage(0); }}>
              <option value="">AlphaMissense: Any</option>
              <option value="yes">With AlphaMissense</option>
              <option value="no">Without AlphaMissense</option>
            </select>
            {hasActiveFilters && (
              <button className="btn-ghost text-xs flex items-center gap-1 text-[#B96F52]" onClick={clearFilters}>
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#72776E] dark:text-[#9FA59A] pt-1 border-t border-[#DED9CC]/60 dark:border-[#2E3E34]/60">
          <span>{filtered.length} variant{filtered.length !== 1 ? 's' : ''} cataloged {hasActiveFilters ? '(filtered)' : ''}</span>
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select className="select w-16 !py-0.5 !text-xs" value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(0); }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Botanical Specimen Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA]/60 dark:bg-[#141C17]/60">
                {([
                  ['chromosome', 'Chr', 'w-16'],
                  ['gene', 'Gene', 'w-24'],
                  ['position', 'Position (GRCh38)', 'w-36'],
                  ['variantType', 'Variant Type', 'w-36'],
                  ['clinvarClassification', 'Clinical Interpretation', 'w-44'],
                  ['reviewStars', 'Stars', 'w-20'],
                ] as [SortKey, string, string][]).map(([key, label, w]) => (
                  <th
                    key={key}
                    className={clsx('table-header px-4 py-3 text-left cursor-pointer select-none hover:text-[#B96F52] transition-colors', w)}
                    onClick={() => toggleSort(key)}
                  >
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
                  <td colSpan={8} className="py-12 text-center text-[#72776E]">
                    No variant specimens match the current filter query.
                  </td>
                </tr>
              ) : (
                paged.map(v => (
                  <tr
                    key={v.id}
                    className="table-row cursor-pointer transition-colors"
                    onClick={() => setSelected(v)}
                  >
                    <td className="px-4 py-3 font-mono text-[#72776E] dark:text-[#9FA59A]">{v.chromosome}</td>
                    <td className="px-4 py-3 font-heading font-bold text-[#243D32] dark:text-[#A1B596] text-sm">{v.gene}</td>
                    <td className="px-4 py-3 font-mono text-[#72776E] dark:text-[#9FA59A]">{v.position.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#292D29] dark:text-[#EAE7DD] capitalize">{v.variantType}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge text-[10px]', classificationBadgeClass(v.clinvarClassification))}>
                        {v.clinvarClassification}
                      </span>
                    </td>
                    <td className="px-4 py-3"><ReviewStars n={v.reviewStars} /></td>
                    <td className="px-4 py-3">
                      {v.hasAlphaMissense
                        ? <span className="font-mono text-[#B96F52] dark:text-[#D08264] font-semibold">{v.alphaMissenseScore?.toFixed(3)}</span>
                        : <span className="text-[#9E9B90]">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {v.hasGnomad
                        ? <span className="text-[#586B50] dark:text-[#8FA385] font-bold">✓</span>
                        : <span className="text-[#9E9B90]">—</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Botanical Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA]/40 dark:bg-[#141C17]/40">
          <div className="text-xs text-[#72776E] dark:text-[#9FA59A]">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded text-[#72776E] hover:text-[#292D29] dark:hover:text-[#EAE7DD] hover:bg-[#DED9CC]/40 dark:hover:bg-[#2E3E34] disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => setPage(p => p - 1)} disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={clsx(
                  'w-7 h-7 rounded text-xs font-heading font-medium transition-colors',
                  i === page
                    ? 'bg-[#243D32] dark:bg-[#2E4D40] text-[#FFFEFA] font-bold'
                    : 'text-[#72776E] dark:text-[#9FA59A] hover:bg-[#DED9CC]/40 dark:hover:bg-[#2E3E34]',
                )}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="p-1 rounded text-[#72776E] hover:text-[#292D29] dark:hover:text-[#EAE7DD] hover:bg-[#DED9CC]/40 dark:hover:bg-[#2E3E34] disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && <VariantDrawer variant={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
