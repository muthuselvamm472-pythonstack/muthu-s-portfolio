import React, { useState } from 'react';
import {
  FolderGit2, Code, Briefcase, Award, Mail, Plus, User, ExternalLink, Layers,
  RefreshCw, Cloud, CheckCircle2, AlertTriangle
} from 'lucide-react';

export const OverviewTab = ({ data, messages, setActiveTab, syncStatus, syncAllToCloud, showToast }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const projectsCount = data.projects?.length || 0;
  const skillsCount = data.skills?.length || 0;
  const expCount = data.experiences?.length || 0;
  const certsCount = data.certifications?.length || 0;
  const unreadMessagesCount = (messages || []).filter((m) => !m.is_read && !m.read).length;
  const pendingCount = syncStatus?.pendingCount || 0;
  const isConnected = syncStatus?.state === 'connected';

  const handleManualSync = async () => {
    if (!syncAllToCloud) return;
    setIsSyncing(true);
    try {
      const res = await syncAllToCloud();
      if (res?.ok) {
        showToast?.('☁️ All 11 sections successfully synced & verified with Cloud Database!', 'success');
      } else {
        showToast?.(`⚠️ Sync incomplete: ${res?.error || 'Check connection or try again.'}`, 'warning');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="tab-subtitle">Welcome back, {data.profile?.fullName || 'Muthu Selvam'}</p>
        </div>
        <div className="flex-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="btn btn-primary flex-center gap-2"
          >
            <RefreshCw size={16} className={isSyncing ? 'spin-icon' : ''} />
            {isSyncing ? 'Syncing All Sections...' : 'Sync All Sections to Cloud'}
          </button>
          <a href="/#/" target="_blank" rel="noreferrer" className="btn btn-secondary flex-center gap-2">
            <ExternalLink size={16} /> View Public Website
          </a>
        </div>
      </div>

      {/* Live Website <-> Cloud Connection Monitor */}
      <div className="admin-section-box margin-bottom" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div className="flex-center gap-3">
          <div className="stat-icon" style={{
            background: pendingCount > 0 ? 'rgba(245, 158, 11, 0.16)' : isConnected ? 'rgba(16, 185, 129, 0.16)' : 'rgba(147, 97, 66, 0.16)',
            color: pendingCount > 0 ? '#f59e0b' : isConnected ? '#10b981' : 'var(--admin-accent)',
          }}>
            {pendingCount > 0 ? <AlertTriangle size={22} /> : isConnected ? <CheckCircle2 size={22} /> : <Cloud size={22} />}
          </div>
          <div>
            <h3 style={{ marginBottom: '0.2rem' }}>
              {pendingCount > 0
                ? `${pendingCount} Local Item(s) Pending Cloud Sync`
                : isConnected
                ? 'Website & Admin Connected (All 11 Sections Synced)'
                : 'Cloud Sync Status'}
            </h3>
            <p className="field-hint">
              {syncStatus?.error
                ? syncStatus.error
                : syncStatus?.lastSyncedAt
                ? `Last verified with backend: ${new Date(syncStatus.lastSyncedAt).toLocaleTimeString()}`
                : 'Edits sync automatically across tabs and push to your cloud backend.'}
            </p>
          </div>
        </div>
        <span className={`badge ${pendingCount > 0 ? 'badge-warning' : 'badge-success'}`}>
          {pendingCount > 0 ? 'SYNC NEEDED' : isConnected ? 'CONNECTED' : 'READY'}
        </span>
      </div>

      {/* Summary Cards Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('projects')}>
          <div className="stat-icon icon-projects">
            <FolderGit2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{projectsCount}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('skills')}>
          <div className="stat-icon icon-skills">
            <Code size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{skillsCount}</span>
            <span className="stat-label">Skills</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('experience')}>
          <div className="stat-icon icon-exp">
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{expCount}</span>
            <span className="stat-label">Experiences</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('certifications')}>
          <div className="stat-icon icon-certs">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{certsCount}</span>
            <span className="stat-label">Certifications</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('messages')}>
          <div className="stat-icon icon-messages">
            <Mail size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{unreadMessagesCount}</span>
            <span className="stat-label">Unread Messages</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section-box">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button onClick={() => setActiveTab('projects')} className="btn btn-secondary quick-btn">
            <Plus size={18} /> Add Project
          </button>
          <button onClick={() => setActiveTab('skills')} className="btn btn-secondary quick-btn">
            <Plus size={18} /> Add Skill
          </button>
          <button onClick={() => setActiveTab('social')} className="btn btn-secondary quick-btn">
            <Plus size={18} /> Manage Social Links
          </button>
          <button onClick={() => setActiveTab('profile')} className="btn btn-secondary quick-btn">
            <User size={18} /> Edit Profile & Resume
          </button>
          <button onClick={() => setActiveTab('sections')} className="btn btn-secondary quick-btn">
            <Layers size={18} /> Section Settings
          </button>
        </div>
      </div>
    </div>
  );
};
