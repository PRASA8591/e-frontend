import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-slate-800">
      <div className="w-full p-6 pb-2 shrink-0 bg-white border-b border-gray-100 z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="text-xs font-bold text-gray-500 hover:text-slate-800 flex items-center gap-1 w-fit cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg> 
          Back
        </button>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">Terms of Service</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 pt-4 hide-scroll bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-slate-600 space-y-5 pb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl w-full">
          <p className="leading-relaxed">By accessing ExpenseTracker Pro, you agree to be bound by these Terms.</p>
          <div>
            <h3 className="font-extrabold text-slate-900 mb-1">1. Use License</h3>
            <p className="text-gray-500">Software is licensed for personal and commercial financial tracking under the supervision of your organization or personal profile.</p>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 mb-1">2. Currency</h3>
            <p className="text-gray-500">All native analytics are processed and audited in Sri Lankan Rupees (RS). Multi-currency support is for convenience and local conversion only.</p>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase">Last updated: July 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
