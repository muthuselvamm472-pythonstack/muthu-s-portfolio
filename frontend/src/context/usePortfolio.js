/**
 * usePortfolio.js — Standalone hook export for Vite Fast Refresh compatibility.
 * Vite HMR requires a file to export ONLY components OR only hooks, not both.
 * By separating usePortfolio from PortfolioProvider, HMR works without full page reloads.
 */
export { usePortfolio } from './PortfolioContext';
