import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { APP_NAME } from '../config';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const { adminLogin, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl space-y-8">

        <div className="text-center">
          <div className="inline-flex bg-ucp-blue text-white p-3.5 rounded-2xl mb-4 shadow-md">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Admin Login</h2>
          <p className="text-sm font-semibold text-slate-400 mt-2">
            {APP_NAME} — Administrator access only
          </p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 p-4 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-bold leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="admin@ucp"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full py-3.5 bg-ucp-blue text-white rounded-xl text-base font-extrabold shadow-md hover:bg-ucp-dark disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          This portal is for administrators only. No registration available.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
