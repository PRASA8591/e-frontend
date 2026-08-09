import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Database, 
  UserCheck, 
  Search, 
  Printer, 
  Info,
  Clock,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en'); // 'en' or 'si'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('intro');

  const contentEN = useMemo(() => ({
    badge: 'Trust & Transparency',
    title: 'Privacy Policy',
    desc: 'Your financial records deserve complete isolation. Discover how ExpenseTracker Pro safeguards your transaction details, balances, and identity files.',
    updated: 'Last updated: July 14, 2026',
    activeVer: 'v2.1 (Active)',
    goBack: 'Go Back',
    printPolicy: 'Print Policy',
    searchPlaceholder: 'Search privacy keywords (e.g. Bcrypt, MongoDB)...',
    clear: 'Clear',
    tableOfContents: 'Table of Contents',
    pillars: [
      { title: 'Isolated Data', desc: 'Tenant database security structures', icon: ShieldCheck, color: 'bg-green-50 text-prasatek-primary' },
      { title: 'Bcrypt Hashing', desc: 'Credentials fully secure and hashed', icon: Lock, color: 'bg-blue-50 text-blue-600' },
      { title: 'No Data Selling', desc: 'Zero advertising scripts or trackers', icon: Database, color: 'bg-amber-50 text-amber-600' },
      { title: 'Cascade Deletes', desc: 'Immediate permanent data removal', icon: UserCheck, color: 'bg-red-50 text-red-600' }
    ],
    sections: [
      {
        id: 'intro',
        title: '1. Introduction',
        content: 'Welcome to ExpenseTracker Pro, operated by Prasatek System Solutions. We are committed to protecting your personal and financial data. This Privacy Policy explains how we collect, use, and protect your information when you use our web application. By signing up, you explicitly agree to the collection and use of information in accordance with this policy.',
        badge: 'Agreement'
      },
      {
        id: 'collection',
        title: '2. Information We Collect',
        content: 'We collect information provided directly by you. This includes: Personal registration details (Name, Email Address, optional Mobile Number), Security Credentials (encrypted password profiles), and Financial Records (Ledgers, Custom Account Titles, Initial Balances, and raw Transaction Logs representing deducts/adds, descriptions, dates, and categories). We do not scrape, scan, or read external financial profiles or banks.',
        badge: 'Data Type'
      },
      {
        id: 'usage',
        title: '3. How We Use Your Data',
        content: 'Your information is strictly used to provide, operate, and maintain ExpenseTracker Pro. Specifically, we process your transaction history to generate local analytics, visual charts, and monthly budget progress counters. We also use your mobile number (if supplied) to send budget alert thresholds, and your role permissions (Admin/Manager/User) are processed to secure operational dashboards.',
        badge: 'Core Processing'
      },
      {
        id: 'sharing',
        title: '4. Data Sharing & Third Parties',
        content: 'We maintain a strict zero-selling policy. Your personal financial details are never sold, rented, or traded to marketing companies, advertising brokers, or credit scoring agencies. Stored records are locked in secure MongoDB schemas accessible only by your authenticated session. We only disclose records if required under Sri Lankan financial regulations or federal law audits.',
        badge: 'Absolute Privacy'
      },
      {
        id: 'security',
        title: '5. Encryption & Security Standards',
        content: 'We deploy enterprise-grade security structures. All user passwords are encrypted using bcryptjs hashing algorithms prior to database transmission, making them unreadable even to system administrators. API communications are isolated, and strict Mongoose schema rules prevent database injections or cross-tenant data leaks. We audit server configurations regularly to block brute-force attempts.',
        badge: 'Security Layer'
      },
      {
        id: 'rights',
        title: '6. Your Rights & Retention Policies',
        content: 'You own your data. At any time, you can modify details, request a manual audit log export via the CSV generator in the Admin panel, or initiate a permanent account termination. Deleting an account initiates a cascade deletion sequence in our database, immediately destroying your user profile, all associated accounts, and all log files from our MongoDB cluster. We do not archive deleted transactions.',
        badge: 'Full Ownership'
      }
    ]
  }), []);

  const contentSI = useMemo(() => ({
    badge: 'විශ්වාසය සහ විනිවිදභාවය',
    title: 'පුද්ගලිකත්ව ප්‍රතිපත්තිය',
    desc: 'ඔබගේ මූල්‍ය වාර්තා සම්පූර්ණයෙන්ම සුරක්ෂිතව තබා ගැනීමට අපි බැඳී සිටිමු. ExpenseTracker Pro මගින් ඔබගේ ගනුදෙනු විස්තර, ගිණුම් ශේෂයන් සහ අනන්‍යතාවය ආරක්ෂා කරන ආකාරය මෙහි දැක්වේ.',
    updated: 'අවසාන යාවත්කාලීනය: 2026 ජූලි 14',
    activeVer: 'v2.1 (ක්‍රියාකාරී)',
    goBack: 'ආපසු යන්න',
    printPolicy: 'මුද්‍රණය කරන්න',
    searchPlaceholder: 'පුද්ගලිකත්ව පද සොයන්න (උදා: Bcrypt, MongoDB)...',
    clear: 'මකන්න',
    tableOfContents: 'පටුන',
    pillars: [
      { title: 'සුරක්ෂිත දත්ත', desc: 'හුදකලා දත්ත සමුදා ආරක්ෂක ව්‍යුහය', icon: ShieldCheck, color: 'bg-green-50 text-prasatek-primary' },
      { title: 'Bcrypt ගුප්තකේතනය', desc: 'මුරපද සම්පූර්ණයෙන්ම ගුප්තකේතනය කර ඇත', icon: Lock, color: 'bg-blue-50 text-blue-600' },
      { title: 'දත්ත විකිණීමක් නැත', desc: 'දැන්වීම් අලෙවිකරණය හෝ ට්‍රැකර් නොමැත', icon: Database, color: 'bg-amber-50 text-amber-600' },
      { title: 'ස්ථිර ලෙස ඉවත් කිරීම', desc: 'ගිණුම සමග සියලු දත්ත ස්ථිරවම මකා දැමීම', icon: UserCheck, color: 'bg-red-50 text-red-600' }
    ],
    sections: [
      {
        id: 'intro',
        title: '1. හැඳින්වීම',
        content: 'ප්‍රසාටෙක් සිස්ටම් සොලූෂන්ස් විසින් මෙහෙයවනු ලබන ExpenseTracker Pro වෙත සාදරයෙන් පිළිගනිමු. ඔබගේ පුද්ගලික සහ මූල්‍ය දත්ත සුරක්ෂිත කිරීමට අපි බැඳී සිටිමු. ඔබ අපගේ වෙබ් යෙදුම භාවිතා කරන විට ඔබගේ තොරතුරු රැස් කරන, භාවිතා කරන සහ ආරක්ෂා කරන ආකාරය මෙම පුද්ගලිකත්ව ප්‍රතිපත්තිය මගින් පැහැදිලි කරයි. ලියාපදිංචි වීමෙන්, මෙම ප්‍රතිපත්තියට අනුකූලව තොරතුරු රැස් කිරීම සහ භාවිතයට ඔබ එකඟ වේ.',
        badge: 'ගිවිසුම'
      },
      {
        id: 'collection',
        title: '2. අප රැස් කරන තොරතුරු',
        content: 'ඔබ විසින් සපයනු ලබන තොරතුරු අපි රැස් කරන්නෙමු. මෙයට: පුද්ගලික ලියාපදිංචි විස්තර (නම, විද්‍යුත් තැපෑල, ජංගම දුරකථන අංකය), ආරක්ෂක මුරපද (Bcrypt ගුප්තකේතිත මුරපද), සහ මූල්‍ය වාර්තා (ගිණුම් මාතෘකා, ආරම්භක ශේෂයන්, ආදායම්/වියදම් ගනුදෙනු සටහන්, විස්තර, දිනයන් සහ කාණ්ඩ) ඇතුළත් වේ. අපි බාහිර බැංකු ගිණුම් පරික්ෂා කිරීමක් සිදු නොකරන්නෙමු.',
        badge: 'දත්ත වර්ගය'
      },
      {
        id: 'usage',
        title: '3. ඔබගේ දත්ත භාවිතා කරන ආකාරය',
        content: 'ExpenseTracker Pro සේවාව සැපයීමට සහ පවත්වාගෙන යාමට පමණක් ඔබගේ තොරතුරු භාවිතා කරයි. ඔබගේ ගනුදෙනු ඉතිහාසය දේශීය විශ්ලේෂණ, දෘශ්‍ය ප්‍රස්ථාර සහ මාසික අයවැය ප්‍රගතිය ගණනය කිරීමට සකසනු ලැබේ. ඔබ සපයා ඇත්නම් අයවැය සීමාවන් දැනුම් දීමට ඔබගේ ජංගම දුරකථන අංකය භාවිතා වේ.',
        badge: 'ප්‍රධාන භාවිතය'
      },
      {
        id: 'sharing',
        title: '4. දත්ත හුවමාරුව සහ තෙවන පාර්ශව',
        content: 'අපි දත්ත අලෙවි නොකිරීමේ දැඩි ප්‍රතිපත්තියක් පවත්වාගෙන යන්නෙමු. ඔබගේ මූල්‍ය විස්තර වෙළඳ ප්‍රචාරණ සමාගම් වෙත කිසි විටෙකත් අලෙවි නොකෙරේ. ආරක්ෂිත MongoDB දත්ත සමුදාය තුළ ගබඩා කර ඇති වාර්තා වෙත ප්‍රවේශ විය හැක්කේ ඔබගේ සක්‍රිය පුරනය වීමේ සැසියට පමණි.',
        badge: 'පූර්ණ රහස්‍යභාවය'
      },
      {
        id: 'security',
        title: '5. ගුප්තකේතනය සහ ආරක්ෂණ ප්‍රමිතීන්',
        content: 'අපි ඉහළ මට්ටමේ ආරක්ෂක ව්‍යුහයන් භාවිතා කරමු. සියලුම පරිශීලක මුරපද දත්ත සමුදායට යැවීමට පෙර Bcrypt ඇල්ගොරිතම මගින් ගුප්තකේතනය කරනු ලැබේ. API සන්නිවේදනය හුදකලා කර ඇති අතර, දත්ත කාන්දු වීම් වැළැක්වීම සඳහා ආරක්ෂක රීති ක්‍රියාත්මක කර ඇත.',
        badge: 'ආරක්ෂක ස්ථරය'
      },
      {
        id: 'rights',
        title: '6. ඔබගේ අයිතිවාසිකම් සහ දත්ත රඳවා තබා ගැනීමේ ප්‍රතිපත්ති',
        content: 'ඔබගේ දත්තවල හිමිකරු ඔබයි. ඕනෑම අවස්ථාවක විස්තර වෙනස් කිරීමට, CSV හරහා වාර්තා ලබා ගැනීමට හෝ ගිණුම ස්ථිරවම මකා දැමීමට ඔබට හැකියාව ඇත. ගිණුමක් මකා දැමූ විට ඔබගේ පැරණි වාර්තා, ගිණුම් සහ සියලුම ගනුදෙනු දත්ත සමුදායෙන් ස්ථිරවම ඉවත් කෙරේ.',
        badge: 'පූර්ණ හිමිකාරිත්වය'
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
                {t.printPolicy}
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

          {/* Policy list */}
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
