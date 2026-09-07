import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Star, Upload, ExternalLink, Github } from 'lucide-react';
import { ConfirmModal } from '../../common/ConfirmModal';

export const ProjectsTab = ({ data, addProject, updateProject, deleteProject, showToast }) => {
  const projects = data.projects || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    image: '',
    technologies: '',
    githubUrl: '',
    liveDemoUrl: '',
    order: 1,
    isFeatured: false,
    isVisible: true
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      shortDescription: '',
      detailedDescription: '',
      image: '',
      technologies: '',
      githubUrl: 'https://github.com/muthuselvamm472-pythonstack',
      liveDemoUrl: '#',
      order: projects.length + 1,
      isFeatured: false,
      isVisible: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      shortDescription: item.shortDescription || '',
      detailedDescription: item.detailedDescription || '',
      image: item.image || '',
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies || '',
      githubUrl: item.githubUrl || '',
      liveDemoUrl: item.liveDemoUrl || '',
      order: item.order || 1,
      isFeatured: !!item.isFeatured,
      isVisible: item.isVisible !== false
    });
    setModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
      showToast('Project screenshot attached!', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      technologies: typeof form.technologies === 'string'
        ? form.technologies.split(',').map(t => t.trim()).filter(Boolean)
        : form.technologies
    };

    if (editingItem) {
      updateProject(editingItem.id, payload);
      showToast('Project updated successfully!', 'success');
    } else {
      addProject(payload);
      showToast('New project added!', 'success');
    }
    setModalOpen(false);
  };

  const promptDelete = (id, title) => {
    setDeleteTarget({ id, title });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProject(deleteTarget.id);
      showToast(`Project "${deleteTarget.title || 'Item'}" deleted`, 'info');
      setDeleteTarget(null);
    }
  };

  const toggleFeatured = (item) => {
    updateProject(item.id, { isFeatured: !item.isFeatured });
    showToast(`Project ${!item.isFeatured ? 'featured' : 'unfeatured'}`, 'info');
  };

  const toggleVisibility = (item) => {
    const nextVal = item.isVisible === false;
    updateProject(item.id, { isVisible: nextVal });
    showToast(`Project ${nextVal ? 'shown' : 'hidden'} on website`, 'info');
  };

  const sortedProjects = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Projects Management</h2>
          <p className="tab-subtitle">Add, edit, reorder, feature, and toggle visibility of your projects</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-2">
          <Plus size={18} /> Add Project
        </button>
      </div>

      <div className="admin-cards-list">
        {sortedProjects.map((proj) => (
          <div key={proj.id} className="admin-card-item">
            <div className="card-item-header">
              <div className="flex-center gap-2">
                <span className="badge badge-category">Order #{proj.order || 1}</span>
                <h4 className="card-item-title">{proj.title}</h4>
                {proj.isFeatured && (
                  <span className="badge badge-featured flex-center gap-1">
                    <Star size={12} fill="currentColor" /> Featured
                  </span>
                )}
              </div>
              <div className="action-buttons">
                <button
                  onClick={() => toggleVisibility(proj)}
                  className={`status-pill ${proj.isVisible !== false ? 'status-active' : 'status-disabled'}`}
                  title={proj.isVisible !== false ? 'Hide from website' : 'Show on website'}
                >
                  {proj.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                  {proj.isVisible !== false ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => toggleFeatured(proj)}
                  className={`btn-icon ${proj.isFeatured ? 'btn-icon-warning' : ''}`}
                  title="Toggle Featured"
                >
                  <Star size={16} fill={proj.isFeatured ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => openEditModal(proj)} className="btn-icon" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => promptDelete(proj.id, proj.title)} className="btn-icon btn-icon-danger" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="card-item-desc">{proj.shortDescription}</p>

            {proj.technologies && (
              <div className="tech-tags margin-top">
                {proj.technologies.map((t, idx) => (
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
              <h3>{editingItem ? 'Edit Project' : 'Add Project'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Python Full Stack Web Application"
                  required
                />
              </div>

              <div className="form-group">
                <label>Short Summary</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Brief 1-line summary for cards"
                  required
                />
              </div>

              <div className="form-group">
                <label>Detailed Description</label>
                <textarea
                  value={form.detailedDescription}
                  onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
                  rows={3}
                  placeholder="Full project details, feature overview, architecture"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>GitHub Repository URL</label>
                  <input
                    type="text"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="form-group">
                  <label>Live Demo URL</label>
                  <input
                    type="text"
                    value={form.liveDemoUrl}
                    onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Technologies (comma separated)</label>
                  <input
                    type="text"
                    value={form.technologies}
                    onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                    placeholder="Python, Django, SQL, React.js"
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
              </div>

              <div className="form-group">
                <label>Project Screenshot Image</label>
                <div className="file-upload-wrapper" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn btn-secondary file-upload-btn" style={{ margin: 0, cursor: 'pointer' }}>
                    <Upload size={16} /> Choose Image File
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, image: '' }));
                        showToast('Project photo removed. Click "Save Project" to confirm.', 'info');
                      }}
                      className="btn btn-outline flex-center gap-1"
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Trash2 size={14} /> Remove Photo
                    </button>
                  )}
                </div>
                {form.image && (
                  <div className="img-preview-thumb margin-top" style={{ marginTop: '0.75rem' }}>
                    <img src={form.image} alt="Project Preview" style={{ maxHeight: '180px', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <div className="flex-center gap-4">
                <div className="toggle-switch-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span>Featured Project</span>
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
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-center gap-2">
                  <Save size={16} /> Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Do you want to delete this project?"
        message="Do you want to delete this project permanently from your portfolio admin?"
        itemName={deleteTarget?.title}
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
