/**
 * Shared JWT silent rotation and idle-wake utilities.
 *
 * Uses a single-flight in-progress lock so concurrent 401 responses share one
 * /api/auth/token/refresh/ request and never replay a rotated refresh token.
 */
import { getApiUrl } from '../apiConfig';

export const ACCESS_TOKEN_KEY = 'muthu_admin_jwt';
export const REFRESH_TOKEN_KEY = 'muthu_admin_jwt_refresh';

export const AUTH_EVENTS = {
  TOKENS_UPDATED: 'muthu-auth-tokens-updated',
  SESSION_EXPIRED: 'muthu-auth-session-expired',
};

let inFlightRefresh = null;

export const parseJwtPayload = (jwt) => {
  try {
    if (!jwt || typeof jwt !== 'string') return null;
    const part = jwt.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (_) {
    return null;
  }
};

export const isTokenUnexpired = (jwt) => {
  const payload = parseJwtPayload(jwt);
  return Boolean(payload && (!payload.exp || payload.exp * 1000 > Date.now()));
};

export const isTokenExpiringSoon = (jwt, bufferSeconds = 300) => {
  const payload = parseJwtPayload(jwt);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
};

export const persistAuthTokens = (access, refresh = null) => {
  try {
    if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } catch (_) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(AUTH_EVENTS.TOKENS_UPDATED, {
        detail: { access: access || null, refresh: refresh || null },
      })
    );
  }
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (_) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED));
  }
};

/**
 * Silently rotate the access (and rotated refresh) token via SimpleJWT.
 * Concurrent callers share a single request to avoid refresh-token blacklist races.
 */
export const rotateAccessToken = async () => {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    let currentRefresh = null;
    try {
      currentRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (_) {}

    if (!currentRefresh) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(getApiUrl('/api/auth/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: currentRefresh }),
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (res.ok && isJson) {
        const data = await res.json().catch(() => null);
        if (data && data.access) {
          persistAuthTokens(data.access, data.refresh || currentRefresh);
          return data.access;
        }
      }

      if (res.status === 401 || res.status === 403) {
        clearAuthTokens();
        return null;
      }
    } catch (err) {
      console.warn('Silent token rotation deferred:', err);
    } finally {
      clearTimeout(timeoutId);
      inFlightRefresh = null;
    }

    return null;
  })();

  return inFlightRefresh;
};
