import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { ConfirmModal } from '../../common/ConfirmModal';

export const SkillsTab = ({ data, addSkill, updateSkill, deleteSkill, showToast }) => {
  const skills = data.skills || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Programming',
    icon: 'Code',
    order: 1,
    isVisible: true
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      name: '',
      category: 'Programming',
      icon: 'Code',
      order: skills.length + 1,
      isVisible: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category || 'Programming',
      icon: item.icon || 'Code',
      order: item.order || 1,
      isVisible: item.isVisible !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = editingItem
      ? await updateSkill(editingItem.id, form)
      : await addSkill(form);
    setModalOpen(false);
    if (res && res.ok) {
      showToast(editingItem ? 'Skill updated & synced to Cloud!' : 'New skill added & synced to Cloud!', 'success');
    } else {
      showToast(`Saved locally — pending Cloud Sync (${res?.error || 'Offline'})`, 'warning');
    }
  };

  const promptDelete = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteSkill(deleteTarget.id);
      showToast(`Skill "${deleteTarget.name || 'Item'}" deleted`, 'info');
      setDeleteTarget(null);
    }
  };

  const toggleVisibility = async (item) => {
    const res = await updateSkill(item.id, { isVisible: !item.isVisible });
    if (res && res.ok) {
      showToast(`Skill ${!item.isVisible ? 'shown' : 'hidden'} on website & synced`, 'info');
    } else {
      showToast(`Updated locally — queued for Cloud Sync`, 'warning');
    }
  };

  const sortedSkills = [...skills].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Skills Management</h2>
          <p className="tab-subtitle">Add, edit, reorder, or toggle visibility of your technical skills</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-2">
          <Plus size={18} /> Add Skill
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Skill Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkills.map((skill) => (
              <tr key={skill.id}>
                <td>{skill.order || '-'}</td>
                <td className="font-weight-600">{skill.name}</td>
                <td>
                  <span className="badge badge-category">{skill.category}</span>
                </td>
                <td>
                  <button
                    onClick={() => toggleVisibility(skill)}
                    className={`status-pill ${skill.isVisible !== false ? 'status-active' : 'status-disabled'}`}
                  >
                    {skill.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                    {skill.isVisible !== false ? 'ON' : 'OFF'}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => openEditModal(skill)} className="btn-icon" title="Edit Skill">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => promptDelete(skill.id, skill.name)} className="btn-icon btn-icon-danger" title="Delete Skill">
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
              <h3>{editingItem ? 'Edit Skill' : 'Add New Skill'}</h3>
              <button onClick={() => setModalOpen(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Skill Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Python, Django, React.js, SQL"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Programming">Programming</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
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
                  <Save size={16} /> Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Do you want to delete this skill?"
        message="Do you want to delete this skill permanently from your portfolio admin?"
        itemName={deleteTarget?.name}
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
