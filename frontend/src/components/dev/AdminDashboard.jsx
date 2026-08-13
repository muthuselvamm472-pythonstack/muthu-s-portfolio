import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Award,
  FolderGit2,
  Mail,
  Sliders,
  Database,
  Lock,
  LogOut,
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  EyeOff,
  Download,
  Upload,
  RotateCcw,
  Star,
  ExternalLink,
  ShieldCheck,
  Palette,
  Layers,
  ArrowRight,
  Image
} from 'lucide-react';
import '../../styles/admin.css';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const {
    data,
    messages,
    isAuthenticated,
    loginAdmin,
    logoutAdmin,
    updateProfile,
    updateAbout,
    addExperience,
    updateExperience,
    deleteExperience,
    addCertification,
    updateCertification,
    deleteCertification,
    addProject,
    updateProject,
    deleteProject,
    toggleSection,
    toggleMessageRead,
    toggleMessageStarred,
    deleteMessage,
    resetToDefault,
    exportDataJSON,
    importDataJSON
  } = usePortfolio();

  const { themeMode, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('overview');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Editable Profile Form State
  const [profileForm, setProfileForm] = useState(data.profile || {});

  // Item Editing Modal States
  const [editingExp, setEditingExp] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [editingProj, setEditingProj] = useState(null);

  // Filters
  const [msgFilter, setMsgFilter] = useState('all');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const success = loginAdmin(passkeyInput);
    if (success) {
      setAuthError(false);
      setPasskeyInput('');
    } else {
      setAuthError(true);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    alert('Profile & Hero settings updated successfully!');
  };

  const jumpToSection = (sectionId) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-overlay">
      <div className="admin-modal">
        {/* Top Header */}
        <div className="admin-header">
          <div className="admin-brand">
            <ShieldCheck className="admin-brand-icon" size={22} />
            <div>
              <div className="admin-title">MUTHU SELVAM | ADMIN CONTROL CENTER</div>
              <div className="admin-subtitle">Live Portfolio Management Dashboard</div>
            </div>
          </div>
          <div className="admin-header-actions">
            <button className="admin-btn admin-btn-secondary" onClick={() => jumpToSection('hero')}>
              <Eye size={16} /> View Live Site
            </button>
            {isAuthenticated && (
              <button className="admin-btn admin-btn-danger" onClick={logoutAdmin}>
                <LogOut size={16} /> Lock
              </button>
            )}
            <button className="admin-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          <div className="admin-login-wrap">
            <div className="admin-login-card">
              <div className="admin-login-icon">
                <Lock size={36} color="var(--primary-color)" />
              </div>
              <h3>Admin Authorization Required</h3>
              <p>Enter administrator passkey to access live editing and messages inbox.</p>
              <form onSubmit={handleLogin} className="admin-login-form">
                <input
                  type="password"
                  placeholder="Enter Passkey (Default: admin123)"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  className={`admin-input ${authError ? 'error' : ''}`}
                  autoFocus
                />
                {authError && <div className="admin-error-text">Invalid passkey. Try: admin123</div>}
                <button type="submit" className="admin-btn admin-btn-primary full-width">
                  Unlock Dashboard
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="admin-body">
            {/* Sidebar Navigation */}
            <div className="admin-sidebar">
              <button
                className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={18} /> Overview
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> Profile & Hero
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'experience' ? 'active' : ''}`}
                onClick={() => setActiveTab('experience')}
              >
                <Briefcase size={18} /> Experience ({data.experiences?.length || 0})
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'certifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('certifications')}
              >
                <Award size={18} /> Certifications ({data.certifications?.length || 0})
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <FolderGit2 size={18} /> Projects ({data.projects?.length || 0})
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <Mail size={18} /> Messages
                {unreadCount > 0 && <span className="admin-badge-count">{unreadCount}</span>}
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'sections' ? 'active' : ''}`}
                onClick={() => setActiveTab('sections')}
              >
                <Sliders size={18} /> Section Controls
              </button>

              <button
                className={`admin-nav-item ${activeTab === 'backup' ? 'active' : ''}`}
                onClick={() => setActiveTab('backup')}
              >
                <Database size={18} /> Backup & Export
              </button>
            </div>

            {/* Main Content Workspace */}
            <div className="admin-main">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header">
                    <h2>Dashboard Overview</h2>
                    <p>Live metrics, visitor inquiry count, and active sections summary.</p>
                  </div>

                  <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                      <div className="stat-icon-bg amber"><Mail size={22} /></div>
                      <div>
                        <div className="stat-value">{messages.length}</div>
                        <div className="stat-label">Inquiries Received ({unreadCount} Unread)</div>
                      </div>
                    </div>

                    <div className="admin-stat-card">
                      <div className="stat-icon-bg blue"><Briefcase size={22} /></div>
                      <div>
                        <div className="stat-value">{data.experiences?.length || 0}</div>
                        <div className="stat-label">Work Experiences</div>
                      </div>
                    </div>

                    <div className="admin-stat-card">
                      <div className="stat-icon-bg green"><Award size={22} /></div>
                      <div>
                        <div className="stat-value">{data.certifications?.length || 0}</div>
                        <div className="stat-label">Certified Credentials</div>
                      </div>
                    </div>

                    <div className="admin-stat-card">
                      <div className="stat-icon-bg purple"><FolderGit2 size={22} /></div>
                      <div>
                        <div className="stat-value">{data.projects?.length || 0}</div>
                        <div className="stat-label">Showcase Projects</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Messages Summary */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>Recent Inquiries</h3>
                      <button className="admin-link-btn" onClick={() => setActiveTab('messages')}>
                        View All Messages &rarr;
                      </button>
                    </div>
                    {messages.length === 0 ? (
                      <p className="empty-text">No visitor messages received yet.</p>
                    ) : (
                      <div className="admin-messages-list mini">
                        {messages.slice(0, 3).map((msg) => (
                          <div key={msg.id} className={`admin-msg-item ${!msg.read ? 'unread' : ''}`}>
                            <div className="msg-avatar">{msg.name.charAt(0)}</div>
                            <div className="msg-content">
                              <div className="msg-top">
                                <span className="msg-author">{msg.name}</span>
                                <span className="msg-date">{new Date(msg.date).toLocaleDateString()}</span>
                              </div>
                              <div className="msg-sub">{msg.subject}</div>
                              <div className="msg-preview">{msg.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE & HERO */}
              {activeTab === 'profile' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header">
                    <h2>Profile & Personal Info</h2>
                    <p>Update header brand name, titles, tagline, contact info, and resume URL.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="admin-form">
                    <div className="form-row">
                      <div className="form-group half">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={profileForm.fullName || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      <div className="form-group half">
                        <label>Professional Title</label>
                        <input
                          type="text"
                          value={profileForm.title || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Hero Tagline</label>
                      <input
                        type="text"
                        value={profileForm.tagline || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hero Description</label>
                      <textarea
                        rows={3}
                        value={profileForm.heroDescription || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, heroDescription: e.target.value })}
                        className="admin-textarea"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group third">
                        <label>Email</label>
                        <input
                          type="email"
                          value={profileForm.email || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      <div className="form-group third">
                        <label>Phone Number</label>
                        <input
                          type="text"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      <div className="form-group third">
                        <label>Location</label>
                        <input
                          type="text"
                          value={profileForm.location || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                    </div>

                    <button type="submit" className="admin-btn admin-btn-primary">
                      Save Profile Changes
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: EXPERIENCE */}
              {activeTab === 'experience' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header flex-between">
                    <div>
                      <h2>Work Experiences & Internships</h2>
                      <p>Manage your job roles, training periods, and company bullet points.</p>
                    </div>
                    <button
                      className="admin-btn admin-btn-primary"
                      onClick={() =>
                        setEditingExp({
                          role: '',
                          company: '',
                          startDate: '',
                          endDate: 'Present',
                          location: '',
                          description: '',
                          technologies: ['Python', 'Django', 'SQL']
                        })
                      }
                    >
                      <Plus size={16} /> Add Experience
                    </button>
                  </div>

                  <div className="admin-list-grid">
                    {(data.experiences || []).map((exp) => (
                      <div key={exp.id} className="admin-item-card">
                        <div className="item-header">
                          <div>
                            <h4>{exp.role || exp.title}</h4>
                            <div className="item-sub">{exp.company} • {exp.startDate} - {exp.endDate || exp.period}</div>
                          </div>
                          <div className="item-actions">
                            <button className="icon-btn" onClick={() => setEditingExp(exp)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn danger" onClick={() => { if (window.confirm("Do you want to delete this experience entry?")) deleteExperience(exp.id); }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="item-desc">{exp.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Edit/Add Modal */}
                  {editingExp && (
                    <div className="admin-sub-modal">
                      <div className="sub-modal-card">
                        <h3>{editingExp.id ? 'Edit Experience' : 'Add New Experience'}</h3>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (editingExp.id) {
                              updateExperience(editingExp.id, editingExp);
                            } else {
                              addExperience(editingExp);
                            }
                            setEditingExp(null);
                          }}
                        >
                          <div className="form-group">
                            <label>Role / Job Title</label>
                            <input
                              type="text"
                              value={editingExp.role || editingExp.title || ''}
                              onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value, title: e.target.value })}
                              className="admin-input"
                              required
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group half">
                              <label>Company / Institute</label>
                              <input
                                type="text"
                                value={editingExp.company || ''}
                                onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                                className="admin-input"
                                required
                              />
                            </div>
                            <div className="form-group half">
                              <label>Duration / Period</label>
                              <input
                                type="text"
                                value={editingExp.period || `${editingExp.startDate || ''} - ${editingExp.endDate || ''}`}
                                onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value, startDate: e.target.value })}
                                className="admin-input"
                                placeholder="e.g. July 2024 - Present"
                                required
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Description & Responsibilities</label>
                            <textarea
                              rows={3}
                              value={editingExp.description || ''}
                              onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                              className="admin-textarea"
                            />
                          </div>
                          <div className="modal-actions">
                            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingExp(null)}>
                              Cancel
                            </button>
                            <button type="submit" className="admin-btn admin-btn-primary">
                              Save Experience
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CERTIFICATIONS */}
              {activeTab === 'certifications' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header flex-between">
                    <div>
                      <h2>Certifications & Achievements</h2>
                      <p>Manage credentials and upload certificate photos for viewing in a new tab.</p>
                    </div>
                    <button
                      className="admin-btn admin-btn-primary"
                      onClick={() =>
                        setEditingCert({
                          title: '',
                          organization: '',
                          issueDate: '',
                          credentialId: '',
                          credentialUrl: '',
                          certificateImg: ''
                        })
                      }
                    >
                      <Plus size={16} /> Add Certification
                    </button>
                  </div>

                  <div className="admin-list-grid">
                    {(data.certifications || []).map((cert) => (
                      <div key={cert.id} className="admin-item-card">
                        <div className="item-header">
                          <div>
                            <h4>{cert.title || cert.name}</h4>
                            <div className="item-sub">{cert.organization || cert.issuer} • {cert.issueDate || 'Verified'}</div>
                          </div>
                          <div className="item-actions">
                            <button className="icon-btn" onClick={() => setEditingCert(cert)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn danger" onClick={() => { if (window.confirm("Do you want to delete this certification?")) deleteCertification(cert.id); }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {cert.credentialId && <div className="cert-id-tag" style={{ display: 'none' }}>ID: {cert.credentialId}</div>}
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {cert.certificateImg && (
                            <button
                              type="button"
                              className="admin-link-btn"
                              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                              onClick={() => {
                                const imgSrc = cert.certificateImg;
                                if (imgSrc.startsWith('data:')) {
                                  fetch(imgSrc).then(r => r.blob()).then(blob => {
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                  });
                                } else {
                                  window.open(imgSrc, '_blank', 'noopener,noreferrer');
                                }
                              }}
                            >
                              <Image size={14} /> View Certificate Image
                            </button>
                          )}
                          {cert.credentialUrl && cert.credentialUrl !== '#' && !cert.credentialUrl.startsWith('data:') && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-link-btn"
                            >
                              <ExternalLink size={14} /> Verify on Website
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Modal */}
                  {editingCert && (
                    <div className="admin-sub-modal">
                      <div className="sub-modal-card">
                        <h3>{editingCert.id ? 'Edit Certification' : 'Add New Certification'}</h3>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (editingCert.id) {
                              updateCertification(editingCert.id, editingCert);
                            } else {
                              addCertification(editingCert);
                            }
                            setEditingCert(null);
                          }}
                        >
                          <div className="form-group">
                            <label>Certification Title</label>
                            <input
                              type="text"
                              value={editingCert.title || editingCert.name || ''}
                              onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value, name: e.target.value })}
                              className="admin-input"
                              required
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group half">
                              <label>Issuer Organization</label>
                              <input
                                type="text"
                                value={editingCert.organization || editingCert.issuer || ''}
                                onChange={(e) => setEditingCert({ ...editingCert, organization: e.target.value, issuer: e.target.value })}
                                className="admin-input"
                                placeholder="e.g. Qspiders / Infosys / TCS iON"
                                required
                              />
                            </div>
                            <div className="form-group half">
                              <label>Issue Date / Period</label>
                              <input
                                type="text"
                                value={editingCert.issueDate || ''}
                                onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                                className="admin-input"
                                placeholder="e.g. July 2026"
                              />
                            </div>
                          </div>

                          {/* Certificate Image — separate from credential URL */}
                          <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Image size={14} /> Upload Certificate Image <span style={{ color: 'var(--primary-color)', fontSize: '0.78rem' }}>(shown in View Certificate button)</span>
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              className="admin-input"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    setEditingCert({ ...editingCert, certificateImg: evt.target.result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {editingCert.certificateImg && (
                              <div style={{ marginTop: '0.5rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '120px' }}>
                                <img
                                  src={editingCert.certificateImg}
                                  alt="Certificate preview"
                                  style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <ExternalLink size={14} /> Credential / Verify URL <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(issuer website for Verify Credential button)</span>
                            </label>
                            <input
                              type="text"
                              value={editingCert.credentialUrl || ''}
                              onChange={(e) => setEditingCert({ ...editingCert, credentialUrl: e.target.value })}
                              className="admin-input"
                              placeholder="e.g. https://qspiders.com or https://nptel.ac.in"
                            />
                          </div>

                          <div className="modal-actions">
                            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingCert(null)}>
                              Cancel
                            </button>
                            <button type="submit" className="admin-btn admin-btn-primary">
                              Save Certification
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header flex-between">
                    <div>
                      <h2>Projects Portfolio</h2>
                      <p>Manage featured web development projects, live demo links, and GitHub repositories.</p>
                    </div>
                    <button
                      className="admin-btn admin-btn-primary"
                      onClick={() =>
                        setEditingProj({
                          title: '',
                          shortDescription: '',
                          detailedDescription: '',
                          category: 'Full Stack',
                          technologies: ['Python', 'Django', 'React.js'],
                          liveDemoUrl: 'https://github.com/muthuselvamm472-pythonstack',
                          githubUrl: 'https://github.com/muthuselvamm472-pythonstack',
                          isFeatured: true
                        })
                      }
                    >
                      <Plus size={16} /> Add Project
                    </button>
                  </div>

                  <div className="admin-list-grid">
                    {(data.projects || []).map((proj) => (
                      <div key={proj.id} className="admin-item-card">
                        <div className="item-header">
                          <div>
                            <h4>{proj.title}</h4>
                            <div className="item-sub">{proj.category} • {proj.isFeatured ? '⭐ Featured' : 'Standard'}</div>
                          </div>
                          <div className="item-actions">
                            <button className="icon-btn" onClick={() => setEditingProj(proj)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn danger" onClick={() => { if (window.confirm("Do you want to delete this project?")) deleteProject(proj.id); }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="item-desc">{proj.shortDescription || proj.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Edit Modal */}
                  {editingProj && (
                    <div className="admin-sub-modal">
                      <div className="sub-modal-card">
                        <h3>{editingProj.id ? 'Edit Project' : 'Add New Project'}</h3>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (editingProj.id) {
                              updateProject(editingProj.id, editingProj);
                            } else {
                              addProject(editingProj);
                            }
                            setEditingProj(null);
                          }}
                        >
                          <div className="form-group">
                            <label>Project Name</label>
                            <input
                              type="text"
                              value={editingProj.title || ''}
                              onChange={(e) => setEditingProj({ ...editingProj, title: e.target.value })}
                              className="admin-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Short Description</label>
                            <textarea
                              rows={2}
                              value={editingProj.shortDescription || editingProj.description || ''}
                              onChange={(e) => setEditingProj({ ...editingProj, shortDescription: e.target.value, description: e.target.value })}
                              className="admin-textarea"
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group half">
                              <label>Live Demo URL (Opens in New Tab)</label>
                              <input
                                type="text"
                                value={editingProj.liveDemoUrl || ''}
                                onChange={(e) => setEditingProj({ ...editingProj, liveDemoUrl: e.target.value })}
                                className="admin-input"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="form-group half">
                              <label>GitHub Repository URL</label>
                              <input
                                type="text"
                                value={editingProj.githubUrl || ''}
                                onChange={(e) => setEditingProj({ ...editingProj, githubUrl: e.target.value })}
                                className="admin-input"
                                placeholder="https://github.com/..."
                              />
                            </div>
                          </div>
                          <div className="modal-actions">
                            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingProj(null)}>
                              Cancel
                            </button>
                            <button type="submit" className="admin-btn admin-btn-primary">
                              Save Project
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: MESSAGES INBOX */}
              {activeTab === 'messages' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header">
                    <h2>Visitor Contact Inquiries Inbox</h2>
                    <p>View, star, mark read, or delete message inquiries submitted via the Contact Section form.</p>
                  </div>

                  <div className="admin-msg-filters">
                    <button
                      className={`filter-chip ${msgFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setMsgFilter('all')}
                    >
                      All ({messages.length})
                    </button>
                    <button
                      className={`filter-chip ${msgFilter === 'unread' ? 'active' : ''}`}
                      onClick={() => setMsgFilter('unread')}
                    >
                      Unread ({unreadCount})
                    </button>
                    <button
                      className={`filter-chip ${msgFilter === 'starred' ? 'active' : ''}`}
                      onClick={() => setMsgFilter('starred')}
                    >
                      Starred ({messages.filter((m) => m.starred).length})
                    </button>
                  </div>

                  {messages.length === 0 ? (
                    <p className="empty-text">No visitor inquiries stored.</p>
                  ) : (
                    <div className="admin-messages-list">
                      {messages
                        .filter((m) => {
                          if (msgFilter === 'unread') return !m.read;
                          if (msgFilter === 'starred') return m.starred;
                          return true;
                        })
                        .map((msg) => (
                          <div key={msg.id} className={`admin-msg-card ${!msg.read ? 'unread' : ''}`}>
                            <div className="msg-card-top">
                              <div className="msg-sender">
                                <strong>{msg.name}</strong> &lt;{msg.email}&gt;
                              </div>
                              <div className="msg-actions">
                                <button
                                  className={`icon-btn ${msg.starred ? 'active-star' : ''}`}
                                  onClick={() => toggleMessageStarred(msg.id)}
                                >
                                  <Star size={16} />
                                </button>
                                <button className="icon-btn" onClick={() => toggleMessageRead(msg.id)}>
                                  {msg.read ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button className="icon-btn danger" onClick={() => { if (window.confirm("Do you want to delete this message?")) deleteMessage(msg.id); }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="msg-subject-line">{msg.subject}</div>
                            <div className="msg-body">{msg.message}</div>
                            <div className="msg-date-footer">{new Date(msg.date).toLocaleString()}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: SECTION CONTROLS & DIRECT LINKS */}
              {activeTab === 'sections' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header">
                    <h2>Live Section Visibility & Direct Jumps</h2>
                    <p>Toggle sections ON/OFF or click 'Go to Live Section' to navigate directly to the section on your portfolio.</p>
                  </div>

                  <div className="admin-toggles-grid">
                    {Object.keys(data.sectionVisibility || {}).map((secKey) => (
                      <div key={secKey} className="admin-toggle-row">
                        <div>
                          <h4 style={{ textTransform: 'capitalize' }}>{secKey} Section</h4>
                          <span className="item-sub">
                            Status: {data.sectionVisibility[secKey] ? 'Visible ON' : 'Hidden OFF'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => jumpToSection(secKey)}
                          >
                            <ArrowRight size={14} /> Jump
                          </button>
                          <button
                            className={`admin-toggle-btn ${data.sectionVisibility[secKey] ? 'active' : ''}`}
                            onClick={() => toggleSection(secKey)}
                          >
                            {data.sectionVisibility[secKey] ? <Eye size={16} /> : <EyeOff size={16} />}
                            {data.sectionVisibility[secKey] ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: BACKUP & EXPORT */}
              {activeTab === 'backup' && (
                <div className="admin-tab-content">
                  <div className="admin-section-header">
                    <h2>System Backup & Restore</h2>
                    <p>Export your full portfolio configuration as a JSON file or import a saved backup.</p>
                  </div>

                  <div className="backup-actions-grid">
                    <div className="admin-card">
                      <h3>Export Configuration</h3>
                      <p>Download a complete JSON backup of your current profile, experience, projects, and settings.</p>
                      <button className="admin-btn admin-btn-primary" onClick={exportDataJSON}>
                        <Download size={16} /> Download JSON Backup
                      </button>
                    </div>

                    <div className="admin-card">
                      <h3>Import Configuration</h3>
                      <p>Upload a previously exported JSON backup file to restore all your portfolio data.</p>
                      <label className="admin-btn admin-btn-secondary upload-btn">
                        <Upload size={16} /> Upload JSON File
                        <input
                          type="file"
                          accept=".json"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const ok = importDataJSON(evt.target.result);
                                if (ok) alert('Portfolio data imported successfully!');
                                else alert('Invalid JSON backup file.');
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="admin-card border-danger">
                      <h3>Reset to Default</h3>
                      <p>Reset all custom changes back to the original portfolio state.</p>
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reset all portfolio data to default?')) {
                            resetToDefault();
                            alert('Portfolio reset to default state.');
                          }
                        }}
                      >
                        <RotateCcw size={16} /> Reset Everything
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
