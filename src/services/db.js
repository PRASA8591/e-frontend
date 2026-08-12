import Dexie from 'dexie';

export const db = new Dexie('ExpenseTrackerProDB');

db.version(1).stores({
  transactions: '++id, _id, amount, type, bankName, merchant, category, date, description, rawSms, createdAt',
  accounts: '++id, _id, name, type, balance'
});

export const saveLocalTransaction = async (txData) => {
  try {
    const record = {
      ...txData,
      createdAt: txData.createdAt || new Date().toISOString()
    };
    const id = await db.transactions.add(record);
    return { ...record, localId: id };
  } catch (err) {
    console.error('[Dexie DB] Error saving local transaction:', err);
    return txData;
  }
};

export const getLocalTransactions = async () => {
  try {
    return await db.transactions.toArray();
  } catch (err) {
    console.error('[Dexie DB] Error fetching local transactions:', err);
    return [];
  }
};
