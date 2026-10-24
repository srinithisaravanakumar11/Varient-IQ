import React, { createContext, useContext, useEffect, useState } from 'react';

export const BOTANICAL_TOKENS = {
  light: {
    bgMain: '#F5F2EA',
    bgSidebar: '#243D32',
    bgCard: '#FFFEFA',
    bgCardHover: '#F7F4EB',
    primaryAccent: '#B96F52',       // Terracotta
    secondaryAccent: '#84977A',     // Sage
    mainText: '#292D29',            // Botanical charcoal
    secondaryText: '#72776E',       // Muted warm gray
    border: '#DED9CC',              // Warm parchment border
    borderSubtle: '#E8E4DA',
    warning: '#B68A3A',             // Muted ochre
    plum: '#5C3D4E',                // Deep plum accent
    forest: '#243D32',              // Forest green
    warmGray: '#9E9B90',
  },
  dark: {
    bgMain: '#141C17',
    bgSidebar: '#1A2821',
    bgCard: '#1D2A23',
    bgCardHover: '#23322B',
    primaryAccent: '#D08264',       // Terracotta highlight
    secondaryAccent: '#8FA385',     // Sage highlight
    mainText: '#EAE7DD',            // Warm off-white
    secondaryText: '#9FA59A',       // Muted warm sage-gray
    border: '#2E3E34',              // Olive charcoal border
    borderSubtle: '#26342C',
    warning: '#D4A853',
    plum: '#8A6075',
    forest: '#3F6553',
    warmGray: '#B4B0A4',
  },
} as const;

// Coordinated botanical chart palette
export const CHART_FOREST     = '#243D32';
export const CHART_TERRACOTTA  = '#B96F52';
export const CHART_SAGE        = '#84977A';
export const CHART_WARM_GRAY   = '#9E9B90';
export const CHART_PLUM        = '#5C3D4E';
export const CHART_AMBER       = '#B68A3A';
export const CHART_CHARCOAL    = '#292D29';

// Dark theme chart variants
export const CHART_FOREST_DARK     = '#3F6553';
export const CHART_TERRACOTTA_DARK  = '#D08264';
export const CHART_SAGE_DARK        = '#8FA385';
export const CHART_WARM_GRAY_DARK   = '#B4B0A4';
export const CHART_PLUM_DARK        = '#8A6075';
export const CHART_AMBER_DARK       = '#D4A853';

export const CHART_PALETTE = [
  CHART_FOREST,
  CHART_TERRACOTTA,
  CHART_SAGE,
  CHART_WARM_GRAY,
  CHART_PLUM,
  CHART_AMBER,
];

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('variantiq-theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') return stored;
    }
    return 'light'; // Default to Botanical Light per prompt
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('variantiq-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
