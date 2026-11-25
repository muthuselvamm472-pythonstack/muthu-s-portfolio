/**
 * API Configuration Module
 * Dynamically resolves the Django Backend API URL based on environment and host,
 * plus hybrid IndexedDB + localStorage cached Base64 resume persistence.
 */
import { idbGet, idbSet, idbDelete, IDB_KEYS } from './utils/persistentStorage';

const RESUME_DATA_KEY = 'muthu_resume_data_v1';
const RESUME_NAME_KEY = 'muthu_resume_filename_v1';
let cachedBlobUrl = null;
let cachedBlobSource = null;
let memoryResumeData = '';
let memoryResumeName = '';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return 'https://muthu-portfolio-backend.onrender.com';
  }
  return '';
};

export const API_BASE_URL = getBaseUrl();

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return cleanPath;
};

export const getCachedResumeData = () => {
  if (memoryResumeData) return memoryResumeData;
  try {
    return localStorage.getItem(RESUME_DATA_KEY) || '';
  } catch (_) {
    return '';
  }
};

export const getCachedResumeFilename = () => {
  if (memoryResumeName) return memoryResumeName;
  try {
    return localStorage.getItem(RESUME_NAME_KEY) || 'Muthu_Selvam_Resume.pdf';
  } catch (_) {
    return 'Muthu_Selvam_Resume.pdf';
  }
};

export const hydrateCachedResumeFromIdb = async () => {
  try {
    const [b64, name] = await Promise.all([
      idbGet(IDB_KEYS.RESUME_DATA),
      idbGet(IDB_KEYS.RESUME_NAME),
    ]);
    if (typeof b64 === 'string' && b64.startsWith('data:')) {
      memoryResumeData = b64;
    }
    if (typeof name === 'string' && name) {
      memoryResumeName = name;
    }
    return b64 || '';
  } catch (_) {
    return '';
  }
};

export const saveCachedResumeData = (dataUrl, filename = 'Muthu_Selvam_Resume.pdf') => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return false;
  memoryResumeData = dataUrl;
  memoryResumeName = filename || 'Muthu_Selvam_Resume.pdf';
  cachedBlobSource = null;
  if (cachedBlobUrl) {
    try { URL.revokeObjectURL(cachedBlobUrl); } catch (_) {}
    cachedBlobUrl = null;
  }

  // Always save to high-capacity IndexedDB so large PDFs never fail localStorage limits
  idbSet(IDB_KEYS.RESUME_DATA, dataUrl);
  idbSet(IDB_KEYS.RESUME_NAME, memoryResumeName);

  // Best-effort localStorage copy only if small enough to avoid QuotaExceededError
  try {
    if (filename) localStorage.setItem(RESUME_NAME_KEY, filename);
    if (dataUrl.length < 1_500_000) {
      localStorage.setItem(RESUME_DATA_KEY, dataUrl);
    } else {
      localStorage.removeItem(RESUME_DATA_KEY);
    }
  } catch (_) {}
  return true;
};

export const clearCachedResumeData = () => {
  memoryResumeData = '';
  memoryResumeName = '';
  idbDelete(IDB_KEYS.RESUME_DATA);
  idbDelete(IDB_KEYS.RESUME_NAME);
  try {
    localStorage.removeItem(RESUME_DATA_KEY);
    localStorage.removeItem(RESUME_NAME_KEY);
  } catch (_) {}
  cachedBlobSource = null;
  if (cachedBlobUrl) {
    try { URL.revokeObjectURL(cachedBlobUrl); } catch (_) {}
    cachedBlobUrl = null;
  }
};

const dataUrlToBlobUrl = (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (cachedBlobSource === dataUrl && cachedBlobUrl) return cachedBlobUrl;
  try {
    const [header, b64] = dataUrl.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    if (cachedBlobUrl) {
      try { URL.revokeObjectURL(cachedBlobUrl); } catch (_) {}
    }
    cachedBlobUrl = URL.createObjectURL(blob);
    cachedBlobSource = dataUrl;
    return cachedBlobUrl;
  } catch (_) {
    return dataUrl;
  }
};

/**
 * Intelligently resolves the Resume URL:
 * - Preserves newly uploaded Base64 data URLs via Blob URL.
 * - Falls back to IndexedDB / localStorage cached resume if backend returns empty/static while sleeping.
 * - Resolves /api/resume/ and /media/... against API_BASE_URL in production.
 * - Falls back to bundled /Muthu_Selvam_Resume.pdf only when no custom resume exists.
 */
export const resolveResumeUrl = (rawUrl) => {
  const cachedData = getCachedResumeData();

  if (typeof rawUrl === 'string' && rawUrl.startsWith('data:')) {
    return dataUrlToBlobUrl(rawUrl);
  }
  if (typeof rawUrl === 'string' && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
    return rawUrl;
  }
  if (cachedData && (!rawUrl || rawUrl === '/api/resume/' || rawUrl === '/Muthu_Selvam_Resume.pdf' || rawUrl === '/Muthu%20Selvam(RESUME).pdf')) {
    return dataUrlToBlobUrl(cachedData);
  }
  if (!rawUrl || rawUrl === '/Muthu_Selvam_Resume.pdf' || rawUrl === '/Muthu%20Selvam(RESUME).pdf') {
    return '/Muthu_Selvam_Resume.pdf';
  }
  if (rawUrl.startsWith('/api/') || rawUrl.startsWith('/media/')) {
    return getApiUrl(rawUrl);
  }
  return rawUrl;
};
