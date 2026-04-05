import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const SubscriptionPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastShownDate = localStorage.getItem('subscription_popup_last_date');
      const popupCount = parseInt(localStorage.getItem('subscription_popup_count') || '0');

      if (lastShownDate !== today) {
        // Reset for the new day
        localStorage.setItem('subscription_popup_last_date', today);
        localStorage.setItem('subscription_popup_count', '1');
        return true;
      } else if (popupCount < 8) {
        // Still within daily limit
        localStorage.setItem('subscription_popup_count', (popupCount + 1).toString());
        return true;
      }
      return false;
    };

    // Show popup after 5 seconds delay
    const timer = setTimeout(() => {
      if (checkVisibility()) {
        setIsVisible(true);
      }
    }, 5000);

    // Sync across multiple tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subscription_popup_count') {
        const newCount = parseInt(e.newValue || '0');
        if (newCount >= 8) {
          // If another tab reached the limit, don't show here anymore
          // (This doesn't hide currently visible popups in other tabs, 
          // but prevents new ones from showing)
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Dimmed Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in"
        aria-hidden="true"
      />
      
      {/* Modal Box */}
      <div 
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Warning Header */}
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
          <div className="flex items-center gap-3 text-yellow-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Subscription Alert</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-slate-600 leading-relaxed">
            Your server subscription will expire soon. Please renew it to continue using the application without any interruptions.
          </p>
          
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
              Status: <span className="font-semibold text-slate-700 uppercase">Attention Required</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 px-8 pb-8">
          <button
            onClick={handleClose}
            className="w-full rounded-xl bg-teal-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-[0.98] transition-all"
          >
            I Understand, Continue
          </button>
        </div>

        {/* Top-right close button (optional) */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-yellow-100 hover:text-yellow-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
