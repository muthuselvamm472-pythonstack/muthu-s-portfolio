import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { SocialIcon } from '../../common/SocialIcon';
import { ConfirmModal } from '../../common/ConfirmModal';

export const SocialLinksTab = ({ data, addSocialLink, updateSocialLink, deleteSocialLink, showToast }) => {
  const links = data.socialLinks || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [customPlatform, setCustomPlatform] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    platform: 'GitHub',
    url: '',
    icon: 'Github',
    order: 1,
    isVisible: true
  });

  const openAddModal = () => {
    setEditingItem(null);
    setCustomPlatform('');
    setForm({
      platform: 'GitHub',
      url: 'https://',
      icon: 'Github',
      order: links.length + 1,
      isVisible: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const standardPlatforms = ['GitHub', 'LinkedIn', 'Email', 'YouTube', 'LeetCode', 'HackerRank', 'Twitter', 'Instagram'];
    const isCustom = !standardPlatforms.includes(item.platform);

    if (isCustom) {
      setCustomPlatform(item.platform);
    } else {
      setCustomPlatform('');
    }

    setForm({
      platform: isCustom ? 'Other' : item.platform,
      url: item.url,
      icon: item.icon || item.platform,
      order: item.order || 1,
      isVisible: item.isVisible !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPlatform = form.platform === 'Other' && customPlatform.trim() ? customPlatform.trim() : form.platform;
    const payload = { ...form, platform: finalPlatform };

    if (editingItem) {
      updateSocialLink(editingItem.id, payload);
      showToast('Social link updated!', 'success');
    } else {
      addSocialLink(payload);
      showToast('New social link added!', 'success');
    }
    setModalOpen(false);
  };

  const promptDelete = (id, platform) => {
    setDeleteTarget({ id, platform });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteSocialLink(deleteTarget.id);
      showToast(`Social link "${deleteTarget.platform || 'Item'}" deleted`, 'info');
      setDeleteTarget(null);
    }
  };

  const toggleVisibility = (item) => {
    const nextVal = item.isVisible === false;
    updateSocialLink(item.id, { isVisible: nextVal });
    showToast(`Social link ${nextVal ? 'shown' : 'hidden'} on website`, 'info');
  };

  const sortedLinks = [...links].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Social Links Management</h2>
          <p className="tab-subtitle">Manage social media profiles, order number, hide/unhide, and custom links</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-2">
          <Plus size={18} /> Add Social Link
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Platform</th>
              <th>URL</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLinks.map((link) => (
              <tr key={link.id}>
                <td><span className="badge badge-category">#{link.order || 1}</span></td>
                <td className="font-weight-600">
                  <div className="flex-center gap-2">
                    <SocialIcon platform={link.platform} size={18} />
                    <span>{link.platform}</span>
                  </div>
                </td>
                <td>
                  <a href={link.url} target="_blank" rel="noreferrer" className="flex-center gap-1">
                    {link.url} <ExternalLink size={12} />
                  </a>
                </td>
                <td>
                  <button
                    onClick={() => toggleVisibility(link)}
                    className={`status-pill ${link.isVisible !== false ? 'status-active' : 'status-disabled'}`}
                    title={link.isVisible !== false ? 'Hide from website' : 'Show on website'}
                  >
                    {link.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                    {link.isVisible !== false ? 'ON' : 'OFF'}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => openEditModal(link)} className="btn-icon" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => promptDelete(link.id, link.platform)} className="btn-icon btn-icon-danger" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Social Link' : 'Add Social Link'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Platform Name</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                >
                  <option value="GitHub">GitHub</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email">Email</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="HackerRank">HackerRank</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Other">Other (Custom)</option>
                </select>
              </div>

              {form.platform === 'Other' && (
                <div className="form-group">
                  <label>Custom Platform Name</label>
                  <input
                    type="text"
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                    placeholder="e.g. Medium, Dev.to, Portfolio"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>URL / Destination Link</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  required
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
                  <Save size={16} /> Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Do you want to delete this social link?"
        message="Do you want to delete this social link permanently from your portfolio admin?"
        itemName={deleteTarget?.platform}
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
