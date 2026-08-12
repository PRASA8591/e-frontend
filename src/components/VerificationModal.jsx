import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

export default function VerificationModal({ isOpen, onClose, email, onSuccess }) {
  const { verifyEmail, resendVerification } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useModalScrollLock(isOpen);

  // Auto-send verification code when modal opens
  useEffect(() => {
    if (isOpen && email) {
      handleResendCode(true); // Initial silent trigger or notification
    }
  }, [isOpen, email]);

  // Resend cooldown timer
  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

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

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    const result = await verifyEmail(email, code);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Email verified successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1200);
    } else {
      setError(result.message);
    }
  };

  const handleResendCode = async (isInitial = false) => {
    if (!email) return;
    if (!isInitial && !canResend) return;

    setError('');
    if (!isInitial) setResending(true);

    const result = await resendVerification(email);
    if (!isInitial) setResending(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Verification code sent to your email.');
      setTimer(60);
      setCanResend(false);
    } else if (!isInitial) {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4">
      <div className="modal-content-container scrollable-modal-content relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 text-center flex flex-col items-center touch-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Email Icon */}
        <div className="w-16 h-16 bg-prasatek-light dark:bg-slate-800 rounded-full flex items-center justify-center text-prasatek-primary mb-4 shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Email Verification</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">
          A 6-digit verification code was automatically sent to
        </p>
        <p className="text-sm font-bold text-prasatek-primary mb-6 break-all">
          {email}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* OTP Input Boxes */}
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

          {successMsg && (
            <p className="text-prasatek-primary text-xs font-medium bg-green-50 dark:bg-green-950/40 p-3 rounded-xl border border-green-100 dark:border-green-900/50">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-bold rounded-xl py-3.5 transition flex justify-center items-center shadow-lg cursor-pointer"
          >
            <span>{submitting ? 'VERIFYING...' : 'VERIFY & CONTINUE'}</span>
          </button>
        </form>

        {/* Resend Option */}
        <div className="mt-6 text-xs text-gray-500 dark:text-slate-400 font-medium flex flex-col items-center gap-1">
          <span>Didn't get the code?</span>
          <button
            type="button"
            onClick={() => handleResendCode(false)}
            disabled={!canResend || resending}
            className={`font-bold transition ${
              canResend && !resending
                ? 'text-prasatek-primary hover:underline cursor-pointer'
                : 'text-gray-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {resending
              ? 'Sending code...'
              : canResend
              ? 'Resend Verification Code'
              : `Resend code in ${timer}s`}
          </button>
        </div>

      </div>
    </div>
  );
}
