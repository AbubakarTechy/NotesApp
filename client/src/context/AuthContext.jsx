import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

const TOKEN_KEY = 'campusnotes_token';
const USER_KEY = 'campusnotes_user';

const storeAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem('ucpian_token');
  localStorage.removeItem('ucpian_user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('ucpian_token');
    const storedUser = localStorage.getItem(USER_KEY) || localStorage.getItem('ucpian_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      refreshProfile(storedToken);
    }
    setLoading(false);
  }, []);

  const refreshProfile = async (activeToken = token) => {
    const currentToken = activeToken || token;
    if (!currentToken) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user profile from backend:', error);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setToken(data.token);
      setUser(data.user);
      storeAuth(data.token, data.user);

      return data.user;
    } catch (error) {
      console.error('Auth context register error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      setToken(data.token);
      setUser(data.user);
      storeAuth(data.token, data.user);

      return data.user;
    } catch (error) {
      console.error('Auth context login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed.');
      }

      setToken(data.token);
      setUser(data.user);
      storeAuth(data.token, data.user);

      return data.user;
    } catch (error) {
      console.error('Auth context Google login error:', error);
      throw error;
    }
  };

  const upgradeUserPlan = async (newPlan) => {
    if (!token) throw new Error('You must be logged in to upgrade your plan.');

    try {
      const response = await fetch(`${API_URL}/api/auth/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: newPlan })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upgrade plan.');
      }

      setToken(data.token);
      setUser(data.user);
      storeAuth(data.token, data.user);

      return data.message;
    } catch (error) {
      console.error('Auth context upgrade error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('ucpian_token');
    localStorage.removeItem('ucpian_user');
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      ...options.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers
    });

    if (res.status === 401) {
      logout();
    }

    return res;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    upgradeUserPlan,
    refreshProfile,
    authFetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
