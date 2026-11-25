import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../apiConfig';

const AuthContext = createContext();

const parseJwtPayload = (jwt) => {
  try {
    const part = jwt.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (_) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('muthu_admin_jwt'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('muthu_admin_jwt_refresh'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipNextVerifyRef = useRef(false);

  // Check auth state on mount or external token change
  useEffect(() => {
    if (skipNextVerifyRef.current) {
      skipNextVerifyRef.current = false;
      setLoading(false);
      return;
    }

    const verifyAuth = async () => {
      let currentToken = token || localStorage.getItem('muthu_admin_jwt');
      const currentRefresh = refreshToken || localStorage.getItem('muthu_admin_jwt_refresh');

      if (!currentToken && !currentRefresh) {
        setLoading(false);
        return;
      }

      const doRefresh = async () => {
        if (!currentRefresh) return null;
        try {
          const rfRes = await fetch(getApiUrl('/api/auth/token/refresh/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: currentRefresh })
          });
          if (rfRes.ok) {
            const data = await rfRes.json();
            if (data.access) {
              localStorage.setItem('muthu_admin_jwt', data.access);
              skipNextVerifyRef.current = true;
              setToken(data.access);
              return data.access;
            }
          }
        } catch (e) {
          console.warn('Silent refresh error:', e);
        }
        return null;
      };

      try {
        let res = null;
        if (currentToken) {
          res = await fetch(getApiUrl('/api/auth/me/'), {
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
        }

        // If no token or token expired (401), try refreshing
        if (!res || res.status === 401) {
          const newAccess = await doRefresh();
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
            if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
              setUser({ username: payload.username || 'admin', offlineFallback: true });
            }
          }
        } else if (res && (res.status === 401 || res.status === 403)) {
          // Explicit auth rejection after refresh attempt — sign out
          localStorage.removeItem('muthu_admin_jwt');
          localStorage.removeItem('muthu_admin_jwt_refresh');
          setToken(null);
          setRefreshToken(null);
          setUser(null);
        } else {
          // Network or 5xx while backend sleeps — preserve valid unexpired session
          const payload = currentToken ? parseJwtPayload(currentToken) : null;
          if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
            setUser({ username: payload.username || 'admin', offlineFallback: true });
          }
        }
      } catch (err) {
        console.warn('Auth verification deferred (backend waking up/offline):', err);
        const payload = currentToken ? parseJwtPayload(currentToken) : null;
        if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
          setUser({ username: payload.username || 'admin', offlineFallback: true });
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
      localStorage.setItem('muthu_admin_jwt', data.access);
      localStorage.setItem('muthu_admin_jwt_refresh', data.refresh);
      skipNextVerifyRef.current = true;
      setToken(data.access);
      setRefreshToken(data.refresh);
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
    if (token && refreshToken) {
      try {
        await fetch(getApiUrl('/api/auth/logout/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refresh: refreshToken })
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }

    localStorage.removeItem('muthu_admin_jwt');
    localStorage.removeItem('muthu_admin_jwt_refresh');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const changeCredentials = async (newUsername, currentPassword, newPassword) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/change-credentials/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        localStorage.setItem('muthu_admin_jwt', data.access);
        localStorage.setItem('muthu_admin_jwt_refresh', data.refresh);
        setToken(data.access);
        setRefreshToken(data.refresh);
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

