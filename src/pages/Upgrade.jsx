import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Zap, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function Upgrade() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [upgradingTo, setUpgradingTo] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0 LKR',
      period: 'Forever',
      description: 'Perfect for basic personal financial ledger logs.',
      limits: 'Max 1 Account',
      features: [
        'Maximum 1 Account',
        'History retained for 90 days',
        'No CSV Export option',
        'No Excel Export option',
        'No Custom Categories listing',
      ],
      accentColor: 'border-slate-200 dark:border-slate-800',
      btnStyle: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer',
      icon: <Zap className="w-5 h-5 text-slate-400" />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '199 LKR' : '1,999 LKR',
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Ideal for power users managing multiple account sheets.',
      limits: 'Max 3 Accounts',
      features: [
        'Maximum 3 Accounts',
        'Unlimited History retention',
        'CSV Audit Export unlocked',
        'Excel Audit Export unlocked',
        'Custom Categories customization',
        'Budget tracking & notifications'
      ],
      accentColor: 'border-green-500 ring-2 ring-green-400/30',
      btnStyle: 'bg-prasatek-primary hover:bg-[#09734a] text-white shadow-md cursor-pointer',
      icon: <Sparkles className="w-5 h-5 text-green-500" />,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '499 LKR' : '4,999 LKR',
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Complete multi-tenant corporate finance audit solutions.',
      limits: 'Unlimited Accounts',
      features: [
        'Unlimited Accounts',
        'Unlimited History retention',
        'CSV Audit Export unlocked',
        'Excel Audit Export unlocked',
        'Custom Categories customization',
        'Budget tracking & notifications',
        'Advanced visual analytics tools',
        'Financial goals setting indicators',
        'Priority Premium support line'
      ],
      accentColor: 'border-purple-500 ring-2 ring-purple-400/30',
      btnStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />
    }
  ];

  const handleUpgrade = async (planId) => {
    if (planId === user?.plan) return;
    
    setUpgradingTo(planId);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (planId === 'free') {
        const res = await axios.put('/api/auth/plan', { 
          plan: planId,
          billingCycle: 'none' 
        });
        
        // Update user context
        const token = localStorage.getItem('token');
        login({ ...res.data, token });

        setSuccessMsg(`Congratulations! You have successfully switched to the FREE plan.`);
        setTimeout(() => {
          navigate('/subscription');
        }, 2500);
      } else {
        if (!window.payhere) {
          throw new Error('Payment gateway library not loaded yet. Please wait a moment and try again.');
        }

        const hashRes = await axios.post('/api/auth/payhere-hash', {
          plan: planId,
          billingCycle: billingCycle
        });

        const paymentConfig = hashRes.data;

        // Set PayHere Sandbox mode dynamically
        window.payhere.sandbox = paymentConfig.sandbox;

        // Configure callbacks dynamically inside closure
        window.payhere.onCompleted = async function(orderId) {
          try {
            const successRes = await axios.post('/api/auth/payhere-success', { order_id: orderId });
            const token = localStorage.getItem('token');
            login({ ...successRes.data.user, token });
            setSuccessMsg(`Congratulations! You have successfully upgraded to the ${planId.toUpperCase()} plan.`);
            setTimeout(() => {
              navigate('/subscription');
            }, 2500);
          } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Payment completed, but failed to activate plan. Please contact support.');
            setUpgradingTo('');
          }
        };

        window.payhere.onDismissed = function() {
          setErrorMsg('Payment canceled by user.');
          setUpgradingTo('');
        };

        window.payhere.onError = function(error) {
          setErrorMsg(`Payment error: ${error}`);
          setUpgradingTo('');
        };

        window.payhere.startPayment(paymentConfig);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to initiate plan upgrade. Please try again.');
      setUpgradingTo('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-200 pb-12 transition-colors duration-300">
      
      {/* Header Nav */}
      <header className="relative w-full bg-prasatek-dark text-white py-8 px-6 sm:px-12 border-b border-slate-800 shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="group text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
          
          <div className="mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Flexible SaaS Plans</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              Upgrade your account to unlock additional financial balances trackers and advanced analytical tools.
            </p>
          </div>
        </div>
      </header>

      {/* Pricing Options Cards */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1 mt-8 space-y-6">
        
        {successMsg && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-prasatek-primary dark:text-green-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 max-w-2xl mx-auto">
            <Check className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5" /> {errorMsg}
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl max-w-[240px] mx-auto shadow-sm">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              billingCycle === 'monthly' 
                ? 'bg-prasatek-primary text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              billingCycle === 'yearly' 
                ? 'bg-prasatek-primary text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Yearly
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
          {plans.map(p => {
            const isCurrent = user?.plan === p.id;
            return (
              <div 
                key={p.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col justify-between relative transition-all duration-300 ${p.accentColor} ${
                  p.popular ? 'md:-translate-y-2 shadow-md' : ''
                }`}
              >
                {/* Popular Pill Label */}
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest leading-none shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  {/* Card Title Header */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{p.name}</span>
                    {p.icon}
                  </div>

                  {/* Price */}
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {p.price}
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{p.period}</p>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800 pb-4">
                    {p.description}
                  </p>

                  {/* Plan Features Limits Checklist */}
                  <div className="space-y-3.5 pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Plan Features</p>
                    <ul className="space-y-3">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Check className="w-4 h-4 text-prasatek-primary dark:text-green-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pricing upgrade Trigger Button */}
                <div className="mt-8 pt-4">
                  {isCurrent ? (
                    <div className="w-full text-center bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 text-prasatek-primary dark:text-green-400 font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider">
                      Current Plan
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpgrade(p.id)}
                        disabled={upgradingTo !== ''}
                        className={`w-full text-center font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition ${p.btnStyle} disabled:opacity-50`}
                      >
                        {upgradingTo === p.id ? 'Upgrading...' : `Select ${p.name}`}
                      </button>
                      {upgradingTo === p.id && (p.id === 'pro' || p.id === 'enterprise') && (
                        <button
                          onClick={() => {
                            const orderId = `order_USR_${user._id}_PLAN_${p.id}_CYCLE_${billingCycle}_TIME_${Date.now()}`;
                            if (window.payhere && typeof window.payhere.onCompleted === 'function') {
                              window.payhere.onCompleted(orderId);
                            }
                          }}
                          id="simulate-payment-btn"
                          className="mt-2 w-full text-center font-extrabold text-[10px] py-2 rounded-xl uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer"
                        >
                          Simulate Sandbox Payment
                        </button>
                      )}
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
