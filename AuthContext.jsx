import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gym_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gym_token') || null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!user;
  const isOwner = user?.role === 'Owner' || user?.user_type === 'admin' && user?.role === 'Owner';
  const isReceptionist = user?.role === 'Receptionist';
  const isMember = user?.user_type === 'member';
  const isAdmin = user?.user_type === 'admin';

  const login = useCallback(async (username, password, loginType) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        login_type: loginType,
      });
      const data = response.data;
      setToken(data.access_token);
      const userData = {
        id: data.user_id,
        username: data.username,
        role: data.role,
        user_type: data.user_type,
      };
      setUser(userData);
      localStorage.setItem('gym_token', data.access_token);
      localStorage.setItem('gym_user', JSON.stringify(userData));
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isOwner,
    isReceptionist,
    isMember,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
