import { Capacitor } from '@capacitor/core';
import axios from 'axios';

/**
 * Sri Lankan Financial SMS Parser Engine
 * Handles SMS notifications from Sri Lankan banks and payment gateways:
 * Commercial Bank (COMBANK), Sampath Bank, HNB, BOC, Seylan, NTB, NDB, SDB, eZ Cash, mCash, Koko, etc.
 */

export const parseSriLankanSms = (smsText) => {
  if (!smsText || typeof smsText !== 'string') {
    return null;
  }

  const cleanText = smsText.trim();
  const lowerText = cleanText.toLowerCase();

  // 1. Extract Numeric Amount (LKR 1,500.00 / Rs. 1500 / Rs 2500.50 / amt: 500)
  let amount = 0;
  const amountPatterns = [
    /(?:LKR|RS\.?|USD|EUR|GBP|\$|€|£)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:LKR|RS\.?|USD|EUR|GBP)/i,
    /amt:?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /amount:?\s*([\d,]+(?:\.\d{1,2})?)/i
  ];

  for (const pattern of amountPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const rawNum = (match[1] || match[2]).replace(/,/g, '');
      const parsedVal = parseFloat(rawNum);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        amount = parsedVal;
        break;
      }
    }
  }

  if (!amount || isNaN(amount)) {
    return null; // Could not extract valid numeric transaction amount
  }

  // 2. Extract Transaction Type: EXPENSE vs INCOME
  // INCOME keywords: credited, received, deposited, deposit, salary, refund, cashback, credit to, transfer in, topup success
  // EXPENSE keywords: debited, paid, withdrawn, transferred to, purchase, spent, payment of, paid to
  let type = 'EXPENSE';
  const creditKeywords = [
    'credited', 'received', 'deposit', 'deposited', 'salary', 'refund', 
    'cashback', 'credit to', 'received from', 'transfer in', 'topup success'
  ];

  if (creditKeywords.some(kw => lowerText.includes(kw))) {
    type = 'INCOME';
  }

  // 3. Identify Bank / Payment Gateway Sender
  let bankName = 'Bank SMS';
  if (lowerText.includes('combank') || lowerText.includes('commercial bank') || lowerText.includes('comb')) {
    bankName = 'Commercial Bank';
  } else if (lowerText.includes('sampath')) {
    bankName = 'Sampath Bank';
  } else if (lowerText.includes('hnb') || lowerText.includes('hatton national')) {
    bankName = 'HNB';
  } else if (lowerText.includes('boc') || lowerText.includes('bank of ceylon')) {
    bankName = 'Bank of Ceylon';
  } else if (lowerText.includes('seylan')) {
    bankName = 'Seylan Bank';
  } else if (lowerText.includes('ntb') || lowerText.includes('nations trust')) {
    bankName = 'Nations Trust Bank';
  } else if (lowerText.includes('ndb')) {
    bankName = 'NDB Bank';
  } else if (lowerText.includes('sdb')) {
    bankName = 'SDB Bank';
  } else if (lowerText.includes('ez cash') || lowerText.includes('ezcash')) {
    bankName = 'eZ Cash';
  } else if (lowerText.includes('mcash')) {
    bankName = 'mCash';
  } else if (lowerText.includes('koko')) {
    bankName = 'Koko Pay';
  } else if (lowerText.includes('payhere')) {
    bankName = 'PayHere';
  }

  // 4. Extract Merchant / Location
  let merchant = bankName;
  const merchantPatterns = [
    /(?:at|to|from|via|merchant:?)\s+([A-Za-z0-9\s&'.-]{2,30}?)(?:\.\s|\son\s|\sfor\s|\sat\s|\sRef|\sAvail|\sBal|\sA\/C|$)/i,
    /spent\s+at\s+([A-Za-z0-9\s&'.-]{2,30}?)(?:\.\s|\son\s|\sRef|$)/i,
    /paid\s+to\s+([A-Za-z0-9\s&'.-]{2,30}?)(?:\.\s|\son\s|\sRef|$)/i
  ];

  for (const pattern of merchantPatterns) {
    const mMatch = cleanText.match(pattern);
    if (mMatch && mMatch[1]) {
      const extracted = mMatch[1].trim();
      if (extracted.length > 2 && !['lkr', 'rs', 'usd', 'bank', 'account', 'card', 'your'].includes(extracted.toLowerCase())) {
        merchant = extracted;
        break;
      }
    }
  }

  // 5. Predict Category
  let category = 'General';
  const combo = (merchant + ' ' + cleanText).toLowerCase();

  if (combo.includes('keells') || combo.includes('cargills') || combo.includes('arpico') || combo.includes('supermarket') || combo.includes('food') || combo.includes('restaurant') || combo.includes('kfc') || combo.includes('pizza') || combo.includes('bakery')) {
    category = 'Food & Dining';
  } else if (combo.includes('fuel') || combo.includes('ceypetco') || combo.includes('ioc') || combo.includes('laugfs') || combo.includes('petrol') || combo.includes('uber') || combo.includes('pickme') || combo.includes('cab') || combo.includes('transport')) {
    category = 'Transport';
  } else if (combo.includes('ceb') || combo.includes('water') || combo.includes('slt') || combo.includes('dialog') || combo.includes('mobitel') || combo.includes('hutch') || combo.includes('electricity') || combo.includes('bill')) {
    category = 'Bills & Utilities';
  } else if (combo.includes('daraz') || combo.includes('fashion') || combo.includes('nolimit') || combo.includes('odel') || combo.includes('store') || combo.includes('amazon') || combo.includes('shopping')) {
    category = 'Shopping';
  } else if (combo.includes('hospital') || combo.includes('pharmacy') || combo.includes('medical') || combo.includes('asiri') || combo.includes('lanka hospitals') || combo.includes('doctor')) {
    category = 'Healthcare';
  } else if (combo.includes('cinema') || combo.includes('movie') || combo.includes('netflix') || combo.includes('spotify') || combo.includes('game') || combo.includes('tickets')) {
    category = 'Entertainment';
  } else if (type === 'INCOME') {
    category = 'Salary / Income';
  }

  const dateStr = new Date().toISOString().split('T')[0];

  return {
    amount,
    type, // 'EXPENSE' or 'INCOME'
    bankName,
    merchant,
    category,
    date: dateStr,
    description: `[Auto-SMS] ${merchant}`,
    rawSms: cleanText
  };
};

/**
 * Sync parsed SMS with backend database
 */
export const syncSmsTransactionWithBackend = async (smsText, accountId = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[SMS Engine] No user auth token found, skipping backend sync.');
      return null;
    }

    const response = await axios.post('/api/transactions/parse-sms', {
      smsText,
      accountId
    });

    return response.data;
  } catch (error) {
    console.error('[SMS Engine] Failed to sync SMS transaction with backend:', error);
    // Fallback: Return locally parsed structure
    return parseSriLankanSms(smsText);
  }
};

/**
 * Check if app is running on native Android platform
 */
export const isNativeAndroid = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};
