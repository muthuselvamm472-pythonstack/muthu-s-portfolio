import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SectionProvider } from './context/SectionContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';
import { PortfolioPage } from './pages/PortfolioPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import './styles/global.css';
import './styles/public.css';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <PortfolioProvider>
            <SectionProvider>
              <Routes>
                {/* Public Portfolio Route */}
                <Route path="/" element={<PortfolioPage />} />

                {/* Private Admin Route (Gated by Auth) */}
                <Route path="/admin/*" element={<AdminDashboardPage />} />

                {/* Catch-all → public portfolio */}
                <Route path="*" element={<PortfolioPage />} />
              </Routes>
            </SectionProvider>
          </PortfolioProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
