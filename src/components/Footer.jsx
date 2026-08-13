import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Footer({ customSettings }) {
  const [settings, setSettings] = useState({
    companyName: 'PRASATEK SYSTEM SOLUTIONS',
    contactWebsite: 'www.prasatek.lk',
    contactEmail: 'info@prasatek.lk',
    contactPhone: '0719323239'
  });

  useEffect(() => {
    if (customSettings && (customSettings.contactWebsite || customSettings.contactEmail)) {
      setSettings(prev => ({
        ...prev,
        ...customSettings
      }));
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await axios.get('/api/system/status');
        if (res.data) {
          setSettings({
            companyName: res.data.companyName || 'PRASATEK SYSTEM SOLUTIONS',
            contactWebsite: res.data.contactWebsite || 'www.prasatek.lk',
            contactEmail: res.data.contactEmail || 'info@prasatek.lk',
            contactPhone: res.data.contactPhone || '0719323239'
          });
        }
      } catch (err) {
        console.warn('Footer system status fetch notice:', err.message);
      }
    };

    fetchStatus();
  }, [customSettings]);

  const rawWebsite = settings.contactWebsite || 'www.prasatek.lk';
  const websiteUrl = rawWebsite.startsWith('http://') || rawWebsite.startsWith('https://')
    ? rawWebsite
    : `https://${rawWebsite}`;

  return (
    <footer className="w-full text-center mt-6 space-y-1.5 shrink-0">
      <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase text-slate-500 tracking-[0.15em]">
        <Link to="/privacy" className="hover:text-prasatek-primary transition">PRIVACY</Link>
        <span className="text-slate-300 font-normal">|</span>
        <Link to="/terms" className="hover:text-prasatek-primary transition">TERMS</Link>
        <span className="text-slate-300 font-normal">|</span>
        <Link to="/contact" className="hover:text-prasatek-primary transition">CONTACT</Link>
      </div>
      
      <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-[0.2em]">
        A PRODUCT BY {settings.companyName.toUpperCase()}
      </p>

      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-center gap-2 flex-wrap">
        <a 
          href={websiteUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="hover:text-prasatek-primary transition"
        >
          {rawWebsite.toUpperCase()}
        </a>
        <span className="text-slate-300 font-normal">|</span>
        <a 
          href={`mailto:${settings.contactEmail}`} 
          className="hover:text-prasatek-primary transition"
        >
          {settings.contactEmail.toUpperCase()}
        </a>
        <span className="text-slate-300 font-normal">|</span>
        <a 
          href={`tel:${settings.contactPhone}`} 
          className="hover:text-prasatek-primary transition"
        >
          {settings.contactPhone}
        </a>
      </p>
    </footer>
  );
}
