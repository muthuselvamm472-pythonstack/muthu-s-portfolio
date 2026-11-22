/**
 * API Configuration Module
 * Dynamically resolves the Django Backend API URL based on environment and host.
 */

const getBaseUrl = () => {
  // 1. If explicit env variable is provided (VITE_API_URL)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 2. In production builds (Vercel, Netlify, Live Host), default to the live Render backend
  if (import.meta.env.PROD) {
    return 'https://muthu-portfolio-backend.onrender.com';
  }

  // 3. In local development (Vite dev server), use relative path to leverage Vite proxy
  return '';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Returns full absolute URL in production or relative URL in dev
 * @param {string} path - e.g. '/api/auth/login/'
 */
export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return cleanPath;
};

/**
 * Intelligently resolves the Resume URL:
 * - If backend path (/api/resume/ or /media/...), prepends backend origin in production.
 * - If external (http:// or https://), returns directly.
 * - If empty or static, falls back to local static bundled file /Muthu_Selvam_Resume.pdf.
 */
export const resolveResumeUrl = (rawUrl) => {
  if (!rawUrl || rawUrl === '/Muthu_Selvam_Resume.pdf' || rawUrl === '/Muthu%20Selvam(RESUME).pdf') {
    return '/Muthu_Selvam_Resume.pdf';
  }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  if (rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  if (rawUrl.startsWith('/api/') || rawUrl.startsWith('/media/')) {
    return getApiUrl(rawUrl);
  }
  return rawUrl;
};
