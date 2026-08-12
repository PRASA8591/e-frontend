import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Zap, 
  AlertCircle,
  Building2,
  Copy,
  UploadCloud,
  FileText,
  X,
  Clock,
  Globe,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  FileCheck,
  Eye,
  ShieldCheck
} from 'lucide-react';

// Trilingual Terms & Conditions Text Content
const TERMS_CONTENT = {
  en: {
    title: "Bank Payment Guidelines & Terms of Service",
    step1Title: "1. Transfer Instructions",
    step1Text: "You can make payment via Cash Counter Deposit or Online Banking Transfer to our Official Commercial Bank Account.",
    step2Title: "2. Mandatory Transfer Remark",
    step2Text: "You MUST include the generated Order Reference ID (e.g. ORD-2026-XXXXX) in your bank deposit remark or reference field. Transfers without Order Reference may experience verification delays.",
    step3Title: "3. Proof Submission & Verification",
    step3Text: "Please upload a clear picture or PDF of your payment slip. Account activation is processed manually by our finance team within 1 to 12 hours.",
    agreeCheckbox: "I have read and agree to the payment terms and conditions."
  },
  si: {
    title: "බැංකු ගෙවීම් උපදෙස් සහ සේවා කොන්දේසි",
    step1Title: "1. මුදල් තැන්පතු උපදෙස්",
    step1Text: "ඔබට බැංකු ශාඛා කවුන්ටරයෙන් හෝ ඔන්ලයින් බෑන්කින් (Online Banking) හරහා අපගේ නිල කොමර්ෂල් බැංකු ගිණුමට මුදල් තැන්පත් කළ හැක.",
    step2Title: "2. අනිවාර්ය Order ID සටහන",
    step2Text: "මුදල් තැන්පත් කිරීමේදී හෝ Online Transfer එකෙහි Remark/Reference ස්ථානයේ පද්ධතිය මගින් ලබාදෙන Order ID (උදා: ORD-2026-XXXXX) සටහන් කිරීම අනිවාර්ය වේ.",
    step3Title: "3. රිසිට්පත සහ තහවුරු කිරීම",
    step3Text: "ගෙවීම් රිසිට්පතෙහි පැහැදිලි ඡායාරූපයක් හෝ PDF පතක් Upload කරන්න. අපගේ ගිණුම් අංශය මගින් පැය 1-12 ත් අතර කාලයකදී ගිණුම සක්‍රිය කරනු ලැබේ.",
    agreeCheckbox: "මම ඉහත ගෙවීම් කොන්දේසි සහ උපදෙස් කියවා එකඟ වෙමි."
  },
  ta: {
    title: "வங்கி கட்டண வழிகாட்டுதல்கள் & விதிமுறைகள்",
    step1Title: "1. கட்டண வழிமுறைகள்",
    step1Text: "வங்கி கிளை வைப்பு அல்லது ஆன்லைன் வங்கி மூலம் எங்கள் வணிக வங்கி கணக்கிற்கு பணத்தை செலுத்தலாம்.",
    step2Title: "2. கட்டாய Order ID குறிப்பு",
    step2Text: "பணம் செலுத்தும் போது உங்கள் Order ID (எ.கா. ORD-2026-XXXXX) குறிப்பில் உள்ளிடுவது கட்டாயமாகும்.",
    step3Title: "3. ரசீது பதிவேற்றம் & சரிபார்ப்பு",
    step3Text: "பணம் செலுத்திய ரசீதை பதிவேற்றவும். 1 முதல் 12 மணி நேரத்திற்குள் உங்கள் கணக்கு செயல்படுத்தப்படும்.",
    agreeCheckbox: "மேலே உள்ள கட்டண விதிமுறைகளை படித்து ஒப்புக்கொள்கிறேன்."
  }
};

export default function Upgrade() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Active Draft Order Banner State
  const [activeDraft, setActiveDraft] = useState(null);
  const [fetchingDraft, setFetchingDraft] = useState(true);

  // Step 1: Terms & Conditions Modal State
  const [tcModalOpen, setTcModalOpen] = useState(false);
  const [selectedPlanForTc, setSelectedPlanForTc] = useState(null);
  const [lang, setLang] = useState('en'); // 'en' | 'si' | 'ta'
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Step 2: Bank Deposit Modal State
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [copiedField, setCopiedField] = useState(''); // 'order' | 'accNo' | 'accName' | 'branch'
  const [uploadingProof, setUploadingProof] = useState(false);

  // Default Bank Details for Instant Display
  const defaultBankDetails = {
    bankName: 'Commercial Bank of Ceylon PLC',
    branch: 'Horana Branch',
    accountNo: '8018225859',
    accountName: 'NPP Indrajith',
    currency: 'LKR'
  };

  const isAnyModalOpen = tcModalOpen || bankModalOpen;

  useModalScrollLock(isAnyModalOpen);

  // Pricing Specifications
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0 LKR',
      period: 'Forever',
      description: 'Perfect for basic personal financial ledger logs.',
      features: [
        'Maximum 1 Account',
        'History retained for 90 days',
        'No CSV / Excel Export',
        'Standard Light/Dark themes'
      ],
      accentColor: 'border-slate-200 dark:border-slate-800',
      btnStyle: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer',
      icon: <Zap className="w-5 h-5 text-slate-400" />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '199 LKR' : '1,900 LKR',
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Ideal for power users managing multiple account sheets.',
      features: [
        'Maximum 3 Accounts',
        'Unlimited History retention',
        'CSV & Excel Audit Export',
        'Forest Emerald Theme Unlocked',
        'Custom Categories listing',
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
      price: billingCycle === 'monthly' ? '499 LKR' : '4,900 LKR',
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Complete multi-tenant corporate finance audit solutions.',
      features: [
        'Edit past transactions (Category, Remark, Value)',
        'Unlimited Accounts & Transactions',
        'Unlimited History retention',
        'CSV & Excel Audit Export',
        'All Visual Theme Packs Unlocked',
        'Bank SMS Auto-Logging Integration',
        'Priority Premium support line'
      ],
      accentColor: 'border-purple-500 ring-2 ring-purple-400/30',
      btnStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />
    }
  ];

  // Fetch active draft or pending order on mount
  const fetchActiveDraftOrder = async () => {
    setFetchingDraft(true);
    try {
      const res = await axios.get('/api/payments/active-draft');
      setActiveDraft(res.data);
    } catch (err) {
      console.error('Fetch draft error:', err);
    } finally {
      setFetchingDraft(false);
    }
  };

  useEffect(() => {
    fetchActiveDraftOrder();
  }, []);

  // Handle file selection with thumbnail preview
  const handleFileChange = (file) => {
    if (!file) return;
    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Step 1 Trigger: User Clicks "Buy Package"
  const handleStartBuyFlow = (planId) => {
    if (planId === user?.plan) return;

    if (planId === 'free') {
      handleSwitchFree();
      return;
    }

    setSelectedPlanForTc(planId);
    setTermsAgreed(false);
    setTcModalOpen(true);
  };

  // Downgrade to Free
  const handleSwitchFree = async () => {
    try {
      setLoading(true);
      const res = await axios.put('/api/auth/plan', { plan: 'free', billingCycle: 'none' });
      const token = localStorage.getItem('token');
      login({ ...res.data, token });
      setSuccessMsg('Successfully switched to Free plan.');
      setLoading(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to switch to Free plan.');
      setLoading(false);
    }
  };

  // Step 2 Trigger: User Agrees to T&C and Clicks "Continue to Payment"
  const handleProceedToPayment = async () => {
    if (!termsAgreed || !selectedPlanForTc) return;

    try {
      setLoading(true);
      setErrorMsg('');
      setTcModalOpen(false);

      const res = await axios.post('/api/payments/create-order', {
        plan: selectedPlanForTc,
        billingCycle: billingCycle,
        termsAgreed: true
      });

      setOrderData(res.data);
      setBankModalOpen(true);
      fetchActiveDraftOrder();
      setLoading(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate order reference.');
      setLoading(false);
    }
  };

  // Resume Draft Order from Banner
  const handleResumeDraft = (draft) => {
    setOrderData({
      orderId: draft.orderId,
      plan: draft.plan,
      billingCycle: draft.billingCycle,
      amount: draft.amount,
      currency: 'LKR',
      bankDetails: defaultBankDetails
    });
    setBankModalOpen(true);
  };

  // Cancel Draft Order
  const handleCancelDraft = async (draftId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/payments/cancel-order/${draftId}`);
      setActiveDraft(null);
      setSuccessMsg('Draft order cancelled successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel draft order.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Submit Payment Proof
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      setErrorMsg('Please select or upload a payment slip receipt file.');
      return;
    }

    try {
      setUploadingProof(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('orderId', orderData.orderId);
      formData.append('plan', orderData.plan);
      formData.append('billingCycle', orderData.billingCycle);
      formData.append('userNotes', userNotes);
      formData.append('receipt', receiptFile);

      const res = await axios.post('/api/payments/upload-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const token = localStorage.getItem('token');
      login({ ...user, pendingPlan: orderData.plan, token });

      setUploadingProof(false);
      setBankModalOpen(false);
      setSuccessMsg('Payment proof submitted successfully! Your order status is now Pending Admin Verification.');
      fetchActiveDraftOrder();

      setTimeout(() => {
        navigate('/subscription');
      }, 2500);
    } catch (err) {
      setUploadingProof(false);
      setErrorMsg(err.response?.data?.message || 'Failed to upload payment slip proof.');
    }
  };

  const currentBankDetails = orderData?.bankDetails || defaultBankDetails;

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
            <h1 className="text-3xl font-extrabold tracking-tight">Subscription Packages & Pricing</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              Select your subscription package. Complete your deposit via Direct Bank Transfer or Online Banking.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1 mt-8 space-y-6">
        
        {/* Step 3: Persistent Draft Order Banner ("Pay Later" Feature) */}
        {activeDraft && activeDraft.status === 'draft' && (
          <div className="bg-gradient-to-r from-slate-900 via-prasatek-dark to-slate-900 text-white p-5 rounded-3xl border border-blue-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                <Clock className="w-6 h-6 animate-pulse text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase bg-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/40 tracking-wider">
                    Pending Draft Order
                  </span>
                  <span className="text-xs font-mono font-bold text-green-400">{activeDraft.orderId}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  Plan: <strong className="uppercase text-white">{activeDraft.plan}</strong> ({activeDraft.billingCycle}) — <strong className="text-green-400">LKR {activeDraft.amount?.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResumeDraft(activeDraft)}
                className="px-4 py-2.5 bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" /> Resume & Upload Slip
              </button>
              <button
                onClick={() => handleCancelDraft(activeDraft._id)}
                className="px-3.5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 transition cursor-pointer"
              >
                Cancel Order
              </button>
            </div>
          </div>
        )}

        {/* Pending Approval Banner */}
        {user?.pendingPlan && user?.pendingPlan !== 'none' && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-5 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-300">
            <Clock className="w-6 h-6 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wide">Payment Proof Under Admin Review</h4>
              <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
                Your payment slip for the <strong>{user.pendingPlan.toUpperCase()}</strong> plan is currently pending verification by Admin. Your package will activate automatically upon approval.
              </p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-prasatek-primary dark:text-green-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 max-w-2xl mx-auto">
            <Check className="w-5 h-5 shrink-0" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
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

        {/* Pricing Cards */}
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
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest leading-none shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{p.name}</span>
                    {p.icon}
                  </div>

                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {p.price}
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{p.period}</p>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed border-b border-slate-100 dark:border-slate-800 pb-4">
                    {p.description}
                  </p>

                  <div className="space-y-3.5 pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Included Features</p>
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

                <div className="mt-8 pt-4">
                  {isCurrent ? (
                    <div className="w-full text-center bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 text-prasatek-primary dark:text-green-400 font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider">
                      Current Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartBuyFlow(p.id)}
                      disabled={loading}
                      className={`w-full text-center font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition ${p.btnStyle} disabled:opacity-50`}
                    >
                      {loading ? 'Processing...' : p.id === 'free' ? 'Select Free' : 'Buy Package'}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* STEP 1: Trilingual Terms & Conditions Agreement Modal */}
      {tcModalOpen && selectedPlanForTc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4">
          <div className="modal-content-container relative max-h-[85vh] w-[90%] max-w-xl overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 touch-auto">
            
            <button 
              onClick={() => setTcModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Language Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-prasatek-primary dark:text-green-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Language:</span>
              </div>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                    lang === 'en' ? 'bg-prasatek-primary text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  English (EN)
                </button>
                <button
                  type="button"
                  onClick={() => setLang('si')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                    lang === 'si' ? 'bg-prasatek-primary text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  සිංහල (SI)
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ta')}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                    lang === 'ta' ? 'bg-prasatek-primary text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  தமிழ் (TA)
                </button>
              </div>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
              {TERMS_CONTENT[lang].title}
            </h3>

            {/* Guidelines List */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
              <div>
                <h4 className="font-extrabold text-prasatek-primary dark:text-green-400">{TERMS_CONTENT[lang].step1Title}</h4>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">{TERMS_CONTENT[lang].step1Text}</p>
              </div>
              <div>
                <h4 className="font-extrabold text-amber-600 dark:text-amber-400">{TERMS_CONTENT[lang].step2Title}</h4>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">{TERMS_CONTENT[lang].step2Text}</p>
              </div>
              <div>
                <h4 className="font-extrabold text-blue-600 dark:text-blue-400">{TERMS_CONTENT[lang].step3Title}</h4>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">{TERMS_CONTENT[lang].step3Text}</p>
              </div>
            </div>

            {/* Mandatory Checkbox */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label 
                onClick={() => setTermsAgreed(!termsAgreed)}
                className="flex items-start gap-3 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 select-none"
              >
                <div className="mt-0.5">
                  {termsAgreed ? (
                    <CheckSquare className="w-5 h-5 text-prasatek-primary dark:text-green-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <span>{TERMS_CONTENT[lang].agreeCheckbox}</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setTcModalOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={!termsAgreed || loading}
                className="flex-1 py-3 text-xs font-extrabold bg-prasatek-primary hover:bg-[#09734a] text-white rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? 'Generating Order...' : 'Continue to Payment'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: Clean, User-Friendly Bank Account & Deposit Modal */}
      {bankModalOpen && orderData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4">
          <div className="modal-content-container relative max-h-[85vh] w-[90%] max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5 touch-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setBankModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-prasatek-primary dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Bank Deposit & Order Summary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Package: <strong className="uppercase text-prasatek-primary dark:text-green-400">{orderData.plan}</strong> ({orderData.billingCycle}) — <strong className="text-slate-900 dark:text-white">LKR {orderData.amount?.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs font-semibold">
              
              {/* Order Reference Box (Big & Easy) */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">Your Order ID</span>
                  <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 font-mono tracking-wider">{orderData.orderId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(orderData.orderId, 'order')}
                  className="px-4 py-2 text-xs font-extrabold bg-prasatek-primary hover:bg-[#09734a] text-white rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedField === 'order' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedField === 'order' ? 'Copied ID!' : 'Copy Order ID'}
                </button>
              </div>

              {/* Bank Account Details Card (Super Clear Table Layout) */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Official Bank Deposit Details
                </p>

                {/* Bank Name */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Bank Name:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{currentBankDetails.bankName}</span>
                </div>

                {/* Branch */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Branch:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{currentBankDetails.branch}</span>
                </div>

                {/* Account Number (Highlighted & Easy Copy) */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Number</span>
                    <span className="text-base font-extrabold text-prasatek-primary dark:text-emerald-400 font-mono">{currentBankDetails.accountNo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentBankDetails.accountNo, 'accNo')}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedField === 'accNo' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'accNo' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Account Name */}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 dark:text-slate-400">Account Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">{currentBankDetails.accountName}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentBankDetails.accountName, 'accName')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 transition cursor-pointer"
                    >
                      {copiedField === 'accName' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Friendly Reminder Box */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Note:</strong> Please put <strong>{orderData.orderId}</strong> in your deposit remark or transfer description.
                </p>
              </div>

              {/* Upload Receipt File Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Upload Payment Receipt (JPG, PNG, PDF)
                </label>
                
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-prasatek-primary dark:hover:border-emerald-500 transition bg-slate-50/50 dark:bg-slate-800/30">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  
                  {receiptFile ? (
                    <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Receipt Slip" className="w-10 h-10 object-cover rounded-lg border shrink-0" />
                        ) : (
                          <FileCheck className="w-8 h-8 text-prasatek-primary shrink-0" />
                        )}
                        <div className="text-left truncate">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{receiptFile.name}</p>
                          <p className="text-[10px] text-slate-400">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptFile(null);
                          setPreviewUrl(null);
                        }}
                        className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition cursor-pointer"
                        title="Remove slip file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none py-1">
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Click or drag payment receipt here</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG, PDF up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional User Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Transfer Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Commercial Bank Online Transfer ref #19202"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-prasatek-primary"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Pay Later / Close
                </button>
                <button
                  type="submit"
                  disabled={uploadingProof || !receiptFile}
                  className="flex-1 py-3 text-xs font-extrabold bg-prasatek-primary hover:bg-[#09734a] text-white rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  {uploadingProof ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Payment Proof'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
