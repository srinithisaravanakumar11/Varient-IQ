import { clsx } from 'clsx';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  badge?: string;
  badgeVariant?: 'teal' | 'cyan' | 'amber' | 'red' | 'slate';
  className?: string;
  valueColor?: string;
}

export function MetricCard({ label, value, sub, badge, badgeVariant = 'teal', className, valueColor }: MetricCardProps) {
  return (
    <div className={clsx('metric-card', className)}>
      <div className="flex items-start justify-between">
        <div className={clsx('metric-label')}>{label}</div>
        {badge && <span className={clsx('badge', `badge-${badgeVariant}`)}>{badge}</span>}
      </div>
      <div className={clsx('metric-value', valueColor)}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, children, className }: SectionHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="flex-shrink-0 flex items-center gap-2">{children}</div>}
    </div>
  );
}

interface LimitationBoxProps {
  items: string[];
  title?: string;
}

export function LimitationBox({ items, title = 'Research Limitations' }: LimitationBoxProps) {
  if (!items.length) return null;
  return (
    <div className="limitation-box">
      <div className="font-semibold text-amber-400 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
        ⚠ {title}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-slate-300 text-xs flex gap-2">
            <span className="text-amber-400 flex-shrink-0">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface InfoBoxProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function InfoBox({ children, title, className }: InfoBoxProps) {
  return (
    <div className={clsx('info-box', className)}>
      {title && <div className="font-semibold text-cyan-400 mb-2 text-xs uppercase tracking-wider">ℹ {title}</div>}
      <div className="text-slate-300 text-xs leading-relaxed">{children}</div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-slate-600 mb-4">{icon}</div>}
      <div className="text-slate-400 font-medium">{title}</div>
      {description && <div className="text-slate-500 text-sm mt-1 max-w-sm">{description}</div>}
    </div>
  );
}

export function PageHeader({ title, description, badge }: { title: string; description?: string; badge?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        {badge && <span className="badge badge-teal">{badge}</span>}
      </div>
      {description && <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">{description}</p>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={clsx('divider my-6', className)} />;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-navy-600 border-t-teal-400 rounded-full animate-spin" />
    </div>
  );
}

export function DemoDataWarning() {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs border mb-4"
      style={{ background: 'rgba(99,102,241,0.07)', borderColor: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
      <span className="flex-shrink-0 mt-0.5">⚗</span>
      <span>
        <strong>Demonstration data:</strong> Records in this view are illustrative examples only. They do not represent verified ClinVar submissions or real biological evidence.
      </span>
    </div>
  );
}
