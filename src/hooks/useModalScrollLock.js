import { useEffect } from 'react';

/**
 * Custom React Hook for Absolute Rigid Zero-Scroll Touch Locking on Modals/Popups.
 * Prevents background touch scrolling on mobile devices while allowing modal inner content scrolling.
 */
export const useModalScrollLock = (isOpen) => {
  useEffect(() => {
    if (!isOpen) return;

    const preventScroll = (e) => {
      // Allow internal scrolling inside inputs or explicit scrollable containers if needed, block everything else
      if (!e.target.closest('.scrollable-modal-content') && !e.target.closest('.modal-content-container')) {
        e.preventDefault();
      }
    };

    // Store original body styling to restore on unmount
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalHeight = document.body.style.height;

    // Lock document scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);
};
