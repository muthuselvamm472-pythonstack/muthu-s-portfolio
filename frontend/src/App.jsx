import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LiquidGlassSvgFilter } from './components/common/GlassLayers';
import { PortfolioPage } from './pages/PortfolioPage';
import './styles/global.css';
import './styles/public.css';

// Route-level code splitting so public visitors don't download the entire Admin CMS bundle eagerly
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((mod) => ({ default: mod.AdminDashboardPage }))
);

export function App() {
  return (
    <ErrorBoundary>
      <LiquidGlassSvgFilter />
      <HashRouter>
        <AuthProvider>
          <ThemeProvider>
            <PortfolioProvider>
              <Routes>
                {/* Public Portfolio Route */}
                <Route path="/" element={<PortfolioPage />} />

                {/* Private Admin Route (Lazy-loaded & Gated by Auth) */}
                <Route
                  path="/admin/*"
                  element={
                    <Suspense
                      fallback={
                        <div className="admin-loading-screen">
                          <div className="spinner" />
                          <p>Loading Admin Studio...</p>
                        </div>
                      }
                    >
                      <AdminDashboardPage />
                    </Suspense>
                  }
                />

                {/* Catch-all -> public portfolio */}
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
