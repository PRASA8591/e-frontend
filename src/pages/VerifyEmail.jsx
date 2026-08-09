import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const { verifyEmail, resendVerification, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email passed via navigation state or default to state
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Redirect if user is already verified and logged in
  useEffect(() => {
    if (user && user.isVerified) {
      if (user.role === 'admin' || user.role === 'manager') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please re-enter your email.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    const result = await verifyEmail(email, code);
    setSubmitting(false);

    if (result.success) {
      setSuccess(result.message || 'Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setError('');
    setSuccess('');
    setResending(true);

    const result = await resendVerification(email);
    setResending(false);

    if (result.success) {
      setSuccess(result.message || 'Verification code resent!');
      setTimer(60);
      setCanResend(false);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center p-4 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-8 text-center flex flex-col items-center">
        
        {/* Email Icon */}
        <div className="w-16 h-16 bg-prasatek-light dark:bg-slate-800 rounded-full flex items-center justify-center text-prasatek-primary mb-4 shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Verify Your Email</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-sm font-bold text-prasatek-primary mb-6 break-all">
          {email || 'your email address'}
        </p>

        {/* Email Input Field fallback if not provided */}
        {!location.state?.email && (
          <div className="w-full mb-4 text-left">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none transition"
              required
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* OTP Input Grid */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-prasatek-light dark:bg-slate-800 border-2 border-transparent focus:border-prasatek-primary focus:bg-white dark:focus:bg-slate-900 text-center text-xl font-bold text-slate-900 dark:text-white rounded-xl outline-none transition shadow-sm"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </p>
          )}

          {success && (
            <p className="text-prasatek-primary text-xs font-medium bg-green-50 dark:bg-green-950/40 p-3 rounded-xl border border-green-100 dark:border-green-900/50">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-bold rounded-xl py-3.5 transition flex justify-center items-center shadow-lg cursor-pointer"
          >
            <span>{submitting ? 'VERIFYING...' : 'VERIFY CODE'}</span>
          </button>
        </form>

        {/* Resend Code Section */}
        <div className="mt-6 text-xs text-gray-500 dark:text-slate-400 font-medium flex flex-col items-center gap-2">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`font-bold transition ${
              canResend && !resending
                ? 'text-prasatek-primary hover:underline cursor-pointer'
                : 'text-gray-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {resending
              ? 'Sending...'
              : canResend
              ? 'Resend Verification Code'
              : `Resend code in ${timer}s`}
          </button>
        </div>

        {/* Back to Login */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 w-full text-center">
          <Link
            to="/"
            className="text-xs text-gray-400 dark:text-slate-500 font-semibold hover:text-prasatek-primary transition"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
