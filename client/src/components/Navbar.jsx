import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { APP_NAME } from '../config';
import { BookOpen, Upload, LogOut, Menu, X, LogIn, Compass, Sparkles, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Compass },
    { name: 'Browse Notes', path: '/browse', icon: BookOpen },
    { name: 'Upload', path: '/upload', icon: Upload, requiresAuth: true },
    { name: 'Pricing', path: '/pricing', icon: Sparkles },
  ];

  if (isAdminAuthenticated) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard });
  }

  // Get user initials for profile avatar placeholder
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Plan badge styling colors
  const planBadgeColors = {
    Basic: 'bg-slate-100 text-slate-600 border-slate-200',
    Pro: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Ultra: 'bg-amber-50 text-amber-700 border-amber-200',
    Free: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-ucp-blue text-ucp-gold p-2 rounded-lg group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-ucp-blue">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-ucp-blue text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-ucp-blue'
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Button / Profile Details */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 bg-slate-50 p-1.5 pr-3 rounded-full border border-slate-200">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-ucp-blue"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-ucp-blue to-blue-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {getInitials(user?.name)}
                  </div>
                )}
                
                {/* User details and plan badge */}
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xs font-semibold text-slate-700 max-w-[90px] truncate" title={user?.name}>
                    {user?.name}
                  </span>
                  <span className={`text-[8px] font-extrabold uppercase mt-0.5 px-1.5 py-0.5 rounded border ${
                    planBadgeColors[user?.plan] || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {(user?.plan === 'Free' ? 'Basic' : user?.plan) || 'Basic'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-ucp-blue border border-ucp-blue hover:bg-blue-50 transition-all duration-200"
                >
                  <span>Register</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-ucp-blue hover:bg-ucp-dark hover:shadow-md active:scale-95 transition-all duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-ucp-blue hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-2 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            if (link.requiresAuth && !isAuthenticated) return null;
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold ${
                  isActive(link.path)
                    ? 'bg-ucp-blue text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-ucp-blue'
                }`}
              >
                <LinkIcon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          {/* Mobile Login / User Profile */}
          <div className="pt-4 pb-2 border-t border-slate-100 px-4">
            {isAuthenticated ? (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border border-ucp-blue"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-ucp-blue text-white flex items-center justify-center text-sm font-bold">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                        planBadgeColors[user?.plan] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {(user?.plan === 'Free' ? 'Basic' : user?.plan) || 'Basic'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold text-ucp-blue border border-ucp-blue hover:bg-blue-50 transition-all duration-200"
                >
                  <span>Register</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold text-white bg-ucp-blue hover:bg-ucp-dark transition-all duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
