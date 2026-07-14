import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Settings, 
  CreditCard, 
  Sparkles, 
  Activity, 
  Bell, 
  HelpCircle, 
  Shield, 
  LogOut, 
  X,
  ShieldCheck
} from 'lucide-react';

export default function ProfileSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const getPlanBadgeStyles = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40';
      case 'pro':
        return 'bg-green-100 dark:bg-green-950/40 text-prasatek-primary dark:text-green-400 border border-green-200 dark:border-green-800/40';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/60 transition-opacity" onClick={onClose}></div>

      {/* Sidebar Panel */}
      <div 
        ref={sidebarRef}
        className={`absolute top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } border-l border-slate-100 dark:border-slate-800`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <span className="font-extrabold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account Menu</span>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-prasatek-primary dark:border-green-500 bg-prasatek-light dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-prasatek-primary dark:text-green-400 font-extrabold text-xl">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-extrabold text-slate-800 dark:text-slate-100 text-base truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email}</p>
              <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mt-2 ${getPlanBadgeStyles(user?.plan)}`}>
                {user?.plan || 'Free'} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Links Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 hide-scroll">
          <Link 
            to="/settings" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition cursor-pointer"
          >
            <User className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0" />
            <span>My Profile / Account Settings</span>
          </Link>

          <Link 
            to="/settings" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0" />
            <span>Application Settings</span>
          </Link>

          <Link 
            to="/subscription" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0" />
            <span>My Subscription</span>
          </Link>

          <Link 
            to="/upgrade" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition cursor-pointer bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400 font-extrabold">Upgrade Plan / Pricing</span>
          </Link>

          <Link 
            to="/usage" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition cursor-pointer"
          >
            <Activity className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0" />
            <span>Usage & Account Limits</span>
          </Link>

          <Link 
            to="/contact" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0" />
            <span>Help & Customer Support</span>
          </Link>

          <Link 
            to="/privacy" 
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition cursor-pointer"
          >
            <Shield className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0" />
            <span>Privacy Policy</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 hover:text-red-700 dark:text-red-400 font-extrabold text-xs transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
