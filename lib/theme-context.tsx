'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    const htmlElement = document.documentElement;
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setTheme(newTheme);
    console.log('Tema alternado para:', newTheme);
  };

  useEffect(() => {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark');
    const currentTheme: Theme = isDark ? 'dark' : 'light';
    
    setTheme(currentTheme);
    console.log('ThemeProvider inicializado com tema:', currentTheme);
    
    setIsMounted(true);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}
