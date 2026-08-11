import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { AlertTriangle, Lock } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export default function Auth() {
  const { user, login, loginWithGoogle, register, updateMobile } = useAuth();
  const navigate = useNavigate();

  const [maintenanceActive, setMaintenanceActive] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get('/api/system/status');
        setMaintenanceActive(res.data.maintenanceMode);
      } catch (err) {
        console.error('System status check error:', err);
      }
    };
    checkStatus();
  }, []);

  const handleGoogleLoginCustom = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setSubmitting(true);
      const result = await loginWithGoogle(null, tokenResponse.access_token);
      setSubmitting(false);
      if (!result.success) {
        setError(result.message);
      } else if (result.requiresVerification) {
        navigate('/verify-email', { state: { email: result.email, message: result.message } });
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    }
  });

  const handleGoogleClick = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url: 'https://cash.prasatek.site/api/auth/google' });
      } catch (e) {
        window.open('https://cash.prasatek.site/api/auth/google', '_blank');
      }
    } else {
      handleGoogleLoginCustom();
    }
  };

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [newMobile, setNewMobile] = useState('');

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'manager') {
        navigate('/admin');
      } else if (!user.mobile || user.mobile.trim() === '') {
        setShowMobilePrompt(true);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (isLoginMode) {
      const result = await login(email, password);
      setSubmitting(false);
      if (!result.success) {
        if (result.requiresVerification) {
          navigate('/verify-email', { state: { email: result.email || email, message: result.message } });
        } else {
          setError(result.message);
        }
      }
    } else {
      if (!name || !mobile) {
        setError('Please fill in all fields');
        setSubmitting(false);
        return;
      }
      const result = await register(name, email, password, mobile);
      setSubmitting(false);
      if (result.success) {
        if (result.requiresVerification) {
          navigate('/verify-email', { state: { email: result.email || email, message: result.message } });
        } else {
          setSuccess('Registration successful! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } else {
        setError(result.message);
      }
    }
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!newMobile.trim()) return;
    setSubmitting(true);
    const result = await updateMobile(newMobile);
    setSubmitting(false);
    if (result.success) {
      setShowMobilePrompt(false);
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  if (showMobilePrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-prasatek-light rounded-full flex items-center justify-center text-prasatek-primary mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Complete Profile</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">Please enter a mobile number to secure your account details.</p>
          
          <form onSubmit={handleMobileSubmit} className="w-full space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Mobile Number</label>
              <input 
                type="tel" 
                required 
                placeholder="071XXXXXXX" 
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                className="w-full bg-prasatek-light text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none transition"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-bold rounded-xl py-3.5 transition flex justify-center items-center gap-2 shadow-lg mt-4"
            >
              <span>{submitting ? 'Saving...' : 'Save & Continue'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-6 px-4 bg-gray-50 text-slate-800">
      <div className="w-full max-w-[1400px] bg-white md:shadow-2xl md:rounded-[2rem] overflow-y-auto md:overflow-hidden min-h-[85vh] md:h-[95vh] relative border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left branding panel */}
        <div className="hidden md:flex md:w-1/2 bg-prasatek-light flex-col items-center justify-center p-12 border-r border-gray-100">
          <img src="/logo.png" alt="Prasatek Logo" className="h-32 mb-6 drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-center">
            ExpenseTracker <span className="text-prasatek-primary">Pro</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.25em] mt-3">Prasatek System Solutions</p>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-between items-center p-8 overflow-y-auto hide-scroll relative">
          <div className="max-w-md w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-6 md:hidden">
              <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-3" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                ExpenseTracker <span className="text-prasatek-primary">Pro</span>
              </h1>
            </div>

            {/* Maintenance Mode Banner Notice */}
            {maintenanceActive && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-left space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span>System Maintenance Active</span>
                </div>
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  The system is currently undergoing scheduled maintenance. Regular user logins are temporarily disabled. System administrators may log in below to access control tools.
                </p>
              </div>
            )}

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                {isLoginMode ? 'Sign in to access your financial dashboards' : 'Sign up for a free Prasatek account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-prasatek-light text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="071XXXXXXX"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-prasatek-light text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none transition"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-prasatek-light text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  {isLoginMode && (
                    <Link to="/forgot-password" className="text-[11px] font-extrabold text-prasatek-primary hover:underline">
                      Forgot?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-prasatek-light text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none transition"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-xl">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-semibold p-3 rounded-xl">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold rounded-xl py-3.5 shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            {/* Google OAuth Button */}
            {!maintenanceActive && (
              <div className="mt-4">
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or continue with</span></div>
                </div>

                <button
                  onClick={() => handleGoogleClick()}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 font-bold rounded-xl py-3 flex items-center justify-center gap-3 transition shadow-sm cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs text-gray-500 font-bold hover:text-prasatek-primary transition cursor-pointer"
              >
                {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>

          <div className="text-center mt-6 space-y-1.5">
            <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase text-slate-500 tracking-[0.15em]">
              <Link to="/privacy" className="hover:text-prasatek-primary transition">PRIVACY</Link>
              <span className="text-slate-300 font-normal">|</span>
              <Link to="/terms" className="hover:text-prasatek-primary transition">TERMS</Link>
              <span className="text-slate-300 font-normal">|</span>
              <Link to="/contact" className="hover:text-prasatek-primary transition">CONTACT</Link>
            </div>
            
            <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-[0.2em]">
              A PRODUCT BY PRASATEK SYSTEM SOLUTIONS
            </p>

            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-center gap-2">
              <a href="https://www.prasatek.lk" target="_blank" rel="noreferrer" className="hover:text-prasatek-primary transition">WWW.PRASATEK.LK</a>
              <span className="text-slate-300 font-normal">|</span>
              <a href="mailto:info@prasatek.lk" className="hover:text-prasatek-primary transition">INFO@PRASATEK.LK</a>
              <span className="text-slate-300 font-normal">|</span>
              <a href="tel:0719323239" className="hover:text-prasatek-primary transition">0719323239</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
