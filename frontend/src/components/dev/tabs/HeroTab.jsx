import React, { useState, useEffect, useRef } from 'react';
import { Save, Sparkles, Type, Plus, Trash2, Layers, GripVertical } from 'lucide-react';

export const HeroTab = ({ data, updateProfile, showToast }) => {
  const profile = data.profile || {};

  const [form, setForm] = useState({
    title: profile.title || 'PYTHON FULL STACK DEVELOPER',
    tagline: profile.tagline || '',
    heroDescription: profile.heroDescription || '',
    statusBadgeText: profile.statusBadgeText || 'Available for Full Stack Opportunities',
    showStatusBadge: profile.showStatusBadge !== false,
    heroLine1: profile.heroLine1 !== undefined ? profile.heroLine1 : "I'm Muthu Selvam,",
    heroLine2: profile.heroLine2 !== undefined ? profile.heroLine2 : "A Python Full Stack",
    heroLine3: profile.heroLine3 !== undefined ? profile.heroLine3 : "developer",
    typewriterRoles: Array.isArray(profile.typewriterRoles) && profile.typewriterRoles.length > 0
      ? profile.typewriterRoles
      : [
          "PYTHON FULL STACK DEVELOPER",
          "DJANGO REST API SPECIALIST",
          "REACT.JS & ORACLE SQL DEVELOPER",
          "QA ANALYST"
        ]
  });

  const [newRoleInput, setNewRoleInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragSrcIdx = useRef(null);

  useEffect(() => {
    if (data.profile) {
      setForm(prev => ({
        ...prev,
        title: data.profile.title || prev.title,
        tagline: data.profile.tagline || prev.tagline,
        heroDescription: data.profile.heroDescription || prev.heroDescription,
        statusBadgeText: data.profile.statusBadgeText || prev.statusBadgeText,
        showStatusBadge: data.profile.showStatusBadge !== false,
        heroLine1: data.profile.heroLine1 !== undefined ? data.profile.heroLine1 : prev.heroLine1,
        heroLine2: data.profile.heroLine2 !== undefined ? data.profile.heroLine2 : prev.heroLine2,
        heroLine3: data.profile.heroLine3 !== undefined ? data.profile.heroLine3 : prev.heroLine3,
        typewriterRoles: Array.isArray(data.profile.typewriterRoles) && data.profile.typewriterRoles.length > 0
          ? data.profile.typewriterRoles
          : prev.typewriterRoles
      }));
    }
  }, [data.profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTypewriterRole = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = newRoleInput.trim().toUpperCase();
    if (!trimmed) return;
    if (form.typewriterRoles.includes(trimmed)) {
      showToast('This title is already in the typewriter rotation.', 'warning');
      return;
    }
    setForm(prev => ({
      ...prev,
      typewriterRoles: [...prev.typewriterRoles, trimmed]
    }));
    setNewRoleInput('');
    showToast(`✨ Added "${trimmed}" to typewriter animation!`, 'info');
  };

  const handleRemoveTypewriterRole = (indexToRemove) => {
    if (form.typewriterRoles.length <= 1) {
      showToast('You must keep at least 1 word in the typewriter rotation.', 'warning');
      return;
    }
    setForm(prev => ({
      ...prev,
      typewriterRoles: prev.typewriterRoles.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Drag-to-reorder handlers
  const handleDragStart = (idx) => { dragSrcIdx.current = idx; };
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (idx) => {
    const src = dragSrcIdx.current;
    if (src === null || src === idx) { setDragOverIdx(null); return; }
    const updated = [...form.typewriterRoles];
    const [removed] = updated.splice(src, 1);
    updated.splice(idx, 0, removed);
    setForm(prev => ({ ...prev, typewriterRoles: updated }));
    dragSrcIdx.current = null;
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { dragSrcIdx.current = null; setDragOverIdx(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
    showToast('🎉 Hero section and typography animation updated successfully!', 'success');
  };

  const MAX_CHARS = 60;
  const charsLeft = MAX_CHARS - newRoleInput.length;

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Hero Section & Typography Management</h2>
          <p className="tab-subtitle">Customize your headline, typewriter text animations, status badge, and role titles</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Availability Badge Box */}
        <div className="admin-section-box margin-bottom">
          <div className="flex-center gap-2 margin-bottom">
            <Sparkles size={20} style={{ color: '#10b981' }} />
            <h3>Availability Status Badge</h3>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Status Pill Text</label>
              <input
                type="text"
                name="statusBadgeText"
                value={form.statusBadgeText}
                onChange={handleChange}
                placeholder="e.g. Available for Full Stack Opportunities"
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label>Badge Visibility</label>
              <div className="toggle-switch-wrapper" style={{ marginTop: '0.4rem' }}>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="showStatusBadge"
                    checked={form.showStatusBadge}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider" />
                </label>
                <span>{form.showStatusBadge ? 'Visible on Website' : 'Hidden from Website'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Typewriter Animation Words ── */}
        <div className="admin-section-box margin-bottom" style={{
          border: '1px solid rgba(6, 182, 212, 0.25)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.04) 0%, var(--admin-card-bg) 100%)'
        }}>
          <div className="flex-center gap-2" style={{ marginBottom: '0.3rem' }}>
            <Type size={20} style={{ color: '#06b6d4' }} />
            <h3 style={{ margin: 0 }}>Typography Animation Words (Typewriter Rotation)</h3>
            <span style={{
              marginLeft: 'auto',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06b6d4',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: '20px',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {form.typewriterRoles.length} word{form.typewriterRoles.length !== 1 ? 's' : ''} rotating
            </span>
          </div>
          <p className="field-hint" style={{ marginBottom: '1.25rem', fontSize: '0.83rem' }}>
            These words rotate dynamically above your headline with a smooth typing &amp; deleting animation.
            Drag chips to reorder. Words auto-convert to UPPERCASE.
          </p>

          {/* ── Enhanced Input Row ── */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'stretch',
              border: `2px solid ${inputFocused ? '#06b6d4' : 'rgba(6, 182, 212, 0.25)'}`,
              borderRadius: '14px',
              background: 'var(--admin-bg)',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxShadow: inputFocused
                ? '0 0 0 4px rgba(6, 182, 212, 0.12), 0 4px 20px rgba(6, 182, 212, 0.08)'
                : 'none',
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={newRoleInput}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) setNewRoleInput(e.target.value);
                  }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleAddTypewriterRole(); }
                  }}
                  placeholder="e.g. DJANGO EXPERT, FULL STACK DEVELOPER..."
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    padding: '0.85rem 2.5rem 0.85rem 1.1rem',
                    background: 'transparent',
                    color: 'var(--admin-text-main)',
                    fontSize: '0.92rem',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    letterSpacing: '0.01em',
                    boxSizing: 'border-box',
                  }}
                />
                {newRoleInput && (
                  <span style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: charsLeft < 10 ? '#ef4444' : 'rgba(148,163,184,0.7)',
                    pointerEvents: 'none',
                  }}>
                    {charsLeft}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddTypewriterRole}
                disabled={!newRoleInput.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.7rem 1.25rem',
                  background: newRoleInput.trim()
                    ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                    : 'rgba(6, 182, 212, 0.08)',
                  color: newRoleInput.trim() ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderLeft: '1px solid rgba(6, 182, 212, 0.2)',
                  cursor: newRoleInput.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em',
                  flexShrink: 0,
                }}
              >
                <Plus size={16} />
                Add Word / Role
              </button>
            </div>

            {!newRoleInput && (
              <p style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: '#94a3b8', paddingLeft: '0.25rem' }}>
                Press{' '}
                <kbd style={{
                  padding: '0.1rem 0.4rem',
                  border: '1px solid rgba(148,163,184,0.3)',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  background: 'rgba(148,163,184,0.1)',
                  fontFamily: 'inherit',
                }}>Enter</kbd>
                {' '}to quickly add · Max {MAX_CHARS} characters per word
              </p>
            )}
          </div>

          {/* ── Word Chips ── */}
          {form.typewriterRoles.length > 0 ? (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.55rem',
              padding: '0.75rem',
              background: 'rgba(6, 182, 212, 0.04)',
              borderRadius: '12px',
              border: '1px dashed rgba(6, 182, 212, 0.2)',
              minHeight: '64px',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
            }}>
              {form.typewriterRoles.map((role, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.75rem 0.45rem 0.55rem',
                    borderRadius: '22px',
                    background: dragOverIdx === idx
                      ? 'rgba(6, 182, 212, 0.25)'
                      : 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08))',
                    border: dragOverIdx === idx
                      ? '2px solid #06b6d4'
                      : '1.5px solid rgba(6, 182, 212, 0.35)',
                    color: '#06b6d4',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    cursor: 'grab',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: dragOverIdx === idx ? '0 0 0 3px rgba(6,182,212,0.15)' : 'none',
                    transform: dragOverIdx === idx ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  <GripVertical size={11} style={{ color: 'rgba(6,182,212,0.5)', flexShrink: 0 }} />
                  <span style={{
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{role}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTypewriterRole(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(6,182,212,0.4)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1px',
                      borderRadius: '50%',
                      marginLeft: '0.05rem',
                      transition: 'color 0.15s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(6,182,212,0.4)'; }}
                    title={`Remove "${role}"`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.85rem',
              border: '1px dashed rgba(6,182,212,0.2)',
              borderRadius: '12px',
            }}>
              No words added yet. Add your first role above ↑
            </div>
          )}

          <p style={{ marginTop: '0.6rem', fontSize: '0.76rem', color: '#64748b', paddingLeft: '0.1rem' }}>
            💡 Tip: Drag the grip icon on each chip to reorder words in the animation sequence.
          </p>
        </div>

        {/* Hero Headline & Titles */}
        <div className="admin-section-box margin-bottom">
          <div className="flex-center gap-2 margin-bottom">
            <Layers size={20} style={{ color: 'var(--admin-accent)' }} />
            <h3>Hero Headline & Role Layout</h3>
          </div>

          <div className="form-grid">
            <div className="form-group span-2">
              <label>Professional Title (Primary Role)</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. PYTHON FULL STACK DEVELOPER"
                required
              />
            </div>

            <div className="form-group">
              <label>Headline Line 1 (Greeting)</label>
              <input
                type="text"
                name="heroLine1"
                value={form.heroLine1}
                onChange={handleChange}
                placeholder="e.g. I'm Muthu Selvam,"
              />
            </div>

            <div className="form-group">
              <label>Headline Line 2 (Highlighted Radiant Gold Text)</label>
              <input
                type="text"
                name="heroLine2"
                value={form.heroLine2}
                onChange={handleChange}
                placeholder="e.g. A Python Full Stack"
              />
            </div>

            <div className="form-group span-2">
              <label>Headline Line 3 (Suffix Text)</label>
              <input
                type="text"
                name="heroLine3"
                value={form.heroLine3}
                onChange={handleChange}
                placeholder="e.g. developer"
              />
            </div>

            <div className="form-group span-2">
              <label>Tagline / Subtitle</label>
              <input
                type="text"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                placeholder="e.g. Motivated software development professional..."
                required
              />
            </div>

            <div className="form-group span-2">
              <label>Hero Description</label>
              <textarea
                name="heroDescription"
                value={form.heroDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Full intro paragraph appearing on the hero section"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary flex-center gap-2">
            <Save size={18} /> Save Hero Changes
          </button>
        </div>
      </form>
    </div>
  );
};
