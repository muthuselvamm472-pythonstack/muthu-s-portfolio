import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, ExternalLink, Image, Eye, EyeOff } from 'lucide-react';
import { ConfirmModal } from '../../common/ConfirmModal';

export const CertificationsTab = ({ data, toggleSection, addCertification, updateCertification, deleteCertification, showToast }) => {
  const certs = data.certifications || [];
  const isSectionVisible = data.sectionVisibility?.certifications !== false;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    name: '',
    organization: '',
    issueDate: '',
    credentialUrl: '',
    certificateImg: '',
    order: 1,
    isVisible: true
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      name: '',
      organization: '',
      issueDate: '2025',
      credentialUrl: '',
      certificateImg: '',
      order: certs.length + 1,
      isVisible: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      organization: item.organization,
      issueDate: item.issueDate || '',
      credentialUrl: item.credentialUrl || '',
      certificateImg: item.certificateImg || '',
      order: item.order || 1,
      isVisible: item.isVisible !== false
    });
    setModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Certificate image must be under 2.5 MB for reliable cloud & offline sync.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, certificateImg: reader.result }));
      showToast('Certificate photo attached!', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = editingItem
      ? await updateCertification(editingItem.id, form)
      : await addCertification(form);
    setModalOpen(false);
    if (res && res.ok) {
      showToast(editingItem ? 'Certification updated & synced to Cloud!' : 'New certification added & synced to Cloud!', 'success');
    } else {
      showToast(`Saved locally — pending Cloud Sync (${res?.error || 'Offline'})`, 'warning');
    }
  };

  const promptDelete = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteCertification(deleteTarget.id);
      showToast(`Certification "${deleteTarget.name || 'Item'}" deleted`, 'info');
      setDeleteTarget(null);
    }
  };

  const toggleVisibility = async (item) => {
    const nextVal = item.isVisible === false;
    const res = await updateCertification(item.id, { isVisible: nextVal });
    if (res && res.ok) {
      showToast(`Certification ${nextVal ? 'shown' : 'hidden'} on website & synced`, 'info');
    } else {
      showToast(`Updated locally — queued for Cloud Sync`, 'warning');
    }
  };

  const sortedCerts = [...certs].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Certifications Management</h2>
          <p className="tab-subtitle">Manage course certificates, credentials, order, and toggle visibility</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-2">
          <Plus size={18} /> Add Certification
        </button>
      </div>

      {/* Global Section Visibility ON/OFF Toggle */}
      <div className="admin-section-box margin-bottom">
        <div className="flex-between">
          <div>
            <h3>Show Certifications Section on Website</h3>
            <p className="field-hint">When OFF, Certifications section disappears from website and navbar, but stored data is retained.</p>
          </div>
          <div className="toggle-switch-wrapper">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isSectionVisible}
                onChange={async () => {
                  const res = await toggleSection('certifications');
                  if (res && res.ok) {
                    showToast(`Certifications section turned ${!isSectionVisible ? 'ON' : 'OFF'} & synced to Cloud`, 'info');
                  } else {
                    showToast(`Certifications section turned ${!isSectionVisible ? 'ON' : 'OFF'} locally — queued for Cloud Sync`, 'warning');
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
        {sortedCerts.map((cert) => (
          <div key={cert.id} className="admin-card-item">
            <div className="card-item-header">
              <div>
                <div className="flex-center gap-2 margin-bottom-xs">
                  <span className="badge badge-category">Order #{cert.order || 1}</span>
                  <h4 className="card-item-title">{cert.name}</h4>
                </div>
                <div className="card-item-sub">{cert.organization} • Issued: {cert.issueDate || 'Verified'}</div>
              </div>
              <div className="action-buttons">
                <button
                  onClick={() => toggleVisibility(cert)}
                  className={`status-pill ${cert.isVisible !== false ? 'status-active' : 'status-disabled'}`}
                  title={cert.isVisible !== false ? 'Hide from website' : 'Show on website'}
                >
                  {cert.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                  {cert.isVisible !== false ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => openEditModal(cert)} className="btn-icon" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => promptDelete(cert.id, cert.name)} className="btn-icon btn-icon-danger" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-center gap-2 margin-top">
              {cert.certificateImg && (
                <span className="badge badge-success flex-center gap-1">
                  <Image size={12} /> Certificate Photo Attached
                </span>
              )}
              {cert.credentialUrl && cert.credentialUrl !== '#' && (
                <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="badge badge-info flex-center gap-1">
                  <ExternalLink size={12} /> Website Link
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Certification' : 'Add Certification'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Certification Title</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Qspiders - Python Full Stack"
                  required
                />
              </div>

              <div className="form-group">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="e.g. Qspiders Training Institute"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Issue Year / Date (Numbers Only)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="e.g. 2025"
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
                <label>Upload Certificate Image (Photos/Scans)</label>
                <div className="file-upload-wrapper" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn btn-secondary file-upload-btn" style={{ margin: 0, cursor: 'pointer' }}>
                    <Upload size={16} /> Select Certificate Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  {form.certificateImg && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, certificateImg: '' }));
                        showToast('Certificate photo removed. Click "Save Certification" to confirm.', 'info');
                      }}
                      className="btn btn-outline flex-center gap-1"
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Trash2 size={14} /> Remove Photo
                    </button>
                  )}
                </div>
                {form.certificateImg && (
                  <div className="img-preview-thumb margin-top" style={{ marginTop: '0.75rem' }}>
                    <img src={form.certificateImg} alt="Certificate preview" style={{ maxHeight: '180px', borderRadius: '8px' }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Credential Website URL (Optional)</label>
                <input
                  type="text"
                  value={form.credentialUrl}
                  onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
                  placeholder="https://..."
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
                  <Save size={16} /> Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Do you want to delete this certification?"
        message="Do you want to delete this certification permanently from your portfolio admin?"
        itemName={deleteTarget?.name}
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
