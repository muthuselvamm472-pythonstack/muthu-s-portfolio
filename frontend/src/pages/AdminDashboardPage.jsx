import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminLayout } from '../components/dev/AdminLayout';

export const AdminDashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Verifying admin session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return <AdminLayout />;
};
