import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title as ChartTitle } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import ProfileSidebar from '../components/ProfileSidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import VerificationModal from '../components/VerificationModal';
import SmsReaderModal from '../components/SmsReaderModal';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

const fxRates = { RS: 1, USD: 0.0033, EUR: 0.0031, GBP: 0.0026, JPY: 0.52, AUD: 0.0050, CAD: 0.0045, CHF: 0.0030, CNY: 0.024, INR: 0.27 };
const fxSymbols = { RS: 'RS ', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$', CHF: 'CHF ', CNY: '¥', INR: '₹' };

export default function Dashboard() {
  const { user, logout, updateBudget, login } = useAuth();
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile sidebar & Custom categories state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Currency State
  const [activeCurrency, setActiveCurrency] = useState(user?.currency || 'RS');
  const [budgetLimitBase, setBudgetLimitBase] = useState(user?.monthlyBudgetLimit || 50000);
  const [budgetInputVal, setBudgetInputVal] = useState('');

  // Forms State
  const [txAccountId, setTxAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 7) + '-' + String(new Date().getDate()).padStart(2, '0'));
  const [txType, setTxType] = useState('add');
  const [txCategory, setTxCategory] = useState('Income');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [submittingTx, setSubmittingTx] = useState(false);

  // Account Modal
  const [showAccModal, setShowAccModal] = useState(false);
  const [showSmsReaderModal, setShowSmsReaderModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalRequiredPlan, setModalRequiredPlan] = useState('');

  // Edit Transaction Modal State
  const [showEditTxModal, setShowEditTxModal] = useState(false);
  const [editTxId, setEditTxId] = useState('');
  const [editTxAccountId, setEditTxAccountId] = useState('');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxType, setEditTxType] = useState('add');
  const [editTxCategory, setEditTxCategory] = useState('Income');
  const [editTxDescription, setEditTxDescription] = useState('');
  const [editTxAmount, setEditTxAmount] = useState('');
  const [submittingEditTx, setSubmittingEditTx] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [submittingAcc, setSubmittingAcc] = useState(false);

  // Advanced Visuals States
  const [activeChartTab, setActiveChartTab] = useState('balances');

  // Filters State
  const [filterType, setFilterType] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchDesc, setSearchDesc] = useState('');

  // Confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Alert modal
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('info'); // info, error, success

  const triggerAlert = (title, message, type = 'info') => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const [globalBanner, setGlobalBanner] = useState(null);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const res = await axios.get('/api/system/status');
        if (res.data.maintenanceMode && user?.role !== 'admin') {
          logout();
          return;
        }
        if (res.data.globalBanner && res.data.globalBanner.enabled && res.data.globalBanner.message) {
          setGlobalBanner(res.data.globalBanner);
        } else {
          setGlobalBanner(null);
        }
      } catch (err) {
        console.error('System status error:', err);
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user?.monthlyBudgetLimit) {
      setBudgetLimitBase(user.monthlyBudgetLimit);
    }
    if (user?.currency) {
      setActiveCurrency(user.currency);
    }
  }, [user]);

  useEffect(() => {
    setBudgetInputVal(String(Math.round(budgetLimitBase * fxRates[activeCurrency])));
  }, [budgetLimitBase, activeCurrency]);

  const fetchData = async () => {
    try {
      const [accRes, txRes] = await Promise.all([
        axios.get('/api/accounts'),
        axios.get('/api/transactions')
      ]);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleTxUpdate = () => {
      fetchData();
    };

    window.addEventListener('expense_tracker_tx_updated', handleTxUpdate);
    return () => {
      window.removeEventListener('expense_tracker_tx_updated', handleTxUpdate);
    };
  }, []);

  const isAnyModalOpen = showAccModal || showConfirm || showAlert || showUpgradeModal || showEditTxModal || showSmsReaderModal || showVerifyModal;

  useModalScrollLock(isAnyModalOpen);

  const formatMoney = (amount) => {
    const converted = amount * fxRates[activeCurrency];
    return fxSymbols[activeCurrency] + converted.toFixed(2);
  };

  const handleCurrencyChange = (e) => {
    setActiveCurrency(e.target.value);
  };

  const handleBudgetSave = async () => {
    const enteredValue = parseFloat(budgetInputVal);
    if (!isNaN(enteredValue) && enteredValue > 0) {
      const limitInBase = enteredValue / fxRates[activeCurrency];
      setBudgetLimitBase(limitInBase);
      await updateBudget(limitInBase);
    } else {
      setBudgetInputVal(String(Math.round(budgetLimitBase * fxRates[activeCurrency])));
    }
  };

  const handleExportJson = () => {
    if (user?.plan !== 'enterprise') {
      setModalRequiredPlan('enterprise');
      setShowUpgradeModal(true);
      return;
    }
    if (transactions.length === 0 && accounts.length === 0) {
      triggerAlert('Export Notice', 'No data available to back up.', 'info');
      return;
    }
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        plan: user.plan
      },
      accounts: accounts.map(a => ({ name: a.name, initialBalance: a.initialBalance })),
      transactions: transactions.map(t => {
        const acc = accounts.find(a => a._id === t.accountId);
        return {
          accountName: acc ? acc.name : 'Unknown Account',
          date: t.date,
          month: t.month,
          type: t.type,
          category: t.category,
          description: t.description,
          amount: t.amount
        };
      })
    };
    
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Prasatek_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddAccountClick = () => {
    if (user?.plan === 'free' && accounts.length >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    setShowAccModal(true);
  };

  // Add account
  const handleAddAccountSubmit = async (e) => {
    e.preventDefault();
    if (user && !user.isVerified && user.role !== 'admin') {
      setShowVerifyModal(true);
      return;
    }
    if (!newAccName || isNaN(parseFloat(newAccBalance))) return;
    setSubmittingAcc(true);
    try {
      await axios.post('/api/accounts', {
        name: newAccName,
        initialBalance: parseFloat(newAccBalance)
      });
      setNewAccName('');
      setNewAccBalance('');
      setShowAccModal(false);
      fetchData();
    } catch (error) {
      triggerAlert('Account Error', error.response?.data?.message || 'Error saving account.', 'error');
    } finally {
      setSubmittingAcc(false);
    }
  };

  // Add transaction
  const handleAddTxSubmit = async (e) => {
    e.preventDefault();
    if (user && !user.isVerified && user.role !== 'admin') {
      setShowVerifyModal(true);
      return;
    }
    if (!txAccountId || !txDescription || isNaN(parseFloat(txAmount)) || !txDate) return;
    
    const finalCategory = txCategory === 'Custom' ? customCategoryName : txCategory;
    if (!finalCategory) {
      triggerAlert('Validation Warning', 'Please enter a custom category name.', 'info');
      return;
    }

    setSubmittingTx(true);
    try {
      await axios.post('/api/transactions', {
        accountId: txAccountId,
        date: txDate,
        type: txType,
        category: finalCategory,
        description: txDescription,
        amount: parseFloat(txAmount)
      });
      setTxDescription('');
      setTxAmount('');
      setCustomCategoryName('');
      fetchData();
    } catch (error) {
      triggerAlert('Transaction Error', error.response?.data?.message || 'Error saving transaction.', 'error');
    } finally {
      setSubmittingTx(false);
    }
  };

  // Open Edit Transaction (Enterprise Feature)
  const handleOpenEditTx = (tx) => {
    if (user?.plan !== 'enterprise' && user?.role !== 'admin' && user?.role !== 'manager') {
      setModalRequiredPlan('enterprise');
      setShowUpgradeModal(true);
      return;
    }
    setEditTxId(tx._id);
    setEditTxAccountId(tx.accountId);
    setEditTxDate(tx.date);
    setEditTxType(tx.type);
    setEditTxCategory(tx.category || 'Other');
    setEditTxDescription(tx.description || '');
    setEditTxAmount(String(tx.amount));
    setShowEditTxModal(true);
  };

  const handleEditTxSubmit = async (e) => {
    e.preventDefault();
    if (!editTxAccountId || !editTxDescription || isNaN(parseFloat(editTxAmount)) || !editTxDate) return;

    setSubmittingEditTx(true);
    try {
      await axios.put(`/api/transactions/${editTxId}`, {
        accountId: editTxAccountId,
        date: editTxDate,
        type: editTxType,
        category: editTxCategory,
        description: editTxDescription,
        amount: parseFloat(editTxAmount)
      });
      setShowEditTxModal(false);
      fetchData();
      triggerAlert('Transaction Updated', 'Transaction details successfully updated.', 'success');
    } catch (error) {
      triggerAlert('Update Error', error.response?.data?.message || 'Error updating transaction.', 'error');
    } finally {
      setSubmittingEditTx(false);
    }
  };

  // Delete transaction
  const handleDeleteTx = (id) => {
    setConfirmTitle('Delete Record');
    setConfirmMsg('Are you sure you want to permanently delete this transaction?');
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`/api/transactions/${id}`);
        fetchData();
      } catch (error) {
        triggerAlert('Deletion Error', 'Failed to delete transaction.', 'error');
      }
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  // Delete Account
  const handleDeleteAccount = (id) => {
    setConfirmTitle('Delete Account');
    setConfirmMsg("Are you sure? Existing transactions associated with this account will display as 'Unknown Account'.");
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`/api/accounts/${id}`);
        fetchData();
      } catch (error) {
        triggerAlert('Deletion Error', 'Failed to delete account.', 'error');
      }
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  const getISOWeekString = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + '-W' + (weekNo < 10 ? '0' : '') + weekNo;
  };

  // Calculations
  const currentMonth = new Date().toISOString().slice(0, 7);
  let accountBalances = {};
  let globalTotal = 0;
  let monthlyExpense = 0;

  accounts.forEach(acc => {
    accountBalances[acc._id] = acc.initialBalance;
  });

  transactions.forEach(tx => {
    if (accountBalances[tx.accountId] !== undefined) {
      if (tx.type === 'add') {
        accountBalances[tx.accountId] += tx.amount;
      } else {
        accountBalances[tx.accountId] -= tx.amount;
        if (tx.date.startsWith(currentMonth) && tx.category !== 'Money Transfer To Me') {
          monthlyExpense += tx.amount;
        }
      }
    }
  });

  accounts.forEach(acc => {
    globalTotal += (accountBalances[acc._id] || 0);
  });

  const spentPct = Math.min((monthlyExpense / budgetLimitBase) * 100, 100);

  // Set default account when accounts list changes
  useEffect(() => {
    if (accounts.length > 0 && !txAccountId) {
      setTxAccountId(accounts[0]._id);
    }
  }, [accounts, txAccountId]);

  // Filters logic
  const filteredTx = transactions.filter(tx => {
    let match = true;
    if (filterType && tx.type !== filterType) match = false;
    if (filterMonth && tx.month !== filterMonth) match = false;
    if (filterDate && tx.date !== filterDate) match = false;
    if (filterWeek && getISOWeekString(tx.date) !== filterWeek) match = false;
    if (filterAccount && tx.accountId !== filterAccount) match = false;
    if (searchDesc && !tx.description.toLowerCase().includes(searchDesc.toLowerCase().trim())) match = false;
    return match;
  });

  let filteredIncome = 0;
  let filteredExpense = 0;

  filteredTx.forEach(tx => {
    if (tx.type === 'add') filteredIncome += tx.amount;
    else filteredExpense += tx.amount;
  });

  // Chart data (balances)
  const chartLabels = accounts.map(acc => acc.name);
  const chartData = accounts.map(acc => Math.max(0, accountBalances[acc._id] || 0));

  const showChart = chartData.length > 0 && !chartData.every(val => val === 0);

  const doughnutData = {
    labels: chartLabels,
    datasets: [{
      data: chartData,
      backgroundColor: ['#0b8c5a', '#1e293b', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'],
      borderWidth: 0
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          font: {
            size: 10,
            weight: 'bold'
          }
        }
      }
    }
  };

  // Categories spending sum (Expenses Category chart data)
  const categoryExpenseSums = {};
  transactions.forEach(tx => {
    if (tx.type === 'deduct') {
      const cat = tx.category || 'Other';
      categoryExpenseSums[cat] = (categoryExpenseSums[cat] || 0) + tx.amount;
    }
  });
  const catLabels = Object.keys(categoryExpenseSums);
  const catData = Object.values(categoryExpenseSums);

  const categoriesChartData = {
    labels: catLabels,
    datasets: [{
      data: catData,
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#0b8c5a', '#64748b', '#ec4899', '#14b8a6'],
      borderWidth: 0
    }]
  };

  const categoriesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          font: { size: 9, weight: 'bold' }
        }
      }
    }
  };

  // Trends (monthly income vs expense trends chart data for the last 6 months)
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6Months.push(d.toISOString().slice(0, 7)); // YYYY-MM
  }

  const monthlyIncome = Array(6).fill(0);
  const monthlyExpenseData = Array(6).fill(0);

  transactions.forEach(tx => {
    const idx = last6Months.indexOf(tx.month);
    if (idx !== -1) {
      if (tx.type === 'add') {
        monthlyIncome[idx] += tx.amount;
      } else {
        monthlyExpenseData[idx] += tx.amount;
      }
    }
  });

  const trendsChartData = {
    labels: last6Months.map(m => {
      const [year, month] = m.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString('default', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Income',
        data: monthlyIncome.map(val => val * fxRates[activeCurrency]),
        backgroundColor: '#0b8c5a',
        borderRadius: 4
      },
      {
        label: 'Expenses',
        data: monthlyExpenseData.map(val => val * fxRates[activeCurrency]),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  const trendsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          font: { size: 9, weight: 'bold' }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 8 } } },
      y: { ticks: { font: { size: 8 } } }
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (user?.plan === 'free') {
      triggerAlert('Premium Feature', 'Excel/CSV export is a Pro/Enterprise feature. Please upgrade your plan to unlock this.', 'info');
      return;
    }
    if (transactions.length === 0) {
      triggerAlert('Export Notice', 'No data available to export.', 'info');
      return;
    }
    let csvContent = 'Date,Month,Account,Type,Category,Description,Amount (Base RS)\n';

    if (filteredTx.length === 0) {
      triggerAlert('Filter Notice', 'No transactions match the current filters.', 'info');
      return;
    }

    filteredTx.forEach(tx => {
      const accRef = accounts.find(a => a._id === tx.accountId);
      const accName = accRef ? accRef.name : 'Unknown Account';
      const typeStr = tx.type === 'add' ? 'Income' : 'Expense';
      const catStr = tx.category || 'N/A';
      csvContent += `${tx.date},${tx.month},"${accName}",${typeStr},${catStr},"${tx.description.replace(/"/g, '""')}",${tx.amount.toFixed(2)}\n`;
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Prasatek_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSignOut = () => {
    setConfirmTitle('Sign Out');
    setConfirmMsg('Are you sure you want to securely sign out of your account?');
    setConfirmAction(() => () => logout());
    setShowConfirm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-prasatek-light border-t-prasatek-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-6 px-4 bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans antialiased transition-colors duration-300">
      <div className="w-full max-w-[1400px] bg-white dark:bg-slate-900 md:shadow-2xl md:rounded-[2rem] overflow-y-auto md:overflow-hidden min-h-[85vh] md:h-[95vh] relative border border-gray-100 dark:border-slate-800 flex flex-col">
        
        {/* Global Header Alert Banner */}
        {globalBanner && globalBanner.enabled && globalBanner.message && (
          <div className={`text-white text-xs font-bold px-4 py-2.5 shadow-md flex items-center justify-between gap-4 animate-fade-in shrink-0 ${
            globalBanner.type === 'warning' ? 'bg-amber-600' :
            globalBanner.type === 'danger' ? 'bg-red-600' :
            globalBanner.type === 'success' ? 'bg-prasatek-primary' :
            'bg-gradient-to-r from-purple-600 via-prasatek-primary to-blue-600'
          }`}>
            <div className="flex items-center gap-2 max-w-5xl mx-auto text-center justify-center flex-1">
              <span className="bg-white/20 uppercase text-[9px] font-extrabold px-2 py-0.5 rounded-md tracking-wider">Announcement</span>
              <span>{globalBanner.message}</span>
            </div>
            <button 
              onClick={() => setGlobalBanner(null)}
              className="text-white/80 hover:text-white font-extrabold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Pending Payment Review Banner */}
        {user?.pendingPlan && user?.pendingPlan !== 'none' && (
          <div className="bg-amber-500 text-white text-xs font-bold px-4 py-2.5 shadow-md flex items-center justify-between gap-4 animate-fade-in shrink-0">
            <div className="flex items-center gap-2 max-w-5xl mx-auto text-center justify-center flex-1">
              <span className="bg-white/20 uppercase text-[9px] font-extrabold px-2 py-0.5 rounded-md tracking-wider">Payment Under Review</span>
              <span>Your bank payment proof for the <strong>{user.pendingPlan.toUpperCase()}</strong> plan is pending Admin verification.</span>
            </div>
          </div>
        )}

        {/* Header bar */}
        <div className="bg-white dark:bg-slate-900 px-6 pt-6 pb-6 shadow-sm border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div 
              onClick={() => setIsSidebarOpen(true)} 
              className="flex items-center gap-3 cursor-pointer group hover:opacity-95 transition"
            >
              <div className="relative w-12 h-12 rounded-full border-2 border-prasatek-primary bg-prasatek-light dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition group-hover:scale-105">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-prasatek-primary dark:text-green-400 font-bold text-lg">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Welcome back</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{user?.name || 'User'}</p>
              </div>
            </div>
            
            <div className="flex md:hidden items-center gap-2">
              <NotificationDropdown />
              <select 
                value={activeCurrency}
                onChange={handleCurrencyChange}
                className="text-[10px] font-bold bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 outline-none border border-gray-200 dark:border-slate-700 cursor-pointer"
              >
                <option value="RS">RS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
                <option value="INR">INR</option>
              </select>
              <button 
                onClick={handleSignOut}
                className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          <div className="text-center md:text-right w-full md:w-auto">
            <h1 className="text-[10px] font-bold mb-1 text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Total Net Worth</h1>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatMoney(globalTotal)}</h2>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <NotificationDropdown />
            <select 
              value={activeCurrency}
              onChange={handleCurrencyChange}
              className="text-[11px] font-bold bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 outline-none border border-gray-200 dark:border-slate-700 cursor-pointer"
            >
              <option value="RS">LKR (RS)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="CHF">CHF (Fr)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>
            <button 
              onClick={handleSignOut}
              className="bg-red-50 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 px-4 py-2 rounded-lg transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Verification Alert Banner */}
        {user && !user.isVerified && user.role !== 'admin' && (
          <div className="mx-4 md:mx-6 mt-4 p-4 bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base">Email Verification Required</h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  Your email (<strong>{user.email}</strong>) is not verified. Please verify your email before using the system.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition cursor-pointer shrink-0"
            >
              Click here to verify email
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full mx-auto flex-1 overflow-y-auto hide-scroll items-start bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* Left Forms */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Budget Panel */}
            {user?.plan === 'free' ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-center items-center text-center py-8 relative overflow-hidden">
                <div className="absolute top-2.5 right-2.5 bg-slate-100 dark:bg-slate-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider text-slate-400">PRO FEATURE</div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Budget Tracking Locked</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] leading-normal">Upgrade to Pro to set limits, monitor spending meters, and get threshold warnings.</p>
                <Link to="/upgrade" className="text-[10px] font-extrabold text-prasatek-primary dark:text-green-400 hover:underline mt-3 flex items-center gap-1 cursor-pointer">Upgrade now &rarr;</Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Monthly Budget</h3>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${spentPct >= 100 ? 'bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-950/20 text-prasatek-primary dark:text-green-400'}`}>
                    {Math.round(spentPct)}% Used ({monthlyExpense >= budgetLimitBase ? 'Exceeded' : 'Active'})
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${spentPct >= 100 ? 'bg-red-500' : 'bg-prasatek-primary'}`} 
                    style={{ width: `${spentPct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mt-1">
                  <span>{formatMoney(monthlyExpense)}</span>
                  <div className="flex items-center gap-1 bg-prasatek-light dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">Target:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-extrabold mr-0.5">{fxSymbols[activeCurrency].trim()}</span>
                    <input 
                      type="number" 
                      value={budgetInputVal} 
                      onChange={(e) => setBudgetInputVal(e.target.value)}
                      onBlur={handleBudgetSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                      min="1" 
                      step="100" 
                      className="w-20 bg-transparent text-slate-800 dark:text-slate-100 font-extrabold outline-none text-left border-none p-0 focus:ring-0 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}



            {/* Add Transaction Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Add Transaction</h3>
                <button
                  type="button"
                  onClick={() => setShowSmsReaderModal(true)}
                  className="px-3 py-1.5 text-xs font-extrabold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-prasatek-primary dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                  <span>Auto-Read SMS</span>
                </button>
              </div>
              <form onSubmit={handleAddTxSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Select Account</label>
                  <select 
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    required 
                    className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none appearance-none cursor-pointer"
                  >
                    {accounts.length === 0 ? (
                      <option value="">-- Create an account first --</option>
                    ) : (
                      accounts.map(acc => (
                        <option key={acc._id} value={acc._id}>
                          {acc.name} (Bal: {formatMoney(accountBalances[acc._id] || 0)})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Date</label>
                    <input 
                      type="date" 
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      required 
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-xl px-3 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Type</label>
                    <select 
                      value={txType}
                      onChange={(e) => setTxType(e.target.value)}
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-extrabold rounded-xl px-3 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none appearance-none cursor-pointer"
                    >
                      <option value="add" className="text-prasatek-primary">Income (+)</option>
                      <option value="deduct" className="text-red-500">Expense (-)</option>
                    </select>
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Category</label>
                  <select 
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    required 
                    className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none appearance-none cursor-pointer"
                  >
                    <option value="Income">Income / Salary</option>
                    <option value="Money Transfer To Me">Money Transfer To Me</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Software/Servers">Software/Servers</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Hardware/Repairs">Hardware/Repairs</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                    {user?.plan !== 'free' && <option value="Custom">-- Custom Category --</option>}
                  </select>
                </div>
                {txCategory === 'Custom' && (
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Custom Category Name</label>
                    <input 
                      type="text"
                      placeholder="e.g., Medical / Health"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      required
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="w-3/5">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Remark</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Server Bill" 
                      value={txDescription}
                      onChange={(e) => setTxDescription(e.target.value)}
                      required 
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none"
                    />
                  </div>
                  <div className="w-2/5">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Amount (RS)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      required 
                      min="0.01" 
                      step="0.01"
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-xl px-3 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submittingTx || accounts.length === 0}
                  className="w-full bg-prasatek-primary hover:bg-[#09734a] text-white font-extrabold rounded-xl py-3.5 transition shadow-lg mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingTx ? 'PROCESSING...' : 'ADD RECORD'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full">
            
            {/* Accounts Panel */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">My Accounts</h3>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
                    ({filterAccount ? accounts.find(a => a._id === filterAccount)?.name || 'Selected' : 'All Accounts'})
                  </span>
                </div>
                <button 
                  onClick={handleAddAccountClick}
                  className="text-xs bg-prasatek-dark text-white px-3 py-1.5 rounded-lg shadow-sm font-extrabold hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  + Add Account
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scroll">
                {accounts.length === 0 ? (
                  <div className="text-xs text-gray-400 dark:text-slate-500 font-bold italic p-6 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl w-full text-center bg-white dark:bg-slate-900">
                    No accounts found. Click '+ Add Account'.
                  </div>
                ) : (
                  <>
                    {/* All Accounts Filter Card */}
                    <div 
                      onClick={() => setFilterAccount('')}
                      className={`min-w-[130px] snap-center p-3.5 rounded-2xl shadow-sm cursor-pointer transition-all border shrink-0 flex flex-col justify-between ${
                        filterAccount === '' 
                          ? 'bg-prasatek-primary text-white border-prasatek-primary shadow-md ring-2 ring-prasatek-primary/30' 
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-gray-100 dark:border-slate-800 hover:border-prasatek-primary/40'
                      }`}
                    >
                      <p className={`text-[10px] font-extrabold uppercase tracking-wider ${filterAccount === '' ? 'text-green-100' : 'text-gray-400'}`}>All Accounts</p>
                      <p className="text-sm font-extrabold mt-1 truncate">Overview</p>
                    </div>

                    {accounts.map(acc => {
                      const currentBal = accountBalances[acc._id] || 0;
                      const isSelected = filterAccount === acc._id;
                      return (
                        <div 
                          key={acc._id} 
                          onClick={() => setFilterAccount(isSelected ? '' : acc._id)}
                          className={`min-w-[140px] snap-center p-3.5 rounded-2xl shadow-sm relative group shrink-0 cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-green-50/40 dark:bg-green-950/20 border-prasatek-primary ring-2 ring-prasatek-primary/40 shadow-md' 
                              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-prasatek-primary/40'
                          }`}
                        >
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAccount(acc._id);
                            }}
                            className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition cursor-pointer"
                            title="Delete Account"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <p className="text-[10px] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider truncate pr-6">{acc.name}</p>
                          <p className={`text-lg font-extrabold mt-1 truncate ${currentBal < 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
                            {formatMoney(currentBal)}
                          </p>
                          {isSelected && (
                            <span className="inline-block text-[8px] font-black uppercase text-prasatek-primary dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded mt-1">
                              Active Filter
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Charts & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
              
              {/* Premium Analytics Charts */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col w-full h-[350px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Analysis</h3>
                  <div className="flex gap-1 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                      onClick={() => setActiveChartTab('balances')}
                      className={`text-[9px] font-extrabold px-2 py-1 rounded-lg transition cursor-pointer ${activeChartTab === 'balances' ? 'bg-prasatek-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Balances
                    </button>
                    <button 
                      onClick={() => {
                        if (user?.plan === 'free') {
                          setModalRequiredPlan('pro');
                          setShowUpgradeModal(true);
                        } else {
                          setActiveChartTab('categories');
                        }
                      }}
                      className={`text-[9px] font-extrabold px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-0.5 ${activeChartTab === 'categories' ? 'bg-prasatek-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {user?.plan === 'free' && '🔒 '}Categories
                    </button>
                    <button 
                      onClick={() => {
                        if (user?.plan !== 'enterprise') {
                          setModalRequiredPlan('enterprise');
                          setShowUpgradeModal(true);
                        } else {
                          setActiveChartTab('trends');
                        }
                      }}
                      className={`text-[9px] font-extrabold px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-0.5 ${activeChartTab === 'trends' ? 'bg-prasatek-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {user?.plan !== 'enterprise' && '🔒 '}Trends
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 w-full flex items-center justify-center">
                  {activeChartTab === 'balances' && (
                    showChart ? (
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                    ) : (
                      <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">No Data Available</p>
                    )
                  )}
                  {activeChartTab === 'categories' && (
                    catData.length > 0 && !catData.every(val => val === 0) ? (
                      <Doughnut data={categoriesChartData} options={categoriesChartOptions} />
                    ) : (
                      <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">No Expense Data</p>
                    )
                  )}
                  {activeChartTab === 'trends' && (
                    <Bar data={trendsChartData} options={trendsChartOptions} />
                  )}
                </div>
              </div>

              {/* Transactions History */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-[500px] lg:h-[600px] w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">History</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleExportCsv}
                      className="bg-prasatek-primary hover:bg-[#09734a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                      title="Export filtered transactions to CSV"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Excel / CSV
                    </button>
                    <button 
                      onClick={handleExportJson}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                      title="Export raw data backup to JSON (Enterprise Feature)"
                    >
                      {user?.plan !== 'enterprise' ? (
                        <span>🔒 Backup JSON</span>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                          </svg>
                          Backup JSON
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Search by remark..." 
                  value={searchDesc}
                  onChange={(e) => setSearchDesc(e.target.value)}
                  className="w-full bg-prasatek-light dark:bg-slate-800 px-3 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none mb-3"
                />

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-prasatek-light dark:bg-slate-800 px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="add">Income Only</option>
                    <option value="deduct">Expense Only</option>
                  </select>
                  <select 
                    value={filterAccount}
                    onChange={(e) => setFilterAccount(e.target.value)}
                    className="w-full bg-prasatek-light dark:bg-slate-800 px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">All Accounts</option>
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-prasatek-light dark:bg-slate-800 px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none" 
                    title="Filter by Day"
                  />
                  <input 
                    type="week" 
                    value={filterWeek}
                    onChange={(e) => setFilterWeek(e.target.value)}
                    className="w-full bg-prasatek-light dark:bg-slate-800 px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none" 
                    title="Filter by Week"
                  />
                  <input 
                    type="month" 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full bg-prasatek-light dark:bg-slate-800 px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none" 
                    title="Filter by Month"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 border-t border-gray-100 dark:border-slate-800 pt-3 shrink-0">
                  <div className="bg-green-50/50 dark:bg-green-950/10 p-2.5 rounded-xl border border-green-100/50 dark:border-green-900/30 text-center">
                    <p className="text-[9px] font-extrabold text-green-600 dark:text-green-400 uppercase tracking-wider truncate">
                      {filterAccount ? `${accounts.find(a => a._id === filterAccount)?.name || 'Account'} Income` : 'All Accounts Income'}
                    </p>
                    <p className="text-base font-extrabold text-green-700 dark:text-green-300 mt-0.5">{formatMoney(filteredIncome)}</p>
                  </div>
                  <div className="bg-red-50/50 dark:bg-red-950/10 p-2.5 rounded-xl border border-red-100/50 dark:border-red-900/30 text-center">
                    <p className="text-[9px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider truncate">
                      {filterAccount ? `${accounts.find(a => a._id === filterAccount)?.name || 'Account'} Expense` : 'All Accounts Expense'}
                    </p>
                    <p className="text-base font-extrabold text-red-700 dark:text-red-300 mt-0.5">{formatMoney(filteredExpense)}</p>
                  </div>
                </div>

                <ul className="flex-1 overflow-y-auto hide-scroll space-y-3 pr-1 pb-4">
                  {filteredTx.length === 0 ? (
                    <li className="text-center text-gray-400 dark:text-slate-500 font-bold py-6 text-xs uppercase tracking-widest">No Records Found</li>
                  ) : (
                    filteredTx.map(tx => {
                      const accRef = accounts.find(a => a._id === tx.accountId);
                      const isInc = tx.type === 'add';
                      return (
                        <li key={tx._id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800">
                          <div className="flex-1 overflow-hidden pr-3">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{tx.description}</p>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-wide flex items-center flex-wrap gap-1">
                              <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">{tx.category}</span>
                              {tx.source === 'sms_auto' && (
                                <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-extrabold text-[9px] border border-blue-200 dark:border-blue-800/40">
                                  🤖 SMS Auto-Logged
                                </span>
                              )}
                              <span className="text-slate-400 dark:text-slate-500">{accRef ? accRef.name : 'Unknown Account'} • {tx.date}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-extrabold text-sm whitespace-nowrap ${isInc ? 'text-prasatek-primary' : 'text-red-500'}`}>
                              {isInc ? '+' : '-'} {formatMoney(tx.amount)}
                            </span>
                            <button 
                              onClick={() => handleOpenEditTx(tx)}
                              className="text-gray-400 hover:text-prasatek-primary bg-gray-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/20 p-2 rounded-lg transition cursor-pointer"
                              title="Edit Transaction (Enterprise Feature)"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteTx(tx._id)}
                              className="text-gray-300 hover:text-red-500 bg-gray-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-lg transition cursor-pointer"
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
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6">
          <div className="flex justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2">
            <Link to="/privacy" className="hover:text-prasatek-primary transition">Privacy</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-prasatek-primary transition">Terms</Link>
            <span>|</span>
            <Link to="/contact" className="hover:text-prasatek-primary transition">Contact</Link>
          </div>
          <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center mt-1">
            <p>A PRODUCT BY PRASATEK SYSTEM SOLUTIONS</p>
            <p className="mt-0.5">www.prasatek.lk | info@prasatek.lk | 0719323239</p>
          </div>
        </div>

        {/* Add Account Modal */}
        {showAccModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4">
            <div className="modal-content-container relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 touch-auto">
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">Add New Account</h3>
              <form onSubmit={handleAddAccountSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Account Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-prasatek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Initial Balance (RS)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    step="0.01" 
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-prasatek-primary"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAccModal(false)}
                    className="w-1/2 bg-[#e2e8f0] dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingAcc}
                    className="w-1/2 bg-prasatek-dark text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition cursor-pointer"
                  >
                    {submittingAcc ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Global Confirm Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4">
            <div className="modal-content-container relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 text-center border border-slate-100 dark:border-slate-800 shadow-2xl touch-auto">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/40 mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">{confirmTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 font-medium">{confirmMsg}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 bg-[#e2e8f0] hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAction}
                  className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Alert Modal */}
        {showAlert && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4">
            <div className="modal-content-container relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 text-center border border-slate-100 dark:border-slate-800 shadow-2xl touch-auto">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                alertType === 'error' 
                  ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                  : alertType === 'success' 
                    ? 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400' 
                    : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
              }`}>
                {alertType === 'error' ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                ) : alertType === 'success' ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">{alertTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 font-bold leading-relaxed whitespace-pre-line">{alertMsg}</p>
              
              {alertMsg.includes('Pro plan users') && (
                <div className="mb-6">
                  <Link 
                    to="/upgrade"
                    onClick={() => setShowAlert(false)}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-prasatek-primary hover:underline"
                  >
                    Go to Plan Upgrade Page &rarr;
                  </Link>
                </div>
              )}

              <button 
                onClick={() => setShowAlert(false)}
                className="w-full bg-prasatek-dark hover:bg-slate-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-md cursor-pointer text-xs"
              >
                Okay
              </button>
            </div>
          </div>
        )}

        {showUpgradeModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4">
            <div className="modal-content-container relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 text-center border border-gray-100 dark:border-slate-800 shadow-2xl touch-auto">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/20 mb-4">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">Upgrade Your Plan</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-5 font-bold leading-normal">
                {modalRequiredPlan === 'enterprise' 
                  ? 'This advanced feature requires the Enterprise Plan. Upgrade to unlock financial goals milestones, monthly income/expense trends, JSON data backup, and all visual themes.'
                  : modalRequiredPlan === 'pro'
                    ? 'This premium feature requires the Pro Plan or higher. Upgrade to unlock expenses category charts, custom category entries, CSV/Excel data export, and forest themes.'
                    : 'You are currently using the Free Plan, which limits your account allocation to exactly 1 account. Please upgrade to Pro or Enterprise to add more accounts.'
                }
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-left text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-normal mb-6 space-y-2 border border-slate-100 dark:border-slate-800">
                <p className="uppercase text-[9px] text-slate-400">Upgrade Instructions:</p>
                <p>1. Click the button below to navigate to the pricing matrix.</p>
                <p>2. Choose either the <strong className="text-green-600 dark:text-green-400">Pro Plan</strong> (up to 3 accounts) or the <strong className="text-purple-600 dark:text-purple-400">Enterprise Plan</strong> (unlimited accounts).</p>
                <p>3. Confirm payment to unlock features instantly.</p>
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

        <VerificationModal 
          isOpen={showVerifyModal} 
          onClose={() => setShowVerifyModal(false)} 
          email={user?.email} 
          onSuccess={() => setShowVerifyModal(false)} 
        />

        {/* Edit Transaction Modal */}
        {showEditTxModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md touch-none p-4 animate-fade-in">
            <div className="modal-content-container relative max-h-[85vh] w-[90%] max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-gray-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 touch-auto">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 px-2.5 py-1 rounded-md">Enterprise Feature</span>
                  <h3 className="text-lg font-extrabold">Edit Transaction</h3>
                </div>
                <button 
                  onClick={() => setShowEditTxModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditTxSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Account</label>
                  <select
                    value={editTxAccountId}
                    onChange={(e) => setEditTxAccountId(e.target.value)}
                    className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl px-4 py-3 border-none outline-none cursor-pointer"
                    required
                  >
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Date</label>
                    <input 
                      type="date" 
                      value={editTxDate}
                      onChange={(e) => setEditTxDate(e.target.value)}
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-3 border-none outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Type</label>
                    <select
                      value={editTxType}
                      onChange={(e) => setEditTxType(e.target.value)}
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-3 border-none outline-none cursor-pointer"
                      required
                    >
                      <option value="add">Income (+)</option>
                      <option value="deduct">Expense (-)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Category</label>
                    <select
                      value={editTxCategory}
                      onChange={(e) => setEditTxCategory(e.target.value)}
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl px-3 py-3 border-none outline-none cursor-pointer"
                      required
                    >
                      <option value="Income">Income / Salary</option>
                      <option value="Money Transfer To Me">Money Transfer To Me</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Software/Servers">Software/Servers</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Hardware/Repairs">Hardware/Repairs</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                      {!['Income', 'Money Transfer To Me', 'Food & Dining', 'Utilities', 'Software/Servers', 'Transportation', 'Hardware/Repairs', 'Entertainment', 'Other'].includes(editTxCategory) && editTxCategory && (
                        <option value={editTxCategory}>{editTxCategory} (Custom)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Amount ({activeCurrency})</label>
                    <input 
                      type="number" 
                      step="any"
                      value={editTxAmount}
                      onChange={(e) => setEditTxAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl px-4 py-3 border-none outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Remark / Description</label>
                  <input 
                    type="text" 
                    value={editTxDescription}
                    onChange={(e) => setEditTxDescription(e.target.value)}
                    placeholder="Enter remark"
                    className="w-full bg-prasatek-light dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl px-4 py-3 border-none outline-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowEditTxModal(false)}
                    className="w-1/2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold py-3 rounded-xl transition text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submittingEditTx}
                    className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingEditTx ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <SmsReaderModal 
          isOpen={showSmsReaderModal} 
          onClose={() => setShowSmsReaderModal(false)} 
          accounts={accounts} 
          onTransactionAdded={fetchData} 
          triggerAlert={triggerAlert} 
        />

        <ProfileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      </div>
    </div>
  );
}
