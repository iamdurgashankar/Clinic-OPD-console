import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const SubscriptionPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHardLocked, setIsHardLocked] = useState(false);

  const checkHardLock = () => {
    const locked = localStorage.getItem('app_hard_locked') === 'true';
    setIsHardLocked(locked);
    if (locked) {
      setIsVisible(true);
      setIsDismissed(false);
    }
  };

  useEffect(() => {
    const checkVisibility = () => {
      // If already hard locked, don't use the normal logic
      if (localStorage.getItem('app_hard_locked') === 'true') {
        setIsHardLocked(true);
        return true;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastShownDate = localStorage.getItem('subscription_popup_last_date');
      const popupCount = parseInt(localStorage.getItem('subscription_popup_count') || '0');

      if (lastShownDate !== today) {
        localStorage.setItem('subscription_popup_last_date', today);
        localStorage.setItem('subscription_popup_count', '1');
        return true;
      } else if (popupCount < 8) {
        localStorage.setItem('subscription_popup_count', (popupCount + 1).toString());
        return true;
      }
      return false;
    };

    // Initial check
    if (checkVisibility()) {
      setIsVisible(true);
    }
    checkHardLock();

    // Listen for lockdown events from API service
    const handleStatusChange = () => {
      checkHardLock();
    };

    window.addEventListener('app_lockdown_status_changed', handleStatusChange);
    
    // Sync across multiple tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_hard_locked') {
        checkHardLock();
      }
      if (e.key === 'subscription_popup_count') {
        // ... handled by original logic if needed
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('app_lockdown_status_changed', handleStatusChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleClose = () => {
    // If hard locked, don't allow closing
    if (isHardLocked) return;
    
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || (isDismissed && !isHardLocked)) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Dimmed Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
        aria-hidden="true"
      />
      
      {/* Modal Box */}
      <div 
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out animate-in zoom-in-95 ${isHardLocked ? 'border-2 border-red-500' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Warning Header */}
        <div className={`${isHardLocked ? 'bg-red-50' : 'bg-yellow-50'} px-6 py-4 border-b ${isHardLocked ? 'border-red-100' : 'border-yellow-100'}`}>
          <div className={`flex items-center gap-3 ${isHardLocked ? 'text-red-700' : 'text-yellow-700'}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isHardLocked ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{isHardLocked ? 'Access Restricted' : 'Subscription Alert'}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-slate-600 leading-relaxed font-medium">
            {isHardLocked 
              ? "Your application subscription has expired. Access to data-saving features has been locked. Please renew immediately to restore full functionality."
              : "Your server subscription will expire soon. Please renew it to continue using the application without any interruptions."}
          </p>
          
          <div className={`mt-4 p-4 rounded-lg border ${isHardLocked ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className={`h-2 w-2 rounded-full ${isHardLocked ? 'bg-red-500' : 'bg-teal-500'} animate-pulse`}></span>
              Status: <span className={`font-bold uppercase ${isHardLocked ? 'text-red-700' : 'text-slate-700'}`}>
                {isHardLocked ? 'Renewal Required' : 'Attention Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 px-8 pb-8">
          <button
            onClick={() => {
              if (isHardLocked) {
                window.location.href = "mailto:admin@rajtruedent.com?subject=Application%20Renewal%20Required";
              } else {
                handleClose();
              }
            }}
            className={`w-full rounded-xl px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
              isHardLocked 
                ? 'bg-red-600 shadow-red-600/20 hover:bg-red-700' 
                : 'bg-teal-600 shadow-teal-600/20 hover:bg-teal-700'
            }`}
          >
            {isHardLocked ? 'Renew Subscription Now' : 'I Understand, Continue'}
          </button>
          
          {isHardLocked && (
            <p className="text-center text-[10px] text-slate-400 font-medium">
              Saving data is disabled until renewal
            </p>
          )}
        </div>

        {/* Top-right close button - only show if NOT hard locked */}
        {!isHardLocked && (
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-yellow-100 hover:text-yellow-700 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
