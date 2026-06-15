import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle } from 'lucide-react';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await register(trimmedName, trimmedEmail, password);
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative z-10 space-y-8">

        <div className="text-center">
          <div className="inline-flex bg-ucp-blue text-ucp-gold p-3.5 rounded-2xl mb-4 shadow-md">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">Create Account</h2>
          <p className="text-sm font-semibold text-slate-400 mt-2">
            Register to upload and share study materials with your classmates
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-bold leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 w-full py-3.5 bg-ucp-blue text-white rounded-xl text-base font-extrabold shadow-md hover:bg-ucp-dark hover:shadow-lg active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">or</span>
          </div>
        </div>

        <GoogleLoginButton
          text="signup_with"
          onSuccess={() => navigate('/')}
          onError={(msg) => setError(msg)}
        />

        <p className="text-center text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-ucp-blue font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
