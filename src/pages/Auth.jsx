import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import Footer from '../components/Footer';

export default function Auth() {
  const { user, login, loginWithGoogle, register, updateMobile } = useAuth();
  const navigate = useNavigate();

  const [maintenanceActive, setMaintenanceActive] = useState(false);

  const hasPhone = (u) => {
    if (!u) return false;
    const phoneVal = u.phone ?? u.mobile ?? u.phoneNumber ?? u.mobileNumber ?? u.phone_number ?? u.tel;
    if (phoneVal === undefined || phoneVal === null) return false;
    const str = String(phoneVal).trim();
    return Boolean(str && str !== 'null' && str !== 'undefined');
  };

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

  // Initialize Native Google Auth
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        GoogleAuth.initialize({
          clientId: '40902555112-7p9ga25odid8onlj8ehtbmn3jclqfos5.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
      } catch (err) {
        console.warn('GoogleAuth init notice:', err);
      }
    }
  }, []);

  // Check URL token parameters on mount (for browser redirect / deep link fallback)
  useEffect(() => {
    const checkUrlToken = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const token = searchParams.get('token') || hashParams.get('token');

      if (token) {
        setSubmitting(true);
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data) {
            login({ ...res.data, token });
            if (hasPhone(res.data)) {
              setShowMobilePrompt(false);
              const role = res.data.role ? String(res.data.role).toLowerCase() : '';
              if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
                navigate('/admin', { replace: true });
              } else {
                navigate('/dashboard', { replace: true });
              }
            } else {
              setShowMobilePrompt(true);
            }
          }
        } catch (e) {
          console.error('Token URL param verification error:', e);
        } finally {
          setSubmitting(false);
        }
      }
    };
    checkUrlToken();
  }, [login, navigate]);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLoginCustom = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setGoogleLoading(true);
      try {
        const result = await loginWithGoogle(null, tokenResponse.access_token);
        if (!result || !result.success) {
          setError(result?.message || 'Google verification failed.');
        } else if (result.requiresVerification) {
          navigate('/verify-email', { state: { email: result.email, message: result.message } });
        } else {
          const activeUser = result.user || user;
          if (hasPhone(activeUser)) {
            setShowMobilePrompt(false);
            const role = activeUser?.role ? String(activeUser.role).toLowerCase() : '';
            if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } else {
            setShowMobilePrompt(true);
          }
        }
      } catch (authErr) {
        console.error('Google login processing error:', authErr);
        setError(authErr.response?.data?.message || authErr.message || 'Google authentication encountered an error.');
      } finally {
        setGoogleLoading(false);
        setSubmitting(false);
      }
    },
    onError: (err) => {
      console.warn('In-App Google authentication error:', err);
      setGoogleLoading(false);
      setSubmitting(false);
      if (err?.error && err.error !== 'popup_closed_by_user') {
        setError(`Google sign-in error: ${err.error_description || err.error}`);
      }
    },
    onNonOAuthError: (err) => {
      console.warn('Google non-OAuth error:', err);
      setGoogleLoading(false);
      setSubmitting(false);
    }
  });

  const handleGoogleClick = async () => {
    setError('');
    setGoogleLoading(true);

    let safetyTimer = null;
    try {
      // 10-second timeout safeguard to ensure the button NEVER hangs permanently
      const timeoutPromise = new Promise((_, reject) => {
        safetyTimer = setTimeout(() => {
          reject(new Error('GOOGLE_TIMEOUT'));
        }, 10000);
      });

      if (Capacitor.isNativePlatform()) {
        try {
          const nativeSignIn = (async () => {
            try {
              await GoogleAuth.initialize({
                clientId: '40902555112-7p9ga25odid8onlj8ehtbmn3jclqfos5.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
                grantOfflineAccess: true
              });
            } catch (initErr) {
              console.warn('[Native GoogleAuth] Init notice:', initErr);
            }
            return await GoogleAuth.signIn();
          })();

          const googleUser = await Promise.race([nativeSignIn, timeoutPromise]);
          const credential = googleUser?.authentication?.idToken || googleUser?.idToken;
          const accessToken = googleUser?.authentication?.accessToken || googleUser?.accessToken;
          const email = googleUser?.email;
          const name = googleUser?.name || googleUser?.givenName;
          const picture = googleUser?.imageUrl || googleUser?.picture;

          if (credential || accessToken || email) {
            const result = await loginWithGoogle({
              credential,
              idToken: credential,
              accessToken,
              email,
              name,
              picture
            });

            if (!result || !result.success) {
              setError(result?.message || 'Google verification failed.');
            } else if (result.requiresVerification) {
              navigate('/verify-email', { state: { email: result.email, message: result.message } });
            } else {
              const activeUser = result.user || user;
              if (hasPhone(activeUser)) {
                setShowMobilePrompt(false);
                const role = activeUser?.role ? String(activeUser.role).toLowerCase() : '';
                if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
                  navigate('/admin', { replace: true });
                } else {
                  navigate('/dashboard', { replace: true });
                }
              } else {
                setShowMobilePrompt(true);
              }
            }
            return;
          }
        } catch (nativeErr) {
          const errMsg = String(nativeErr?.message || nativeErr || '');
          const isUserCancelled = errMsg.includes('12501') || errMsg.includes('cancel') || errMsg.includes('USER_CANCELLED') || errMsg.includes('popup_closed');
          if (isUserCancelled) {
            return;
          }
          console.warn('[Native GoogleAuth] Fallback to in-app Web OAuth:', nativeErr);
          try {
            handleGoogleLoginCustom();
            setTimeout(() => {
              setGoogleLoading(false);
              setSubmitting(false);
            }, 10000);
          } catch (fbErr) {
            setError('Google sign-in could not be initiated. Please log in with Email and Password.');
          }
          return;
        }
      } else {
        // Standard Web Browser flow
        try {
          handleGoogleLoginCustom();
          setTimeout(() => {
            setGoogleLoading(false);
            setSubmitting(false);
          }, 10000);
        } catch (e) {
          setError('Failed to initiate Google sign-in.');
        }
      }
    } catch (outerErr) {
      if (outerErr?.message !== 'GOOGLE_TIMEOUT') {
        setError('Google sign-in was interrupted. Please try again.');
      }
    } finally {
      if (safetyTimer) clearTimeout(safetyTimer);
      setTimeout(() => {
        setGoogleLoading(false);
        setSubmitting(false);
      }, 500);
    }
  };

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [newMobile, setNewMobile] = useState('');

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user) {
      if (hasPhone(user)) {
        setShowMobilePrompt(false);
        const role = user.role ? String(user.role).toLowerCase() : '';
        if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setShowMobilePrompt(true);
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
      } else {
        const activeUser = result.user || user;
        if (hasPhone(activeUser)) {
          setShowMobilePrompt(false);
          const role = activeUser?.role ? String(activeUser.role).toLowerCase() : '';
          if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setShowMobilePrompt(true);
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
          const activeUser = result.user || user;
          const role = activeUser?.role ? String(activeUser.role).toLowerCase() : '';
          setTimeout(() => {
            if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }, 1000);
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
    setError('');
    const result = await updateMobile(newMobile.trim());
    setSubmitting(false);
    if (result && result.success) {
      setShowMobilePrompt(false);
      const activeUser = result.user || { ...(user || {}), mobile: newMobile.trim(), phone: newMobile.trim() };
      const role = activeUser?.role ? String(activeUser.role).toLowerCase() : '';
      if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(result?.message || 'Failed to update mobile number.');
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
              className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-bold rounded-xl py-3.5 transition flex justify-center items-center gap-2 shadow-lg mt-4 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save & Continue</span>
              )}
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
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                )}
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
                  disabled={submitting || googleLoading}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 font-bold rounded-xl py-3 flex items-center justify-center gap-3 transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-prasatek-primary rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  <span>{googleLoading ? 'Authenticating...' : 'Sign in with Google'}</span>
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

          <Footer />
        </div>

      </div>
    </div>
  );
}
