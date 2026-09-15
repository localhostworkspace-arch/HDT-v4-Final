import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const THEME_KEY = 'hdt_theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') return 'light';
    return 'dark'; // Default to dark / black theme
  } catch {
    return 'dark';
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* Theme still works when browser storage is unavailable. */ }
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== THEME_KEY && event.key !== null) return;
      try { if (event.storageArea && event.storageArea !== localStorage) return; } catch { return; }
      setThemeState(event.newValue === 'light' ? 'light' : 'dark');
    };
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  const toggleTheme = () => setThemeState(previous => previous === 'dark' ? 'light' : 'dark');
  const setTheme = (next: Theme) => setThemeState(next);

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
