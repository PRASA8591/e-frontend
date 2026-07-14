import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Settings as SettingsIcon, 
  Camera, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // login handles updating the context user model when supplied a payload

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || user?.picture || '');
  const [base64Photo, setBase64Photo] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // App Toggles States
  const [currency, setCurrency] = useState(user?.currency || 'RS');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled !== false);
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Handle Photo Change Uploader
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Photo size must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setBase64Photo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Name/Photo
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setSavingProfile(true);

    try {
      const res = await axios.put('/api/auth/profile', {
        name,
        profilePhoto: base64Photo || undefined
      });

      // Update user in context
      const token = localStorage.getItem('token');
      login({ ...res.data, token });
      setProfileSuccess('Profile details updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile info.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setSavingPassword(true);

    try {
      await axios.put('/api/auth/password', {
        oldPassword,
        newPassword
      });

      setPasswordSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Submit App Settings (Theme, Currency, Notifications Toggles)
  const handleSettingsSubmit = async (newTheme, newCurrency, newNotif) => {
    setSettingsSuccess('');
    setSettingsError('');
    setSavingSettings(true);

    const actualTheme = newTheme !== undefined ? newTheme : theme;
    const actualCurrency = newCurrency !== undefined ? newCurrency : currency;
    const actualNotif = newNotif !== undefined ? newNotif : notificationsEnabled;

    try {
      const res = await axios.put('/api/auth/settings', {
        theme: actualTheme,
        currency: actualCurrency,
        notificationsEnabled: actualNotif
      });

      // Update user in context
      const token = localStorage.getItem('token');
      login({ ...res.data, token });
      setSettingsSuccess('Application settings synced successfully!');
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Failed to sync settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-200 pb-12 transition-colors duration-300">
      
      {/* Mini Nav Header */}
      <header className="relative w-full bg-prasatek-dark text-white py-8 px-6 sm:px-12 border-b border-slate-800 shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="group text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
          
          <div className="mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Application Settings</h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              Manage your personal credentials, customize the theme interface, and select native currency logs.
            </p>
          </div>
        </div>
      </header>

      {/* Settings Options Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 w-full flex-1 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card and App Configurations */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Profile Info */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <User className="w-5 h-5 text-prasatek-primary dark:text-green-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">My Personal Profile</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5 mt-5">
              {profileSuccess && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-prasatek-primary dark:text-green-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {profileError}
                </div>
              )}

              {/* Photo Upload Widget */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                <div className="relative group w-20 h-20 rounded-full border-2 border-prasatek-primary bg-prasatek-light dark:bg-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-prasatek-primary font-bold text-2xl">U</span>
                  )}
                  <label className="absolute inset-0 bg-black/40 text-white flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer select-none">
                    <Camera className="w-4 h-4" />
                    <span className="text-[8px] font-extrabold mt-0.5">CHANGE</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Display Avatar Image</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Supports JPG, PNG formats under 2MB. Crops automatically.</p>
                  <label className="inline-block bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer mt-1">
                    Upload Avatar File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Name fields */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Full Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pun sara"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl p-3 border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-prasatek-primary focus:bg-white dark:focus:bg-slate-800 transition"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingProfile ? 'Saving Details...' : 'Save Profile Changes'}
              </button>
            </form>
          </section>

          {/* Section 2: App Configurations */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <SettingsIcon className="w-5 h-5 text-prasatek-primary dark:text-green-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Application Customization</h2>
            </div>

            <div className="space-y-5 mt-5">
              {settingsSuccess && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-prasatek-primary dark:text-green-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {settingsSuccess}
                </div>
              )}

              {/* Currency Customizer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Default Exchange Currency</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Calculates native chart balances in selected node currency.</p>
                </div>
                <select 
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    handleSettingsSubmit(theme, e.target.value, notificationsEnabled);
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-200 cursor-pointer w-full sm:w-auto"
                >
                  <option value="RS">LKR (RS)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              {/* Toggle Notifications */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">System Notification Alerts</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Get warned before subscriptions expire or maintenance schedules start.</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in shrink-0">
                  <input 
                    type="checkbox" 
                    id="notifToggle" 
                    checked={notificationsEnabled}
                    onChange={(e) => {
                      setNotificationsEnabled(e.target.checked);
                      handleSettingsSubmit(theme, currency, e.target.checked);
                    }}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 z-10"
                  />
                  <label 
                    htmlFor="notifToggle" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300 ${notificationsEnabled ? 'bg-prasatek-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                  ></label>
                </div>
              </div>

              {/* Theme Selector (Light/Dark Toggle) */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Application Mode Theme</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Toggle between standard light display and sleek modern dark layouts.</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in shrink-0">
                  <input 
                    type="checkbox" 
                    id="themeToggle" 
                    checked={theme === 'dark'}
                    onChange={(e) => {
                      const selectedTheme = e.target.checked ? 'dark' : 'light';
                      setTheme(selectedTheme);
                      handleSettingsSubmit(selectedTheme, currency, notificationsEnabled);
                    }}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 z-10"
                  />
                  <label 
                    htmlFor="themeToggle" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300 ${theme === 'dark' ? 'bg-prasatek-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                  ></label>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Right Column: Password Change Panel */}
        <aside className="lg:col-span-5">
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Lock className="w-5 h-5 text-prasatek-primary dark:text-green-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Security Credentials</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-5">
              {passwordSuccess && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-prasatek-primary dark:text-green-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {passwordError}
                </div>
              )}

              {/* Old Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Current Password</label>
                <div className="relative">
                  <input 
                    type={showOldPass ? 'text' : 'password'} 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl pl-3 pr-10 py-3 border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-prasatek-primary focus:bg-white dark:focus:bg-slate-800 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPass ? 'text' : 'password'} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl pl-3 pr-10 py-3 border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-prasatek-primary focus:bg-white dark:focus:bg-slate-800 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl p-3 border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-prasatek-primary focus:bg-white dark:focus:bg-slate-800 transition font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                {savingPassword ? 'Updating Password...' : 'Reset System Password'}
              </button>
            </form>
          </section>
        </aside>

      </main>
    </div>
  );
}
