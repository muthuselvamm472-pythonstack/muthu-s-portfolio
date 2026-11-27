import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../apiConfig';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  AUTH_EVENTS,
  parseJwtPayload,
  isTokenUnexpired,
  isTokenExpiringSoon,
  persistAuthTokens,
  clearAuthTokens,
  rotateAccessToken,
} from '../utils/tokenRefresh';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipNextVerifyRef = useRef(false);

  // Sync React token state across silent rotations and proactively refresh on tab wake
  useEffect(() => {
    const handleTokensUpdated = (event) => {
      const { access, refresh } = event.detail || {};
      skipNextVerifyRef.current = true;
      if (access) setToken(access);
      if (refresh) setRefreshToken(refresh);
    };

    const handleSessionExpired = () => {
      skipNextVerifyRef.current = true;
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    };

    const handleWakeRefresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const currentRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!currentRefresh) return;
      const currentAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!currentAccess || isTokenExpiringSoon(currentAccess, 300)) {
        rotateAccessToken();
      }
    };

    window.addEventListener(AUTH_EVENTS.TOKENS_UPDATED, handleTokensUpdated);
    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
    document.addEventListener('visibilitychange', handleWakeRefresh);
    window.addEventListener('focus', handleWakeRefresh);

    return () => {
      window.removeEventListener(AUTH_EVENTS.TOKENS_UPDATED, handleTokensUpdated);
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
      document.removeEventListener('visibilitychange', handleWakeRefresh);
      window.removeEventListener('focus', handleWakeRefresh);
    };
  }, []);

  // Check auth state on mount or external token change
  useEffect(() => {
    if (skipNextVerifyRef.current) {
      skipNextVerifyRef.current = false;
      setLoading(false);
      return;
    }

    const verifyAuth = async () => {
      let currentToken = token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const currentRefresh = refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!currentToken && !currentRefresh) {
        setLoading(false);
        return;
      }

      try {
        let res = null;
        if (currentToken) {
          res = await fetch(getApiUrl('/api/auth/me/'), {
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
        }

        // If no token or token expired (401), rotate silently
        if (!res || res.status === 401) {
          const newAccess = await rotateAccessToken();
          if (newAccess) {
            currentToken = newAccess;
            res = await fetch(getApiUrl('/api/auth/me/'), {
              headers: { 'Authorization': `Bearer ${newAccess}` }
            });
          }
        }

        if (res && res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Unexpected HTML (e.g. Render cold start splash) — keep local session intact if token unexpired
            const payload = currentToken ? parseJwtPayload(currentToken) : null;
            if (isTokenUnexpired(currentToken)) {
              setUser({ username: payload?.username || 'admin', offlineFallback: true });
            }
          }
        } else if (res && (res.status === 401 || res.status === 403)) {
          // Explicit auth rejection after refresh attempt — sign out
          clearAuthTokens();
        } else {
          // Network or 5xx while backend sleeps — preserve valid unexpired session
          const payload = currentToken ? parseJwtPayload(currentToken) : null;
          if (isTokenUnexpired(currentToken)) {
            setUser({ username: payload?.username || 'admin', offlineFallback: true });
          }
        }
      } catch (err) {
        console.warn('Auth verification deferred (backend waking up/offline):', err);
        const payload = currentToken ? parseJwtPayload(currentToken) : null;
        if (isTokenUnexpired(currentToken)) {
          setUser({ username: payload?.username || 'admin', offlineFallback: true });
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token, refreshToken]);

  const login = async (username, password) => {
    try {
      const loginUrl = getApiUrl('/api/auth/login/');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for Render cold start

      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          error: 'Server returned non-JSON response. Please check server URL or wait 30s if backend is sleeping.'
        };
      }

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || data.detail || 'Invalid credentials' };
      }

      // Save tokens
      skipNextVerifyRef.current = true;
      persistAuthTokens(data.access, data.refresh);
      setUser(data.user);

      return { success: true };
    } catch (err) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          error: 'Server response timed out. Backend may be waking up from sleep, please try again in 15 seconds.'
        };
      }
      console.error('Login request error:', err);
      return {
        success: false,
        error: 'Unable to connect to backend server. If using Render, please wait 30 seconds for the backend to wake up and try again.'
      };
    }
  };

  const logout = async () => {
    const activeToken = token || localStorage.getItem(ACCESS_TOKEN_KEY);
    const activeRefresh = refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
    if (activeToken && activeRefresh) {
      try {
        await fetch(getApiUrl('/api/auth/logout/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({ refresh: activeRefresh })
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }

    clearAuthTokens();
  };

  const changeCredentials = async (newUsername, currentPassword, newPassword) => {
    const activeToken = token || localStorage.getItem(ACCESS_TOKEN_KEY);
    try {
      const res = await fetch(getApiUrl('/api/auth/change-credentials/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          new_username: newUsername,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: false, error: 'Server connection failed' };
      }

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update credentials' };
      }

      if (data.access && data.refresh) {
        skipNextVerifyRef.current = true;
        persistAuthTokens(data.access, data.refresh);
      }

      if (data.user) {
        setUser(data.user);
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        changeCredentials
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

