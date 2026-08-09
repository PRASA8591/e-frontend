import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  AlertTriangle,
  RotateCcw,
  Trash2,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth(); // login handles updating user, logout clears auth session

  // Danger Zone States (Reset & Delete Account)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resettingAccount, setResettingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [dangerError, setDangerError] = useState('');
  const [dangerSuccess, setDangerSuccess] = useState('');

  // Handle Reset Account Action
  const handleResetAccount = async () => {
    setResettingAccount(true);
    setDangerError('');
    setDangerSuccess('');
    try {
      await axios.post('/api/auth/reset-account');
      setDangerSuccess('Account reset successful! All accounts and transaction histories have been wiped.');
      setShowResetModal(false);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setDangerError(err.response?.data?.message || 'Failed to reset account data.');
    } finally {
      setResettingAccount(false);
    }
  };

  // Handle Delete Account Action
  const handleDeleteAccount = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setDeletingAccount(true);
    setDangerError('');
    setDangerSuccess('');

    try {
      await axios.delete('/api/auth/delete-account', {
        data: { password: deletePassword }
      });
      setDangerSuccess('Your account and all associated data have been permanently deleted.');
      setShowDeleteModal(false);
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (err) {
      setDangerError(err.response?.data?.message || 'Failed to delete account. Please check your password.');
    } finally {
      setDeletingAccount(false);
    }
  };

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalRequiredPlan, setModalRequiredPlan] = useState('');

  // Handle Photo Change Uploader
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Photo size must be smaller than 2MB.");
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

              {/* Theme Selector (Light/Dark/Forest/Nordic/Cyberpunk Select) */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 gap-4">
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Application Mode Theme</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Select a visual theme theme style matching your preferences.</p>
                </div>
                <div className="shrink-0 w-full sm:w-48">
                  <select 
                    value={theme}
                    onChange={(e) => {
                      const selectedTheme = e.target.value;
                      const plan = user?.plan || 'free';
                      if (selectedTheme === 'forest' && plan === 'free') {
                        setModalRequiredPlan('pro');
                        setShowUpgradeModal(true);
                        return;
                      }
                      if (['nordic', 'cyberpunk'].includes(selectedTheme) && plan !== 'enterprise') {
                        setModalRequiredPlan('enterprise');
                        setShowUpgradeModal(true);
                        return;
                      }
                      setTheme(selectedTheme);
                      handleSettingsSubmit(selectedTheme, currency, notificationsEnabled);
                    }}
                    className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg px-3 py-2 border border-gray-200 dark:border-slate-700 outline-none cursor-pointer"
                  >
                    <option value="light">☀️ Light Theme (Default)</option>
                    <option value="dark">🌑 Dark Slate Theme</option>
                    <option value="forest">{user?.plan === 'free' ? '🔒 🌲 Forest Emerald (Pro/Ent)' : '🌲 Forest Emerald (Green)'}</option>
                    <option value="nordic">{user?.plan !== 'enterprise' ? '🔒 🌊 Nordic Frost (Ent)' : '🌊 Nordic Frost (Blue)'}</option>
                    <option value="cyberpunk">{user?.plan !== 'enterprise' ? '🔒 🔮 Cyberpunk Neon (Ent)' : '🔮 Cyberpunk Neon (Violet)'}</option>
                  </select>
                </div>
              </div>

            </div>
          </section>

          {/* Section 3: Danger Zone / Account Management */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-red-100 dark:border-red-900/20">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Danger Zone & Account Actions</h2>
            </div>

            <div className="space-y-4 mt-5">
              {dangerSuccess && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-prasatek-primary dark:text-green-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {dangerSuccess}
                </div>
              )}
              {dangerError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" /> {dangerError}
                </div>
              )}

              {/* Action 1: Reset Account Data */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                <div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Reset Account Data</p>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Wipes all financial accounts, balances, and transaction history clean while keeping your user profile active.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDangerError('');
                    setDangerSuccess('');
                    setShowResetModal(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reset Account
                </button>
              </div>

              {/* Action 2: Delete Account Permanently */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-red-50/50 dark:bg-red-950/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-500" />
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Delete Account Permanently</p>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Permanently delete your profile and all associated data per Privacy Policy #6. Action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDangerError('');
                    setDangerSuccess('');
                    setDeletePassword('');
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  Delete Account
                </button>
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
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] w-full max-w-sm p-6 shadow-2xl text-center border border-gray-100 dark:border-slate-800">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/20 mb-4">
              <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">Upgrade Your Plan</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-5 font-bold leading-normal">
              This visual theme package is locked. You need a <span className="text-prasatek-primary dark:text-green-400 uppercase font-extrabold">{modalRequiredPlan} plan</span> or higher to unlock this customization theme style.
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-left text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-normal mb-6 space-y-2 border border-slate-100 dark:border-slate-800">
              <p className="uppercase text-[9px] text-slate-400">Unlock theme steps:</p>
              <p>1. Navigate to our subscription pricing dashboard.</p>
              <p>2. Select the plan that fits your visual styling requirements.</p>
              <p>3. Confirm payment sandbox sequence to enable immediately.</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="w-1/2 bg-[#e2e8f0] hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <Link 
                to="/upgrade"
                onClick={() => setShowUpgradeModal(false)}
                className="w-1/2 bg-prasatek-primary hover:bg-[#09734a] text-white font-bold py-3 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer text-xs"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Reset Account Warning Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] w-full max-w-md p-6 shadow-2xl border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Reset Account Data</h3>
                <p className="text-[11px] font-semibold text-slate-400">Confirmation Required</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 leading-relaxed my-4">
              ⚠️ After reset, all your data will be deleted: all accounts and all transaction histories are gone. Are you sure?
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-1/2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleResetAccount}
                disabled={resettingAccount}
                className="w-1/2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer text-xs disabled:opacity-50"
              >
                {resettingAccount ? 'Resetting Data...' : 'Yes, Reset Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] w-full max-w-md p-6 shadow-2xl border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-3">
              <div className="p-2.5 bg-red-100 dark:bg-red-950/40 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Permanently Delete Account</h3>
                <p className="text-[11px] font-semibold text-slate-400">Privacy Policy Section #6</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed mb-4">
              This action will permanently remove your user profile, credentials, financial accounts, and transaction history from our servers.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {user?.authProvider === 'google' ? (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 p-3 rounded-xl text-xs font-bold">
                  🔒 Google Login User: No password required. Click confirm below to finalize account deletion.
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">
                    Re-enter Password to Confirm
                  </label>
                  <div className="relative">
                    <input 
                      type={showDeletePass ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl pl-3 pr-10 py-3 border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-red-500 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePass(!showDeletePass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showDeletePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={deletingAccount}
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer text-xs disabled:opacity-50"
                >
                  {deletingAccount ? 'Deleting Account...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
