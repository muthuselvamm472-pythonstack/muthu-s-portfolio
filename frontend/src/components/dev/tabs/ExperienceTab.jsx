import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { ConfirmModal } from '../../common/ConfirmModal';

export const ExperienceTab = ({ data, toggleSection, addExperience, updateExperience, deleteExperience, showToast }) => {
  const experiences = data.experiences || [];
  const isSectionVisible = data.sectionVisibility?.experience !== false;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    role: '',
    company: '',
    location: '',
    startDate: '',
    endDate: 'Present',
    description: '',
    technologies: '',
    order: 1,
    isVisible: true
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      role: '',
      company: '',
      location: 'Chennai, India',
      startDate: '',
      endDate: 'Present',
      description: '',
      technologies: '',
      order: experiences.length + 1,
      isVisible: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      role: item.role,
      company: item.company,
      location: item.location || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      description: item.description || '',
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies || '',
      order: item.order || 1,
      isVisible: item.isVisible !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      technologies: typeof form.technologies === 'string'
        ? form.technologies.split(',').map(t => t.trim()).filter(Boolean)
        : form.technologies
    };

    const res = editingItem
      ? await updateExperience(editingItem.id, payload)
      : await addExperience(payload);
    setModalOpen(false);
    if (res && res.ok) {
      showToast(editingItem ? 'Experience updated & synced to Cloud!' : 'New experience added & synced to Cloud!', 'success');
    } else {
      showToast(`Saved locally — pending Cloud Sync (${res?.error || 'Offline'})`, 'warning');
    }
  };

  const promptDelete = (id, role) => {
    setDeleteTarget({ id, role });
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteExperience(deleteTarget.id);
      showToast(`Experience "${deleteTarget.role || 'Item'}" deleted`, 'info');
      setDeleteTarget(null);
    }
  };

  const toggleVisibility = async (item) => {
    const nextVal = item.isVisible === false;
    const res = await updateExperience(item.id, { isVisible: nextVal });
    if (res && res.ok) {
      showToast(`Experience entry ${nextVal ? 'shown' : 'hidden'} on website & synced`, 'info');
    } else {
      showToast(`Updated locally — queued for Cloud Sync`, 'warning');
    }
  };

  const sortedExperiences = [...experiences].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Experience Management</h2>
          <p className="tab-subtitle">Manage work, internships, display order, and toggle visibility</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-2">
          <Plus size={18} /> Add Experience
        </button>
      </div>

      {/* Global Section Visibility ON/OFF Toggle */}
      <div className="admin-section-box margin-bottom">
        <div className="flex-between">
          <div>
            <h3>Show Experience Section on Website</h3>
            <p className="field-hint">When OFF, Experience section disappears from the website and navbar, but all data remains safely stored.</p>
          </div>
          <div className="toggle-switch-wrapper">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isSectionVisible}
                onChange={async () => {
                  const res = await toggleSection('experience');
                  if (res && res.ok) {
                    showToast(`Experience section turned ${!isSectionVisible ? 'ON' : 'OFF'} & synced to Cloud`, 'info');
                  } else {
                    showToast(`Experience section turned ${!isSectionVisible ? 'ON' : 'OFF'} locally — queued for Cloud Sync`, 'warning');
                  }
                }}
              />
              <span className="toggle-slider" />
            </label>
            <span className={`badge ${isSectionVisible ? 'badge-success' : 'badge-disabled'}`}>
              {isSectionVisible ? 'SECTION ON' : 'SECTION OFF'}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-cards-list">
        {sortedExperiences.map((exp) => (
          <div key={exp.id} className="admin-card-item">
            <div className="card-item-header">
              <div>
                <div className="flex-center gap-2 margin-bottom-xs">
                  <span className="badge badge-category">Order #{exp.order || 1}</span>
                  <h4 className="card-item-title">{exp.role}</h4>
                </div>
                <div className="card-item-sub">{exp.company} • {exp.location} ({exp.startDate} - {exp.endDate})</div>
              </div>
              <div className="action-buttons">
                <button
                  onClick={() => toggleVisibility(exp)}
                  className={`status-pill ${exp.isVisible !== false ? 'status-active' : 'status-disabled'}`}
                  title={exp.isVisible !== false ? 'Hide from website' : 'Show on website'}
                >
                  {exp.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                  {exp.isVisible !== false ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => openEditModal(exp)} className="btn-icon" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => promptDelete(exp.id, exp.role)} className="btn-icon btn-icon-danger" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="card-item-desc">{exp.description}</p>
            {exp.technologies && exp.technologies.length > 0 && (
              <div className="tech-tags margin-top">
                {exp.technologies.map((t, idx) => (
                  <span key={idx} className="badge badge-tech">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Experience Entry' : 'Add New Experience Entry'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Job Title / Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Full Stack Developer, Intern"
                  required
                />
              </div>

              <div className="form-group">
                <label>Company / Organization</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Qspiders, ZohoTech"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Chennai, Tamil Nadu, India"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="text"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    placeholder="e.g. Jan 2024"
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    placeholder="e.g. Feb 2024 or Present"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Key Responsibilities</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your achievements and tasks..."
                />
              </div>

              <div className="form-group">
                <label>Technologies Used (comma separated)</label>
                <input
                  type="text"
                  value={form.technologies}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  placeholder="HTML5, CSS3, JavaScript, React.js"
                />
              </div>

              <div className="form-group">
                <label>Display Order (Numbers Only)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="e.g. 1"
                />
              </div>

              <div className="toggle-switch-wrapper">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                  />
                  <span className="toggle-slider" />
                </label>
                <span>Visible on Website</span>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-center gap-2">
                  <Save size={16} /> Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Do you want to delete this experience entry?"
        message="Do you want to delete this experience entry permanently from your portfolio admin?"
        itemName={deleteTarget?.role}
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
