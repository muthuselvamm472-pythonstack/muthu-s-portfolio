import React, { useState } from 'react';
import { Save } from 'lucide-react';

export const HeroTab = ({ data, updateProfile, showToast }) => {
  const [form, setForm] = useState({
    tagline: data.profile?.tagline || '',
    heroDescription: data.profile?.heroDescription || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
    showToast('Hero section updated successfully!', 'success');
  };

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Hero Section Management</h2>
          <p className="tab-subtitle">Modify the main introduction tagline and hero description</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-section-box">
          <h3>Headline & Introduction</h3>
          <div className="form-group">
            <label>Tagline / Main Subtitle</label>
            <input
              type="text"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="e.g. Driven BCA graduate with a strong academic foundation..."
              required
            />
          </div>

          <div className="form-group">
            <label>Hero Description</label>
            <textarea
              name="heroDescription"
              value={form.heroDescription}
              onChange={handleChange}
              rows={4}
              placeholder="Full description appearing below your name"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary flex-center gap-2">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
