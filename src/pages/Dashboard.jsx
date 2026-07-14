import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ProfileSidebar from '../components/ProfileSidebar';
import NotificationDropdown from '../components/NotificationDropdown';

ChartJS.register(ArcElement, Tooltip, Legend);

const fxRates = { RS: 1, USD: 0.0033, EUR: 0.0031, GBP: 0.0026, JPY: 0.52, AUD: 0.0050, CAD: 0.0045, CHF: 0.0030, CNY: 0.024, INR: 0.27 };
const fxSymbols = { RS: 'RS ', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$', CHF: 'CHF ', CNY: '¥', INR: '₹' };

export default function Dashboard() {
  const { user, logout, updateBudget } = useAuth();
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile sidebar & Custom categories state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Currency State
  const [activeCurrency, setActiveCurrency] = useState(user?.currency || 'RS');
  const [budgetLimitBase, setBudgetLimitBase] = useState(user?.monthlyBudgetLimit || 50000);

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [submittingAcc, setSubmittingAcc] = useState(false);

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

  useEffect(() => {
    if (user?.monthlyBudgetLimit) {
      setBudgetLimitBase(user.monthlyBudgetLimit);
    }
    if (user?.currency) {
      setActiveCurrency(user.currency);
    }
  }, [user]);

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
  }, []);

  const formatMoney = (amount) => {
    const converted = amount * fxRates[activeCurrency];
    return fxSymbols[activeCurrency] + converted.toFixed(2);
  };

  const handleCurrencyChange = (e) => {
    setActiveCurrency(e.target.value);
  };

  const handleBudgetChange = async (e) => {
    const enteredValue = parseFloat(e.target.value) || 0;
    const limitInBase = enteredValue / fxRates[activeCurrency];
    setBudgetLimitBase(limitInBase);
    await updateBudget(limitInBase);
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
      alert(error.response?.data?.message || 'Error saving account.');
    } finally {
      setSubmittingAcc(false);
    }
  };

  // Add transaction
  const handleAddTxSubmit = async (e) => {
    e.preventDefault();
    if (!txAccountId || !txDescription || isNaN(parseFloat(txAmount)) || !txDate) return;
    
    const finalCategory = txCategory === 'Custom' ? customCategoryName : txCategory;
    if (!finalCategory) {
      alert("Please enter a custom category name.");
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
      alert(error.response?.data?.message || 'Error saving transaction.');
    } finally {
      setSubmittingTx(false);
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
        alert('Failed to delete transaction.');
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
        alert('Failed to delete account.');
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
        if (tx.date.startsWith(currentMonth)) {
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

  // Chart data
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

  // Export CSV
  const handleExportCsv = () => {
    if (user?.plan === 'free') {
      alert("Excel/CSV export is a Pro/Enterprise feature. Please upgrade your plan to unlock this.");
      return;
    }
    if (transactions.length === 0) return alert('No data available to export.');
    let csvContent = 'Date,Month,Account,Type,Category,Description,Amount (Base RS)\n';

    if (filteredTx.length === 0) return alert('No transactions match the current filters.');

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex justify-center items-center md:py-6 md:px-4 text-slate-800 dark:text-slate-200 font-sans antialiased transition-colors duration-300">
      <div className="w-full max-w-[1400px] bg-white dark:bg-slate-900 md:shadow-2xl md:rounded-[2rem] overflow-hidden h-screen md:h-[95vh] relative border border-gray-100 dark:border-slate-800 flex flex-col">
        
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
                  <div className="flex items-center gap-1 bg-prasatek-light px-2 py-1 rounded-lg">
                    <span className="text-slate-500 uppercase text-[9px]">Target:</span>
                    <span className="text-slate-700 mr-0.5">{fxSymbols[activeCurrency].trim()}</span>
                    <input 
                      type="number" 
                      value={Math.round(budgetLimitBase * fxRates[activeCurrency])} 
                      onChange={handleBudgetChange}
                      min="1" 
                      step="500" 
                      className="w-16 bg-transparent text-slate-800 font-extrabold outline-none text-left border-none p-0 focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add Transaction Form */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide mb-4">Add Transaction</h3>
              <form onSubmit={handleAddTxSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Select Account</label>
                  <select 
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    required 
                    className="w-full bg-prasatek-light text-slate-800 text-sm font-bold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none appearance-none cursor-pointer"
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
                      className="w-full bg-prasatek-light text-slate-800 text-sm font-bold rounded-xl px-3 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Type</label>
                    <select 
                      value={txType}
                      onChange={(e) => setTxType(e.target.value)}
                      className="w-full bg-prasatek-light text-sm font-extrabold rounded-xl px-3 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none appearance-none cursor-pointer"
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
                      className="w-full bg-prasatek-light text-slate-800 text-sm font-bold rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none"
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
                      className="w-full bg-prasatek-light text-slate-800 text-sm font-bold rounded-xl px-3 py-3 border-none focus:ring-2 focus:ring-prasatek-primary outline-none"
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
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">My Accounts</h3>
                <button 
                  onClick={handleAddAccountClick}
                  className="text-xs bg-prasatek-dark text-white px-3 py-1.5 rounded-lg shadow-sm font-extrabold hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  + Add Account
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scroll">
                {accounts.length === 0 ? (
                  <div className="text-xs text-gray-400 font-bold italic p-6 border-2 border-dashed border-gray-200 rounded-2xl w-full text-center bg-white">
                    No accounts found. Click '+ Add Account'.
                  </div>
                ) : (
                  accounts.map(acc => {
                    const currentBal = accountBalances[acc._id] || 0;
                    return (
                      <div key={acc._id} className="min-w-[140px] snap-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm relative group shrink-0">
                        <button 
                          onClick={() => handleDeleteAccount(acc._id)}
                          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                          title="Delete Account"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider truncate pr-6">{acc.name}</p>
                        <p className={`text-xl font-extrabold mt-1 truncate ${currentBal < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                          {formatMoney(currentBal)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Charts & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
              
              {/* Doughnut Chart */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col w-full h-[350px]">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide w-full text-left mb-4">Account Balances</h3>
                <div className="relative flex-1 w-full flex items-center justify-center">
                  {showChart ? (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  ) : (
                    <p className="text-xs font-bold text-gray-400 uppercase">No Data Available</p>
                  )}
                </div>
              </div>

              {/* Transactions History */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col h-[500px] lg:h-[600px] w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">History</h3>
                  <button 
                    onClick={handleExportCsv}
                    className="bg-prasatek-primary hover:bg-[#09734a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Excel / CSV
                  </button>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Search by remark..." 
                  value={searchDesc}
                  onChange={(e) => setSearchDesc(e.target.value)}
                  className="w-full bg-prasatek-light px-3 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 outline-none mb-3"
                />

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-prasatek-light px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="add">Income Only</option>
                    <option value="deduct">Expense Only</option>
                  </select>
                  <select 
                    value={filterAccount}
                    onChange={(e) => setFilterAccount(e.target.value)}
                    className="w-full bg-prasatek-light px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 outline-none appearance-none cursor-pointer"
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
                    className="w-full bg-prasatek-light px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 outline-none" 
                    title="Filter by Day"
                  />
                  <input 
                    type="week" 
                    value={filterWeek}
                    onChange={(e) => setFilterWeek(e.target.value)}
                    className="w-full bg-prasatek-light px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 outline-none" 
                    title="Filter by Week"
                  />
                  <input 
                    type="month" 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full bg-prasatek-light px-2 py-2 border-none rounded-lg text-[11px] font-bold text-slate-700 outline-none" 
                    title="Filter by Month"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 border-t border-gray-100 pt-3 shrink-0">
                  <div className="bg-green-50/50 p-2 rounded-xl border border-green-100/50 text-center">
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Filtered Income</p>
                    <p className="text-sm font-extrabold text-green-700">{formatMoney(filteredIncome)}</p>
                  </div>
                  <div className="bg-red-50/50 p-2 rounded-xl border border-red-100/50 text-center">
                    <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Filtered Expense</p>
                    <p className="text-sm font-extrabold text-red-700">{formatMoney(filteredExpense)}</p>
                  </div>
                </div>

                <ul className="flex-1 overflow-y-auto hide-scroll space-y-3 pr-1 pb-4">
                  {filteredTx.length === 0 ? (
                    <li className="text-center text-gray-400 font-bold py-6 text-xs uppercase tracking-widest">No Records Found</li>
                  ) : (
                    filteredTx.map(tx => {
                      const accRef = accounts.find(a => a._id === tx.accountId);
                      const isInc = tx.type === 'add';
                      return (
                        <li key={tx._id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                          <div className="flex-1 overflow-hidden pr-3">
                            <p className="font-bold text-slate-800 text-sm truncate">{tx.description}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-slate-500 mr-1">{tx.category}</span>
                              <span className="text-slate-400">{accRef ? accRef.name : 'Unknown Account'}</span> • {tx.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-extrabold text-sm whitespace-nowrap ${isInc ? 'text-prasatek-primary' : 'text-red-500'}`}>
                              {isInc ? '+' : '-'} {formatMoney(tx.amount)}
                            </span>
                            <button 
                              onClick={() => handleDeleteTx(tx._id)}
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
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-200 bg-white py-6">
          <div className="flex justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2">
            <Link to="/privacy" className="hover:text-prasatek-primary transition">Privacy</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-prasatek-primary transition">Terms</Link>
            <span>|</span>
            <Link to="/contact" className="hover:text-prasatek-primary transition">Contact</Link>
          </div>
          <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center mt-1">
            <p>A PRODUCT BY PRASATEK SYSTEM SOLUTIONS</p>
            <p className="mt-0.5">www.prasatek.site | 0719323239</p>
          </div>
        </div>

        {/* Add Account Modal */}
        {showAccModal && (
          <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-150">
            <div className="bg-white rounded-[1.5rem] w-full max-w-sm p-7 shadow-2xl">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-1">Add New Account</h3>
              <form onSubmit={handleAddAccountSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Account Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-prasatek-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Initial Balance (RS)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    step="0.01" 
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-prasatek-primary"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAccModal(false)}
                    className="w-1/2 bg-[#e2e8f0] text-slate-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition cursor-pointer"
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
          <div className="absolute inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-150">
            <div className="bg-white rounded-[1.5rem] w-full max-w-sm p-6 shadow-2xl text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">{confirmTitle}</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">{confirmMsg}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 bg-[#e2e8f0] hover:bg-gray-300 text-slate-700 font-bold py-3 rounded-xl transition cursor-pointer"
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

        {showUpgradeModal && (
          <div className="absolute inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] w-full max-w-sm p-6 shadow-2xl text-center border border-gray-100 dark:border-slate-800">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/20 mb-4">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">Upgrade Your Plan</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-5 font-bold leading-normal">
                You are currently using the <span className="text-prasatek-primary dark:text-green-400 uppercase font-extrabold">Free Plan</span>, which limits your account allocation to exactly 1 account.
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

        <ProfileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      </div>
    </div>
  );
}
