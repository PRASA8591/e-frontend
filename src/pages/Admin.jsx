import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Building, 
  Server, 
  Database, 
  Cpu, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Mail, 
  Download, 
  Upload, 
  Bell, 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft, 
  Sliders, 
  FileText,
  Lock,
  Sparkles,
  TrendingUp,
  LogOut,
  Zap,
  Calendar,
  MapPin
} from 'lucide-react';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation Tabs: 'overview', 'users', 'audit', 'announcements', 'messages'
  const [activeTab, setActiveTab] = useState('overview');
  
  // System Telemetry & Stats
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    privilegedUsers: 0, 
    suspendedUsers: 0, 
    totalOrgs: 1,
    freeUsers: 0,
    proUsers: 0,
    enterpriseUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0
  });
  
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // User Management
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Selected User Financial Detail
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [userFinancialsLoading, setUserFinancialsLoading] = useState(false);

  // Reset Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Manual Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('user');
  const [addStatus, setAddStatus] = useState('active');
  const [addOrg, setAddOrg] = useState('default');
  const [addIsVerified, setAddIsVerified] = useState(true);
  const [savingUser, setSavingUser] = useState(false);

  // Contact Support Messages
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactsLoading, setContactsLoading] = useState(false);

  // Announcements & Scheduling
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementType, setAnnouncementType] = useState('info');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Ticket Email Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // System Operational Settings (Maintenance Mode, Global Banner & HQ Map Location)
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const isAnyModalOpen = showAddUserModal || showPasswordModal || showConfirm || showAlert || selectedSlipUrl || rejectModalOrder;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerType, setBannerType] = useState('info');
  const [hqAddress, setHqAddress] = useState('Kottawa Road, Colombo District, Sri Lanka');
  const [hqMapUrl, setHqMapUrl] = useState('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.385418197779!2d79.9610!3d6.8440!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2501a3512e02d%3A0x6b4f738e4a9e5251!2sKottawa%2C%20Pannipitiya!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk');
  const [updatingSettings, setUpdatingSettings] = useState(false);
  // Pending Bank Payment Orders State
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(false);
  const [selectedSlipUrl, setSelectedSlipUrl] = useState(null);
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPendingOrders = async () => {
    setPendingOrdersLoading(true);
    try {
      const res = await axios.get('/api/admin/payments/pending');
      setPendingOrders(res.data);
    } catch (err) {
      console.error('Fetch pending orders error:', err.message);
    } finally {
      setPendingOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending_payments') {
      fetchPendingOrders();
    }
  }, [activeTab]);

  // Custom Popup Alert/Confirm States
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('info');

  const isModalOpen = showAddUserModal || showPasswordModal || showConfirm || showAlert || !!selectedSlipUrl || !!rejectModalOrder;

  useModalScrollLock(isModalOpen);

  const triggerAlert = (title, message, type = 'info') => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  // Fetch Core Admin Data
  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/stats')
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  // Fetch System Health Telemetry
  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await axios.get('/api/admin/system-health');
      setSystemHealth(res.data);
    } catch (err) {
      console.error('Error fetching system health:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setAuditLogsLoading(true);
    try {
      const res = await axios.get('/api/admin/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setAuditLogsLoading(false);
    }
  };

  // Fetch Announcements List
  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const res = await axios.get('/api/admin/announcements');
      setAnnouncementsList(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Fetch System Settings
  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/system-settings');
      setMaintenanceMode(res.data.maintenanceMode);
      if (res.data.globalBanner) {
        setBannerEnabled(res.data.globalBanner.enabled);
        setBannerMessage(res.data.globalBanner.message);
        setBannerType(res.data.globalBanner.type || 'info');
      }
      if (res.data.hqAddress) setHqAddress(res.data.hqAddress);
      if (res.data.hqMapUrl) setHqMapUrl(res.data.hqMapUrl);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Fetch Support Tickets
  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await axios.get('/api/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contact messages:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    const role = user?.role ? String(user.role).toLowerCase() : '';
    if (role === 'admin' || role === 'manager' || role === 'system_admin' || role === 'system-admin') {
      fetchData();
      fetchHealth();
      fetchSettings();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'messages') fetchContacts();
    if (activeTab === 'overview') fetchHealth();
    if (activeTab === 'announcements') fetchAnnouncements();
  }, [activeTab]);

  // Handle User Search & Filtering
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.org && u.org.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesPlan = planFilter === 'All' || u.plan === planFilter.toLowerCase();
      const matchesRole = roleFilter === 'All' || u.role === roleFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesRole;
    });
  }, [users, searchQuery, planFilter, roleFilter]);

  // Handle Audit Log Filtering
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = auditSearchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.adminName && log.adminName.toLowerCase().includes(q)) ||
        (log.targetUser && log.targetUser.toLowerCase().includes(q))
      );
    });
  }, [auditLogs, auditSearchQuery]);

  // Select User Financials
  const handleSelectUser = async (targetUser) => {
    setSelectedUser(targetUser);
    setUserFinancialsLoading(true);
    try {
      const res = await axios.get(`/api/admin/users/${targetUser._id}/financials`);
      setUserAccounts(res.data.accounts);
      setUserTransactions(res.data.transactions);
    } catch (err) {
      triggerAlert('Error', 'Failed to load user financial logs.', 'error');
    } finally {
      setUserFinancialsLoading(false);
    }
  };

  // Import Backup JSON File for Selected User
  const [importingBackup, setImportingBackup] = useState(false);
  const handleImportBackupFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        if (!jsonContent) {
          triggerAlert('Import Error', 'Invalid or empty JSON file format.', 'error');
          return;
        }

        setImportingBackup(true);
        const res = await axios.post(`/api/admin/users/${selectedUser._id}/import-backup`, jsonContent);

        triggerAlert('Import Successful', res.data.message, 'success');
        handleSelectUser(selectedUser);
        fetchData();
      } catch (parseErr) {
        console.error('Import error:', parseErr);
        const errorMsg = parseErr.response?.data?.message || parseErr.message || 'Failed to import backup file into user account.';
        triggerAlert('Import Error', errorMsg, 'error');
      } finally {
        setImportingBackup(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Toggle Email Verification Status
  const handleToggleVerify = async (targetUser) => {
    try {
      const res = await axios.put(`/api/admin/users/${targetUser._id}/verify`, {
        isVerified: !targetUser.isVerified
      });
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, isVerified: res.data.isVerified } : u));
      if (selectedUser?._id === targetUser._id) {
        setSelectedUser(prev => ({ ...prev, isVerified: res.data.isVerified }));
      }
      triggerAlert('Status Updated', res.data.message, 'success');
    } catch (err) {
      triggerAlert('Error', 'Failed to update email verification status.', 'error');
    }
  };

  // Toggle User Status (Active / Suspended)
  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      await axios.put(`/api/admin/users/${targetUser._id}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, status: newStatus } : u));
      if (selectedUser?._id === targetUser._id) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
      triggerAlert('Status Updated', `User status updated to ${newStatus}`, 'success');
    } catch (err) {
      triggerAlert('Error', 'Failed to update status.', 'error');
    }
  };

  // Change User Plan
  const handleChangePlan = async (targetUser, newPlan) => {
    try {
      const res = await axios.put(`/api/admin/users/${targetUser._id}/plan`, {
        plan: newPlan,
        planType: newPlan === 'free' ? 'none' : 'yearly'
      });
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, plan: res.data.plan, planType: res.data.planType } : u));
      if (selectedUser?._id === targetUser._id) {
        setSelectedUser(prev => ({ ...prev, plan: res.data.plan, planType: res.data.planType }));
      }
      fetchData();
      triggerAlert('Plan Updated', `Plan updated to ${newPlan.toUpperCase()}`, 'success');
    } catch (err) {
      triggerAlert('Error', 'Failed to update plan.', 'error');
    }
  };

  // Change User Role
  const handleChangeRole = async (targetUser, newRole) => {
    try {
      await axios.put(`/api/admin/users/${targetUser._id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
      if (selectedUser?._id === targetUser._id) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }
      fetchData();
      triggerAlert('Role Updated', `Role set to ${newRole}`, 'success');
    } catch (err) {
      triggerAlert('Error', 'Failed to update role.', 'error');
    }
  };

  // Open Password Reset Modal
  const handleOpenResetPassword = (targetUser) => {
    setResetUser(targetUser);
    setNewPasswordVal('');
    setShowPasswordModal(true);
  };

  // Submit Password Reset
  const handleSubmitPasswordReset = async (e) => {
    e.preventDefault();
    if (!resetUser || !newPasswordVal || newPasswordVal.length < 6) return;

    setSubmittingPassword(true);
    try {
      const res = await axios.put(`/api/admin/users/${resetUser._id}/password`, {
        newPassword: newPasswordVal
      });
      setShowPasswordModal(false);
      triggerAlert('Password Reset', res.data.message, 'success');
    } catch (err) {
      triggerAlert('Reset Error', err.response?.data?.message || 'Failed to reset password.', 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Handle Manual Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!addEmail) return;

    setSavingUser(true);
    try {
      const res = await axios.post('/api/admin/users', {
        email: addEmail,
        name: addName,
        password: addPassword || 'prasatek123',
        role: addRole,
        status: addStatus,
        org: addOrg,
        isVerified: addIsVerified
      });

      setShowAddUserModal(false);
      fetchData();
      setAddEmail('');
      setAddName('');
      setAddPassword('');
      triggerAlert('User Created', `User ${res.data.email} successfully created.`, 'success');
    } catch (err) {
      triggerAlert('Error', err.response?.data?.message || 'Failed to create user.', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  // Delete User Cascade
  const handleDeleteUser = (targetUser) => {
    setConfirmTitle('Delete User Profile');
    setConfirmMsg(`Are you sure you want to PERMANENTLY delete profile ${targetUser.email}? This will cascade delete all their accounts and transaction history.`);
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`/api/admin/users/${targetUser._id}`);
        if (selectedUser?._id === targetUser._id) setSelectedUser(null);
        fetchData();
        triggerAlert('User Deleted', 'User and financial logs successfully removed.', 'success');
      } catch (err) {
        triggerAlert('Error', err.response?.data?.message || 'Failed to delete user.', 'error');
      }
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  // Broadcast & Schedule System Announcement
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMsg) return;

    setSendingAnnouncement(true);
    try {
      const res = await axios.post('/api/admin/announcements', {
        title: announcementTitle,
        message: announcementMsg,
        type: announcementType,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : new Date(),
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null
      });
      setAnnouncementTitle('');
      setAnnouncementMsg('');
      setScheduledStart('');
      setScheduledEnd('');
      fetchAnnouncements();
      triggerAlert('Announcement Broadcasted', res.data.message, 'success');
    } catch (err) {
      triggerAlert('Broadcast Error', 'Failed to send announcement.', 'error');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (announcement) => {
    setConfirmTitle('Delete Announcement');
    setConfirmMsg(`Are you sure you want to delete announcement "${announcement.title}"? This will also remove the notification from all user feeds.`);
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`/api/admin/announcements/${announcement._id}`);
        fetchAnnouncements();
        triggerAlert('Deleted', 'Announcement deleted successfully.', 'success');
      } catch (err) {
        triggerAlert('Error', 'Failed to delete announcement.', 'error');
      }
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  // Send Support Ticket Email Reply
  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!selectedContact || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await axios.post(`/api/contacts/${selectedContact._id}/reply`, {
        replyMessage: replyText
      });
      setReplyText('');
      setSelectedContact(res.data.contact);
      fetchContacts();
      triggerAlert('Email Sent', res.data.message, 'success');
    } catch (err) {
      triggerAlert('Error', err.response?.data?.message || 'Failed to send reply email.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  // Update System Operational Settings (Maintenance Mode / Global Banner)
  const handleUpdateSystemSettings = async () => {
    setUpdatingSettings(true);
    try {
      await axios.post('/api/admin/system-settings', {
        maintenanceMode,
        globalBanner: {
          enabled: bannerEnabled,
          message: bannerMessage,
          type: bannerType
        },
        hqAddress,
        hqMapUrl
      });
      triggerAlert('Settings Saved', 'System operational parameters updated successfully.', 'success');
    } catch (err) {
      triggerAlert('Error', 'Failed to update system settings.', 'error');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  const isAdminOrManager = userRole === 'admin' || userRole === 'manager' || userRole === 'system_admin' || userRole === 'system-admin';

  if (!isAdminOrManager) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <Lock className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-3xl font-extrabold">Access Restricted</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md">
          You need Administrator or Manager privileges to view this control panel.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 bg-prasatek-primary hover:bg-[#09734a] text-white font-bold px-6 py-3 rounded-xl transition shadow-lg cursor-pointer text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-prasatek-primary selection:text-white pb-12">
      
      {/* Top Header Navbar */}
      <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-prasatek-primary/20 text-prasatek-primary px-2.5 py-0.5 rounded-full border border-prasatek-primary/30">
                  Master Control Panel
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-0.5">System Administration</h1>
            </div>
          </div>

          {/* Quick System Telemetry pill */}
          {systemHealth && (
            <div className="hidden sm:flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-prasatek-primary" />
                <span>Uptime: <strong className="text-white">{systemHealth.uptimeFormatted}</strong></span>
              </div>
              <div className="w-[1px] h-3 bg-slate-800"></div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>RAM: <strong className="text-white">{systemHealth.memoryHeapMb} MB</strong></span>
              </div>
              <div className="w-[1px] h-3 bg-slate-800"></div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>DB: <strong className="text-green-400">{systemHealth.dbStatus}</strong></span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs px-4 py-2 rounded-xl border border-red-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 mt-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scroll bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'overview' ? 'bg-prasatek-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Telemetry & Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'users' ? 'bg-prasatek-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            User Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('pending_payments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'pending_payments' ? 'bg-prasatek-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-green-400" />
            Pending Payments ({pendingOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'audit' ? 'bg-prasatek-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Security Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'announcements' ? 'bg-prasatek-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            Broadcast & Operational Settings
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer shrink-0 ${
              activeTab === 'messages' ? 'bg-prasatek-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            Client Support Tickets ({contacts.length})
          </button>
        </div>

        {/* ==================== TAB 1: OVERVIEW & TELEMETRY ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Total Registered</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalUsers}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Across {stats.totalOrgs} Branches</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Enterprise Plans</p>
                  <h3 className="text-3xl font-extrabold text-purple-400 mt-1">{stats.enterpriseUsers}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">{stats.proUsers} Pro / {stats.freeUsers} Free</p>
                </div>
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Financial Accounts</p>
                  <h3 className="text-3xl font-extrabold text-green-400 mt-1">{stats.totalAccounts}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">{stats.totalTransactions} Total Logs</p>
                </div>
                <div className="p-3 bg-green-500/10 text-prasatek-primary rounded-2xl border border-green-500/20">
                  <Database className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Security State</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{stats.privilegedUsers}</h3>
                  <p className="text-[11px] text-red-400 font-semibold mt-1">{stats.suspendedUsers} Suspended Users</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Server Telemetry Details Card */}
            {systemHealth && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-prasatek-primary" />
                    Live Server Telemetry & System Diagnostics
                  </h3>
                  <button 
                    onClick={fetchHealth}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
                    Refresh Stats
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-extrabold uppercase text-slate-500">Node Runtime</p>
                    <p className="text-sm font-extrabold text-white mt-1">{systemHealth.nodeVersion}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{systemHealth.platform}</p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-extrabold uppercase text-slate-500">Memory RSS</p>
                    <p className="text-sm font-extrabold text-purple-400 mt-1">{systemHealth.memoryRssMb} MB</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Heap: {systemHealth.memoryHeapMb} MB</p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-extrabold uppercase text-slate-500">Server Uptime</p>
                    <p className="text-sm font-extrabold text-green-400 mt-1">{systemHealth.uptimeFormatted}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{systemHealth.uptimeSeconds}s total</p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-extrabold uppercase text-slate-500">Database Engine</p>
                    <p className="text-sm font-extrabold text-blue-400 mt-1">{systemHealth.dbStatus}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">MongoDB Atlas</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: PENDING BANK PAYMENTS ==================== */}
        {activeTab === 'pending_payments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-prasatek-primary" />
                    Pending Bank Deposit Payments Manager
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Verify uploaded payment slips, check order reference numbers, and approve user plan upgrades.
                  </p>
                </div>
                <button
                  onClick={fetchPendingOrders}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
                </button>
              </div>

              {pendingOrdersLoading ? (
                <div className="py-12 text-center text-xs text-slate-400 font-bold">
                  Loading pending payment orders...
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-bold">
                  No pending bank deposit payment orders found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 font-semibold">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase font-extrabold text-slate-500">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">User Details</th>
                        <th className="py-3 px-3">Plan / Cycle</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Payment Slip</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {pendingOrders.map(ord => (
                        <tr key={ord._id} className="hover:bg-slate-900/50 transition">
                          <td className="py-3 px-3 font-mono font-bold text-prasatek-primary">{ord.orderId}</td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-white">{ord.userId?.name || 'Unknown User'}</p>
                            <p className="text-[10px] text-slate-400">{ord.userId?.email}</p>
                            {ord.userId?.mobile && <p className="text-[10px] text-slate-500">{ord.userId.mobile}</p>}
                          </td>
                          <td className="py-3 px-3 uppercase font-extrabold text-slate-200">
                            {ord.plan} ({ord.billingCycle})
                          </td>
                          <td className="py-3 px-3 font-bold text-green-400">
                            LKR {ord.amount?.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {new Date(ord.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            {ord.receiptUrl ? (
                              <button
                                onClick={() => setSelectedSlipUrl(ord.receiptUrl)}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold border border-blue-500/20 rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" /> Preview Slip
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">No Slip Attached</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setConfirmTitle('Approve Payment Order');
                                  setConfirmMsg(`Are you sure you want to approve Order ${ord.orderId} for ${ord.userId?.name} (${ord.userId?.email})? This will immediately upgrade them to the ${ord.plan.toUpperCase()} plan.`);
                                  setConfirmAction(() => async () => {
                                    try {
                                      const res = await axios.put(`/api/admin/payments/${ord._id}/approve`);
                                      triggerAlert('Approved & Activated', res.data.message, 'success');
                                      fetchPendingOrders();
                                      fetchData();
                                    } catch (err) {
                                      triggerAlert('Approval Error', err.response?.data?.message || 'Failed to approve payment.', 'error');
                                    }
                                  });
                                  setShowConfirm(true);
                                }}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-extrabold rounded-xl border border-green-500/30 transition text-xs cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Activate
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalOrder(ord);
                                  setRejectReason('');
                                }}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-extrabold rounded-xl border border-red-500/30 transition text-xs cursor-pointer flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: USER DIRECTORY ==================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Search & Filter Controls */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 outline-none focus:border-prasatek-primary transition"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="bg-slate-900 text-slate-300 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-800 outline-none cursor-pointer"
                >
                  <option value="All">All Plans</option>
                  <option value="Free">Free Plan</option>
                  <option value="Pro">Pro Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-900 text-slate-300 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-800 outline-none cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create User
                </button>
              </div>
            </div>

            {/* Users Grid / Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* User List */}
              <div className="lg:col-span-7 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 overflow-hidden">
                <div className="flex justify-between items-center px-2 pb-2 border-b border-slate-900">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">User Directory</span>
                  <span className="text-[10px] font-bold text-slate-400">Showing {filteredUsers.length} Users</span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto hide-scroll pr-1">
                  {filteredUsers.map(u => {
                    const isSelected = selectedUser?._id === u._id;
                    return (
                      <div 
                        key={u._id}
                        onClick={() => handleSelectUser(u)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex flex-wrap items-center justify-between gap-3 ${
                          isSelected ? 'bg-slate-900 border-prasatek-primary/50 shadow-md' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-10 h-10 rounded-full bg-slate-800 text-prasatek-primary font-extrabold flex items-center justify-center text-sm border border-slate-700">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-white">{u.name}</h4>
                              {u.isVerified ? (
                                <span title="Email Verified"><CheckCircle2 className="w-3.5 h-3.5 text-prasatek-primary" /></span>
                              ) : (
                                <span title="Email Unverified"><XCircle className="w-3.5 h-3.5 text-amber-500" /></span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-400 truncate max-w-[180px]">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={u.plan || 'free'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleChangePlan(u, e.target.value)}
                            className="bg-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border border-slate-800 outline-none cursor-pointer text-purple-400"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>

                          <select
                            value={u.role || 'user'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleChangeRole(u, e.target.value)}
                            className="bg-slate-950 text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg border border-slate-800 outline-none cursor-pointer text-slate-300"
                          >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenResetPassword(u);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                            title="Reset User Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(u);
                            }}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition cursor-pointer"
                            title="Delete User Cascade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected User Detail Inspector */}
              <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 max-h-[750px] overflow-y-auto hide-scroll">
                {selectedUser ? (
                  <div className="space-y-4 animate-fade-in text-xs font-semibold">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-prasatek-primary tracking-wider">User Profile Inspector</span>
                        <h3 className="text-lg font-extrabold text-white mt-0.5">{selectedUser.name}</h3>
                        <p className="text-xs text-slate-400 font-semibold">{selectedUser.email}</p>
                        {selectedUser.mobile && (
                          <p className="text-[11px] text-prasatek-primary font-bold mt-0.5">Mobile: {selectedUser.mobile}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                          selectedUser.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                          {selectedUser.status}
                        </span>

                        {/* Import JSON Backup Button */}
                        <label className="bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl border border-green-500/30 transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{importingBackup ? 'Importing...' : 'Import JSON Backup'}</span>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportBackupFile}
                            disabled={importingBackup}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Account Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[9px] font-extrabold uppercase block">Mobile Number</span>
                        <span className="text-white font-extrabold">{selectedUser.mobile || 'Not set'}</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[9px] font-extrabold uppercase block">Auth Provider</span>
                        <span className="text-purple-400 font-extrabold uppercase">{selectedUser.authProvider || 'manual'}</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[9px] font-extrabold uppercase block">User Role</span>
                        <span className="text-white font-extrabold uppercase">{selectedUser.role || 'user'}</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[9px] font-extrabold uppercase block">Plan Tier</span>
                        <span className="text-green-400 font-extrabold uppercase">{selectedUser.plan || 'free'}</span>
                      </div>
                    </div>

                    {/* Toggles Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[9px] font-extrabold uppercase block">Verification State</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className={selectedUser.isVerified ? 'text-green-400 font-extrabold' : 'text-amber-400 font-extrabold'}>
                            {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                          <button
                            onClick={() => handleToggleVerify(selectedUser)}
                            className="text-[9px] font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md transition cursor-pointer"
                          >
                            Toggle State
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 text-[9px] font-extrabold uppercase block">Account Status</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className={selectedUser.status === 'suspended' ? 'text-red-400 font-extrabold' : 'text-green-400 font-extrabold'}>
                            {selectedUser.status}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(selectedUser)}
                            className="text-[9px] font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md transition cursor-pointer"
                          >
                            {selectedUser.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Financial Accounts List */}
                    <div className="space-y-2 pt-3 border-t border-slate-900">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-white">Financial Accounts ({userAccounts.length})</h4>
                        <span className="text-[10px] text-slate-400">{userTransactions.length} Total Logs</span>
                      </div>

                      {userFinancialsLoading ? (
                        <div className="py-4 text-center text-xs text-slate-500">Loading accounts...</div>
                      ) : userAccounts.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-500 font-bold bg-slate-900/50 rounded-xl">No Accounts Logged</div>
                      ) : (
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto hide-scroll">
                          {userAccounts.map(acc => (
                            <div key={acc._id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-extrabold text-white">{acc.name}</span>
                                {acc.type && <span className="text-[9px] uppercase font-bold text-slate-500 ml-2">({acc.type})</span>}
                              </div>
                              <span className="font-extrabold text-prasatek-primary">{acc.initialBalance} LKR</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Transaction History Log */}
                    <div className="space-y-2 pt-3 border-t border-slate-900">
                      <h4 className="text-xs font-extrabold text-white flex justify-between items-center">
                        <span>Transaction History ({userTransactions.length})</span>
                      </h4>

                      {userFinancialsLoading ? (
                        <div className="py-4 text-center text-xs text-slate-500">Loading history...</div>
                      ) : userTransactions.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-500 font-bold bg-slate-900/50 rounded-xl">No Transaction History Logged</div>
                      ) : (
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto hide-scroll pr-1">
                          {userTransactions.map(tx => (
                            <div key={tx._id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 flex justify-between items-center text-[11px]">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-extrabold uppercase text-[9px] px-1.5 py-0.5 rounded ${
                                    tx.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {tx.type}
                                  </span>
                                  <span className="font-bold text-white">{tx.category || 'General'}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">{tx.description || 'No notes'} • {new Date(tx.date || tx.createdAt || Date.now()).toLocaleDateString()}</p>
                              </div>
                              <span className={`font-extrabold text-xs ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount} LKR
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-3">
                    <Users className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Select a user to inspect profile, accounts & history</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 3: AUDIT LOGS ==================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-prasatek-primary" />
                <h3 className="text-sm font-extrabold text-white">Security & Administrative Activity Stream</h3>
              </div>
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter audit logs..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl pl-10 pr-4 py-2 border border-slate-800 outline-none focus:border-prasatek-primary"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {auditLogsLoading ? (
                <div className="py-12 text-center text-xs font-bold text-slate-500">Loading audit trail...</div>
              ) : filteredAuditLogs.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-slate-500">No audit logs recorded yet</div>
              ) : (
                <div className="space-y-2 max-h-[550px] overflow-y-auto hide-scroll pr-1">
                  {filteredAuditLogs.map((log) => (
                    <div key={log._id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-md ${
                          log.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          log.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {log.action}
                        </span>
                        <div>
                          <p className="font-extrabold text-white">{log.details}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            By {log.adminName} • IP: {log.ipAddress}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ANNOUNCEMENTS & OPERATIONAL SETTINGS ==================== */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Left Column: Scheduled Announcements Manager */}
            <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-prasatek-primary" />
                  <h3 className="text-sm font-extrabold text-white">Scheduled Broadcast Announcements</h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">{announcementsList.length} Announcements</span>
              </div>

              {/* Create Scheduled Announcement Form */}
              <form onSubmit={handleSendAnnouncement} className="space-y-4 bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Create New Announcement</h4>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Title Line</label>
                  <input
                    type="text"
                    placeholder="e.g., Scheduled Server Maintenance Notice"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none focus:border-prasatek-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Severity Type</label>
                    <select
                      value={announcementType}
                      onChange={(e) => setAnnouncementType(e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 text-xs font-bold rounded-xl p-2.5 border border-slate-800 outline-none cursor-pointer"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Schedule Start Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledStart}
                      onChange={(e) => setScheduledStart(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-2 border border-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Schedule End Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledEnd}
                      onChange={(e) => setScheduledEnd(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-2 border border-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Message Content</label>
                  <textarea
                    rows="3"
                    placeholder="Enter announcement text to send to all user feeds..."
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none focus:border-prasatek-primary resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingAnnouncement}
                  className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {sendingAnnouncement ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </form>

              {/* Active & Scheduled Announcements List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Active Broadcast History ({announcementsList.length})</h4>
                
                {announcementsLoading ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-bold">Loading announcements...</div>
                ) : announcementsList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-bold bg-slate-900/50 rounded-xl">No Announcements Broadcasted</div>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto hide-scroll pr-1">
                    {announcementsList.map(a => (
                      <div key={a._id} className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              a.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                              a.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {a.type}
                            </span>
                            <h5 className="font-extrabold text-sm text-white">{a.title}</h5>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{a.message}</p>
                          <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-prasatek-primary" />
                            <span>Created: {new Date(a.createdAt).toLocaleString()}</span>
                            {a.scheduledStart && <span>• Start: {new Date(a.scheduledStart).toLocaleDateString()}</span>}
                            {a.scheduledEnd && <span>• End: {new Date(a.scheduledEnd).toLocaleDateString()}</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAnnouncement(a)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition cursor-pointer shrink-0"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: System Operational Parameters & Maintenance Mode */}
            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-extrabold text-white">System Operational Settings</h3>
              </div>

              <div className="space-y-5">
                {/* Maintenance Mode Card */}
                <div className={`p-4 rounded-2xl border transition ${
                  maintenanceMode ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${maintenanceMode ? 'text-red-400 animate-bounce' : 'text-slate-400'}`} />
                        <h4 className="text-xs font-extrabold text-white">System Maintenance Mode</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1">
                        When enabled, all non-admin users are automatically logged out, and the Auth screen displays a maintenance banner.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>

                {/* Global Alert Banner Card */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-prasatek-primary" />
                      Global Header Alert Banner
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={bannerEnabled}
                        onChange={(e) => setBannerEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-prasatek-primary"></div>
                    </label>
                  </div>

                  {bannerEnabled && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Banner Type</label>
                        <select
                          value={bannerType}
                          onChange={(e) => setBannerType(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-xs font-bold rounded-xl p-2.5 border border-slate-800 outline-none"
                        >
                          <option value="info">Info (Blue)</option>
                          <option value="warning">Warning (Amber)</option>
                          <option value="success">Success (Green)</option>
                          <option value="danger">Danger (Red)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Header Banner Message</label>
                        <input
                          type="text"
                          placeholder="e.g., Notice: Server upgrade scheduled for tonight at 11 PM LKR."
                          value={bannerMessage}
                          onChange={(e) => setBannerMessage(e.target.value)}
                          className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Headquarters Location & Google Map Embed Settings */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-prasatek-primary" />
                    Headquarters Location & Google Map Embed
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Paste a Google Maps embed link or &lt;iframe&gt; code to update the Contact Page map & location in real-time.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Headquarters Physical Address</label>
                      <input
                        type="text"
                        placeholder="e.g., Kottawa Road, Colombo District, Sri Lanka"
                        value={hqAddress}
                        onChange={(e) => setHqAddress(e.target.value)}
                        className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none focus:ring-2 focus:ring-prasatek-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Google Maps Embed Link / &lt;iframe&gt; Code</label>
                      <textarea
                        rows="3"
                        placeholder="Paste Google Maps embed URL (https://www.google.com/maps/embed?...) or full <iframe> code"
                        value={hqMapUrl}
                        onChange={(e) => setHqMapUrl(e.target.value)}
                        className="w-full bg-slate-950 text-white text-xs font-mono font-bold rounded-xl p-3 border border-slate-800 outline-none focus:ring-2 focus:ring-prasatek-primary resize-none"
                      />
                    </div>

                    {hqMapUrl && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Live Map Preview</label>
                        <div className="rounded-xl overflow-hidden border border-slate-800 h-36 bg-slate-950">
                          <iframe
                            src={hqMapUrl.includes('src="') ? (hqMapUrl.match(/src="([^"]+)"/)?.[1] || hqMapUrl) : hqMapUrl}
                            className="w-full h-full border-0"
                            loading="lazy"
                            title="Admin HQ Map Preview"
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpdateSystemSettings}
                  disabled={updatingSettings}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {updatingSettings ? 'Saving Settings...' : 'Save System Operational Settings'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 5: CLIENT SUPPORT TICKETS ==================== */}
        {activeTab === 'messages' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-prasatek-primary" />
                <h3 className="text-sm font-extrabold text-white">Client Inquiry & Support Tickets</h3>
              </div>
              <span className="text-xs font-extrabold text-slate-400">{contacts.length} Total Messages</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 max-h-[600px] overflow-y-auto hide-scroll">
                {contactsLoading ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-bold">Loading support messages...</div>
                ) : contacts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-bold">No inquiry tickets logged</div>
                ) : (
                  contacts.map(c => (
                    <div 
                      key={c._id}
                      onClick={() => setSelectedContact(c)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                        selectedContact?._id === c._id ? 'bg-slate-900 border-prasatek-primary' : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-white">{c.subject || 'General Inquiry'}</h4>
                          {c.status === 'replied' && (
                            <span className="text-[9px] font-extrabold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md">Replied</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{c.name} • {c.email}</p>
                        {c.mobile && <p className="text-[10px] text-prasatek-primary font-bold">Mobile: {c.mobile}</p>}
                      </div>
                      <span className="text-[9px] font-extrabold uppercase bg-slate-800 text-slate-400 px-2 py-1 rounded-md shrink-0">
                        {c.category || 'General'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                {selectedContact ? (
                  <div className="space-y-4 text-xs font-semibold animate-fade-in">
                    <div className="border-b border-slate-900 pb-3 flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-prasatek-primary">{selectedContact.category}</span>
                        <h3 className="text-lg font-extrabold text-white mt-1">{selectedContact.subject}</h3>
                        <p className="text-slate-400 mt-0.5">
                          From: <strong className="text-white">{selectedContact.name}</strong> ({selectedContact.email})
                          {selectedContact.mobile && <span className="text-prasatek-primary font-bold block">Mobile: {selectedContact.mobile}</span>}
                        </p>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        selectedContact.status === 'replied' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {selectedContact.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-500">Client Message Content</span>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {selectedContact.message}
                      </div>
                    </div>

                    {/* Display Previous Admin Reply if exists */}
                    {selectedContact.adminReply && (
                      <div className="space-y-2 pt-2 border-t border-slate-900">
                        <span className="text-[10px] font-extrabold uppercase text-green-400">Previous Admin Email Reply Sent</span>
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {selectedContact.adminReply}
                        </div>
                        {selectedContact.repliedAt && (
                          <p className="text-[10px] text-slate-500 font-bold">Sent on: {new Date(selectedContact.repliedAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}

                    {/* Official Email Reply Form */}
                    <form onSubmit={handleSendTicketReply} className="space-y-3 pt-4 border-t border-slate-900">
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-prasatek-primary" />
                        Reply to Ticket via Official Email (noreply@prasatek.lk)
                      </h4>

                      <textarea
                        rows="4"
                        placeholder={`Type official support response to send to ${selectedContact.email}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-slate-900 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none focus:border-prasatek-primary resize-none"
                        required
                      />

                      <button
                        type="submit"
                        disabled={sendingReply}
                        className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {sendingReply ? 'Sending Email Reply...' : 'Send Official Email Reply'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="py-20 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Select a ticket to inspect message details and send official reply
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Manual Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4 animate-fade-in">
          <div className="modal-content-container scrollable-modal-content relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl touch-auto">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Plus className="w-4 h-4 text-prasatek-primary" />
                Create User Profile
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Default: prasatek123"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Role</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full bg-slate-950 text-slate-300 text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 font-bold py-3 rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="w-1/2 bg-prasatek-primary hover:bg-[#09734a] font-bold py-3 rounded-xl transition text-xs shadow-md disabled:opacity-50"
                >
                  {savingUser ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Password Reset Modal */}
      {showPasswordModal && resetUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4 animate-fade-in">
          <div className="modal-content-container scrollable-modal-content relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl touch-auto">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Reset User Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitPasswordReset} className="space-y-4">
              <p className="text-xs text-slate-400">
                Manually set a new password for <strong className="text-white">{resetUser.email}</strong>.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">New Password (min 6 chars)</label>
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-bold rounded-xl p-3 border border-slate-800 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 font-bold py-3 rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="w-1/2 bg-purple-600 hover:bg-purple-700 font-bold py-3 rounded-xl transition text-xs shadow-md disabled:opacity-50"
                >
                  {submittingPassword ? 'Saving...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4 animate-fade-in">
          <div className="modal-content-container scrollable-modal-content relative max-h-[85vh] w-[90%] max-w-sm overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white text-center space-y-4 shadow-2xl touch-auto">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-extrabold">{confirmTitle}</h3>
            <p className="text-xs text-slate-400 font-semibold">{confirmMsg}</p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 font-bold py-3 rounded-xl transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
                className="w-1/2 bg-red-600 hover:bg-red-700 font-bold py-3 rounded-xl transition text-xs shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Banner Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4 animate-fade-in">
          <div className="modal-content-container scrollable-modal-content relative max-h-[85vh] w-[90%] max-w-sm overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white text-center space-y-4 shadow-2xl touch-auto">
            {alertType === 'error' ? (
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            ) : alertType === 'success' ? (
              <CheckCircle2 className="w-12 h-12 text-prasatek-primary mx-auto" />
            ) : (
              <Bell className="w-12 h-12 text-blue-400 mx-auto" />
            )}
            <h3 className="text-lg font-extrabold">{alertTitle}</h3>
            <p className="text-xs text-slate-400 font-semibold">{alertMsg}</p>

            <button
              onClick={() => setShowAlert(false)}
              className="w-full bg-prasatek-primary hover:bg-[#09734a] font-bold py-3 rounded-xl transition text-xs cursor-pointer shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Payment Slip Preview Modal */}
      {selectedSlipUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4 animate-fade-in">
          <div className="modal-content-container scrollable-modal-content relative max-h-[85vh] w-[90%] max-w-4xl overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center shadow-2xl touch-auto">
            <button
              onClick={() => setSelectedSlipUrl(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full transition cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-white mb-4">Payment Receipt Slip Preview</h3>
            
            <div className="w-full flex-1 overflow-auto flex items-center justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {selectedSlipUrl.endsWith('.pdf') ? (
                <iframe src={selectedSlipUrl} title="Slip PDF" className="w-full h-[600px] rounded-xl" />
              ) : (
                <img src={selectedSlipUrl} alt="Payment Slip Proof" className="max-w-full max-h-[600px] object-contain rounded-xl shadow-lg" />
              )}
            </div>
            
            <a
              href={selectedSlipUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 px-4 py-2 bg-prasatek-primary hover:bg-[#09734a] text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Open Full Resolution / Download
            </a>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4 animate-fade-in">
          <div className="modal-content-container scrollable-modal-content relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white space-y-4 shadow-2xl touch-auto">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h3 className="text-base font-extrabold">Reject Payment Order</h3>
                <p className="text-xs text-slate-400">Order: <span className="font-mono text-white">{rejectModalOrder.orderId}</span></p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason for Rejection</label>
              <textarea
                rows={3}
                placeholder="e.g. Deposit slip image is unreadable / Amount does not match Order ID..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 font-bold py-2.5 rounded-xl transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await axios.put(`/api/admin/payments/${rejectModalOrder._id}/reject`, {
                      adminNotes: rejectReason || 'Payment slip could not be verified.'
                    });
                    triggerAlert('Payment Rejected', res.data.message, 'warning');
                    setRejectModalOrder(null);
                    fetchPendingOrders();
                    fetchData();
                  } catch (err) {
                    triggerAlert('Error', err.response?.data?.message || 'Failed to reject payment.', 'error');
                  }
                }}
                className="w-1/2 bg-red-600 hover:bg-red-700 font-bold py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
