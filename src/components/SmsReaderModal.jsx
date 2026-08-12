import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Zap, CheckCircle2, AlertCircle, X, Sparkles, Building2, Tag, CreditCard, ArrowRight } from 'lucide-react';

const SMS_SAMPLES = [
  {
    label: 'ComBank Debit',
    text: 'ComBank Debit: LKR 4,500.00 spent at Cargills Food City Horana on 10-AUG-2026. Avail Bal: LKR 45,200.00'
  },
  {
    label: 'BOC Credit',
    text: 'BOC A/C 8018XXXX Credited LKR 35,000.00 on 10-AUG-2026. Salary payment received.'
  },
  {
    label: 'Sampath Fuel',
    text: 'Sampath Bank: Spent LKR 2,200.00 at CEYPETCO Fuel Station Horana on 09/08/2026.'
  },
  {
    label: 'eZ Cash Utility',
    text: 'eZ Cash: Paid LKR 1,850.00 for Dialog Mobile Bill Ref: 0771234567.'
  }
];

export default function SmsReaderModal({ isOpen, onClose, accounts = [], onTransactionAdded, triggerAlert }) {
  const [smsText, setSmsText] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [parsingError, setParsingError] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0]._id);
    }
  }, [accounts]);

  // Lock body scroll when modal is open
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

  // Live Auto-Parse on Text Change
  useEffect(() => {
    if (!smsText.trim()) {
      setParsedData(null);
      setParsingError('');
      return;
    }

    const timer = setTimeout(() => {
      handleLiveParse(smsText);
    }, 250);

    return () => clearTimeout(timer);
  }, [smsText]);

  const handleLiveParse = async (text) => {
    try {
      setParsingError('');
      const res = await axios.post('/api/transactions/preview-sms', { smsText: text });
      if (res.data.success && res.data.parsed) {
        setParsedData(res.data.parsed);
        setCustomCategory(res.data.parsed.category);
        setCustomDescription(res.data.parsed.description);
      }
    } catch (err) {
      setParsedData(null);
      setParsingError(err.response?.data?.message || 'Could not detect transaction amount from SMS.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!smsText.trim() || !parsedData) return;

    try {
      setSubmitting(true);
      const res = await axios.post('/api/transactions/parse-sms', {
        smsText,
        accountId: selectedAccountId || (accounts[0] && accounts[0]._id),
        customCategory,
        customDescription
      });

      if (res.data.success) {
        triggerAlert('Transaction Logged!', 'Bank SMS was successfully parsed and logged.', 'success');
        if (onTransactionAdded) onTransactionAdded();
        handleClose();
      }
    } catch (err) {
      triggerAlert('SMS Ingest Failed', err.response?.data?.message || 'Failed to log transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSmsText('');
    setParsedData(null);
    setParsingError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-prasatek-primary dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Automatic Bank SMS Reader
              <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-prasatek-primary dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3" /> Auto AI
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Paste any bank SMS or notification to automatically detect amount, type & log transactions.
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Click Quick Sample SMS to Test:
          </span>
          <div className="flex flex-wrap gap-2">
            {SMS_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSmsText(sample.text)}
                className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-prasatek-primary dark:hover:text-emerald-400 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* SMS Input Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Paste Bank SMS / Payment Notification Text
            </label>
            <textarea
              rows="3"
              placeholder="e.g. ComBank Debit: LKR 4,500.00 spent at Cargills Food City on 10-AUG-2026..."
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-prasatek-primary font-mono transition leading-relaxed"
            />
          </div>

          {/* Parsing Status / Error Banner */}
          {parsingError && smsText.trim() && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parsingError}</span>
            </div>
          )}

          {/* Live Extracted Transaction Card */}
          {parsedData && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-3">
                <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Live Smart Detection
                </span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${parsedData.type === 'add' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300'}`}>
                  {parsedData.type === 'add' ? '+ Income / Credit' : '- Expense / Debit'}
                </span>
              </div>

              {/* Amount & Merchant Hero Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Extracted Amount</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    LKR {parsedData.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Merchant / Bank</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {parsedData.merchant}
                  </span>
                </div>
              </div>

              {/* Customization Controls (Category & Account) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Target Account
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-prasatek-primary"
                  >
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-prasatek-primary"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary / Income">Salary / Income</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Description Note
                </label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-prasatek-primary"
                />
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !parsedData}
              className="flex-1 py-3 text-xs font-extrabold bg-prasatek-primary hover:bg-[#09734a] text-white rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Auto-Log Transaction
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
