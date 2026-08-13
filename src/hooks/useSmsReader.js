import { useEffect, useState, useCallback } from 'react';
import { parseSriLankanSms, syncSmsTransactionWithBackend, isNativeAndroid, initSmsListener } from '../services/smsReaderService';

export { initSmsListener };


/**
 * Custom React Hook for Automated Bank SMS Reading on Android
 * Safely guards execution with Capacitor.isNativePlatform() checks.
 */
export const useSmsReader = (onTransactionAdded) => {
  const [lastParsedSms, setLastParsedSms] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionNoticeMessage, setPermissionNoticeMessage] = useState('');

  const handleIncomingSms = useCallback(async (event) => {
    try {
      const smsText = event.detail?.body || event.detail?.message || (typeof event.detail === 'string' ? event.detail : '');
      const sender = event.detail?.sender || event.detail?.address || '';

      if (!smsText) return;

      console.log(`[SMS Reader] Received SMS from ${sender}: ${smsText}`);

      const parsed = parseSriLankanSms(smsText);
      if (!parsed) {
        console.log('[SMS Reader] SMS does not contain recognized Sri Lankan transaction format.');
        return;
      }

      setLastParsedSms(parsed);

      // Sync transaction automatically to Backend API
      const result = await syncSmsTransactionWithBackend(smsText);

      // Notify callback or dispatch event for UI refresh
      if (onTransactionAdded) {
        onTransactionAdded(result || parsed);
      }

      window.dispatchEvent(new CustomEvent('expense_tracker_tx_updated', { detail: result || parsed }));

    } catch (err) {
      console.error('[SMS Reader Error]', err);
    }
  }, [onTransactionAdded]);

  const handlePermissionDenied = useCallback((event) => {
    const message = event.detail?.message || 'For automatic expense tracking, please go to App Settings > Permissions > SMS and allow access.';
    setPermissionDenied(true);
    setPermissionNoticeMessage(message);
    
    // Display fallback alert modal to smartphone user
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`[SMS Permission Required]\n\n${message}`);
    }
  }, []);

  useEffect(() => {
    // Only register listener on Native Android platform
    if (!isNativeAndroid()) {
      return;
    }

    setIsListening(true);

    // Listen for custom broadcast events dispatched from Android SmsReceiver / MainActivity Java bridge
    window.addEventListener('onSmsReceived', handleIncomingSms);
    window.addEventListener('onSmsPermissionDenied', handlePermissionDenied);

    return () => {
      window.removeEventListener('onSmsReceived', handleIncomingSms);
      window.removeEventListener('onSmsPermissionDenied', handlePermissionDenied);
      setIsListening(false);
    };
  }, [handleIncomingSms, handlePermissionDenied]);

  return {
    lastParsedSms,
    isListening,
    permissionDenied,
    permissionNoticeMessage,
    parseSmsManually: parseSriLankanSms
  };
};
