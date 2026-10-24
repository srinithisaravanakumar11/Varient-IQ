import React from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, Info } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  badge?: string;
  badgeVariant?: 'terracotta' | 'sage' | 'forest' | 'amber' | 'plum' | 'neutral' | 'teal' | 'cyan' | 'slate' | 'red';
  className?: string;
  valueColor?: string;
  featured?: boolean;
}

export function MetricCard({
  label,
  value,
  sub,
  badge,
  badgeVariant = 'sage',
  className,
  valueColor,
  featured = false,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        'metric-card relative transition-all duration-150',
        featured
          ? 'border-l-4 border-l-[#B96F52] dark:border-l-[#D08264] shadow-sm'
          : '',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="metric-label">{label}</div>
        {badge && <span className={clsx('badge', `badge-${badgeVariant}`)}>{badge}</span>}
      </div>
      <div
        className={clsx(
          'metric-value',
          valueColor ? valueColor : (featured ? 'text-[#243D32] dark:text-[#D08264]' : 'text-[#292D29] dark:text-[#EAE7DD]')
        )}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A] mt-1 font-sans truncate">{sub}</div>}
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
    <div className={clsx('flex items-start justify-between gap-4 mb-4', className)}>
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
  className?: string;
}

export function LimitationBox({ items, title = 'Research Limitations & Boundary Conditions', className }: LimitationBoxProps) {
  if (!items.length) return null;
  return (
    <div className={clsx('limitation-box', className)}>
      <div className="font-heading font-bold text-[#8C661D] dark:text-[#E2BC6B] mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
        <AlertTriangle size={14} className="flex-shrink-0 text-[#B68A3A]" />
        <span>{title}</span>
      </div>
      <ul className="space-y-1.5 pl-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-[#383D38] dark:text-[#D5D2C8] text-xs flex items-start gap-2 leading-relaxed">
            <span className="text-[#B68A3A] font-bold flex-shrink-0 mt-0.5">·</span>
            <span>{item}</span>
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
      {title && (
        <div className="font-heading font-bold text-[#4B6344] dark:text-[#A1B596] mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Info size={13} className="flex-shrink-0" />
          <span>{title}</span>
        </div>
      )}
      <div className="text-[#383D38] dark:text-[#D5D2C8] text-xs leading-relaxed font-sans">{children}</div>
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-[#84977A] mb-3">{icon}</div>}
      <div className="text-[#292D29] dark:text-[#EAE7DD] font-heading font-semibold text-sm">{title}</div>
      {description && <div className="text-[#72776E] dark:text-[#9FA59A] text-xs mt-1 max-w-sm leading-relaxed">{description}</div>}
    </div>
  );
}

export function PageHeader({ title, description, badge }: { title: string; description?: string; badge?: string }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-1.5">
        <h1 className="text-2xl font-heading font-extrabold text-[#292D29] dark:text-[#EAE7DD] tracking-tight">{title}</h1>
        {badge && <span className="badge badge-terracotta">{badge}</span>}
      </div>
      {description && <p className="text-[#72776E] dark:text-[#9FA59A] text-xs md:text-sm max-w-3xl leading-relaxed">{description}</p>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={clsx('divider my-6', className)} />;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#DED9CC] border-t-[#B96F52] dark:border-[#2E3E34] dark:border-t-[#D08264] rounded-full animate-spin" />
    </div>
  );
}

export function DemoDataWarning() {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs border mb-4 bg-[rgba(182,138,58,0.08)] border-[rgba(182,138,58,0.28)] text-[#8C661D] dark:text-[#E2BC6B]">
      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-[#B68A3A]" />
      <span className="leading-relaxed">
        <strong>Demonstration Records:</strong> The variants displayed in this view are illustrative benchmark examples. They do not represent verified diagnostic evidence or real clinical submissions.
      </span>
    </div>
  );
}
