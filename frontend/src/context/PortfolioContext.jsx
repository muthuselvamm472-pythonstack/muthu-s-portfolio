/**
 * PortfolioContext.jsx
 * Single source of truth for all portfolio data with Non-Destructive Persistent Merging,
 * Multi-Tab BroadcastChannel Sync, Local Resume Fallback, and Cloud Recovery Queue.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { mockPortfolioData } from '../mockData';
import {
  getApiUrl,
  getCachedResumeData,
  getCachedResumeFilename,
  saveCachedResumeData,
  clearCachedResumeData,
} from '../apiConfig';

const PortfolioContext = createContext(null);

const STORAGE_KEY = 'muthu_portfolio_v8';
const DELETED_KEY = 'muthu_deleted_ids_v8';

// Clear legacy cache keys safely
try {
  [
    'muthu_portfolio_v7',
    'muthu_portfolio_v6',
    'muthu_portfolio_v5',
    'muthu_portfolio_v4',
    'muthu_portfolio_v3',
    'muthu_portfolio_data_v2',
    'muthu_portfolio_data',
  ].forEach((k) => localStorage.removeItem(k));
} catch (_) {}

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

const isNumericId = (id) => {
  if (id === null || id === undefined) return false;
  const num = Number(id);
  return !isNaN(num) && Number.isInteger(num) && num > 0 && !String(id).includes('_');
};

const tryRefreshToken = async () => {
  const refresh = localStorage.getItem('muthu_admin_jwt_refresh');
  if (!refresh) return null;
  try {
    const res = await fetch(getApiUrl('/api/auth/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('muthu_admin_jwt', data.access);
        return data.access;
      }
    }
  } catch (err) {
    console.warn('Silent token refresh failed:', err);
  }
  return null;
};

const formatApiError = (errBody, status) => {
  if (!errBody) return `Server responded with status ${status}`;
  if (typeof errBody === 'string') return errBody;
  if (errBody.error) return errBody.error;
  if (errBody.detail) return errBody.detail;
  const firstKey = Object.keys(errBody)[0];
  if (firstKey) {
    const val = errBody[firstKey];
    const msg = Array.isArray(val) ? val[0] : String(val);
    return `${firstKey}: ${msg}`;
  }
  return `Request failed (${status})`;
};

/**
 * Authenticated API wrapper with timeout protection, JWT auto-refresh,
 * and structured error parsing.
 */
const apiRequest = async (url, method = 'GET', body = null, timeoutMs = 35000) => {
  let token = localStorage.getItem('muthu_admin_jwt');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== null && body !== undefined) headers['Content-Type'] = 'application/json';

  const makeOpts = () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const opts = { method, headers: { ...headers }, signal: controller.signal };
    if (body !== null && body !== undefined) opts.body = JSON.stringify(body);
    return { opts, timer };
  };

  let timer = null;
  try {
    let req = makeOpts();
    timer = req.timer;
    let res = await fetch(getApiUrl(url), req.opts);
    clearTimeout(timer);

    if (res && res.status === 401) {
      const freshToken = await tryRefreshToken();
      if (freshToken) {
        headers['Authorization'] = `Bearer ${freshToken}`;
        req = makeOpts();
        timer = req.timer;
        res = await fetch(getApiUrl(url), req.opts);
        clearTimeout(timer);
      }
    }

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const parsed = isJson ? await res.json().catch(() => null) : null;

    if (res.ok) {
      return { ok: true, synced: true, status: res.status, data: parsed, error: null };
    }
    return {
      ok: false,
      synced: false,
      status: res.status,
      data: parsed,
      error: formatApiError(parsed, res.status),
    };
  } catch (err) {
    if (timer) clearTimeout(timer);
    const isTimeout = err && err.name === 'AbortError';
    console.warn(`API ${method} ${url} failed:`, err);
    return {
      ok: false,
      synced: false,
      status: 0,
      networkError: true,
      data: null,
      error: isTimeout
        ? 'Backend server is waking up (timed out). Saved locally — retry Cloud Sync shortly.'
        : 'Unable to reach backend server. Saved locally for Cloud Sync.',
    };
  }
};

// Auto-sequence order numbers without collisions
const assignSequentialOrders = (list = []) => {
  const seenOrders = new Set();
  let nextAvailable = 1;
  return list.map((item) => {
    let orderNum = Number(item.order ?? item.display_order);
    if (!Number.isInteger(orderNum) || orderNum <= 0 || seenOrders.has(orderNum)) {
      while (seenOrders.has(nextAvailable)) nextAvailable++;
      orderNum = nextAvailable;
    }
    seenOrders.add(orderNum);
    return { ...item, order: orderNum };
  });
};

/**
 * Non-Destructive List Merger:
 * - Authoritative server items come first (unless explicitly deleted in deletedIds).
 * - Cached items (both temp IDs AND numeric IDs that disappeared during ephemeral server resets)
 *   are NEVER discarded unless explicitly in deletedIds!
 * - Prevents duplicate entries using semantic keys when offline temp items already synced.
 */
const mergeList = (apiItems = [], cachedItems = [], semanticKeyFn = null) => {
  const deletedSet = getDeletedIds();
  const resultMap = new Map();
  const seenSemanticKeys = new Set();
  const cachedMap = new Map();

  (cachedItems || []).forEach((c) => {
    if (c && c.id !== undefined && c.id !== null) {
      cachedMap.set(String(c.id), c);
    }
  });

  apiItems.forEach((item, idx) => {
    const itemId = item.id || `api_${idx + 1}`;
    const key = String(itemId);
    if (deletedSet.has(key)) return;

    // Check if user locally edited this item with pending sync
    const cached = cachedMap.get(key);
    if (cached && (cached._needsSync || cached._userEdited)) {
      resultMap.set(key, { ...item, ...cached, id: itemId });
    } else {
      resultMap.set(key, { ...item, id: itemId, _needsSync: false });
    }

    if (semanticKeyFn) {
      const sk = semanticKeyFn(resultMap.get(key));
      if (sk) seenSemanticKeys.add(sk);
    }
  });

  cachedItems.forEach((item, idx) => {
    const itemId = item.id || `cache_${idx + 1}`;
    const key = String(itemId);
    if (deletedSet.has(key) || resultMap.has(key)) return;

    if (semanticKeyFn) {
      const sk = semanticKeyFn(item);
      if (sk && seenSemanticKeys.has(sk)) return;
      if (sk) seenSemanticKeys.add(sk);
    }

    // Preserve user-added item and flag for cloud re-sync
    resultMap.set(key, { ...item, id: itemId, _needsSync: true });
  });

  return assignSequentialOrders(Array.from(resultMap.values()));
};

const semanticKeys = {
  skills: (s) => `${(s.name || '').trim().toLowerCase()}|${(s.category || '').trim().toLowerCase()}`,
  experiences: (e) => `${(e.role || '').trim().toLowerCase()}|${(e.company || '').trim().toLowerCase()}`,
  certifications: (c) => `${(c.name || '').trim().toLowerCase()}|${(c.organization || '').trim().toLowerCase()}`,
  projects: (p) => `${(p.title || '').trim().toLowerCase()}`,
  socialLinks: (sl) => `${(sl.platform || '').trim().toLowerCase()}|${(sl.url || '').trim().toLowerCase()}`,
};

// Strip blank or undefined fields when merging profile/about
const pickEditedOrServer = (isEdited, prevVal, serverVal, fallbackVal) => {
  if (isEdited && prevVal !== undefined) return prevVal;
  if (serverVal !== undefined && serverVal !== null && serverVal !== '') return serverVal;
  if (prevVal !== undefined && prevVal !== null && prevVal !== '') return prevVal;
  return fallbackVal;
};

const formatAndMerge = (apiData, prev) => {
  if (!apiData) return prev;
  const p = apiData.profile || {};
  const a = apiData.about || {};
  const s = apiData.settings || {};

  const profileEdited = prev?.profile?._userEdited || {};
  const aboutEdited = prev?.about?._userEdited || {};
  const hasCachedResume = !!getCachedResumeData();

  // Never allow an empty server resume_url to revert an active custom/cached resume to the old static PDF
  const serverResume = p.resume_url;
  let mergedResumeUrl;
  if (profileEdited.resumeUrl && prev?.profile?.resumeUrl) {
    mergedResumeUrl = prev.profile.resumeUrl;
  } else if (serverResume) {
    mergedResumeUrl = serverResume;
  } else if (hasCachedResume || prev?.profile?.resumeUrl === '/api/resume/') {
    mergedResumeUrl = prev?.profile?.resumeUrl || '/api/resume/';
  } else {
    mergedResumeUrl = prev?.profile?.resumeUrl || mockPortfolioData.profile.resumeUrl;
  }

  const apiSkills = (apiData.skills || []).map((sk, i) => ({
    id: sk.id || i + 1,
    name: sk.name,
    category: sk.category,
    icon: sk.icon || 'Code',
    order: sk.display_order ?? i + 1,
    isVisible: sk.is_visible !== false,
  }));

  const apiExp = (apiData.experiences || []).map((e, i) => ({
    id: e.id || i + 1,
    role: e.role,
    company: e.company,
    location: e.location,
    startDate: e.start_date,
    endDate: e.end_date,
    description: e.description,
    technologies: e.technologies || [],
    order: e.display_order ?? i + 1,
    isVisible: e.is_visible !== false,
  }));

  const apiCerts = (apiData.certifications || []).map((c, i) => ({
    id: c.id || i + 1,
    name: c.name,
    organization: c.organization,
    issueDate: c.issue_date,
    credentialUrl: c.credential_url,
    certificateImg: c.certificate_image || c.certificate_image_data,
    order: c.display_order ?? i + 1,
    isVisible: c.is_visible !== false,
  }));

  const apiProj = (apiData.projects || []).map((pj, i) => ({
    id: pj.id || i + 1,
    title: pj.title,
    shortDescription: pj.short_description,
    detailedDescription: pj.detailed_description,
    image: pj.project_image || pj.project_image_url,
    technologies: pj.technologies || [],
    githubUrl: pj.github_url,
    liveDemoUrl: pj.live_demo_url,
    isFeatured: !!pj.is_featured,
    isVisible: pj.is_visible !== false,
    order: pj.display_order ?? i + 1,
  }));

  const apiSocial = (apiData.social_links || []).map((sl, i) => ({
    id: sl.id || i + 1,
    platform: sl.platform,
    url: sl.url,
    icon: sl.icon,
    order: sl.display_order ?? i + 1,
    isVisible: sl.is_visible !== false,
  }));

  return {
    profile: {
      fullName: pickEditedOrServer(profileEdited.fullName, prev?.profile?.fullName, p.full_name, mockPortfolioData.profile.fullName),
      title: pickEditedOrServer(profileEdited.title, prev?.profile?.title, p.professional_title, mockPortfolioData.profile.title),
      tagline: pickEditedOrServer(profileEdited.tagline, prev?.profile?.tagline, p.tagline, mockPortfolioData.profile.tagline),
      heroDescription: pickEditedOrServer(profileEdited.heroDescription, prev?.profile?.heroDescription, p.hero_description, mockPortfolioData.profile.heroDescription),
      profileImage: pickEditedOrServer(profileEdited.profileImage, prev?.profile?.profileImage, p.profile_image || p.profile_image_url, mockPortfolioData.profile.profileImage),
      statusBadgeText: profileEdited.statusBadgeText
        ? prev.profile.statusBadgeText
        : p.status_badge_text !== undefined
        ? p.status_badge_text
        : prev?.profile?.statusBadgeText ?? mockPortfolioData.profile.statusBadgeText,
      showStatusBadge: profileEdited.showStatusBadge
        ? prev.profile.showStatusBadge
        : p.show_status_badge !== undefined
        ? p.show_status_badge
        : prev?.profile?.showStatusBadge ?? true,
      typewriterRoles: profileEdited.typewriterRoles
        ? prev.profile.typewriterRoles
        : Array.isArray(p.typewriter_roles) && p.typewriter_roles.length > 0
        ? p.typewriter_roles
        : prev?.profile?.typewriterRoles || mockPortfolioData.profile.typewriterRoles,
      heroLine1: profileEdited.heroLine1
        ? prev.profile.heroLine1
        : p.hero_line1 !== undefined
        ? p.hero_line1
        : prev?.profile?.heroLine1 ?? mockPortfolioData.profile.heroLine1,
      heroLine2: profileEdited.heroLine2
        ? prev.profile.heroLine2
        : p.hero_line2 !== undefined
        ? p.hero_line2
        : prev?.profile?.heroLine2 ?? mockPortfolioData.profile.heroLine2,
      heroLine3: profileEdited.heroLine3
        ? prev.profile.heroLine3
        : p.hero_line3 !== undefined
        ? p.hero_line3
        : prev?.profile?.heroLine3 ?? mockPortfolioData.profile.heroLine3,
      email: pickEditedOrServer(profileEdited.email, prev?.profile?.email, p.email, mockPortfolioData.profile.email),
      phone: pickEditedOrServer(profileEdited.phone, prev?.profile?.phone, p.phone, mockPortfolioData.profile.phone),
      location: pickEditedOrServer(profileEdited.location, prev?.profile?.location, p.location, mockPortfolioData.profile.location),
      resumeUrl: mergedResumeUrl,
      resumeFilename: p.resume_filename || prev?.profile?.resumeFilename || getCachedResumeFilename(),
      showHeroButtons: p.show_hero_buttons !== false,
      button1Text: pickEditedOrServer(profileEdited.button1Text, prev?.profile?.button1Text, p.button1_text, 'View My Work'),
      button1Url: pickEditedOrServer(profileEdited.button1Url, prev?.profile?.button1Url, p.button1_url, '#projects'),
      button2Text: pickEditedOrServer(profileEdited.button2Text, prev?.profile?.button2Text, p.button2_text, 'Download Resume'),
      button2Url: mergedResumeUrl,
      _userEdited: profileEdited,
      _clientUpdatedAt: prev?.profile?._clientUpdatedAt,
    },
    about: {
      heading: pickEditedOrServer(aboutEdited.heading, prev?.about?.heading, a.heading, mockPortfolioData.about.heading),
      shortDescription: pickEditedOrServer(aboutEdited.shortDescription, prev?.about?.shortDescription, a.short_description, mockPortfolioData.about.shortDescription),
      detailedDescription: pickEditedOrServer(aboutEdited.detailedDescription, prev?.about?.detailedDescription, a.detailed_description, mockPortfolioData.about.detailedDescription),
      currentFocus: pickEditedOrServer(aboutEdited.currentFocus, prev?.about?.currentFocus, a.current_focus, mockPortfolioData.about.currentFocus),
      coreTechnologies: pickEditedOrServer(aboutEdited.coreTechnologies, prev?.about?.coreTechnologies, a.core_technologies, mockPortfolioData.about.coreTechnologies),
      showResumeButton: aboutEdited.showResumeButton
        ? prev.about.showResumeButton
        : a.show_resume_button !== undefined
        ? a.show_resume_button
        : prev?.about?.showResumeButton ?? true,
      resumeUrl: mergedResumeUrl,
      _userEdited: aboutEdited,
      _clientUpdatedAt: prev?.about?._clientUpdatedAt,
    },
    skills: mergeList(apiSkills, prev?.skills || [], semanticKeys.skills),
    experiences: mergeList(apiExp, prev?.experiences || [], semanticKeys.experiences),
    certifications: mergeList(apiCerts, prev?.certifications || [], semanticKeys.certifications),
    projects: mergeList(apiProj, prev?.projects || [], semanticKeys.projects),
    socialLinks: mergeList(apiSocial, prev?.socialLinks || [], semanticKeys.socialLinks),
    sectionVisibility: {
      hero: prev?.sectionVisibility?._userEdited?.hero !== undefined
        ? prev.sectionVisibility.hero
        : (s.show_hero !== undefined ? s.show_hero : prev?.sectionVisibility?.hero ?? true),
      about: prev?.sectionVisibility?._userEdited?.about !== undefined
        ? prev.sectionVisibility.about
        : (s.show_about !== undefined ? s.show_about : prev?.sectionVisibility?.about ?? true),
      skills: prev?.sectionVisibility?._userEdited?.skills !== undefined
        ? prev.sectionVisibility.skills
        : (s.show_skills !== undefined ? s.show_skills : prev?.sectionVisibility?.skills ?? true),
      experience: prev?.sectionVisibility?._userEdited?.experience !== undefined
        ? prev.sectionVisibility.experience
        : (s.show_experience !== undefined ? s.show_experience : prev?.sectionVisibility?.experience ?? true),
      certifications: prev?.sectionVisibility?._userEdited?.certifications !== undefined
        ? prev.sectionVisibility.certifications
        : (s.show_certifications !== undefined ? s.show_certifications : prev?.sectionVisibility?.certifications ?? true),
      projects: prev?.sectionVisibility?._userEdited?.projects !== undefined
        ? prev.sectionVisibility.projects
        : (s.show_projects !== undefined ? s.show_projects : prev?.sectionVisibility?.projects ?? true),
      contact: prev?.sectionVisibility?._userEdited?.contact !== undefined
        ? prev.sectionVisibility.contact
        : (s.show_contact !== undefined ? s.show_contact : prev?.sectionVisibility?.contact ?? true),
      footer: prev?.sectionVisibility?._userEdited?.footer !== undefined
        ? prev.sectionVisibility.footer
        : (s.show_footer !== undefined ? s.show_footer : prev?.sectionVisibility?.footer ?? true),
      _userEdited: prev?.sectionVisibility?._userEdited || {},
    },
    themeSettings: {
      ...(prev?.themeSettings || mockPortfolioData.themeSettings),
      themeMode: prev?.themeSettings?._userEdited
        ? prev.themeSettings.themeMode
        : (s.theme_mode || prev?.themeSettings?.themeMode || mockPortfolioData.themeSettings.themeMode),
      primaryColor: prev?.themeSettings?._userEdited
        ? prev.themeSettings.primaryColor
        : (s.primary_color || prev?.themeSettings?.primaryColor || mockPortfolioData.themeSettings.primaryColor),
      accentColor: prev?.themeSettings?._userEdited
        ? prev.themeSettings.accentColor
        : (s.accent_color || prev?.themeSettings?.accentColor || mockPortfolioData.themeSettings.accentColor),
      backgroundColor: prev?.themeSettings?._userEdited
        ? prev.themeSettings.backgroundColor
        : (s.background_color || prev?.themeSettings?.backgroundColor || mockPortfolioData.themeSettings.backgroundColor),
      textColor: prev?.themeSettings?._userEdited
        ? prev.themeSettings.textColor
        : (s.text_color || prev?.themeSettings?.textColor || mockPortfolioData.themeSettings.textColor),
      cardColor: prev?.themeSettings?._userEdited
        ? prev.themeSettings.cardColor
        : (s.card_color || prev?.themeSettings?.cardColor || mockPortfolioData.themeSettings.cardColor),
      borderRadius: prev?.themeSettings?._userEdited
        ? prev.themeSettings.borderRadius
        : (s.border_radius || prev?.themeSettings?.borderRadius || mockPortfolioData.themeSettings.borderRadius),
      _userEdited: prev?.themeSettings?._userEdited || false,
    },
    contact: {
      email: pickEditedOrServer(profileEdited.email, prev?.profile?.email, p.email, mockPortfolioData.contact.email),
      phone: pickEditedOrServer(profileEdited.phone, prev?.profile?.phone, p.phone, mockPortfolioData.contact.phone),
      location: pickEditedOrServer(profileEdited.location, prev?.profile?.location, p.location, mockPortfolioData.contact.location),
    },
  };
};

const loadCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
};

const saveCache = (portfolioData) => {
  try {
    // Strip any huge inline base64 resume copies before writing main state so STORAGE_KEY stays compact
    const clean = portfolioData?.profile?.resumeUrl?.startsWith?.('data:')
      ? {
          ...portfolioData,
          profile: { ...portfolioData.profile, resumeUrl: '/api/resume/' },
          about: { ...(portfolioData.about || {}), resumeUrl: '/api/resume/' },
        }
      : portfolioData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (err) {
    console.warn('localStorage quota warning:', err);
  }
};

// Cross-tab / Cross-window zero-latency sync via BroadcastChannel
let syncChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('muthu_portfolio_sync');
  }
} catch (_) {}

// Field mappers for shared collection CRUD logic
const collectionSpecs = {
  skills: {
    endpoint: '/api/admin/skills/',
    prefix: 'sk',
    prepend: false,
    toApi: (item) => ({
      name: item.name,
      category: item.category,
      icon: item.icon || 'Code',
      display_order: Number(item.order) || 1,
      is_visible: item.isVisible !== false,
    }),
  },
  experiences: {
    endpoint: '/api/admin/experience/',
    prefix: 'exp',
    prepend: true,
    toApi: (item) => ({
      role: item.role,
      company: item.company,
      location: item.location || '',
      start_date: item.startDate || '',
      end_date: item.endDate || 'Present',
      description: item.description || '',
      technologies: item.technologies || [],
      display_order: Number(item.order) || 1,
      is_visible: item.isVisible !== false,
    }),
  },
  certifications: {
    endpoint: '/api/admin/certifications/',
    prefix: 'cert',
    prepend: true,
    toApi: (item) => ({
      name: item.name,
      organization: item.organization,
      issue_date: item.issueDate || '',
      credential_url: item.credentialUrl === '#' ? '' : (item.credentialUrl || ''),
      certificate_image_data: item.certificateImg || '',
      display_order: Number(item.order) || 1,
      is_visible: item.isVisible !== false,
    }),
  },
  projects: {
    endpoint: '/api/admin/projects/',
    prefix: 'proj',
    prepend: true,
    toApi: (item) => ({
      title: item.title,
      short_description: item.shortDescription || '',
      detailed_description: item.detailedDescription || '',
      project_image_url: item.image || '',
      technologies: item.technologies || [],
      github_url: item.githubUrl === '#' ? '' : (item.githubUrl || ''),
      live_demo_url: item.liveDemoUrl === '#' ? '' : (item.liveDemoUrl || ''),
      is_featured: !!item.isFeatured,
      display_order: Number(item.order) || 1,
      is_visible: item.isVisible !== false,
    }),
  },
  socialLinks: {
    endpoint: '/api/admin/social/',
    prefix: 'soc',
    prepend: false,
    toApi: (item) => ({
      platform: item.platform,
      url: item.url,
      icon: item.icon || item.platform?.toLowerCase() || 'Globe',
      display_order: Number(item.order) || 1,
      is_visible: item.isVisible !== false,
    }),
  },
};

const countPendingSync = (portfolioData) => {
  if (!portfolioData) return 0;
  return ['skills', 'experiences', 'certifications', 'projects', 'socialLinks'].reduce(
    (sum, key) => sum + (portfolioData[key] || []).filter((item) => item._needsSync).length,
    0
  );
};

export const PortfolioProvider = ({ children }) => {
  const [data, setDataRaw] = useState(() => loadCache() || mockPortfolioData);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    state: 'idle',
    pendingCount: 0,
    lastSyncedAt: null,
    error: null,
  });

  const dataRef = useRef(data);
  dataRef.current = data;

  const setData = useCallback((updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCache(next);
      if (syncChannel) {
        try {
          syncChannel.postMessage({ type: 'SYNC_PORTFOLIO', payload: next });
        } catch (_) {}
      }
      return next;
    });
  }, []);

  // Recompute pending count cleanly whenever lists change
  useEffect(() => {
    const pendingCount = countPendingSync(data);
    setSyncStatus((prev) => (prev.pendingCount === pendingCount ? prev : { ...prev, pendingCount }));
  }, [data]);

  const refreshPortfolioData = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/portfolio/'));
      if (res && res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const apiData = await res.json();
          setData((prev) => formatAndMerge(apiData, prev));
          setSyncStatus((prev) => ({
            ...prev,
            state: 'connected',
            lastSyncedAt: new Date().toISOString(),
            error: null,
          }));

          if (apiData?.settings?.theme_mode) {
            localStorage.setItem('muthu_portfolio_default_theme', apiData.settings.theme_mode);
            const manualTheme = localStorage.getItem('muthu_portfolio_user_selected_theme');
            if (!manualTheme) {
              localStorage.setItem('muthu_portfolio_theme_mode', apiData.settings.theme_mode);
              document.documentElement.setAttribute('data-theme', apiData.settings.theme_mode);
            }
          }
          return true;
        }
      }
    } catch (err) {
      console.warn('Backend fetch failed, relying on local cache:', err);
      setSyncStatus((prev) => ({ ...prev, state: 'offline', error: 'Backend waking up / offline' }));
    } finally {
      setLoading(false);
    }
    return false;
  }, [setData]);

  useEffect(() => {
    refreshPortfolioData();
  }, [refreshPortfolioData]);

  // Cross-tab instant synchronization
  useEffect(() => {
    const handleBroadcast = (e) => {
      if (e?.data?.type === 'SYNC_PORTFOLIO' && e.data.payload) {
        setDataRaw(e.data.payload);
      } else if (e?.data?.type === 'SYNC_THEME' && e.data.mode) {
        document.documentElement.setAttribute('data-theme', e.data.mode);
      }
    };
    if (syncChannel) {
      syncChannel.addEventListener('message', handleBroadcast);
    }

    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setDataRaw(JSON.parse(e.newValue));
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (syncChannel) syncChannel.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    const result = await apiRequest('/api/admin/messages/');
    if (result.ok) {
      const list = Array.isArray(result.data) ? result.data : result.data?.results || [];
      setMessages(list);
    }
    return result;
  }, []);

  // ─── PROFILE & HERO ────────────────────────────────────────────────────────
  const updateProfile = useCallback(
    async (fields) => {
      // Cache resume locally when uploaded so offline/restarts never revert it
      if (typeof fields.resumeUrl === 'string' && fields.resumeUrl.startsWith('data:')) {
        saveCachedResumeData(fields.resumeUrl, fields.resumeFilename || 'Muthu_Selvam_Resume.pdf');
      } else if (fields.clearResume || fields.resumeUrl === '/Muthu_Selvam_Resume.pdf' || fields.resumeUrl === '') {
        clearCachedResumeData();
      }

      setData((prev) => {
        const userEdited = { ...(prev?.profile?._userEdited || {}) };
        Object.keys(fields).forEach((k) => {
          if (fields[k] !== undefined) userEdited[k] = true;
        });
        const nextResumeUrl = fields.clearResume
          ? '/Muthu_Selvam_Resume.pdf'
          : fields.resumeUrl !== undefined
          ? fields.resumeUrl || '/Muthu_Selvam_Resume.pdf'
          : prev.profile.resumeUrl;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            ...fields,
            resumeUrl: nextResumeUrl,
            button2Url: nextResumeUrl,
            _userEdited: userEdited,
            _clientUpdatedAt: Date.now(),
          },
          about: {
            ...prev.about,
            resumeUrl: nextResumeUrl,
          },
          contact: {
            ...prev.contact,
            email: fields.email ?? prev.profile.email,
            phone: fields.phone ?? prev.profile.phone,
            location: fields.location ?? prev.profile.location,
          },
        };
      });

      // Only send fields explicitly present so HeroTab never touches resume fields on the backend!
      const apiPayload = {};
      const fieldMap = {
        fullName: 'full_name',
        title: 'professional_title',
        tagline: 'tagline',
        heroDescription: 'hero_description',
        profileImage: 'profile_image',
        email: 'email',
        phone: 'phone',
        location: 'location',
        resumeFilename: 'resume_filename',
        statusBadgeText: 'status_badge_text',
        showStatusBadge: 'show_status_badge',
        typewriterRoles: 'typewriter_roles',
        heroLine1: 'hero_line1',
        heroLine2: 'hero_line2',
        heroLine3: 'hero_line3',
        button1Text: 'button1_text',
        button1Url: 'button1_url',
        button2Text: 'button2_text',
        showHeroButtons: 'show_hero_buttons',
      };
      Object.entries(fieldMap).forEach(([clientKey, serverKey]) => {
        if (fields[clientKey] !== undefined) {
          apiPayload[serverKey] = fields[clientKey];
        }
      });
      if (fields.clearResume) {
        apiPayload.clear_resume = true;
        apiPayload.resume_url = '';
      } else if (fields.resumeUrl !== undefined) {
        apiPayload.resume_url = fields.resumeUrl;
        apiPayload.button2_url = fields.resumeUrl;
      }

      const result = await apiRequest('/api/admin/profile/', 'PUT', apiPayload);
      if (result.ok && result.data) {
        if (result.data.resume_url) {
          setData((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              resumeUrl: result.data.resume_url,
              button2Url: result.data.resume_url,
              resumeFilename: result.data.resume_filename || prev.profile.resumeFilename,
            },
            about: {
              ...prev.about,
              resumeUrl: result.data.resume_url,
            },
          }));
        }
      }
      return result;
    },
    [setData]
  );

  // ─── ABOUT ─────────────────────────────────────────────────────────────────
  const updateAbout = useCallback(
    async (fields) => {
      setData((prev) => {
        const userEdited = { ...(prev?.about?._userEdited || {}) };
        Object.keys(fields).forEach((k) => {
          if (fields[k] !== undefined) userEdited[k] = true;
        });
        return {
          ...prev,
          about: {
            ...prev.about,
            ...fields,
            _userEdited: userEdited,
            _clientUpdatedAt: Date.now(),
          },
        };
      });
      const payload = {};
      if (fields.heading !== undefined) payload.heading = fields.heading;
      if (fields.shortDescription !== undefined) payload.short_description = fields.shortDescription;
      if (fields.detailedDescription !== undefined) payload.detailed_description = fields.detailedDescription;
      if (fields.currentFocus !== undefined) payload.current_focus = fields.currentFocus;
      if (fields.coreTechnologies !== undefined) payload.core_technologies = fields.coreTechnologies;
      if (fields.showResumeButton !== undefined) payload.show_resume_button = fields.showResumeButton;

      return await apiRequest('/api/admin/about/', 'PUT', payload);
    },
    [setData]
  );

  // ─── SHARED COLLECTION MUTATION HELPERS ────────────────────────────────────
  const createCollectionItem = useCallback(
    async (collectionKey, item) => {
      const spec = collectionSpecs[collectionKey];
      const tempId = `${spec.prefix}_${Date.now()}`;
      const newItem = {
        ...item,
        id: tempId,
        isVisible: item.isVisible !== false,
        order: Number(item.order) || 1,
        _needsSync: true,
        _userEdited: true,
        _clientUpdatedAt: Date.now(),
      };

      setData((prev) => {
        const list = prev[collectionKey] || [];
        return {
          ...prev,
          [collectionKey]: spec.prepend ? [newItem, ...list] : [...list, newItem],
        };
      });

      const result = await apiRequest(spec.endpoint, 'POST', spec.toApi(newItem));
      if (result.ok && result.data?.id) {
        setData((prev) => ({
          ...prev,
          [collectionKey]: (prev[collectionKey] || []).map((entry) =>
            String(entry.id) === String(tempId)
              ? { ...entry, id: result.data.id, _needsSync: false }
              : entry
          ),
        }));
      }
      return result;
    },
    [setData]
  );

  const updateCollectionItem = useCallback(
    async (collectionKey, id, fields) => {
      const spec = collectionSpecs[collectionKey];
      let updatedItem = null;

      setData((prev) => {
        const list = (prev[collectionKey] || []).map((entry) => {
          if (String(entry.id) === String(id)) {
            updatedItem = {
              ...entry,
              ...fields,
              _needsSync: true,
              _userEdited: true,
              _clientUpdatedAt: Date.now(),
            };
            return updatedItem;
          }
          return entry;
        });
        return { ...prev, [collectionKey]: list };
      });

      if (!updatedItem) {
        return { ok: false, synced: false, error: 'Item not found locally.' };
      }

      if (isNumericId(id)) {
        const result = await apiRequest(`${spec.endpoint}${id}/`, 'PUT', spec.toApi(updatedItem));
        if (result.ok) {
          setData((prev) => ({
            ...prev,
            [collectionKey]: (prev[collectionKey] || []).map((entry) =>
              String(entry.id) === String(id) ? { ...entry, _needsSync: false } : entry
            ),
          }));
        }
        return result;
      }

      // If item was offline temp ID, promote it to a real backend record now
      const createRes = await apiRequest(spec.endpoint, 'POST', spec.toApi(updatedItem));
      if (createRes.ok && createRes.data?.id) {
        setData((prev) => ({
          ...prev,
          [collectionKey]: (prev[collectionKey] || []).map((entry) =>
            String(entry.id) === String(id)
              ? { ...entry, id: createRes.data.id, _needsSync: false }
              : entry
          ),
        }));
      }
      return createRes;
    },
    [setData]
  );

  const deleteCollectionItem = useCallback(
    async (collectionKey, id) => {
      const spec = collectionSpecs[collectionKey];
      addDeletedId(id);
      setData((prev) => ({
        ...prev,
        [collectionKey]: (prev[collectionKey] || []).filter((entry) => String(entry.id) !== String(id)),
      }));
      if (isNumericId(id)) {
        return await apiRequest(`${spec.endpoint}${id}/`, 'DELETE');
      }
      return { ok: true, synced: true, status: 204 };
    },
    [setData]
  );

  const addSkill = useCallback((s) => createCollectionItem('skills', s), [createCollectionItem]);
  const updateSkill = useCallback((id, f) => updateCollectionItem('skills', id, f), [updateCollectionItem]);
  const deleteSkill = useCallback((id) => deleteCollectionItem('skills', id), [deleteCollectionItem]);

  const addExperience = useCallback((e) => createCollectionItem('experiences', e), [createCollectionItem]);
  const updateExperience = useCallback((id, f) => updateCollectionItem('experiences', id, f), [updateCollectionItem]);
  const deleteExperience = useCallback((id) => deleteCollectionItem('experiences', id), [deleteCollectionItem]);

  const addCertification = useCallback((c) => createCollectionItem('certifications', c), [createCollectionItem]);
  const updateCertification = useCallback((id, f) => updateCollectionItem('certifications', id, f), [updateCollectionItem]);
  const deleteCertification = useCallback((id) => deleteCollectionItem('certifications', id), [deleteCollectionItem]);

  const addProject = useCallback((p) => createCollectionItem('projects', p), [createCollectionItem]);
  const updateProject = useCallback((id, f) => updateCollectionItem('projects', id, f), [updateCollectionItem]);
  const deleteProject = useCallback((id) => deleteCollectionItem('projects', id), [deleteCollectionItem]);

  const addSocialLink = useCallback((sl) => createCollectionItem('socialLinks', sl), [createCollectionItem]);
  const updateSocialLink = useCallback((id, f) => updateCollectionItem('socialLinks', id, f), [updateCollectionItem]);
  const deleteSocialLink = useCallback((id) => deleteCollectionItem('socialLinks', id), [deleteCollectionItem]);

  // ─── SECTION VISIBILITY & THEME ────────────────────────────────────────────
  const toggleSection = useCallback(
    async (key) => {
      let nextValue;
      setData((prev) => {
        const currentValue = prev.sectionVisibility?.[key] !== false;
        nextValue = !currentValue;
        const userEdited = { ...(prev.sectionVisibility?._userEdited || {}), [key]: true };
        return {
          ...prev,
          sectionVisibility: { ...(prev.sectionVisibility || {}), [key]: nextValue, _userEdited: userEdited },
        };
      });

      const fieldMap = {
        hero: 'show_hero',
        about: 'show_about',
        skills: 'show_skills',
        experience: 'show_experience',
        certifications: 'show_certifications',
        projects: 'show_projects',
        contact: 'show_contact',
        footer: 'show_footer',
      };

      if (fieldMap[key] && nextValue !== undefined) {
        return await apiRequest('/api/admin/settings/', 'PUT', { [fieldMap[key]]: nextValue });
      }
      return { ok: false, synced: false };
    },
    [setData]
  );

  const updateThemeSettings = useCallback(
    async (newSettings) => {
      setData((prev) => ({
        ...prev,
        themeSettings: { ...(prev.themeSettings || {}), ...newSettings, _userEdited: true },
      }));

      if (newSettings.themeMode) {
        localStorage.setItem('muthu_portfolio_default_theme', newSettings.themeMode);
        localStorage.setItem('muthu_portfolio_theme_mode', newSettings.themeMode);
        document.documentElement.setAttribute('data-theme', newSettings.themeMode);
        if (syncChannel) {
          try {
            syncChannel.postMessage({ type: 'SYNC_THEME', mode: newSettings.themeMode });
          } catch (_) {}
        }
      }

      return await apiRequest('/api/admin/settings/', 'PUT', {
        theme_mode: newSettings.themeMode,
        primary_color: newSettings.primaryColor,
        accent_color: newSettings.accentColor,
        background_color: newSettings.backgroundColor,
        text_color: newSettings.textColor,
        card_color: newSettings.cardColor,
        border_radius: newSettings.borderRadius,
      });
    },
    [setData]
  );

  // ─── FULL CLOUD SYNC ENGINE (Reconciles all 11 sections + resume + pending items) ─
  const syncAllToCloud = useCallback(async () => {
    const token = localStorage.getItem('muthu_admin_jwt');
    if (!token) {
      return { ok: false, error: 'Admin login required to sync to Cloud Database.' };
    }

    setSyncStatus((prev) => ({ ...prev, state: 'syncing', error: null }));
    const current = dataRef.current;
    let errors = [];
    let syncedCount = 0;

    // 1. Fetch live backend snapshot to detect what items are missing on server
    let serverSnapshot = null;
    try {
      const snapRes = await fetch(getApiUrl('/api/portfolio/'));
      if (snapRes.ok) serverSnapshot = await snapRes.json();
    } catch (_) {}

    // 2. Sync Profile & Hero (plus locally cached Base64 resume if available)
    const cachedResumeB64 = getCachedResumeData();
    const profilePayload = {
      ...current.profile,
      resumeUrl: cachedResumeB64 || current.profile?.resumeUrl,
      resumeFilename: getCachedResumeFilename(),
    };
    delete profilePayload._userEdited;
    delete profilePayload._clientUpdatedAt;
    const pRes = await updateProfile(profilePayload);
    if (pRes.ok) syncedCount++;
    else errors.push(`Profile/Hero: ${pRes.error}`);

    // 3. Sync About
    const aRes = await updateAbout(current.about || {});
    if (aRes.ok) syncedCount++;
    else errors.push(`About: ${aRes.error}`);

    // 4. Sync Section Settings & Theme
    const sv = current.sectionVisibility || {};
    const ts = current.themeSettings || {};
    const sRes = await apiRequest('/api/admin/settings/', 'PUT', {
      show_hero: sv.hero !== false,
      show_about: sv.about !== false,
      show_skills: sv.skills !== false,
      show_experience: sv.experience !== false,
      show_certifications: sv.certifications !== false,
      show_projects: sv.projects !== false,
      show_contact: sv.contact !== false,
      show_footer: sv.footer !== false,
      theme_mode: ts.themeMode,
      primary_color: ts.primaryColor,
      accent_color: ts.accentColor,
      background_color: ts.backgroundColor,
      text_color: ts.textColor,
      card_color: ts.cardColor,
      border_radius: ts.borderRadius,
    });
    if (sRes.ok) syncedCount++;
    else errors.push(`Settings/Theme: ${sRes.error}`);

    // 5. Reconcile all 5 list collections (push any item with _needsSync or missing from server)
    const serverKeyMap = {
      skills: serverSnapshot?.skills || [],
      experiences: serverSnapshot?.experiences || [],
      certifications: serverSnapshot?.certifications || [],
      projects: serverSnapshot?.projects || [],
      socialLinks: serverSnapshot?.social_links || [],
    };

    for (const key of Object.keys(collectionSpecs)) {
      const spec = collectionSpecs[key];
      const serverIds = new Set((serverKeyMap[key] || []).map((row) => String(row.id)));
      const localItems = current[key] || [];

      for (const item of localItems) {
        const missingOnServer = item._needsSync || !isNumericId(item.id) || (serverSnapshot && !serverIds.has(String(item.id)));
        if (!missingOnServer) continue;

        const apiBody = spec.toApi(item);
        let itemRes;
        if (isNumericId(item.id) && serverIds.has(String(item.id))) {
          itemRes = await apiRequest(`${spec.endpoint}${item.id}/`, 'PUT', apiBody);
        } else {
          itemRes = await apiRequest(spec.endpoint, 'POST', apiBody);
        }

        if (itemRes.ok) {
          syncedCount++;
          const newId = itemRes.data?.id || item.id;
          setData((prev) => ({
            ...prev,
            [key]: (prev[key] || []).map((entry) =>
              String(entry.id) === String(item.id) ? { ...entry, id: newId, _needsSync: false } : entry
            ),
          }));
        } else {
          errors.push(`${key} (${item.title || item.platform || item.name || item.role}): ${itemRes.error}`);
        }
      }
    }

    await refreshPortfolioData();

    if (errors.length === 0) {
      setSyncStatus({
        state: 'connected',
        pendingCount: 0,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
      return { ok: true, synced: true, syncedCount };
    }

    setSyncStatus((prev) => ({
      ...prev,
      state: 'error',
      error: errors[0],
    }));
    return { ok: false, synced: false, error: errors[0], syncedCount };
  }, [updateProfile, updateAbout, setData, refreshPortfolioData]);

  // ─── PUBLIC MESSAGES ───────────────────────────────────────────────────────
  const addMessage = useCallback(async (msg) => {
    return await apiRequest('/api/contact/', 'POST', msg);
  }, []);

  const markMessageRead = useCallback(async (id) => {
    setMessages((prev) => prev.map((m) => (String(m.id) === String(id) ? { ...m, is_read: true } : m)));
    if (isNumericId(id)) {
      return await apiRequest(`/api/admin/messages/${id}/`, 'PATCH', { is_read: true });
    }
    return { ok: true, synced: true };
  }, []);

  const deleteMessage = useCallback(async (id) => {
    setMessages((prev) => prev.filter((m) => String(m.id) !== String(id)));
    if (isNumericId(id)) {
      return await apiRequest(`/api/admin/messages/${id}/`, 'DELETE');
    }
    return { ok: true, synced: true };
  }, []);

  const value = {
    data,
    messages,
    loading,
    syncStatus,
    refreshPortfolioData,
    syncAllToCloud,
    fetchMessages,
    updateProfile,
    updateAbout,
    addSkill,
    updateSkill,
    deleteSkill,
    addExperience,
    updateExperience,
    deleteExperience,
    addCertification,
    updateCertification,
    deleteCertification,
    addProject,
    updateProject,
    deleteProject,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    toggleSection,
    updateThemeSettings,
    addMessage,
    markMessageRead,
    deleteMessage,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return ctx;
};
