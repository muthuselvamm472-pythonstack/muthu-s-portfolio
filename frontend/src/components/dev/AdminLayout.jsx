import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { useTheme } from '../../context/ThemeContext';
import { Toast } from '../common/Toast';
import { GlassBackdrop } from '../common/GlassLayers';
import {
  LayoutDashboard, User, Sliders, Info, Code, Briefcase, Award,
  FolderGit2, Mail, Share2, Palette, Layers, LogOut, Menu, X, ShieldCheck, ExternalLink, Sun, Moon
} from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { ProfileTab } from './tabs/ProfileTab';
import { HeroTab } from './tabs/HeroTab';
import { AboutTab } from './tabs/AboutTab';
import { SkillsTab } from './tabs/SkillsTab';
import { ExperienceTab } from './tabs/ExperienceTab';
import { CertificationsTab } from './tabs/CertificationsTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { MessagesTab } from './tabs/MessagesTab';
import { SocialLinksTab } from './tabs/SocialLinksTab';
import { SectionSettingsTab } from './tabs/SectionSettingsTab';
import { ThemeTab } from './tabs/ThemeTab';
import '../../styles/admin.css';

export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const {
    data, messages, syncStatus, syncAllToCloud,
    updateProfile, updateAbout,
    addSkill, updateSkill, deleteSkill,
    addExperience, updateExperience, deleteExperience,
    addCertification, updateCertification, deleteCertification,
    addProject, updateProject, deleteProject,
    addSocialLink, updateSocialLink, deleteSocialLink,
    toggleSection, updateThemeSettings,
    fetchMessages
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const autoSyncedRef = React.useRef(false);

  const showToast = React.useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 4500);
  }, []);

  React.useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Automatically reconcile any offline/unsynced items when admin opens dashboard
  React.useEffect(() => {
    if (!autoSyncedRef.current && syncStatus?.pendingCount > 0) {
      autoSyncedRef.current = true;
      syncAllToCloud().then((res) => {
        if (res?.ok && res.syncedCount > 0) {
          showToast(`☁️ Auto-synced ${res.syncedCount} local item(s) to Cloud Database!`, 'success');
        }
      });
    }
  }, [syncStatus?.pendingCount, syncAllToCloud, showToast]);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'hero', label: 'Hero', icon: Sliders },
    { id: 'about', label: 'About', icon: Info },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'messages', label: 'Messages', icon: Mail, badge: (messages || []).filter(m => !m.is_read && !m.read).length },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'theme', label: 'Theme & Modes', icon: Palette },
    { id: 'sections', label: 'Section Settings', icon: Layers },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="admin-cms-wrapper">
      {/* Toast Notification Banner */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Top Navbar */}
      <header className="admin-topbar glass-container" style={{ overflow: 'visible' }}>
        <GlassBackdrop overlayClassName="glass-overlay--nav" />
        <div className="topbar-left">
          <button className="mobile-drawer-toggle" onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}>
            {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="admin-brand flex-center gap-2">
            <ShieldCheck size={20} className="brand-icon" />
            <span className="brand-text"><span className="brand-title-prefix">PORTFOLIO </span>ADMIN</span>
          </div>
        </div>

        <div className="topbar-right flex-center gap-2">
          <button
            onClick={toggleTheme}
            className="topbar-action-btn"
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span className="topbar-btn-label">{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {user?.username && (
            <span className="topbar-user-badge flex-center gap-1">
              <User size={14} />
              {user.username}
            </span>
          )}
          <a href="/#/" target="_blank" rel="noreferrer" className="topbar-action-btn" title="View public website">
            <ExternalLink size={15} />
            <span className="topbar-btn-label">Website</span>
          </a>
          <button onClick={logout} className="topbar-action-btn topbar-action-danger" title="Sign out">
            <LogOut size={15} />
            <span className="topbar-btn-label">Logout</span>
          </button>
        </div>
      </header>

      <div className="admin-body-layout">
        {/* Mobile Backdrop */}
        {mobileDrawerOpen && (
          <div
            className="admin-drawer-backdrop"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close menu drawer"
          />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileDrawerOpen ? 'drawer-open' : ''}`}>
          <div className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <button onClick={logout} className="sidebar-nav-item btn-logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-main-content">
          {activeTab === 'overview' && (
            <OverviewTab
              data={data}
              messages={messages}
              setActiveTab={setActiveTab}
              syncStatus={syncStatus}
              syncAllToCloud={syncAllToCloud}
              showToast={showToast}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab data={data} updateProfile={updateProfile} showToast={showToast} />
          )}

          {activeTab === 'hero' && (
            <HeroTab data={data} updateProfile={updateProfile} showToast={showToast} />
          )}

          {activeTab === 'about' && (
            <AboutTab data={data} updateAbout={updateAbout} showToast={showToast} />
          )}

          {activeTab === 'skills' && (
            <SkillsTab
              data={data}
              addSkill={addSkill}
              updateSkill={updateSkill}
              deleteSkill={deleteSkill}
              showToast={showToast}
            />
          )}

          {activeTab === 'experience' && (
            <ExperienceTab
              data={data}
              toggleSection={toggleSection}
              addExperience={addExperience}
              updateExperience={updateExperience}
              deleteExperience={deleteExperience}
              showToast={showToast}
            />
          )}

          {activeTab === 'certifications' && (
            <CertificationsTab
              data={data}
              toggleSection={toggleSection}
              addCertification={addCertification}
              updateCertification={updateCertification}
              deleteCertification={deleteCertification}
              showToast={showToast}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              data={data}
              addProject={addProject}
              updateProject={updateProject}
              deleteProject={deleteProject}
              showToast={showToast}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesTab showToast={showToast} />
          )}

          {activeTab === 'social' && (
            <SocialLinksTab
              data={data}
              addSocialLink={addSocialLink}
              updateSocialLink={updateSocialLink}
              deleteSocialLink={deleteSocialLink}
              showToast={showToast}
            />
          )}

          {activeTab === 'theme' && (
            <ThemeTab data={data} updateThemeSettings={updateThemeSettings} showToast={showToast} />
          )}

          {activeTab === 'sections' && (
            <SectionSettingsTab data={data} toggleSection={toggleSection} showToast={showToast} />
          )}
        </main>
      </div>
    </div>
  );
};
