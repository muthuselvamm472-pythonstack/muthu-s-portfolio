import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PortfolioPage } from './pages/PortfolioPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import './styles/global.css';
import './styles/public.css';

export function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <ThemeProvider>
            <PortfolioProvider>
              <Routes>
                {/* Public Portfolio Route */}
                <Route path="/" element={<PortfolioPage />} />

                {/* Private Admin Route (Gated by Auth) */}
                <Route path="/admin/*" element={<AdminDashboardPage />} />

                {/* Catch-all → public portfolio */}
                <Route path="*" element={<PortfolioPage />} />
              </Routes>
            </PortfolioProvider>
          </ThemeProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
