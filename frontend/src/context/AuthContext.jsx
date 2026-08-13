import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('muthu_admin_jwt'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('muthu_admin_jwt_refresh'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      // Save tokens
      localStorage.setItem('muthu_admin_jwt', data.access);
      localStorage.setItem('muthu_admin_jwt_refresh', data.refresh);
      setToken(data.access);
      setRefreshToken(data.refresh);
      setUser(data.user);

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const logout = async () => {
    if (token && refreshToken) {
      try {
        await fetch('/api/auth/logout/', {
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
      const res = await fetch('/api/auth/change-credentials/', {
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
