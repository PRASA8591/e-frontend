import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
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
        <h2 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">Contact Us</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 pt-4 hide-scroll bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl w-full">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4">Prasatek System Solutions</h3>
          <div className="space-y-4 text-sm font-bold text-slate-700">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-prasatek-primary text-lg">✆</span> 
              <span>0719323239</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-prasatek-primary text-lg">🌐</span> 
              <a href="https://www.prasatek.site" target="_blank" rel="noopener noreferrer" className="hover:underline">www.prasatek.site</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
