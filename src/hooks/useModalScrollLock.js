import { useEffect } from 'react';

/**
 * Custom React Hook for Rigid Mobile Touch Scroll Locking on Modals/Popups.
 * Prevents background touch scrolling on mobile devices while allowing modal inner content scrolling.
 */
export const useModalScrollLock = (isOpen) => {
  useEffect(() => {
    if (!isOpen) return;

    const preventTouch = (e) => {
      if (!e.target.closest('.modal-content-container')) {
        e.preventDefault();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('touchmove', preventTouch);
    };
  }, [isOpen]);
};
