import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';


export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users'); // dashboard, users, orgs, messages, settings
  const [stats, setStats] = useState({ totalUsers: 0, privilegedUsers: 0, suspendedUsers: 0, totalOrgs: 1 });
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected user detail
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [userFinancialsLoading, setUserFinancialsLoading] = useState(false);

  // Contact support messages
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsSearchQuery, setContactsSearchQuery] = useState('');
  const [contactsFilterCategory, setContactsFilterCategory] = useState('All');
  const [contactsFilterStatus, setContactsFilterStatus] = useState('All');

  // Manual Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('user');
  const [addStatus, setAddStatus] = useState('active');
  const [addOrg, setAddOrg] = useState('default');
  const [savingUser, setSavingUser] = useState(false);

  // Backup Import States
  const [importingData, setImportingData] = useState(false);
  const [overwriteOnImport, setOverwriteOnImport] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);

  // Organizations list
  const [orgs, setOrgs] = useState([
    { id: 'default', name: 'Default Main Pool', location: 'HQ', userCount: 0 },
    { id: 'central-pepiliyana', name: 'Central Stores - Pepiliyana', location: 'Pepiliyana', userCount: 0 }
  ]);

  // Global Settings Settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Colombo (GMT+5:30)');

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
      
      // Update user counts for organizations
      const orgCounts = { default: 0, 'central-pepiliyana': 0 };
      res.data.forEach(u => {
        const orgId = u.org || 'default';
        if (orgCounts[orgId] !== undefined) {
          orgCounts[orgId]++;
        } else {
          orgCounts[orgId] = 1;
        }
      });
      setOrgs(prev => prev.map(o => ({ ...o, userCount: orgCounts[o.id] || 0 })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const res = await axios.get('/api/contacts');
      setContacts(res.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleMarkContactAsRead = async (id) => {
    try {
      await axios.put(`/api/contacts/${id}/read`);
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status: 'read' } : c));
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(prev => ({ ...prev, status: 'read' }));
      }
    } catch (error) {
      alert('Failed to mark message as read.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (confirm('Are you sure you want to permanently delete this contact message?')) {
      try {
         await axios.delete(`/api/contacts/${id}`);
         setContacts(prev => prev.filter(c => c._id !== id));
         if (selectedContact && selectedContact._id === id) {
           setSelectedContact(null);
         }
      } catch (error) {
         alert('Failed to delete message.');
      }
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchContacts();
  }, []);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') fetchStats();
    if (tab === 'users') fetchUsers();
    if (tab === 'messages') fetchContacts();
  };

  const loadUserDetails = async (u) => {
    setSelectedUser(u);
    setUserFinancialsLoading(true);
    try {
      const res = await axios.get(`/api/admin/users/${u._id}/financials`);
      setUserAccounts(res.data.accounts);
      setUserTransactions(res.data.transactions);
    } catch (error) {
      console.error('Error loading financials:', error);
    } finally {
      setUserFinancialsLoading(false);
    }
  };

  const handleRoleChange = async (e) => {
    if (!selectedUser) return;
    const newRole = e.target.value;
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}/role`, { role: newRole });
      setSelectedUser(prev => ({ ...prev, role: newRole }));
      fetchUsers();
    } catch (error) {
      alert('Failed to update role.');
    }
  };

  const handleStatusChange = async (e) => {
    if (!selectedUser) return;
    const newStatus = e.target.value;
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}/status`, { status: newStatus });
      setSelectedUser(prev => ({ ...prev, status: newStatus }));
      fetchUsers();
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const handleOrgChange = async (e) => {
    if (!selectedUser) return;
    const newOrg = e.target.value;
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}/org`, { org: newOrg });
      setSelectedUser(prev => ({ ...prev, org: newOrg }));
      fetchUsers();
    } catch (error) {
      alert('Failed to update branch.');
    }
  };

  const handlePlanChange = async (e) => {
    if (!selectedUser) return;
    const newPlan = e.target.value;
    try {
      const res = await axios.put(`/api/admin/users/${selectedUser._id}/plan`, { plan: newPlan });
      setSelectedUser(prev => ({ ...prev, plan: res.data.plan, planExpiryDate: res.data.planExpiryDate, planStatus: res.data.planStatus, planType: res.data.planType }));
      fetchUsers();
    } catch (error) {
      alert('Failed to update plan.');
    }
  };

  const handlePlanTypeChange = async (e) => {
    if (!selectedUser) return;
    const newPlanType = e.target.value;
    try {
      const res = await axios.put(`/api/admin/users/${selectedUser._id}/plan`, { planType: newPlanType });
      setSelectedUser(prev => ({ ...prev, plan: res.data.plan, planExpiryDate: res.data.planExpiryDate, planStatus: res.data.planStatus, planType: res.data.planType }));
      fetchUsers();
    } catch (error) {
      alert('Failed to update billing cycle.');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!addEmail) return;
    setSavingUser(true);
    try {
      await axios.post('/api/admin/users', { 
        email: addEmail,
        name: addName,
        password: addPassword,
        role: addRole,
        status: addStatus,
        org: addOrg
      });
      setAddEmail('');
      setAddName('');
      setAddPassword('');
      setAddRole('user');
      setAddStatus('active');
      setAddOrg('default');
      setShowAddUserModal(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving user.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to permanently delete this user? This will also cascade delete all their accounts and transactions from the system!")) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setSelectedUser(null);
        fetchUsers();
        fetchStats();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteUserAccount = async (accId) => {
    if (confirm("Are you sure you want to permanently delete this user's account?")) {
      try {
        await axios.delete(`/api/admin/accounts/${accId}`);
        if (selectedUser) {
          loadUserDetails(selectedUser);
        }
      } catch (error) {
        alert('Failed to delete account.');
      }
    }
  };

  const handleDeleteUserTransaction = async (txId) => {
    if (confirm("Are you sure you want to permanently delete this user's transaction?")) {
      try {
        await axios.delete(`/api/admin/transactions/${txId}`);
        if (selectedUser) {
          loadUserDetails(selectedUser);
        }
      } catch (error) {
        alert('Failed to delete transaction.');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.accounts && !json.transactions) {
          return alert('Invalid backup file. Must contain accounts or transactions data.');
        }
        setPendingImportData(json);
        setShowImportModal(true);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportSubmit = async () => {
    if (!pendingImportData || !selectedUser) return;
    setImportingData(true);
    try {
      await axios.post(`/api/admin/users/${selectedUser._id}/import`, {
        ...pendingImportData,
        overwrite: overwriteOnImport
      });
      alert('Data imported successfully!');
      setShowImportModal(false);
      setPendingImportData(null);
      setOverwriteOnImport(false);
      loadUserDetails(selectedUser);
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error importing data.');
    } finally {
      setImportingData(false);
    }
  };

  const handleExportAudit = () => {
    if (!selectedUser || userTransactions.length === 0) {
      return alert('No transactions available to export for this user.');
    }
    let csvContent = 'Date,Type,Category,Description,Amount (RS)\n';
    userTransactions.forEach(tx => {
      const typeStr = tx.type === 'add' ? 'Income' : 'Expense';
      const catStr = tx.category || 'N/A';
      csvContent += `${tx.date},${typeStr},${catStr},"${tx.description.replace(/"/g, '""')}",${tx.amount.toFixed(2)}\n`;
    });
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuditLog_${selectedUser.email.split('@')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u._id && u._id.includes(searchQuery))
  );

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      (c.name && c.name.toLowerCase().includes(contactsSearchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(contactsSearchQuery.toLowerCase())) ||
      (c.subject && c.subject.toLowerCase().includes(contactsSearchQuery.toLowerCase())) ||
      (c.message && c.message.toLowerCase().includes(contactsSearchQuery.toLowerCase()));
      
    const matchesCategory = contactsFilterCategory === 'All' || c.category === contactsFilterCategory;
    const matchesStatus = contactsFilterStatus === 'All' || c.status === contactsFilterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const unreadContactsCount = contacts.filter(c => c.status === 'unread').length;

  // Compute actual account balances for detail panel
  const accountBalances = {};
  userAccounts.forEach(acc => {
    accountBalances[acc._id] = acc.initialBalance;
  });
  userTransactions.forEach(tx => {
    if (accountBalances[tx.accountId] !== undefined) {
      if (tx.type === 'add') {
        accountBalances[tx.accountId] += tx.amount;
      } else {
        accountBalances[tx.accountId] -= tx.amount;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-slate-800 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-prasatek-dark flex items-center justify-center text-white font-bold shadow-md">PT</div>
              <span className="font-extrabold text-xl tracking-tight">Admin<span className="text-prasatek-primary">Enterprise</span></span>
            </div>
            
            {/* Tab Navigation */}
            <div className="hidden md:flex items-center space-x-8 pt-1">
              <button 
                className={`${activeTab === 'dashboard' ? 'tab-active' : 'tab-inactive'} h-full px-1 py-4 text-sm transition-colors focus:outline-none cursor-pointer`}
                onClick={() => handleTabSwitch('dashboard')}
              >
                System Dashboard
              </button>
              <button 
                className={`${activeTab === 'users' ? 'tab-active' : 'tab-inactive'} h-full px-1 py-4 text-sm transition-colors focus:outline-none cursor-pointer`}
                onClick={() => handleTabSwitch('users')}
              >
                User Management
              </button>
              <button 
                className={`${activeTab === 'orgs' ? 'tab-active' : 'tab-inactive'} h-full px-1 py-4 text-sm transition-colors focus:outline-none cursor-pointer`}
                onClick={() => handleTabSwitch('orgs')}
              >
                Organizations
              </button>
              <button 
                className={`${activeTab === 'messages' ? 'tab-active' : 'tab-inactive'} h-full px-1 py-4 text-sm transition-colors focus:outline-none cursor-pointer flex items-center gap-1.5`}
                onClick={() => handleTabSwitch('messages')}
              >
                Support Inquiries
                {unreadContactsCount > 0 && (
                  <span className="bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full leading-none animate-pulse">
                    {unreadContactsCount}
                  </span>
                )}
              </button>
              <button 
                className={`${activeTab === 'settings' ? 'tab-active' : 'tab-inactive'} h-full px-1 py-4 text-sm transition-colors focus:outline-none cursor-pointer`}
                onClick={() => handleTabSwitch('settings')}
              >
                Global Settings
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                App Dashboard &rarr;
              </Link>
              <span className="text-sm font-bold text-slate-500 hidden sm:block">{user?.email}</span>
              <button 
                onClick={() => logout()}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer"
              >
                Secure Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. System Analytics Dashboard View */}
      {activeTab === 'dashboard' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total System Users</p>
              <h3 className="text-4xl font-extrabold text-slate-800">{stats.totalUsers}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Managers/Admins</p>
              <h3 className="text-4xl font-extrabold text-prasatek-primary">{stats.privilegedUsers}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Suspended Accounts</p>
              <h3 className="text-4xl font-extrabold text-red-500">{stats.suspendedUsers}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Branches</p>
              <h3 className="text-4xl font-extrabold text-blue-500">{stats.totalOrgs}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4">Recent System Logins</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50 font-bold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 rounded-r-lg">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map(u => (
                    <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-bold text-slate-800">{u.name || 'Unnamed'}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className={`px-4 py-3 font-bold uppercase text-[10px] ${u.role === 'admin' ? 'text-prasatek-primary' : 'text-slate-600'}`}>
                        {u.role}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* 2. User Management View */}
      {activeTab === 'users' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 relative w-full flex-1">
          {/* Users List */}
          <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[75vh]">
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">System Users</h2>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">{users.length} Users</p>
                </div>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="text-xs bg-prasatek-primary hover:bg-[#09734a] transition text-white px-3 py-1.5 rounded-lg shadow-sm font-bold flex items-center gap-1 cursor-pointer"
                >
                  + Add User
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name, email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-prasatek-light text-slate-800 text-xs font-bold rounded-xl pl-9 pr-4 py-2.5 border-none outline-none focus:ring-1 focus:ring-prasatek-primary transition"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-scroll p-3 space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 text-center py-4">No matching users found.</p>
              ) : (
                filteredUsers.map(u => {
                  const initial = (u.name || u.email || '?').charAt(0).toUpperCase();
                  const isSuspended = u.status === 'suspended';
                  return (
                    <div 
                      key={u._id}
                      onClick={() => loadUserDetails(u)}
                      className={`flex items-center justify-between p-3 rounded-xl hover:bg-prasatek-light cursor-pointer transition border border-gray-100 shadow-sm ${selectedUser?._id === u._id ? 'bg-prasatek-light' : 'bg-white'} ${isSuspended ? 'opacity-60 grayscale' : ''}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 relative overflow-hidden">
                          {u.picture ? (
                            <img src={u.picture} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            initial
                          )}
                          {isSuspended && <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full z-10"></div>}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-slate-800 text-sm truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        {u.role === 'admin' && (
                          <span className="text-[8px] font-extrabold bg-prasatek-dark text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
                        )}
                        {u.role === 'manager' && (
                          <span className="text-[8px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Manager</span>
                        )}
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          u.plan === 'enterprise' 
                            ? 'bg-purple-100 text-purple-700' 
                            : u.plan === 'pro' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.plan || 'free'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* User Details Details Panel */}
          <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[75vh] overflow-hidden">
            {!selectedUser ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p className="font-bold text-sm">Select a user to view enterprise details</p>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-prasatek-light shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-prasatek-dark rounded-full flex items-center justify-center text-white font-bold text-xl relative overflow-hidden">
                        {selectedUser.picture ? (
                          <img src={selectedUser.picture} alt={selectedUser.name} className="w-full h-full object-cover" />
                        ) : (
                          (selectedUser.name || '?').charAt(0).toUpperCase()
                        )}
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${selectedUser.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'} border-2 border-prasatek-light rounded-full z-10`}></div>
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">{selectedUser.name}</h2>
                        <p className="text-sm font-bold text-slate-500">{selectedUser.email}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">ID: <span className="text-gray-500">{selectedUser._id}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Access Role:</label>
                        <select 
                          value={selectedUser.role}
                          onChange={handleRoleChange}
                          className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-700 cursor-pointer"
                        >
                          <option value="user">Standard User</option>
                          <option value="manager">Branch Manager</option>
                          <option value="admin">System Admin</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Acc Status:</label>
                        <select 
                          value={selectedUser.status}
                          onChange={handleStatusChange}
                          className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-700 cursor-pointer"
                        >
                          <option value="active" className="text-green-600 font-bold">Active</option>
                          <option value="suspended" className="text-red-500 font-bold">Suspended</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Active Plan:</label>
                        <select 
                          value={selectedUser.plan || 'free'}
                          onChange={handlePlanChange}
                          className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-700 cursor-pointer"
                        >
                          <option value="free">Free Plan</option>
                          <option value="pro">Pro Plan</option>
                          <option value="enterprise">Enterprise Plan</option>
                        </select>
                      </div>
                      {selectedUser.plan && selectedUser.plan !== 'free' && (
                        <div className="flex items-center gap-2">
                          <label className="text-[9px] font-bold text-gray-500 uppercase">Billing Cycle:</label>
                          <select 
                            value={selectedUser.planType || 'monthly'}
                            onChange={handlePlanTypeChange}
                            className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-700 cursor-pointer"
                          >
                            <option value="monthly">Monthly billing</option>
                            <option value="yearly">Yearly billing</option>
                          </select>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2 w-full justify-end flex-wrap">
                        <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer select-none">
                          IMPORT JSON BACKUP
                          <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                        </label>
                        {selectedUser.email.toLowerCase() !== 'admin@prasatek.site' && (
                          <button 
                            onClick={() => handleDeleteUser(selectedUser._id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                          >
                            DELETE USER
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Contact Phone</p>
                      <p className="font-bold text-slate-800">{selectedUser.mobile || 'Not set'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Tenant Organization</p>
                        <select 
                          value={selectedUser.org || 'default'}
                          onChange={handleOrgChange}
                          className="font-bold text-slate-800 bg-transparent outline-none border-none p-0 cursor-pointer text-sm w-full focus:ring-0 focus:border-none"
                        >
                          <option value="default">Default Pool</option>
                          <option value="central-pepiliyana">Central Stores - Pepiliyana</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto hide-scroll p-6 bg-gray-50">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4">Financial Overview (Base Currency: RS)</h3>
                  {userFinancialsLoading ? (
                    <p className="text-xs font-bold text-gray-400">Loading financials...</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {userAccounts.length === 0 ? (
                          <div className="col-span-2 text-center py-4 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 bg-white">
                            No accounts created by user.
                          </div>
                        ) : (
                          userAccounts.map(acc => {
                            const bal = accountBalances[acc._id] || 0;
                            return (
                              <div key={acc._id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm relative group">
                                <button 
                                  onClick={() => handleDeleteUserAccount(acc._id)}
                                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                                  title="Delete Account"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider truncate pr-6">{acc.name}</p>
                                <p className={`text-lg font-extrabold mt-1 truncate ${bal < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                                  RS {bal.toFixed(2)}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Audit Log (Transactions)</h3>
                        <button 
                          onClick={handleExportAudit}
                          disabled={userTransactions.length === 0}
                          className="bg-prasatek-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          Export Audit CSV
                        </button>
                      </div>
                      <ul className="space-y-3 pb-4">
                        {userTransactions.length === 0 ? (
                          <li className="text-center py-6 text-xs font-bold text-gray-400 bg-white rounded-xl border border-gray-100 uppercase tracking-widest">No Transactions Logged</li>
                        ) : (
                          userTransactions.map(tx => {
                            const isInc = tx.type === 'add';
                            const accRef = userAccounts.find(a => a._id === tx.accountId);
                            return (
                              <li key={tx._id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition">
                                <div className="flex-1 overflow-hidden pr-3">
                                  <p className="font-bold text-slate-800 text-sm truncate">{tx.description}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-wide">
                                    {tx.category} • {accRef ? accRef.name : 'Unknown Account'} • {tx.date}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`font-extrabold text-sm whitespace-nowrap ${isInc ? 'text-prasatek-primary' : 'text-red-500'}`}>
                                    {isInc ? '+' : '-'} RS {tx.amount.toFixed(2)}
                                  </span>
                                  <button 
                                    onClick={() => handleDeleteUserTransaction(tx._id)}
                                    className="text-gray-300 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition cursor-pointer"
                                    title="Delete Transaction"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 3. Multi-Tenant Organizations View */}
      {activeTab === 'orgs' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 w-full">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Branch & Location Management</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Manage sub-tenants and regional organizations.</p>
            </div>
            <button 
              onClick={() => alert("Manual branch registry is restricted by the license node.")}
              className="bg-prasatek-primary hover:bg-[#09734a] text-white px-4 py-2 rounded-xl shadow-sm font-bold flex items-center gap-2 transition cursor-pointer"
            >
              + Register Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orgs.map(org => (
              <div key={org.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">{org.name}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Location: {org.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-prasatek-primary">{org.userCount}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Assigned Users</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Support Inquiries View */}
      {activeTab === 'messages' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 relative w-full flex-1">
          {/* Messages List Inbox */}
          <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[75vh]">
            <div className="p-5 border-b border-gray-100 space-y-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Support Inquiries</h2>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">
                  {contacts.length} Total • {unreadContactsCount} Unread
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search subject, name, body..." 
                  value={contactsSearchQuery}
                  onChange={(e) => setContactsSearchQuery(e.target.value)}
                  className="w-full bg-prasatek-light text-slate-800 text-xs font-bold rounded-xl pl-4 pr-4 py-2.5 border-none outline-none focus:ring-1 focus:ring-prasatek-primary transition"
                />
              </div>

              {/* Filters dropdown row */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={contactsFilterCategory}
                  onChange={(e) => setContactsFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-2 py-1.5 outline-none text-slate-700 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="General Inquiry">General</option>
                  <option value="Technical Support">Technical</option>
                  <option value="Billing & Pricing">Billing</option>
                  <option value="Partnership">Partnership</option>
                </select>

                <select
                  value={contactsFilterStatus}
                  onChange={(e) => setContactsFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-2 py-1.5 outline-none text-slate-700 cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto hide-scroll p-3 space-y-2">
              {contactsLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-prasatek-light border-t-prasatek-primary rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Inbox...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 text-center py-8">No messages matching criteria.</p>
              ) : (
                filteredContacts.map(c => {
                  const isSelected = selectedContact?._id === c._id;
                  const isUnread = c.status === 'unread';
                  return (
                    <div 
                      key={c._id}
                      onClick={() => {
                        setSelectedContact(c);
                        if (isUnread) handleMarkContactAsRead(c._id);
                      }}
                      className={`p-3.5 rounded-xl border hover:bg-prasatek-light cursor-pointer transition flex flex-col gap-1.5 ${
                        isSelected 
                          ? 'bg-prasatek-light border-prasatek-primary/20 shadow-sm' 
                          : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          c.category === 'Technical Support' 
                            ? 'bg-red-50 text-red-600' 
                            : c.category === 'Billing & Pricing' 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-green-50 text-prasatek-primary'
                        }`}>
                          {c.category.split(' ')[0]}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isUnread && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                          <span className="text-[10px] text-gray-400 font-bold">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 text-xs truncate">{c.subject}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{c.name} • {c.email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Message Detail Reader */}
          <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[75vh] overflow-hidden">
            {!selectedContact ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-4a2 2 0 011.78 0l8 4A2 2 0 0122 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-1.78 0l-2.25 1.5"></path>
                </svg>
                <p className="font-bold text-sm">Select an inquiry to read support message</p>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-prasatek-light shrink-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-extrabold bg-prasatek-dark text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {selectedContact.category}
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-3">{selectedContact.subject}</h2>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        From: <span className="font-extrabold text-slate-800">{selectedContact.name}</span> ({selectedContact.email})
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <span className="text-xs text-gray-400 font-bold">
                        Submitted: {new Date(selectedContact.createdAt).toLocaleString()}
                      </span>
                      
                      <div className="flex gap-2 mt-2">
                        <a 
                          href={`mailto:${selectedContact.email}?subject=Re: [ExpenseTracker Pro Support] ${selectedContact.subject}`}
                          className="bg-prasatek-primary hover:bg-[#09734a] text-white text-[10px] font-extrabold px-3.5 py-2 rounded-lg transition shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                          </svg>
                          Reply Email
                        </a>
                        <button 
                          onClick={() => handleDeleteContact(selectedContact._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-extrabold px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer"
                        >
                          Delete Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 4. Global Settings View */}
      {activeTab === 'settings' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6">Global System Configurations</h2>
            
            <div className="space-y-6">
              {/* Security Settings */}
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4">Security Policies</h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Enforce Biometric Authentication System-wide</p>
                    <p className="text-xs text-gray-500 mt-1">Requires all users to verify identity via fingerprint or FaceID before session access. Disables standard password fallbacks.</p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      id="biometricToggle" 
                      checked={biometricEnabled}
                      onChange={(e) => setBiometricEnabled(e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 z-10"
                    />
                    <label 
                      htmlFor="biometricToggle" 
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300 ${biometricEnabled ? 'bg-prasatek-primary' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>
              </div>

              {/* Localization Settings */}
              <div className="pb-6 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4">Localization & Currency</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Base System Currency</label>
                    <select 
                      className="w-full bg-prasatek-light text-slate-800 text-sm font-bold rounded-xl px-4 py-3 border-none outline-none appearance-none cursor-not-allowed opacity-70" 
                      disabled
                    >
                      <option value="RS">Sri Lankan Rupee (RS)</option>
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1 italic">Hard-locked to RS for reporting compliance.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Timezone</label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-prasatek-light text-slate-800 text-sm font-bold rounded-xl px-4 py-3 border-none outline-none cursor-pointer"
                    >
                      <option>Asia/Colombo (GMT+5:30)</option>
                      <option>UTC (GMT+0:00)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Manual Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[1.5rem] p-7 w-full max-w-md mx-auto shadow-2xl">
            <h3 className="text-2xl font-extrabold text-slate-800 mb-1">Add Manual User</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Create a user record directly in MongoDB.</p>
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Display Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pun sara" 
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-prasatek-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="user@company.com" 
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-prasatek-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Password (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Leave empty for default (prasatek123)" 
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-prasatek-primary font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Access Role</label>
                  <select 
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-prasatek-primary cursor-pointer"
                  >
                    <option value="user">Standard User</option>
                    <option value="manager">Branch Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tenant Org</label>
                  <select 
                    value={addOrg}
                    onChange={(e) => setAddOrg(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-prasatek-primary cursor-pointer"
                  >
                    <option value="default">Default Pool</option>
                    <option value="central-pepiliyana">Central Stores - Pepiliyana</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Account Status</label>
                <select 
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-prasatek-primary cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setAddEmail('');
                    setAddName('');
                    setAddPassword('');
                    setAddRole('user');
                    setAddStatus('active');
                    setAddOrg('default');
                    setShowAddUserModal(false);
                  }}
                  className="w-1/2 bg-[#e2e8f0] text-slate-600 font-bold py-2.5 rounded-xl hover:bg-gray-300 transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingUser}
                  className="w-1/2 bg-prasatek-primary hover:bg-[#09734a] transition text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer text-sm"
                >
                  {savingUser ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[1.5rem] p-7 w-full max-w-md mx-auto shadow-2xl">
            <h3 className="text-2xl font-extrabold text-slate-800 mb-1">Confirm Backup Import</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Importing backup data for <strong className="text-slate-700">{selectedUser.name}</strong>. 
              Found {pendingImportData?.accounts?.length || 0} accounts and {pendingImportData?.transactions?.length || 0} transactions.
            </p>
            
            <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
              <input 
                id="overwriteCheck" 
                type="checkbox" 
                checked={overwriteOnImport}
                onChange={(e) => setOverwriteOnImport(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 bg-white accent-red-600 cursor-pointer shrink-0 mt-0.5"
              />
              <label htmlFor="overwriteCheck" className="text-xs font-bold text-red-700 cursor-pointer select-none leading-relaxed">
                Delete all current accounts and transactions of this user before importing (Recommended for clean migration)
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setShowImportModal(false);
                  setPendingImportData(null);
                  setOverwriteOnImport(false);
                }}
                className="w-1/2 bg-[#e2e8f0] text-slate-600 font-bold py-2.5 rounded-xl hover:bg-gray-300 transition cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleImportSubmit}
                disabled={importingData}
                className="w-1/2 bg-prasatek-primary hover:bg-[#09734a] transition text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer text-sm"
              >
                {importingData ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
