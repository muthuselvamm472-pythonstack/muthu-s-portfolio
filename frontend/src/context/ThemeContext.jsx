import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockPortfolioData } from '../mockData';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(() => {
    const savedUserTheme = localStorage.getItem('muthu_portfolio_theme_mode');
    const savedAdminDefault = localStorage.getItem('muthu_portfolio_default_theme');
    return savedUserTheme || savedAdminDefault || mockPortfolioData.themeSettings?.themeMode || 'dark';
  });

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    localStorage.setItem('muthu_portfolio_theme_mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  const setAdminDefaultTheme = (mode) => {
    localStorage.setItem('muthu_portfolio_default_theme', mode);
    localStorage.removeItem('muthu_portfolio_user_selected_theme');
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('muthu_portfolio_user_selected_theme', nextMode);
    setThemeMode(nextMode);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, theme: themeMode, toggleTheme, setThemeMode, setAdminDefaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
