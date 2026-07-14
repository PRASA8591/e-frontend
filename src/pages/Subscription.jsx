import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  Activity, 
  CheckCircle, 
  Zap, 
  Sparkles, 
  Info,
  ChevronRight
} from 'lucide-react';

export default function Subscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accountCount, setAccountCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountsCount = async () => {
      try {
        const res = await axios.get('/api/accounts');
        setAccountCount(res.data.length);
      } catch (err) {
        console.error('Error fetching accounts count:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountsCount();
  }, []);

  const getPlanDetails = (plan, planType) => {
    const isYearly = planType?.toLowerCase() === 'yearly';
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return {
          title: 'Enterprise Plan',
          maxAccounts: 'Unlimited',
          history: 'Unlimited History',
          price: isYearly ? '4,999 LKR/yr' : '499 LKR/mo',
          features: ['Unlimited Accounts', 'Excel & CSV Export', 'Custom Categories', 'Budget Monitoring', 'Advanced Analytics', 'Financial Goals'],
          accentColor: 'text-purple-600 dark:text-purple-400',
          bgBadge: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40',
          maxAcctVal: Infinity
        };
      case 'pro':
        return {
          title: 'Pro Plan',
          maxAccounts: '3 Accounts',
          history: 'Unlimited History',
          price: isYearly ? '1,999 LKR/yr' : '199 LKR/mo',
          features: ['Up to 3 Accounts', 'Excel & CSV Export', 'Custom Categories', 'Budget Monitoring'],
          accentColor: 'text-green-600 dark:text-green-400',
          bgBadge: 'bg-green-100 dark:bg-green-950/40 text-prasatek-primary dark:text-green-400 border border-green-200 dark:border-green-800/40',
          maxAcctVal: 3
        };
      default:
        return {
          title: 'Free Plan',
          maxAccounts: '1 Account',
          history: '90 Days History',
          price: '0 LKR/mo',
          features: ['1 Account Limit', '90 Days History', 'Basic Analytics', 'Standard Categories'],
          accentColor: 'text-slate-500 dark:text-slate-400',
          bgBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
          maxAcctVal: 1
        };
    }
  };

  const planInfo = getPlanDetails(user?.plan, user?.planType);
  const spentPct = planInfo.maxAcctVal === Infinity 
    ? 0 
    : (accountCount / planInfo.maxAcctVal) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-200 pb-12 transition-colors duration-300">
      
      {/* Navigation Header */}
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
            <h1 className="text-3xl font-extrabold tracking-tight">My Subscription</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              Monitor your active subscription limits, transaction logs policies, and active pricing schedules.
            </p>
          </div>
        </div>
      </header>

      {/* Subscription Info Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1 mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Card: Active plan details */}
        <section className="md:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-prasatek-primary dark:text-green-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-sans">Active Subscription Details</h2>
              </div>
              <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${planInfo.bgBadge}`}>
                {user?.plan || 'Free'} Plan
              </span>
            </div>

            {/* Plan statistics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subscription Status</p>
                <p className="text-sm font-extrabold text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Active / Good Standing
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Data History Policy</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                  {planInfo.history}
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Plan Start Date</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> 
                  {user?.planStartDate ? new Date(user.planStartDate).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Plan Expiry Date</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {user?.planExpiryDate ? new Date(user.planExpiryDate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            {/* Account limits meter progress */}
            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Active Accounts Allocated</span>
                <span className="text-xs font-extrabold text-prasatek-primary dark:text-green-400">
                  {loading ? '...' : `${accountCount} / ${planInfo.maxAccounts}`}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-2.5 rounded-full bg-prasatek-primary dark:bg-green-500 transition-all duration-500" 
                  style={{ width: `${Math.min(spentPct, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {user?.plan !== 'enterprise' && (
            <Link 
              to="/upgrade"
              className="mt-8 bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer w-full text-center"
            >
              <Sparkles className="w-4 h-4" /> Upgrade My Plan
            </Link>
          )}
        </section>

        {/* Right Sidebar: Plan details specifications checklist */}
        <aside className="md:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
              <Zap className="w-4 h-4 text-amber-500" /> Active Plan Specifications
            </h2>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-normal">
              Below are the active features and limits unlocked by your subscription tier.
            </p>
            <ul className="space-y-3 pt-2">
              {planInfo.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50/50 dark:bg-slate-800/30 border border-blue-100/50 dark:border-slate-800 p-4 rounded-xl mt-6 flex items-start gap-2.5">
            <Info className="w-4.5 h-4.5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[10px] font-semibold text-blue-800/80 dark:text-slate-400 leading-relaxed">
              If your plan is close to expiry, system alerts will appear in your notification bell inbox.
            </p>
          </div>
        </aside>

      </main>
    </div>
  );
}
