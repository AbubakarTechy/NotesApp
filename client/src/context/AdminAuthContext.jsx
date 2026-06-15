import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';

const AdminAuthContext = createContext(null);

const ADMIN_TOKEN_KEY = 'campusnotes_admin_token';
const ADMIN_USER_KEY = 'campusnotes_admin_user';

const storeAdminAuth = (token, user) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedAdmin = localStorage.getItem(ADMIN_USER_KEY);

    if (storedToken && storedAdmin) {
      setAdminToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const adminLogin = async (username, password) => {
    const response = await fetch(`${API_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Admin login failed.');
    }

    setAdminToken(data.token);
    setAdmin(data.user);
    storeAdminAuth(data.token, data.user);

    return data.user;
  };

  const adminLogout = () => {
    setAdminToken(null);
    setAdmin(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  };

  const adminFetch = async (url, options = {}) => {
    const headers = { ...options.headers };

    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      adminLogout();
    }

    return res;
  };

  const value = {
    admin,
    adminToken,
    isAdminAuthenticated: !!adminToken,
    loading,
    adminLogin,
    adminLogout,
    adminFetch
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
