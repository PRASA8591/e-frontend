import Dexie from 'dexie';

export const db = new Dexie('ExpenseTrackerProDB');

db.version(1).stores({
  transactions: '++id, _id, amount, type, bankName, merchant, category, date, description, rawSms, createdAt',
  accounts: '++id, _id, name, type, balance'
});

// Safe non-blocking initialization of IndexedDB
db.open().catch(err => {
  console.warn('[Dexie DB] Non-blocking IndexedDB open notice:', err?.message || err);
});

export const saveLocalTransaction = async (txData) => {
  try {
    if (!db.isOpen()) {
      try { await db.open(); } catch (e) {}
    }
    const record = {
      ...txData,
      createdAt: txData.createdAt || new Date().toISOString()
    };
    const id = await db.transactions.add(record);
    return { ...record, localId: id };
  } catch (err) {
    console.warn('[Dexie DB] Error saving local transaction:', err?.message || err);
    return txData;
  }
};

export const getLocalTransactions = async () => {
  try {
    if (!db.isOpen()) {
      try { await db.open(); } catch (e) {}
    }
    const txs = await db.transactions.toArray();
    return Array.isArray(txs) ? txs : [];
  } catch (err) {
    console.warn('[Dexie DB] Error fetching local transactions:', err?.message || err);
    return [];
  }
};

export const getLocalAccounts = async () => {
  try {
    if (!db.isOpen()) {
      try { await db.open(); } catch (e) {}
    }
    const accs = await db.accounts.toArray();
    return Array.isArray(accs) ? accs : [];
  } catch (err) {
    console.warn('[Dexie DB] Error fetching local accounts:', err?.message || err);
    return [];
  }
};

