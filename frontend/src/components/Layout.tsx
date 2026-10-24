import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, TopNav, MobileHeader, MobileDrawer } from './Navigation';

const pageTitles: Record<string, { title: string; breadcrumbs: string[] }> = {
  '/':            { title: 'Overview Dashboard', breadcrumbs: ['VariantIQ'] },
  '/variants':    { title: 'Variant Explorer', breadcrumbs: ['VariantIQ', 'Data'] },
  '/analysis':    { title: 'Variant Analysis Workspace', breadcrumbs: ['VariantIQ', 'Analysis'] },
  '/performance': { title: 'Model Performance Lab', breadcrumbs: ['VariantIQ', 'Evaluation'] },
  '/pipeline':    { title: 'Dataset & Pipeline', breadcrumbs: ['VariantIQ', 'Methods'] },
  '/reports':     { title: 'Research Reports', breadcrumbs: ['VariantIQ', 'Reports'] },
  '/about':       { title: 'About & Limitations', breadcrumbs: ['VariantIQ', 'Info'] },
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Match longest prefix
  const pageKey = Object.keys(pageTitles)
    .filter(k => k === '/' ? location.pathname === '/' : location.pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0] ?? '/';

  const { title, breadcrumbs } = pageTitles[pageKey] ?? pageTitles['/'];

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Mobile header + drawer */}
      <MobileHeader onMenuOpen={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Desktop top nav */}
      <div className="hidden md:block">
        <TopNav sidebarCollapsed={collapsed} title={title} breadcrumbs={breadcrumbs} />
      </div>

      {/* Main content */}
      <main
        className="transition-all duration-300 pt-14 md:pt-14"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? (collapsed ? 64 : 256) : 0 }}
      >
        <div className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
