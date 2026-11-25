import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import '../styles/admin.css';

export const AdminLoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon-badge">
            <ShieldCheck size={32} />
          </div>
          <h2>Portfolio Admin Portal</h2>
          <p>Private Management System • Sign in to continue</p>
        </div>

        {error && (
          <div className="admin-auth-error" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary admin-login-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} className="spin-icon" /> Connecting to server...
              </span>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>Private CMS System • Muthu Selvam Portfolio</span>
        </div>
      </div>
    </div>
  );
};

