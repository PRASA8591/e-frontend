import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Activity, 
  CheckCircle, 
  CreditCard, 
  Database, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export default function Usage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [accountsCount, setAccountsCount] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        const [accRes, txRes] = await Promise.all([
          axios.get('/api/accounts'),
          axios.get('/api/transactions')
        ]);
        setAccountsCount(accRes.data.length);
        setTxCount(txRes.data.length);
      } catch (err) {
        console.error('Error fetching usage stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsageStats();
  }, []);

  const getPlanLimitDetails = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return {
          maxAccts: Infinity,
          maxAcctsStr: 'Unlimited',
          history: 'Unlimited retention',
          analytics: 'Advanced Analytics Included'
        };
      case 'pro':
        return {
          maxAccts: 3,
          maxAcctsStr: '3 Accounts',
          history: 'Unlimited retention',
          analytics: 'Basic Analytics'
        };
      default:
        return {
          maxAccts: 1,
          maxAcctsStr: '1 Account',
          history: '90 Days Retention',
          analytics: 'Basic Analytics'
        };
    }
  };

  const limits = getPlanLimitDetails(user?.plan);
  const acctsRemaining = limits.maxAccts === Infinity 
    ? 'Unlimited' 
    : Math.max(0, limits.maxAccts - accountsCount);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-200 pb-12 transition-colors duration-300">
      
      {/* Header Nav */}
      <header className="relative w-full bg-prasatek-dark text-white py-8 px-6 sm:px-12 border-b border-slate-800 shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="group text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
          
          <div className="mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Usage & Account Limits</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              View your account ledger allocations, transaction counts, and subscription parameters.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1 mt-8 space-y-6">
        
        {/* Plan Summary Row Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Active plan card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 text-prasatek-primary dark:text-green-400 rounded-xl shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Plan</p>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 uppercase">{user?.plan || 'Free'}</h3>
            </div>
          </div>

          {/* Accounts Count card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Accounts Created</p>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {loading ? '...' : `${accountsCount} / ${limits.maxAcctsStr}`}
              </h3>
            </div>
          </div>

          {/* Transactions logged card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Logged Records</p>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                {loading ? '...' : `${txCount} Entries`}
              </h3>
            </div>
          </div>

        </div>

        {/* Detailed limits parameters tables */}
        <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-prasatek-primary dark:text-green-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-sans">Active Limits Meter</h2>
          </div>

          <div className="space-y-5">
            {/* Account progress */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Ledger Accounts Limit</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Maximum number of concurrent ledger lists you can manage.</p>
                </div>
                <span className="text-xs font-extrabold text-prasatek-primary dark:text-green-400">
                  {accountsCount} / {limits.maxAcctsStr}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-2 rounded-full bg-prasatek-primary dark:bg-green-500 transition-all duration-500"
                  style={{ width: `${limits.maxAccts === Infinity ? 0 : (accountsCount / limits.maxAccts) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                <span>Remaining: {acctsRemaining}</span>
                <span>Max: {limits.maxAcctsStr}</span>
              </div>
            </div>

            {/* History retention progress */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">History Retention Window</h4>
              <p className="text-[10px] font-semibold text-slate-400 leading-normal">
                {user?.plan === 'free' 
                  ? 'Your transaction records are deleted automatically after 90 days of storage to save database pool index limits.' 
                  : 'Your transaction records are preserved indefinitely. No background deletions apply.'
                }
              </p>
              <div className="pt-2 flex justify-between text-xs font-extrabold">
                <span className="text-slate-400">Allowed Time Window:</span>
                <span className="text-slate-800 dark:text-slate-200">{limits.history}</span>
              </div>
            </div>

            {/* Analytics unlock status */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Analytical Tools Unlocked</h4>
              <p className="text-[10px] font-semibold text-slate-400 leading-normal text-justify">
                {user?.plan === 'enterprise' 
                  ? 'Premium analytic graphs, goals monitoring boards, and audit log exports are fully unlocked for this account.'
                  : user?.plan === 'pro'
                    ? 'Audit log exports (CSV/Excel) and basic analytical graphs are unlocked. Upgrade to Enterprise to gain Goals monitors.'
                    : 'Basic transaction log history lists are unlocked. Audit log exports are locked. Upgrade to Pro/Enterprise to download logs.'
                }
              </p>
            </div>
          </div>

          {user?.plan !== 'enterprise' && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Upgrade to increase your constraints limit</span>
              <Link 
                to="/upgrade"
                className="bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-md hover:shadow-lg flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" /> View Pricing Options
              </Link>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
