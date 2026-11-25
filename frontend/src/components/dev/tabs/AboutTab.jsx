import React, { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';

export const AboutTab = ({ data, updateAbout, showToast }) => {
  const [form, setForm] = useState({
    heading: data.about?.heading || '',
    shortDescription: data.about?.shortDescription || '',
    detailedDescription: data.about?.detailedDescription || '',
    currentFocus: data.about?.currentFocus || '',
    coreTechnologies: data.about?.coreTechnologies || '',
    showResumeButton: data.about?.showResumeButton !== false,
  });
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (data.about && !isDirtyRef.current) {
      setForm(prev => ({
        ...prev,
        heading: data.about.heading || '',
        shortDescription: data.about.shortDescription || '',
        detailedDescription: data.about.detailedDescription || '',
        currentFocus: data.about.currentFocus || '',
        coreTechnologies: data.about.coreTechnologies || '',
        showResumeButton: data.about.showResumeButton !== false,
      }));
    }
  }, [data.about]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    isDirtyRef.current = true;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateAbout(form);
      isDirtyRef.current = false;
      if (res && res.ok) {
        showToast('🎉 About section saved & synced to Cloud Database!', 'success');
      } else {
        showToast(`⚠️ Saved locally — queued for Cloud Sync (${res?.error || 'Backend waking up'})`, 'warning');
      }
    } catch (_) {
      showToast('⚠️ Saved locally — pending Cloud Sync.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>About Me Management</h2>
          <p className="tab-subtitle">Update background summary, core technologies, and focus area</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-section-box">
          <h3>Main Heading & Summary</h3>
          <div className="form-group">
            <label>Heading</label>
            <input type="text" name="heading" value={form.heading} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Short Description (Degree & College)</label>
            <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={2} required />
          </div>

          <div className="form-group">
            <label>Detailed Description (Career goals & aspirations)</label>
            <textarea name="detailedDescription" value={form.detailedDescription} onChange={handleChange} rows={4} required />
          </div>
        </div>

        <div className="admin-section-box">
          <h3>Current Focus & Technologies</h3>
          <div className="form-group">
            <label>Current Focus</label>
            <input type="text" name="currentFocus" value={form.currentFocus} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Core Technologies Line</label>
            <input type="text" name="coreTechnologies" value={form.coreTechnologies} onChange={handleChange} placeholder="e.g. PYTHON • SQL • HTML5 • CSS3 • REACT.JS" />
          </div>

          <div className="toggle-switch-wrapper">
            <label className="toggle-switch">
              <input type="checkbox" name="showResumeButton" checked={form.showResumeButton} onChange={handleChange} />
              <span className="toggle-slider" />
            </label>
            <span>Show Resume Button in About Section</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary flex-center gap-2" disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
