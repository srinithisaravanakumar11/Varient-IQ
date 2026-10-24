import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, FlaskConical, BarChart3, GitBranch,
  FileText, Info, ChevronLeft, ChevronRight, Dna, AlertTriangle, Menu, X,
  Sun, Moon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../theme';

const navItems = [
  { to: '/',                  label: 'Overview',             icon: LayoutDashboard },
  { to: '/variants',          label: 'Variant Explorer',     icon: Search },
  { to: '/analysis',          label: 'Variant Analysis',     icon: FlaskConical },
  { to: '/performance',       label: 'Model Performance',    icon: BarChart3 },
  { to: '/pipeline',          label: 'Dataset & Pipeline',   icon: GitBranch },
  { to: '/reports',           label: 'Research Reports',     icon: FileText },
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
        'border-r border-[#1C3228] dark:border-[#26382E]',
        'bg-[#243D32] dark:bg-[#1A2821] text-[#E8E6DF]',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Editorial Logo Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1C3228] dark:border-[#26382E]">
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[#2E4D40] border border-[#3E6554] flex items-center justify-center text-[#B96F52] dark:text-[#D08264]">
          <Dna size={18} />
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <div className="font-heading font-bold text-[#FFFEFA] text-sm tracking-tight leading-tight">VariantIQ</div>
            <div className="text-[10px] text-[#A1B596] font-mono tracking-wider">v0.3 Research</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-md text-[#9DB099] hover:text-[#EDEAE0] hover:bg-[#2E4D40] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Research Badge in Sidebar */}
      {!collapsed && (
        <div className="mx-3 mt-3 animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium bg-[#1C3228] border border-[#2F4D3F] text-[#D8B467]">
            <AlertTriangle size={12} className="flex-shrink-0 text-[#B68A3A]" />
            <span>Research Only — Not Clinical</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#2E4D40] text-[#FFFEFA] font-semibold'
                  : 'text-[#B0BAAC] hover:text-[#FFFEFA] hover:bg-[#2A4639]',
                collapsed ? 'justify-center px-0' : '',
              )}
              title={collapsed ? label : undefined}
            >
              {/* Restrained Terracotta Active Indicator */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#B96F52] dark:bg-[#D08264] rounded-r" />
              )}
              <Icon
                size={17}
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-[#D08264]' : 'text-[#84977A]'
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Botanical Footer Metadata */}
      <div className="px-3 py-3 border-t border-[#1C3228] dark:border-[#26382E]">
        {!collapsed ? (
          <div className="animate-fade-in text-[10px] text-[#84977A] space-y-0.5 leading-relaxed font-mono">
            <div>ClinVar: public domain</div>
            <div>AlphaMissense: CC BY-NC-SA 4.0</div>
            <div>gnomAD v4.1: open terms</div>
          </div>
        ) : (
          <div className="flex justify-center text-[#84977A]">
            <Info size={14} />
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
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={clsx(
        'fixed top-0 right-0 z-30 h-14 flex items-center justify-between gap-4 px-6',
        'border-b border-[#DED9CC] dark:border-[#2E3E34]',
        'bg-[#F5F2EA]/95 dark:bg-[#141C17]/95 backdrop-blur-md',
        'transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64',
      )}
    >
      {/* Breadcrumbs + title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs.length > 0 && (
          <div className="text-[11px] text-[#72776E] dark:text-[#9FA59A] truncate font-medium">
            {breadcrumbs.join(' › ')}
          </div>
        )}
        <h1 className="text-sm font-heading font-bold text-[#292D29] dark:text-[#EAE7DD] truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Research status banner */}
        <div className="research-banner">
          <AlertTriangle size={12} />
          <span className="hidden sm:inline">Research Platform</span>
        </div>

        {/* Theme toggle: Botanical Light <-> Botanical Dark */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-[#DED9CC] dark:border-[#2E3E34] bg-[#FFFEFA] dark:bg-[#1D2A23] text-[#72776E] dark:text-[#EAE7DD] hover:border-[#B96F52] transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} className="text-[#D4A853]" />}
        </button>
      </div>
    </header>
  );
}

export function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center gap-3 px-4 border-b border-[#DED9CC] dark:border-[#2E3E34] bg-[#F5F2EA] dark:bg-[#141C17] md:hidden">
      <button onClick={onMenuOpen} className="p-2 rounded text-[#72776E] dark:text-[#EAE7DD]">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-[#243D32] flex items-center justify-center text-[#B96F52]">
          <Dna size={14} />
        </div>
        <span className="font-heading font-bold text-[#292D29] dark:text-[#EAE7DD] text-sm">VariantIQ</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="research-banner text-[10px]">
          <AlertTriangle size={10} />
          <span>Research</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded border border-[#DED9CC] dark:border-[#2E3E34] text-[#72776E] dark:text-[#EAE7DD]"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} className="text-[#D4A853]" />}
        </button>
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
          <div className="absolute inset-0 bg-[#292D29]/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#243D32] border-r border-[#1C3228] text-[#E8E6DF] flex flex-col">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1C3228]">
              <div className="w-8 h-8 rounded bg-[#2E4D40] flex items-center justify-center text-[#B96F52]">
                <Dna size={18} />
              </div>
              <div>
                <div className="font-heading font-bold text-[#FFFEFA] text-sm">VariantIQ</div>
                <div className="text-[10px] text-[#84977A] font-mono">v0.3 Research</div>
              </div>
              <button onClick={onClose} className="ml-auto p-1.5 text-[#9DB099] hover:text-[#EDEAE0]">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={clsx(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all',
                      isActive
                        ? 'bg-[#2E4D40] text-[#FFFEFA] font-semibold'
                        : 'text-[#B0BAAC] hover:text-[#FFFEFA] hover:bg-[#2A4639]',
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#B96F52] rounded-r" />
                    )}
                    <Icon size={18} className={isActive ? 'text-[#D08264]' : 'text-[#84977A]'} />
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
