import React from 'react';
import {
  FolderGit2, Code, Briefcase, Award, Mail, Plus, User, ExternalLink, Layers
} from 'lucide-react';

export const OverviewTab = ({ data, messages, setActiveTab }) => {
  const projectsCount = data.projects?.length || 0;
  const skillsCount = data.skills?.length || 0;
  const expCount = data.experiences?.length || 0;
  const certsCount = data.certifications?.length || 0;
  const unreadMessagesCount = (messages || []).filter(m => !m.is_read && !m.read).length;

  return (
    <div className="tab-pane">
      <div className="tab-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="tab-subtitle">Welcome back, {data.profile?.fullName || 'Muthu Selvam'}</p>
        </div>
        <a href="/#/" target="_blank" rel="noreferrer" className="btn btn-secondary flex-center gap-2">
          <ExternalLink size={16} /> View Public Website
        </a>
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
          <button onClick={() => setActiveTab('profile')} className="btn btn-secondary quick-btn">
            <User size={18} /> Edit Profile
          </button>
          <button onClick={() => setActiveTab('sections')} className="btn btn-secondary quick-btn">
            <Layers size={18} /> Section Settings
          </button>
        </div>
      </div>
    </div>
  );
};
