import { useEffect, useState, useCallback } from 'react';
import { parseSriLankanSms, syncSmsTransactionWithBackend, isNativeAndroid } from '../services/smsReaderService';

/**
 * Custom React Hook for Automated Bank SMS Reading on Android
 * Safely guards execution with Capacitor.isNativePlatform() checks.
 */
export const useSmsReader = (onTransactionAdded) => {
  const [lastParsedSms, setLastParsedSms] = useState(null);
  const [isListening, setIsListening] = useState(false);

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

  useEffect(() => {
    // Only register listener on Native Android platform
    if (!isNativeAndroid()) {
      return;
    }

    setIsListening(true);

    // Listen for custom broadcast events dispatched from Android SmsReceiver / MainActivity Java bridge
    window.addEventListener('onSmsReceived', handleIncomingSms);

    return () => {
      window.removeEventListener('onSmsReceived', handleIncomingSms);
      setIsListening(false);
    };
  }, [handleIncomingSms]);

  return {
    lastParsedSms,
    isListening,
    parseSmsManually: parseSriLankanSms
  };
};
