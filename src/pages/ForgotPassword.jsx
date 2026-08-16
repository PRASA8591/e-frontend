import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1: Email, Step 2: Code Verification, Step 3: Reset Password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Request 6-digit OTP
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSuccess(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/verify-reset-code', { email, code });
      setSuccess(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password & Redirect to Login
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password-with-code', {
        email,
        code,
        newPassword
      });

      setSuccess(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-prasatek-primary selection:text-white">
      <div className="w-full max-w-md bg-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <button
            onClick={() => navigate('/login')}
            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer absolute left-6 top-6"
            title="Back to Login"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="w-14 h-14 bg-prasatek-primary/20 text-prasatek-primary rounded-2xl flex items-center justify-center mx-auto border border-prasatek-primary/30">
            <KeyRound className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight pt-2">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify Email Code' : 'Create New Password'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto">
            {step === 1 ? 'Enter your manually registered email address to receive a 6-digit verification code.' :
             step === 2 ? `Enter the 6-digit verification code sent to ${email}.` :
             'Enter a new password for your Prasatek account.'}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-prasatek-primary' : 'w-3 bg-slate-800'}`}></div>
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-prasatek-primary' : 'w-3 bg-slate-800'}`}></div>
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'w-8 bg-prasatek-primary' : 'w-3 bg-slate-800'}`}></div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl text-red-400 text-xs font-semibold flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 p-3.5 rounded-2xl text-green-400 text-xs font-semibold flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-prasatek-primary shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl pl-10 pr-4 py-3 border border-slate-800 outline-none focus:border-prasatek-primary transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: Enter Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">6-Digit Verification Code</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900 text-white text-base font-extrabold tracking-widest text-center rounded-xl py-3 border border-slate-800 outline-none focus:border-prasatek-primary transition"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-900 hover:bg-slate-800 font-extrabold text-xs py-3.5 rounded-xl transition cursor-pointer text-slate-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">New Password (min 6 characters)</label>
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl pl-4 pr-11 py-3 border border-slate-800 outline-none focus:border-prasatek-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Confirm New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl pl-4 pr-11 py-3 border border-slate-800 outline-none focus:border-prasatek-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-prasatek-primary transition">
            Remember your password? Return to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
