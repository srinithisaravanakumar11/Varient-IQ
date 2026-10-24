import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, FlaskConical, BarChart3, GitBranch,
  FileText, Info, ChevronLeft, ChevronRight, Dna, AlertTriangle, Menu, X,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/',                  label: 'Overview',             icon: LayoutDashboard },
  { to: '/variants',          label: 'Variant Explorer',     icon: Search },
  { to: '/analysis',          label: 'Variant Analysis',     icon: FlaskConical },
  { to: '/performance',       label: 'Model Performance',    icon: BarChart3 },
  { to: '/pipeline',          label: 'Dataset & Pipeline',   icon: GitBranch },
  { to: '/reports',           label: 'Reports',              icon: FileText },
  { to: '/about',             label: 'About & Limitations',  icon: Info },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300',
        'border-r border-navy-700/60',
        'bg-gradient-to-b from-navy-900 to-navy-950',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-700/60">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <Dna className="w-4.5 h-4.5 text-navy-950" size={18} />
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <div className="font-bold text-slate-100 text-sm leading-tight">VariantIQ</div>
            <div className="text-[10px] text-teal-400/80 font-mono truncate">v0.3 Research</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-navy-700/50 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Research badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 animate-fade-in">
          <div className="research-banner">
            <AlertTriangle size={12} />
            <span>Research Only — Not Clinical</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700/50',
                collapsed ? 'justify-center' : '',
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="animate-fade-in truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-navy-700/60">
        {!collapsed ? (
          <div className="animate-fade-in text-[10px] text-slate-500 space-y-1">
            <div>ClinVar: public domain (NCBI)</div>
            <div>AlphaMissense: CC BY-NC-SA 4.0</div>
            <div>gnomAD v4.1: open terms</div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Info size={14} className="text-slate-600" />
          </div>
        )}
      </div>
    </aside>
  );
}

interface TopNavProps {
  sidebarCollapsed: boolean;
  title: string;
  breadcrumbs: string[];
}

export function TopNav({ sidebarCollapsed, title, breadcrumbs }: TopNavProps) {
  return (
    <header
      className={clsx(
        'fixed top-0 right-0 z-30 h-14 flex items-center gap-4 px-6',
        'border-b border-navy-700/60 bg-navy-950/80 backdrop-blur-sm',
        'transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64',
      )}
    >
      {/* Breadcrumbs + title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs.length > 0 && (
          <div className="text-xs text-slate-500 truncate">
            {breadcrumbs.join(' › ')}
          </div>
        )}
        <h1 className="text-sm font-semibold text-slate-100 truncate">{title}</h1>
      </div>

      {/* Research status */}
      <div className="research-banner flex-shrink-0">
        <AlertTriangle size={11} />
        <span className="hidden sm:inline">Research Only</span>
      </div>
    </header>
  );
}

export function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center gap-3 px-4 border-b border-navy-700/60 bg-navy-950 md:hidden">
      <button onClick={onMenuOpen} className="p-2 rounded text-slate-400 hover:text-slate-200">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <Dna size={14} className="text-navy-950" />
        </div>
        <span className="font-bold text-slate-100 text-sm">VariantIQ</span>
      </div>
      <div className="ml-auto research-banner">
        <AlertTriangle size={11} />
        <span className="text-[10px]">Research Only</span>
      </div>
    </header>
  );
}

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-navy-900 border-r border-navy-700/60 flex flex-col">
            <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-700/60">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <Dna size={18} className="text-navy-950" />
              </div>
              <div>
                <div className="font-bold text-slate-100 text-sm">VariantIQ</div>
                <div className="text-[10px] text-teal-400/80 font-mono">v0.3 Research</div>
              </div>
              <button onClick={onClose} className="ml-auto p-1 text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700/50',
                    )}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
