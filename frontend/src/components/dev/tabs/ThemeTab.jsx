import React, { useState, useEffect } from 'react';
import { Save, Palette, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export const ThemeTab = ({ data, updateThemeSettings, showToast }) => {
  const { themeMode, setThemeMode, setAdminDefaultTheme } = useTheme();
  const theme = data.themeSettings || {};

  const [form, setForm] = useState({
    themeMode: theme.themeMode || localStorage.getItem('muthu_portfolio_default_theme') || 'light',
    primaryColor: theme.primaryColor || '#936142',
    accentColor: theme.accentColor || '#C58970',
    backgroundColor: theme.backgroundColor || '#CCBBA9',
    textColor: theme.textColor || '#414942',
    cardColor: theme.cardColor || '#EAE0D5',
    borderRadius: theme.borderRadius || '18px'
  });

  useEffect(() => {
    if (data.themeSettings) {
      setForm(prev => ({
        ...prev,
        themeMode: data.themeSettings.themeMode || prev.themeMode,
        primaryColor: data.themeSettings.primaryColor || prev.primaryColor,
        accentColor: data.themeSettings.accentColor || prev.accentColor,
        backgroundColor: data.themeSettings.backgroundColor || prev.backgroundColor,
        textColor: data.themeSettings.textColor || prev.textColor,
        cardColor: data.themeSettings.cardColor || prev.cardColor,
        borderRadius: data.themeSettings.borderRadius || prev.borderRadius,
      }));
    }
  }, [data.themeSettings]);

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (mode) => {
    setForm(prev => ({ ...prev, themeMode: mode }));
    setThemeMode(mode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateThemeSettings(form);
      setAdminDefaultTheme(form.themeMode);
      if (res && res.ok) {
        showToast(`✅ Default website theme saved to Cloud Database as ${form.themeMode.toUpperCase()} mode!`, 'success');
      } else {
        showToast(`⚠️ Theme saved locally (${form.themeMode.toUpperCase()}). ${res?.error || 'Sync when online.'}`, 'warning');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Theme & Appearance Settings</h2>
          <p className="tab-subtitle">Control the default theme mode (Dark/Light) and brand styling for your public website</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-section-box">
          <h3>Default Website Theme Mode</h3>
          <p className="section-desc" style={{ color: 'var(--admin-text-sub)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Choose which theme mode automatically appears when visitors land on your website:
          </p>

          <div className="theme-mode-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => handleModeChange('dark')}
              className={`theme-mode-card ${form.themeMode === 'dark' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.25rem',
                borderRadius: '16px',
                background: form.themeMode === 'dark' ? 'rgba(147, 97, 66, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                color: 'var(--admin-text-main)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Moon size={26} style={{ color: form.themeMode === 'dark' ? 'var(--admin-accent)' : 'inherit' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Dark Mode</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-sub)' }}>Sleek, deep slate charcoal theme</span>
              </div>
              {form.themeMode === 'dark' && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: 'var(--admin-accent)' }} />}
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('light')}
              className={`theme-mode-card ${form.themeMode === 'light' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.25rem',
                borderRadius: '16px',
                background: form.themeMode === 'light' ? 'rgba(147, 97, 66, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                color: 'var(--admin-text-main)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Sun size={26} style={{ color: form.themeMode === 'light' ? 'var(--admin-accent)' : 'inherit' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>Light Mode</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-sub)' }}>Warm linen sand editorial theme</span>
              </div>
              {form.themeMode === 'light' && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: 'var(--admin-accent)' }} />}
            </button>
          </div>
        </div>





        <div className="form-actions">
          <button type="submit" className="btn btn-primary flex-center gap-2" disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Default Theme Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
