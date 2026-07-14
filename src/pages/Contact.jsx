import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Phone, 
  Globe, 
  Clock, 
  MapPin, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  HelpCircle,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export default function Contact() {
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Status & Validation States
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Business Open/Closed State
  const [isOpen, setIsOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'Is my financial transaction log completely private?',
      a: 'Absolutely. We store your data in isolated schemas. Neither managers nor other users can view your logs. Password authentication is secure and encrypted using bcryptjs.'
    },
    {
      q: 'Can I change my default currency from Sri Lankan Rupees (RS)?',
      a: 'ExpenseTracker Pro processes native audits in Sri Lankan Rupees. While you can log amounts converted from other currencies, the base analytical graphs are calculated in Rupees.'
    },
    {
      q: 'How do I export all my data if I want a backup?',
      a: 'Standard users can view their current transaction grids and account summaries. Managers or Administrators can also generate and download audit files in CSV format from the Admin panel.'
    },
    {
      q: 'What happens to my records if I delete my account?',
      a: 'Initiating an account deletion executes a cascade script in our database. This permanently deletes your profile, all financial accounts, and transaction history immediately.'
    }
  ];

  // Calculate Colombo, Sri Lanka (GMT+5:30) Business Status
  useEffect(() => {
    const checkBusinessHours = () => {
      // Calculate local time in Sri Lanka (+5:30)
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const colomboOffset = 5.5 * 60 * 60000;
      const colomboTime = new Date(utcTime + colomboOffset);

      const day = colomboTime.getDay(); // 0: Sunday, 1: Monday, ... 6: Saturday
      const hours = colomboTime.getHours();
      const minutes = colomboTime.getMinutes();

      // Business Hours: Monday to Saturday, 9:00 AM - 6:00 PM (09:00 - 18:00)
      const isWeekdayOrSat = day >= 1 && day <= 6;
      const isOpenHour = hours >= 9 && hours < 18;
      
      setIsOpen(isWeekdayOrSat && isOpenHour);

      // Format time string for display
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const dispHours = hours % 12 || 12;
      const dispMins = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTimeStr(`${dispHours}:${dispMins} ${ampm} (LKR Time)`);
    };

    checkBusinessHours();
    const interval = setInterval(checkBusinessHours, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email address';
    }
    if (!subject.trim()) errors.subject = 'Subject is required';
    if (!message.trim()) {
      errors.message = 'Message content cannot be blank';
    } else if (message.trim().length < 15) {
      errors.message = 'Message must be at least 15 characters long';
    }
    if (!agreed) errors.agreed = 'You must agree to the privacy policy & terms';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setFormStatus('submitting');

    try {
      const response = await axios.post('/api/contacts', {
        name,
        email,
        category,
        subject,
        message
      });

      setSubmittedData(response.data.contact);
      setFormStatus('success');
      
      // Clear form
      setName('');
      setEmail('');
      setCategory('General Inquiry');
      setSubject('');
      setMessage('');
      setAgreed(false);
    } catch (err) {
      setFormStatus('error');
      setApiError(err.response?.data?.message || 'Failed to submit message. Please try again.');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 pb-12">
      {/* Dynamic Header */}
      <header className="relative w-full bg-prasatek-dark text-white overflow-hidden py-10 px-6 sm:px-12 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-prasatek-primary rounded-full filter blur-3xl opacity-10 -mr-20 -mt-20"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="group text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Application
          </button>
          
          <div className="mt-8">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-prasatek-primary bg-[#0b8c5a]/10 px-3 py-1 rounded-full border border-prasatek-primary/20">Client Services</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-4">Contact Our Team</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl">
              Have questions about your account, custom branches, or general ledger calculations? Fill in details below to start a ticket.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form / Success state */}
        <section className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          {formStatus === 'success' && submittedData ? (
            /* Success Response Feedback */
            <div className="flex-1 flex flex-col justify-center items-center py-10 text-center animate-fade-in">
              <CheckCircle className="w-16 h-16 text-prasatek-primary mb-6 animate-pulse" />
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inquiry Received Successfully</h2>
              <p className="text-sm font-semibold text-slate-500 max-w-md mt-2">
                Thank you for contacting us, <span className="text-slate-800">{submittedData.name}</span>. Your ticket has been logged inside our database, and a support officer will review details.
              </p>
              
              <div className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl my-6 text-left space-y-2 text-xs font-semibold">
                <p className="text-slate-400 uppercase font-extrabold text-[9px]">Ticket Summary Details</p>
                <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400">Reference ID:</span>
                  <span className="col-span-2 text-slate-800 font-extrabold select-all">{submittedData._id}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400">Category:</span>
                  <span className="col-span-2 text-slate-800 font-extrabold">{submittedData.category}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400">Subject:</span>
                  <span className="col-span-2 text-slate-800 font-bold">{submittedData.subject}</span>
                </div>
                <div className="grid grid-cols-3 pt-1">
                  <span className="text-slate-400">Submitted Email:</span>
                  <span className="col-span-2 text-slate-800">{submittedData.email}</span>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-1.5 justify-center">
                <Clock className="w-3.5 h-3.5 text-prasatek-primary" />
                <span>Typical response time is less than 24 hours.</span>
              </div>

              <button
                onClick={() => setFormStatus('idle')}
                className="bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            /* Interactive Contact Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MessageSquare className="w-5 h-5 text-prasatek-primary" />
                <h2 className="text-lg font-extrabold text-slate-900">Log A Support Ticket</h2>
              </div>

              {formStatus === 'error' && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700 text-xs font-bold items-center">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Name & Email Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full bg-slate-50 text-slate-800 text-xs font-bold rounded-xl p-3 border ${
                      validationErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-100 focus:ring-prasatek-primary'
                    } outline-none focus:ring-2 focus:bg-white transition`}
                  />
                  {validationErrors.name && <p className="text-[10px] font-bold text-red-500">{validationErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full bg-slate-50 text-slate-800 text-xs font-bold rounded-xl p-3 border ${
                      validationErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-100 focus:ring-prasatek-primary'
                    } outline-none focus:ring-2 focus:bg-white transition`}
                  />
                  {validationErrors.email && <p className="text-[10px] font-bold text-red-500">{validationErrors.email}</p>}
                </div>
              </div>

              {/* Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold rounded-xl p-3 border border-slate-100 outline-none focus:ring-2 focus:ring-prasatek-primary focus:bg-white transition cursor-pointer"
                  >
                    <option value="General Inquiry">General</option>
                    <option value="Technical Support">Technical</option>
                    <option value="Billing & Pricing">Billing</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Subject Line</label>
                  <input 
                    type="text" 
                    placeholder="What is this regarding?"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (validationErrors.subject) setValidationErrors(prev => ({ ...prev, subject: '' }));
                    }}
                    className={`w-full bg-slate-50 text-slate-800 text-xs font-bold rounded-xl p-3 border ${
                      validationErrors.subject ? 'border-red-400 focus:ring-red-400' : 'border-slate-100 focus:ring-prasatek-primary'
                    } outline-none focus:ring-2 focus:bg-white transition`}
                  />
                  {validationErrors.subject && <p className="text-[10px] font-bold text-red-500">{validationErrors.subject}</p>}
                </div>
              </div>

              {/* Message content text area */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Message Content</label>
                  <span className={`text-[9px] font-extrabold ${message.length > 450 ? 'text-red-500' : 'text-slate-400'}`}>
                    {500 - message.length} characters left
                  </span>
                </div>
                <textarea 
                  rows="5"
                  maxLength="500"
                  placeholder="Describe your issue in details (minimum 15 characters)..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (validationErrors.message) setValidationErrors(prev => ({ ...prev, message: '' }));
                  }}
                  className={`w-full bg-slate-50 text-slate-800 text-xs font-bold rounded-xl p-3 border ${
                    validationErrors.message ? 'border-red-400 focus:ring-red-400' : 'border-slate-100 focus:ring-prasatek-primary'
                  } outline-none focus:ring-2 focus:bg-white transition resize-none`}
                />
                {validationErrors.message && <p className="text-[10px] font-bold text-red-500">{validationErrors.message}</p>}
              </div>

              {/* Checkbox agreement */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-500 font-semibold cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (validationErrors.agreed) setValidationErrors(prev => ({ ...prev, agreed: '' }));
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-prasatek-primary focus:ring-prasatek-primary mt-0.5 cursor-pointer accent-prasatek-primary"
                  />
                  <span>
                    I represent that the information is accurate and I agree to the{' '}
                    <Link to="/privacy" className="text-prasatek-primary font-bold hover:underline" target="_blank">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link to="/terms" className="text-prasatek-primary font-bold hover:underline" target="_blank">Terms of Service</Link>.
                  </span>
                </label>
                {validationErrors.agreed && <p className="text-[10px] font-bold text-red-500 mt-1">{validationErrors.agreed}</p>}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {formStatus === 'submitting' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging Ticket...
                  </>
                ) : (
                  'Submit Inquiry Form'
                )}
              </button>
            </form>
          )}
        </section>

        {/* Right Column: Channels, Map, and FAQ */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Operations & Open Hours hours details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-prasatek-primary" />
                Office Operations
              </h2>
              {/* Pulsing indicator badge */}
              <div className="flex items-center gap-2">
                <span className={`relative flex h-2 w-2`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                <span className={`text-[10px] font-extrabold uppercase ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                  {isOpen ? 'Open Now' : 'Closed Now'}
                </span>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Working Hours:</span>
                <span className="font-extrabold text-slate-800">9:00 AM - 6:00 PM (Mon-Sat)</span>
              </div>
              <div className="flex justify-between">
                <span>Current Time:</span>
                <span className="font-bold text-slate-700">{currentTimeStr || 'Calculating...'}</span>
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="tel:0719323239" 
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition group"
            >
              <div className="p-2.5 bg-green-50 text-prasatek-primary rounded-xl group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide mt-3">Phone Line</p>
              <p className="font-extrabold text-slate-800 text-xs mt-0.5">0719323239</p>
            </a>

            <a 
              href="https://www.prasatek.site" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition group"
            >
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide mt-3">Website</p>
              <p className="font-extrabold text-blue-600 text-xs mt-0.5 hover:underline truncate w-full max-w-[120px]">prasatek.site</p>
            </a>
          </div>

          {/* Headquarters styled Map mock widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-prasatek-primary" />
              Headquarters Location
            </h2>
            <div className="relative h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60 flex items-center justify-center">
              {/* Mock map styling with CSS elements */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#808080_1px,transparent_1px)] bg-[size:10px_10px]"></div>
              {/* Map grid streets */}
              <div className="absolute w-full h-[2px] bg-slate-200/80 top-1/3"></div>
              <div className="absolute w-full h-[2px] bg-slate-200/80 top-2/3"></div>
              <div className="absolute h-full w-[2px] bg-slate-200/80 left-1/3"></div>
              <div className="absolute h-full w-[2px] bg-slate-200/80 left-2/3"></div>
              {/* Pulsing pointer */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-3 h-3 bg-prasatek-primary rounded-full animate-ping absolute"></div>
                <MapPin className="w-7 h-7 text-prasatek-primary relative drop-shadow-md animate-bounce" />
              </div>
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-extrabold text-slate-500 border border-slate-100 shadow-sm">
                Colombo, Sri Lanka
              </div>
            </div>
            <div className="flex justify-between items-center gap-3">
              <div className="text-[11px] font-semibold text-slate-500">
                <p className="font-extrabold text-slate-800">Prasatek System Solutions</p>
                <p>Kottawa Road, Colombo District, Sri Lanka</p>
              </div>
              <a 
                href="https://maps.google.com/?q=Colombo,Sri+Lanka" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[10px] font-extrabold px-3 py-2 rounded-lg transition text-slate-600 shrink-0 cursor-pointer text-center"
              >
                Get Route
              </a>
            </div>
          </div>

          {/* Interactive FAQs Accordion */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-prasatek-primary" />
              Frequent Questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-3 bg-slate-50/50 hover:bg-slate-50 text-left text-xs font-bold text-slate-700 flex justify-between items-center transition cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="p-3 bg-white text-[11px] font-semibold text-slate-500 leading-relaxed border-t border-slate-100 animate-slide-down">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
