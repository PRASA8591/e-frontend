import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Coins, 
  AlertCircle, 
  ShieldAlert, 
  Search, 
  Printer, 
  Info,
  Clock,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en'); // 'en' or 'si'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('intro');

  const contentEN = useMemo(() => ({
    badge: 'Legal Framework',
    title: 'Terms of Service',
    desc: 'Please review the guidelines, obligations, and system calculation policies governing your ExpenseTracker Pro account.',
    updated: 'Last updated: July 14, 2026',
    activeVer: 'v2.1 (Active)',
    goBack: 'Go Back',
    printTerms: 'Print Terms',
    searchPlaceholder: 'Search terms keywords (e.g. License, Rupees, Accounts)...',
    clear: 'Clear',
    tableOfContents: 'Table of Contents',
    pillars: [
      { title: 'User Agreement', desc: 'Acceptance terms and usage limits', icon: FileText, color: 'bg-green-50 text-prasatek-primary' },
      { title: 'Ceylon Rupees', desc: 'All audit charts computed in LKR', icon: Coins, color: 'bg-blue-50 text-blue-600' },
      { title: 'Usage Obligations', desc: 'Account credentials confidentiality', icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
      { title: 'Disclaimers', desc: 'Calculations provided "as is"', icon: ShieldAlert, color: 'bg-red-50 text-red-600' }
    ],
    sections: [
      {
        id: 'intro',
        title: '1. Acceptance of Terms',
        content: 'By accessing or using the ExpenseTracker Pro dashboard, you represent that you have read, understood, and agree to be bound by these terms. If you are registering an enterprise profile on behalf of a team, group, or system branch, you verify that you possess the necessary authorization credentials. If you do not agree, you must immediately cease all system sessions.',
        badge: 'Agreement'
      },
      {
        id: 'obligations',
        title: '2. User Accounts & Security',
        content: 'To log transactions and ledgers, you must register a profile. You are solely responsible for maintaining the privacy of your account access credentials and passwords. Any transaction additions, account deletions, or backup imports executed under your session are treated as authorized procedures. If you detect unauthorized token activity, notify system support immediately.',
        badge: 'Account'
      },
      {
        id: 'currency',
        title: '3. Currency Audit & Calculations',
        content: 'All default analytical charts, budgets, and ledgers processed inside ExpenseTracker Pro are calculated and audited in Sri Lankan Rupees (RS). Multi-currency converters are supplied solely for display convenience, using mocked reference exchange rates. The system does not assume liability for discrepancies caused by exchange updates or local bank variations.',
        badge: 'Sri Lankan Rupees'
      },
      {
        id: 'license',
        title: '4. License & Permitted Use',
        content: 'Prasatek System Solutions grants you a personal, non-assignable, and non-exclusive license to use the platform for financial record tracking and ledger analysis. You may not reverse-engineer, exploit system routes, replicate UI components, scrape database collections, or distribute automated bot sessions intended to bypass our Express backend controls.',
        badge: 'Intellectual Property'
      },
      {
        id: 'disclaimer',
        title: '5. Limitation of Liability & Warranties',
        content: 'ExpenseTracker Pro is provided "as is" and "as available". We do not represent that the ledger calculations represent official tax filings or commercial financial audits. Prasatek System Solutions is not liable for financial planning failures, budgeting miscalculations, local database interruptions, or direct/indirect losses resulting from transaction deletions.',
        badge: 'Disclaimers'
      },
      {
        id: 'termination',
        title: '6. Term & Termination',
        content: 'We reserve the right to suspend or terminate user profiles (status toggled to "suspended" in Admin page) if credentials violate security policies or participate in system abuse. Upon termination, access to analytical dashboard routers is revoked. You may manually delete your data or request complete database deletion at any point.',
        badge: 'Termination'
      }
    ]
  }), []);

  const contentSI = useMemo(() => ({
    badge: 'නීතිමය රාමුව',
    title: 'සේවා කොන්දේසි',
    desc: 'ඔබගේ ExpenseTracker Pro ගිණුම පාලනය වන රීති, වගකීම් සහ පද්ධති ගණනය කිරීමේ ප්‍රතිපත්ති කරුණාකර පරීක්ෂා කරන්න.',
    updated: 'අවසාන යාවත්කාලීනය: 2026 ජූලි 14',
    activeVer: 'v2.1 (ක්‍රියාකාරී)',
    goBack: 'ආපසු යන්න',
    printTerms: 'මුද්‍රණය කරන්න',
    searchPlaceholder: 'සේවා කොන්දේසි සොයන්න (උදා: බලපත්‍රය, රුපියල්, ගිණුම්)...',
    clear: 'මකන්න',
    tableOfContents: 'පටුන',
    pillars: [
      { title: 'පරිශීලක ගිවිසුම', desc: 'පිළිගැනීමේ කොන්දේසි සහ සීමාවන්', icon: FileText, color: 'bg-green-50 text-prasatek-primary' },
      { title: 'ශ්‍රී ලංකා රුපියල්', desc: 'සියලුම වාර්තා LKR වලින් ගණනය කෙරේ', icon: Coins, color: 'bg-blue-50 text-blue-600' },
      { title: 'භාවිත වගකීම්', desc: 'පරිශීලක මුරපද සුරක්ෂිතතාවය', icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
      { title: 'වගකීම් ලිහිල් කිරීම්', desc: 'ගණනය කිරීම් සපයා ඇති පරිදි භාවිතය', icon: ShieldAlert, color: 'bg-red-50 text-red-600' }
    ],
    sections: [
      {
        id: 'intro',
        title: '1. කොන්දේසි පිළිගැනීම',
        content: 'ExpenseTracker Pro භාවිත කිරීමෙන්, ඔබ මෙම කොන්දේසි කියවා, තේරුම් ගෙන ඒවාට බැඳී සිටීමට එකඟ වන බව ප්‍රකාශ කරයි. ඔබ කණ්ඩායමක් වෙනුවෙන් ලියාපදිංචි වන්නේ නම්, ඔබට අවශ්‍ය බලයලත් සහතික ඇති බව තහවුරු කරයි. ඔබ එකඟ නොවන්නේ නම්, පද්ධති භාවිතය වහාම නතර කළ යුතුය.',
        badge: 'ගිවිසුම'
      },
      {
        id: 'obligations',
        title: '2. පරිශීලක ගිණුම් සහ ආරක්ෂාව',
        content: 'ගනුදෙනු සහ ලෙජර සටහන් කිරීමට, ඔබ පැතිකඩක් ලියාපදිංචි කළ යුතුය. ඔබගේ ගිණුමේ මුරපදවල රහස්‍යභාවය පවත්වා ගැනීම සඳහා ඔබ පමණක් වගකිව යුතුය. ඔබගේ ගිණුම යටතේ සිදුවන සියලුම ගනුදෙනු එකතු කිරීම් හෝ මකා දැමීම් ඔබගේ අනුමැතියෙන් සිදුවූ ලෙස සැලකේ.',
        badge: 'ගිණුම'
      },
      {
        id: 'currency',
        title: '3. මුදල් ගණනය කිරීම් සහ විගණන',
        content: 'ExpenseTracker Pro තුළ සකසන ලද සියලුම ප්‍රස්ථාර, අයවැය සහ ලෙජර ශ්‍රී ලංකා රුපියල් (RS) වලින් ගණනය කෙරේ. බහු-මුදල් පරිවර්තකයන් සපයා ඇත්තේ නැරඹීමේ පහසුව සඳහා පමණි. බැංකු වෙනස්වීම් නිසා සිදුවන වෙනස්කම් සඳහා පද්ධතිය වගකියනු නොලැබේ.',
        badge: 'ශ්‍රී ලංකා රුපියල්'
      },
      {
        id: 'license',
        title: '4. බලපත්‍රය සහ අනුමත භාවිතය',
        content: 'මූල්‍ය වාර්තා ලුහුබැඳීම සඳහා ප්‍රසාටෙක් සිස්ටම් සොලූෂන්ස් විසින් ඔබට පුද්ගලික බලපත්‍රයක් පිරිනමයි. අපගේ Backend පද්ධති පාලනයන් මඟහැරීමට උත්සාහ කිරීම හෝ දත්ත පිටපත් කිරීම සපයා නැත.',
        badge: 'බුද්ධිමය දේපළ'
      },
      {
        id: 'disclaimer',
        title: '5. වගකීම් සීමාව සහ වගකීම්',
        content: 'ExpenseTracker Pro සපයා ඇත්තේ "එලෙසින්ම" වේ. මෙම ගණනය කිරීම් නිල බදු වාර්තා ලෙස නියෝජනය නොවේ. මූල්‍ය සැලසුම් අසාර්ථකත්වයන් හෝ දත්ත මකා දැමීම් නිසා සිදුවන අලාභයන් සඳහා ප්‍රසාටෙක් වගකියනු නොලැබේ.',
        badge: 'වගකීම් ලිහිල් කිරීම්'
      },
      {
        id: 'termination',
        title: '6. කාලසීමාව සහ අවසන් කිරීම',
        content: 'ආරක්ෂක ප්‍රතිපත්ති උල්ලංඝනය කරන්නේ නම් පරිශීලක පැතිකඩ අත්හිටුවීමට හෝ අවසන් කිරීමට අපි අයිතිය තබා ගනිමු. අවසන් කළ පසු, ප්‍රස්ථාර සහ උපකරණ පුවරුව වෙත ප්‍රවේශය අහෝසි කෙරේ.',
        badge: 'අවසන් කිරීම'
      }
    ]
  }), []);

  const t = lang === 'si' ? contentSI : contentEN;

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return t.sections;
    const query = searchQuery.toLowerCase();
    return t.sections.filter(sec => 
      sec.title.toLowerCase().includes(query) || 
      sec.content.toLowerCase().includes(query) ||
      sec.badge.toLowerCase().includes(query)
    );
  }, [searchQuery, t.sections]);

  const handlePrint = () => {
    window.print();
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i} className="bg-green-100 text-prasatek-primary font-bold px-0.5 rounded">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 pb-12 print:bg-white print:pb-0">
      {/* Header section with grid overlay */}
      <header className="relative w-full bg-prasatek-dark text-white overflow-hidden py-12 px-6 sm:px-12 border-b border-slate-800 print:bg-white print:text-black print:py-4">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] print:hidden"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-prasatek-primary rounded-full filter blur-3xl opacity-10 -mr-20 -mt-20 print:hidden"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="group text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition cursor-pointer print:hidden"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              {t.goBack}
            </button>
            
            <div className="flex items-center gap-3 print:hidden">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <Globe className="w-3.5 h-3.5 text-prasatek-primary ml-2 mr-1" />
                <button
                  onClick={() => setLang('en')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    lang === 'en' ? 'bg-prasatek-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('si')}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    lang === 'si' ? 'bg-prasatek-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  සිංහල
                </button>
              </div>

              <button 
                onClick={handlePrint}
                className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                {t.printTerms}
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-prasatek-primary bg-[#0b8c5a]/10 px-3 py-1 rounded-full border border-prasatek-primary/20">{t.badge}</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-4 print:text-black print:text-3xl">{t.title}</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl print:text-slate-600">
              {t.desc}
            </p>
            <div className="flex items-center gap-2 mt-6 text-xs font-semibold text-slate-400 print:text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.updated}</span>
              <span className="mx-2">•</span>
              <span>{t.activeVer}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core pillar dashboard cards */}
        <section className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          {t.pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                <div className={`p-3 rounded-xl ${pillar.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{pillar.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Left column sidebar directory */}
        <aside className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
            <h2 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-prasatek-primary" />
              {t.tableOfContents}
            </h2>
            <div className="space-y-1">
              {t.sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-full text-left text-xs font-extrabold px-4 py-3 rounded-xl flex items-center justify-between transition cursor-pointer ${
                    activeSection === sec.id 
                      ? 'bg-prasatek-primary/5 text-prasatek-primary border border-prasatek-primary/20' 
                      : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="truncate">{sec.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${activeSection === sec.id ? 'translate-x-1' : 'opacity-40'}`} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right column detailed text panel */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Real-time search bar */}
          <div className="relative print:hidden">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-sm font-bold rounded-2xl pl-11 pr-4 py-4 border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-prasatek-primary focus:border-transparent transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition cursor-pointer"
              >
                {t.clear}
              </button>
            )}
          </div>

          {/* Terms list */}
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-8 print:p-0 print:border-0 print:shadow-none">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-35" />
                <p className="font-extrabold text-sm">No matching clauses found</p>
                <p className="text-xs font-bold text-slate-400 mt-1">Try other terms or clear search input</p>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <div 
                  key={sec.id}
                  id={sec.id}
                  className={`space-y-3 pb-8 border-b border-slate-100 last:border-0 last:pb-0 scroll-mt-24 transition-opacity duration-300 ${
                    activeSection === sec.id ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                  }`}
                  onMouseEnter={() => setActiveSection(sec.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {highlightText(sec.title, searchQuery)}
                    </h3>
                    <span className="text-[9px] font-extrabold tracking-wider uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                      {highlightText(sec.badge, searchQuery)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 leading-relaxed text-justify">
                    {highlightText(sec.content, searchQuery)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
