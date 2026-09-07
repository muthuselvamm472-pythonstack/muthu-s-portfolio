/**
 * PortfolioContext.jsx
 * Single source of truth for all portfolio data with Intelligent Persistent State Merging.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockPortfolioData } from '../mockData';
import { getApiUrl } from '../apiConfig';

const PortfolioContext = createContext(null);

const STORAGE_KEY = 'muthu_portfolio_v8';
const DELETED_KEY = 'muthu_deleted_ids_v8';

// Clear legacy cache keys
try {
  ['muthu_portfolio_v7', 'muthu_portfolio_v6', 'muthu_portfolio_v5', 'muthu_portfolio_v4', 'muthu_portfolio_v3', 'muthu_portfolio_data_v2', 'muthu_portfolio_data'].forEach(k => localStorage.removeItem(k));
} catch (_) {}

// Helper to manage deleted IDs in localStorage
const getDeletedIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (_) {
    return new Set();
  }
};

const addDeletedId = (id) => {
  if (!id) return;
  try {
    const set = getDeletedIds();
    set.add(String(id));
    localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch (_) {}
};

// Helper: Check if ID is a numeric database primary key
const isNumericId = (id) => {
  if (id === null || id === undefined) return false;
  const num = Number(id);
  return !isNaN(num) && Number.isInteger(num) && num > 0 && !String(id).includes('_');
};

// Helper to refresh JWT token transparently
const tryRefreshToken = async () => {
  const refresh = localStorage.getItem('muthu_admin_jwt_refresh');
  if (!refresh) return null;
  try {
    const res = await fetch(getApiUrl('/api/auth/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('muthu_admin_jwt', data.access);
        return data.access;
      }
    }
  } catch (err) {
    console.warn('Silent token refresh failed in PortfolioContext:', err);
  }
  return null;
};

// ─── JWT API helper with Auto-Token Refresh ────────────────────────────────────
const api = async (url, method = 'GET', body = null) => {
  let token = localStorage.getItem('muthu_admin_jwt');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    let res = await fetch(getApiUrl(url), opts);
    // If token expired (401), automatically refresh token and retry the mutation
    if (res && res.status === 401) {
      const freshToken = await tryRefreshToken();
      if (freshToken) {
        headers['Authorization'] = `Bearer ${freshToken}`;
        res = await fetch(getApiUrl(url), opts);
      }
    }
    return res;
  } catch (err) {
    console.warn(`API ${method} ${url} failed:`, err);
    return null;
  }
};

// ─── Auto-sequence order numbers so duplicates (e.g. 1,1,1,5) become unique (1,2,3,5)
const assignSequentialOrders = (list = []) => {
  const seenOrders = new Set();
  let nextAvailable = 1;
  return list.map((item, idx) => {
    let orderNum = Number(item.order ?? item.display_order);
    if (!Number.isInteger(orderNum) || orderNum <= 0 || seenOrders.has(orderNum)) {
      while (seenOrders.has(nextAvailable)) {
        nextAvailable++;
      }
      orderNum = nextAvailable;
    }
    seenOrders.add(orderNum);
    return { ...item, order: orderNum };
  });
};

// ─── Smart List Merger (Database API items take priority; cached offline temp items preserved)
const mergeList = (apiItems = [], cachedItems = []) => {
  const deletedSet = getDeletedIds();
  const resultMap = new Map();

  // 1. Database API items are authoritative
  apiItems.forEach((item, idx) => {
    const itemId = item.id || `api_${idx + 1}`;
    if (!deletedSet.has(String(itemId))) {
      resultMap.set(String(itemId), { ...item, id: itemId });
    }
  });

  // 2. Only preserve unsynced temporary offline items from cache (e.g. string IDs like "soc_172000")
  cachedItems.forEach((item, idx) => {
    const itemId = item.id || `cache_${idx + 1}`;
    const isTempId = typeof itemId === 'string' && (
      itemId.startsWith('sk_') || itemId.startsWith('exp_') ||
      itemId.startsWith('cert_') || itemId.startsWith('proj_') ||
      itemId.startsWith('soc_')
    );
    if (isTempId && !deletedSet.has(String(itemId))) {
      resultMap.set(String(itemId), { ...item, id: itemId });
    }
  });

  const merged = Array.from(resultMap.values());
  return assignSequentialOrders(merged);
};

// ─── Format backend response & merge with cached local state ─────────────────
const formatAndMerge = (apiData, prev) => {
  if (!apiData) return prev;
  const p = apiData.profile || {};
  const a = apiData.about || {};
  const s = apiData.settings || {};

  const apiSkills = (apiData.skills || []).map((sk, i) => ({
    id: sk.id || i + 1, name: sk.name, category: sk.category, icon: sk.icon || 'Code',
    order: sk.display_order ?? (i + 1), isVisible: sk.is_visible !== false,
  }));

  const apiExp = (apiData.experiences || []).map((e, i) => ({
    id: e.id || i + 1, role: e.role, company: e.company, location: e.location,
    startDate: e.start_date, endDate: e.end_date, description: e.description,
    technologies: e.technologies || [], order: e.display_order ?? (i + 1), isVisible: e.is_visible !== false,
  }));

  const apiCerts = (apiData.certifications || []).map((c, i) => ({
    id: c.id || i + 1, name: c.name, organization: c.organization, issueDate: c.issue_date,
    credentialUrl: c.credential_url, certificateImg: c.certificate_image || c.certificate_image_data,
    order: c.display_order ?? (i + 1), isVisible: c.is_visible !== false,
  }));

  const apiProj = (apiData.projects || []).map((pj, i) => ({
    id: pj.id || i + 1, title: pj.title, shortDescription: pj.short_description,
    detailedDescription: pj.detailed_description, image: pj.project_image || pj.project_image_url,
    technologies: pj.technologies || [], githubUrl: pj.github_url, liveDemoUrl: pj.live_demo_url,
    isFeatured: !!pj.is_featured, isVisible: pj.is_visible !== false, order: pj.display_order ?? (i + 1),
  }));

  const apiSocial = (apiData.social_links || []).map((sl, i) => ({
    id: sl.id || i + 1, platform: sl.platform, url: sl.url, icon: sl.icon,
    order: sl.display_order ?? (i + 1), isVisible: sl.is_visible !== false,
  }));

  return {
    profile: {
      fullName:       p.full_name             || prev?.profile?.fullName        || mockPortfolioData.profile.fullName,
      title:          p.professional_title     || prev?.profile?.title           || mockPortfolioData.profile.title,
      tagline:        p.tagline                || prev?.profile?.tagline         || mockPortfolioData.profile.tagline,
      heroDescription:p.hero_description       || prev?.profile?.heroDescription || mockPortfolioData.profile.heroDescription,
      profileImage:   p.profile_image          || prev?.profile?.profileImage    || mockPortfolioData.profile.profileImage,
      statusBadgeText: p.status_badge_text !== undefined ? p.status_badge_text : (prev?.profile?.statusBadgeText ?? mockPortfolioData.profile.statusBadgeText),
      showStatusBadge: p.show_status_badge !== undefined ? p.show_status_badge : (prev?.profile?.showStatusBadge ?? true),
      typewriterRoles: (Array.isArray(p.typewriter_roles) && p.typewriter_roles.length > 0) ? p.typewriter_roles : (prev?.profile?.typewriterRoles || mockPortfolioData.profile.typewriterRoles),
      heroLine1:       p.hero_line1 !== undefined ? p.hero_line1 : (prev?.profile?.heroLine1 ?? mockPortfolioData.profile.heroLine1),
      heroLine2:       p.hero_line2 !== undefined ? p.hero_line2 : (prev?.profile?.heroLine2 ?? mockPortfolioData.profile.heroLine2),
      heroLine3:       p.hero_line3 !== undefined ? p.hero_line3 : (prev?.profile?.heroLine3 ?? mockPortfolioData.profile.heroLine3),
      email:          p.email                  || prev?.profile?.email           || mockPortfolioData.profile.email,
      phone:          p.phone                  || prev?.profile?.phone           || mockPortfolioData.profile.phone,
      location:       p.location               || prev?.profile?.location        || mockPortfolioData.profile.location,
      resumeUrl:      p.resume_url             || prev?.profile?.resumeUrl       || '/Muthu_Selvam_Resume.pdf',
      showHeroButtons: p.show_hero_buttons !== false,
      button1Text:    p.button1_text           || prev?.profile?.button1Text     || 'View My Work',
      button1Url:     p.button1_url            || prev?.profile?.button1Url      || '#projects',
      button2Text:    p.button2_text           || prev?.profile?.button2Text     || 'Download Resume',
      button2Url:     p.button2_url            || prev?.profile?.button2Url      || '/Muthu_Selvam_Resume.pdf',
    },
    about: {
      heading:            a.heading              || prev?.about?.heading            || mockPortfolioData.about.heading,
      shortDescription:   a.short_description   || prev?.about?.shortDescription   || mockPortfolioData.about.shortDescription,
      detailedDescription:a.detailed_description || prev?.about?.detailedDescription|| mockPortfolioData.about.detailedDescription,
      currentFocus:       a.current_focus        || prev?.about?.currentFocus       || mockPortfolioData.about.currentFocus,
      coreTechnologies:   a.core_technologies    || prev?.about?.coreTechnologies    || mockPortfolioData.about.coreTechnologies,
      showResumeButton:   a.show_resume_button !== false,
      resumeUrl:          p.resume_url           || prev?.about?.resumeUrl          || '/Muthu_Selvam_Resume.pdf',
    },
    skills:         mergeList(apiSkills, prev?.skills || []),
    experiences:    mergeList(apiExp, prev?.experiences || []),
    certifications: mergeList(apiCerts, prev?.certifications || []),
    projects:       mergeList(apiProj, prev?.projects || []),
    socialLinks:    mergeList(apiSocial, prev?.socialLinks || []),
    sectionVisibility: {
      hero:           s.show_hero           !== false,
      about:          s.show_about          !== false,
      skills:         s.show_skills         !== false,
      experience:     s.show_experience     !== false,
      certifications: s.show_certifications !== false,
      projects:       s.show_projects       !== false,
      contact:        s.show_contact        !== false,
      footer:         s.show_footer         !== false,
    },
    themeSettings: {
      ...(prev?.themeSettings || mockPortfolioData.themeSettings),
      themeMode: s.theme_mode || prev?.themeSettings?.themeMode || mockPortfolioData.themeSettings.themeMode,
      primaryColor: s.primary_color || prev?.themeSettings?.primaryColor || mockPortfolioData.themeSettings.primaryColor,
      accentColor: s.accent_color || prev?.themeSettings?.accentColor || mockPortfolioData.themeSettings.accentColor,
      backgroundColor: s.background_color || prev?.themeSettings?.backgroundColor || mockPortfolioData.themeSettings.backgroundColor,
      textColor: s.text_color || prev?.themeSettings?.textColor || mockPortfolioData.themeSettings.textColor,
      cardColor: s.card_color || prev?.themeSettings?.cardColor || mockPortfolioData.themeSettings.cardColor,
      borderRadius: s.border_radius || prev?.themeSettings?.borderRadius || mockPortfolioData.themeSettings.borderRadius,
    },
  };
};

// ─── Load / Save localStorage Cache ───────────────────────────────────────────
const loadCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
};

const saveCache = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
};

export const PortfolioProvider = ({ children }) => {
  const [data, setDataRaw] = useState(() => loadCache() || mockPortfolioData);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persistence wrapper for setData
  const setData = useCallback((updater) => {
    setDataRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCache(next);
      return next;
    });
  }, []);

  // Fetch API data & merge intelligently
  const refreshPortfolioData = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/portfolio/'));
      if (res && res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const apiData = await res.json();
          setData(prev => formatAndMerge(apiData, prev));

          // If backend settings specify a theme_mode, apply it as default theme
          if (apiData?.settings?.theme_mode) {
            localStorage.setItem('muthu_portfolio_default_theme', apiData.settings.theme_mode);
            const manualTheme = localStorage.getItem('muthu_portfolio_user_selected_theme');
            if (!manualTheme) {
              localStorage.setItem('muthu_portfolio_theme_mode', apiData.settings.theme_mode);
              document.documentElement.setAttribute('data-theme', apiData.settings.theme_mode);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Backend fetch failed, relying on local cache:', err);
    } finally {
      setLoading(false);
    }
  }, [setData]);

  useEffect(() => {
    refreshPortfolioData();
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setDataRaw(JSON.parse(e.newValue)); } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Admin Messages
  const fetchMessages = useCallback(async () => {
    const res = await api('/api/admin/messages/');
    if (res && res.ok) {
      const msgs = await res.json();
      setMessages(Array.isArray(msgs) ? msgs : []);
    }
  }, []);

  // ─── PROFILE ───────────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (fields) => {
    setData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...fields,
        button2Url: fields.resumeUrl || fields.button2Url || prev.profile.button2Url
      },
      about: {
        ...prev.about,
        resumeUrl: fields.resumeUrl || prev.about?.resumeUrl || prev.profile.resumeUrl
      },
      // Keep contact in sync with profile
      contact: { ...prev.contact, email: fields.email || prev.profile.email, phone: fields.phone || prev.profile.phone, location: fields.location || prev.profile.location }
    }));
    const res = await api('/api/admin/profile/', 'PUT', {
      full_name: fields.fullName,
      professional_title: fields.title,
      tagline: fields.tagline,
      hero_description: fields.heroDescription,
      email: fields.email,
      phone: fields.phone,
      location: fields.location,
      resume_url: fields.resumeUrl,
      button2_url: fields.resumeUrl,
      status_badge_text: fields.statusBadgeText,
      show_status_badge: fields.showStatusBadge,
      typewriter_roles: fields.typewriterRoles,
      hero_line1: fields.heroLine1,
      hero_line2: fields.heroLine2,
      hero_line3: fields.heroLine3,
    });
    if (res && res.ok) {
      const updated = await res.json();
      if (updated && updated.resume_url) {
        setData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            resumeUrl: updated.resume_url,
            button2Url: updated.resume_url,
          },
          about: {
            ...prev.about,
            resumeUrl: updated.resume_url,
          }
        }));
      }
    }
  }, [setData]);

  // ─── ABOUT ─────────────────────────────────────────────────────────────────
  const updateAbout = useCallback(async (fields) => {
    setData(prev => ({ ...prev, about: { ...prev.about, ...fields } }));
    await api('/api/admin/about/', 'PUT', {
      heading: fields.heading,
      short_description: fields.shortDescription,
      detailed_description: fields.detailedDescription,
      current_focus: fields.currentFocus,
      core_technologies: fields.coreTechnologies,
      show_resume_button: fields.showResumeButton,
    });
  }, [setData]);

  // ─── SKILLS ────────────────────────────────────────────────────────────────
  const addSkill = useCallback(async (skill) => {
    const tempId = `sk_${Date.now()}`;
    const newItem = { ...skill, id: tempId, isVisible: skill.isVisible !== false, order: skill.order || 1 };
    setData(prev => ({ ...prev, skills: [...(prev.skills || []), newItem] }));
    const res = await api('/api/admin/skills/', 'POST', {
      name: skill.name, category: skill.category,
      icon: skill.icon || 'Code', display_order: skill.order || 1, is_visible: skill.isVisible !== false,
    });
    if (res && res.ok) {
      const created = await res.json();
      if (created?.id) {
        setData(prev => ({
          ...prev,
          skills: (prev.skills || []).map(s => String(s.id) === String(tempId) ? { ...s, id: created.id } : s),
        }));
      }
    }
  }, [setData]);

  const updateSkill = useCallback(async (id, fields) => {
    let updatedItem = null;
    setData(prev => {
      const skills = (prev.skills || []).map(s => {
        if (String(s.id) === String(id)) {
          updatedItem = { ...s, ...fields };
          return updatedItem;
        }
        return s;
      });
      return { ...prev, skills };
    });
    if (isNumericId(id) && updatedItem) {
      await api(`/api/admin/skills/${id}/`, 'PUT', {
        name: updatedItem.name,
        category: updatedItem.category,
        icon: updatedItem.icon || 'Code',
        display_order: updatedItem.order || 1,
        is_visible: updatedItem.isVisible !== false,
      });
    }
  }, [setData]);

  const deleteSkill = useCallback(async (id) => {
    addDeletedId(id);
    setData(prev => ({ ...prev, skills: (prev.skills || []).filter(s => String(s.id) !== String(id)) }));
    if (isNumericId(id)) {
      await api(`/api/admin/skills/${id}/`, 'DELETE');
    }
  }, [setData]);

  // ─── EXPERIENCE ────────────────────────────────────────────────────────────
  const addExperience = useCallback(async (exp) => {
    const tempId = `exp_${Date.now()}`;
    const newItem = { ...exp, id: tempId, isVisible: exp.isVisible !== false, order: exp.order || 1 };
    setData(prev => ({ ...prev, experiences: [newItem, ...(prev.experiences || [])] }));
    const res = await api('/api/admin/experience/', 'POST', {
      role: exp.role, company: exp.company, location: exp.location,
      start_date: exp.startDate, end_date: exp.endDate, description: exp.description,
      technologies: exp.technologies || [], display_order: exp.order || 1, is_visible: exp.isVisible !== false,
    });
    if (res && res.ok) {
      const created = await res.json();
      if (created?.id) {
        setData(prev => ({
          ...prev,
          experiences: (prev.experiences || []).map(e => String(e.id) === String(tempId) ? { ...e, id: created.id } : e),
        }));
      }
    }
  }, [setData]);

  const updateExperience = useCallback(async (id, fields) => {
    let updatedItem = null;
    setData(prev => {
      const experiences = (prev.experiences || []).map(e => {
        if (String(e.id) === String(id)) {
          updatedItem = { ...e, ...fields };
          return updatedItem;
        }
        return e;
      });
      return { ...prev, experiences };
    });
    if (isNumericId(id) && updatedItem) {
      await api(`/api/admin/experience/${id}/`, 'PUT', {
        role: updatedItem.role,
        company: updatedItem.company,
        location: updatedItem.location,
        start_date: updatedItem.startDate,
        end_date: updatedItem.endDate,
        description: updatedItem.description,
        technologies: updatedItem.technologies || [],
        display_order: updatedItem.order || 1,
        is_visible: updatedItem.isVisible !== false,
      });
    }
  }, [setData]);

  const deleteExperience = useCallback(async (id) => {
    addDeletedId(id);
    setData(prev => ({
      ...prev,
      experiences: (prev.experiences || []).filter(e => String(e.id) !== String(id)),
    }));
    if (isNumericId(id)) {
      await api(`/api/admin/experience/${id}/`, 'DELETE');
    }
  }, [setData]);

  // ─── CERTIFICATIONS ────────────────────────────────────────────────────────
  const addCertification = useCallback(async (cert) => {
    const tempId = `cert_${Date.now()}`;
    const newItem = { ...cert, id: tempId, isVisible: cert.isVisible !== false, order: cert.order || 1 };
    setData(prev => ({ ...prev, certifications: [newItem, ...(prev.certifications || [])] }));
    const res = await api('/api/admin/certifications/', 'POST', {
      name: cert.name, organization: cert.organization, issue_date: cert.issueDate,
      credential_url: cert.credentialUrl, certificate_image_data: cert.certificateImg,
      display_order: cert.order || 1, is_visible: cert.isVisible !== false,
    });
    if (res && res.ok) {
      const created = await res.json();
      if (created?.id) {
        setData(prev => ({
          ...prev,
          certifications: (prev.certifications || []).map(c => String(c.id) === String(tempId) ? { ...c, id: created.id } : c),
        }));
      }
    }
  }, [setData]);

  const updateCertification = useCallback(async (id, fields) => {
    let updatedItem = null;
    setData(prev => {
      const certifications = (prev.certifications || []).map(c => {
        if (String(c.id) === String(id)) {
          updatedItem = { ...c, ...fields };
          return updatedItem;
        }
        return c;
      });
      return { ...prev, certifications };
    });
    if (isNumericId(id) && updatedItem) {
      await api(`/api/admin/certifications/${id}/`, 'PUT', {
        name: updatedItem.name,
        organization: updatedItem.organization,
        issue_date: updatedItem.issueDate,
        credential_url: updatedItem.credentialUrl,
        certificate_image_data: updatedItem.certificateImg,
        display_order: updatedItem.order || 1,
        is_visible: updatedItem.isVisible !== false,
      });
    }
  }, [setData]);

  const deleteCertification = useCallback(async (id) => {
    addDeletedId(id);
    setData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter(c => String(c.id) !== String(id)),
    }));
    if (isNumericId(id)) {
      await api(`/api/admin/certifications/${id}/`, 'DELETE');
    }
  }, [setData]);

  // ─── PROJECTS ──────────────────────────────────────────────────────────────
  const addProject = useCallback(async (proj) => {
    const tempId = `proj_${Date.now()}`;
    const newItem = { ...proj, id: tempId, isVisible: proj.isVisible !== false, order: proj.order || 1 };
    setData(prev => ({ ...prev, projects: [newItem, ...(prev.projects || [])] }));
    const res = await api('/api/admin/projects/', 'POST', {
      title: proj.title, short_description: proj.shortDescription,
      detailed_description: proj.detailedDescription, project_image_url: proj.image,
      technologies: proj.technologies || [], github_url: proj.githubUrl,
      live_demo_url: proj.liveDemoUrl, is_featured: proj.isFeatured || false,
      display_order: proj.order || 1, is_visible: proj.isVisible !== false,
    });
    if (res && res.ok) {
      const created = await res.json();
      if (created?.id) {
        setData(prev => ({
          ...prev,
          projects: (prev.projects || []).map(p => String(p.id) === String(tempId) ? { ...p, id: created.id } : p),
        }));
      }
    }
  }, [setData]);

  const updateProject = useCallback(async (id, fields) => {
    let updatedItem = null;
    setData(prev => {
      const projects = (prev.projects || []).map(p => {
        if (String(p.id) === String(id)) {
          updatedItem = { ...p, ...fields };
          return updatedItem;
        }
        return p;
      });
      return { ...prev, projects };
    });
    if (isNumericId(id) && updatedItem) {
      await api(`/api/admin/projects/${id}/`, 'PUT', {
        title: updatedItem.title,
        short_description: updatedItem.shortDescription,
        detailed_description: updatedItem.detailedDescription,
        project_image_url: updatedItem.image,
        technologies: updatedItem.technologies || [],
        github_url: updatedItem.githubUrl,
        live_demo_url: updatedItem.liveDemoUrl,
        is_featured: !!updatedItem.isFeatured,
        display_order: updatedItem.order || 1,
        is_visible: updatedItem.isVisible !== false,
      });
    }
  }, [setData]);

  const deleteProject = useCallback(async (id) => {
    addDeletedId(id);
    setData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter(p => String(p.id) !== String(id)),
    }));
    if (isNumericId(id)) {
      await api(`/api/admin/projects/${id}/`, 'DELETE');
    }
  }, [setData]);

  // ─── SOCIAL LINKS ──────────────────────────────────────────────────────────
  const addSocialLink = useCallback(async (link) => {
    const tempId = `soc_${Date.now()}`;
    const newItem = { ...link, id: tempId, isVisible: link.isVisible !== false, order: link.order || 1 };
    setData(prev => ({ ...prev, socialLinks: [...(prev.socialLinks || []), newItem] }));
    const res = await api('/api/admin/social/', 'POST', {
      platform: link.platform, url: link.url,
      icon: link.icon || link.platform?.toLowerCase(),
      display_order: link.order || 1, is_visible: link.isVisible !== false,
    });
    if (res && res.ok) {
      const created = await res.json();
      if (created?.id) {
        setData(prev => ({
          ...prev,
          socialLinks: (prev.socialLinks || []).map(s => String(s.id) === String(tempId) ? { ...s, id: created.id } : s),
        }));
      }
    }
  }, [setData]);

  const updateSocialLink = useCallback(async (id, fields) => {
    let updatedItem = null;
    setData(prev => {
      const socialLinks = (prev.socialLinks || []).map(s => {
        if (String(s.id) === String(id)) {
          updatedItem = { ...s, ...fields };
          return updatedItem;
        }
        return s;
      });
      return { ...prev, socialLinks };
    });
    if (isNumericId(id) && updatedItem) {
      await api(`/api/admin/social/${id}/`, 'PUT', {
        platform: updatedItem.platform,
        url: updatedItem.url,
        icon: updatedItem.icon || updatedItem.platform?.toLowerCase(),
        display_order: updatedItem.order || 1,
        is_visible: updatedItem.isVisible !== false,
      });
    }
  }, [setData]);

  const deleteSocialLink = useCallback(async (id) => {
    addDeletedId(id);
    setData(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter(s => String(s.id) !== String(id)),
    }));
    if (isNumericId(id)) {
      await api(`/api/admin/social/${id}/`, 'DELETE');
    }
  }, [setData]);

  // ─── SECTION VISIBILITY ────────────────────────────────────────────────────
  const toggleSection = useCallback(async (key) => {
    let nextValue;
    setData(prev => {
      const currentValue = prev.sectionVisibility?.[key] !== false;
      nextValue = !currentValue;
      return {
        ...prev,
        sectionVisibility: { ...(prev.sectionVisibility || {}), [key]: nextValue },
      };
    });

    const fieldMap = {
      hero: 'show_hero', about: 'show_about', skills: 'show_skills',
      experience: 'show_experience', certifications: 'show_certifications',
      projects: 'show_projects', contact: 'show_contact', footer: 'show_footer',
    };

    if (fieldMap[key] && nextValue !== undefined) {
      await api('/api/admin/settings/', 'PUT', { [fieldMap[key]]: nextValue });
    }
  }, [setData]);

  // ─── MESSAGES ──────────────────────────────────────────────────────────────
  const addMessage = useCallback(async (msg) => {
    await fetch(getApiUrl('/api/contact/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
  }, []);

  const markMessageRead = useCallback(async (id) => {
    setMessages(prev => prev.map(m => String(m.id) === String(id) ? { ...m, is_read: true } : m));
    if (isNumericId(id)) {
      await api(`/api/admin/messages/${id}/`, 'PATCH', { is_read: true });
    }
  }, []);

  const deleteMessage = useCallback(async (id) => {
    setMessages(prev => prev.filter(m => String(m.id) !== String(id)));
    if (isNumericId(id)) {
      await api(`/api/admin/messages/${id}/`, 'DELETE');
    }
  }, []);

  const updateThemeSettings = useCallback(async (newSettings) => {
    setData((prev) => {
      const updatedTheme = {
        ...(prev.themeSettings || {}),
        ...newSettings
      };
      const updatedData = { ...prev, themeSettings: updatedTheme };
      saveCache(updatedData);
      return updatedData;
    });

    if (newSettings.themeMode) {
      localStorage.setItem('muthu_portfolio_default_theme', newSettings.themeMode);
      localStorage.setItem('muthu_portfolio_theme_mode', newSettings.themeMode);
      document.documentElement.setAttribute('data-theme', newSettings.themeMode);
    }

    // Persist to backend database so settings stay permanently across restarts
    try {
      await api('/api/admin/settings/', 'PUT', {
        theme_mode: newSettings.themeMode,
        primary_color: newSettings.primaryColor,
        accent_color: newSettings.accentColor,
        background_color: newSettings.backgroundColor,
        text_color: newSettings.textColor,
        card_color: newSettings.cardColor,
        border_radius: newSettings.borderRadius,
      });
    } catch (err) {
      console.warn('Failed to persist theme settings to backend:', err);
    }
  }, [setData]);

  const value = {
    data,
    messages,
    loading,
    refreshPortfolioData,
    fetchMessages,
    updateProfile,
    updateAbout,
    addSkill, updateSkill, deleteSkill,
    addExperience, updateExperience, deleteExperience,
    addCertification, updateCertification, deleteCertification,
    addProject, updateProject, deleteProject,
    addSocialLink, updateSocialLink, deleteSocialLink,
    toggleSection,
    updateThemeSettings,
    addMessage, markMessageRead, deleteMessage,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return ctx;
};
