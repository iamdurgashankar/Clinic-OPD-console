import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Treatments } from './pages/Treatments';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { Billing } from './pages/Billing';
import { User } from './types';
import { Toaster } from 'react-hot-toast';
import { Menu, Bell, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useStore } from './context/StoreContext';
import { NotificationsPanel } from './components/NotificationsPanel';
import { ProfileModal } from './components/ProfileModal';
import { SubscriptionPopup } from './components/SubscriptionPopup';
import { api } from './services/api';
import { AlertCircle, ShieldAlert, Mail } from 'lucide-react';

// Simple Router Component since we can't use react-router-dom in this environment easily
const Router = ({ onLogout, user, onUpdateUser }: { onLogout: () => void, user: User | null, onUpdateUser: (u: User) => void }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { notifications } = useStore();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const renderPage = () => {
    switch (currentRoute) {
      case 'dashboard': return <Dashboard />;
      case 'patients': return <Patients />;
      case 'appointments': return <Appointments />;
      case 'treatments': return <Treatments type="all" />; // Unified View
      case 'rct':
      case 'pulpectomy':
      case 'crown':
      case 'ortho':
        return <Treatments type={currentRoute as any} />;
      case 'admin':
        return <AdminPanel />;
      case 'billing':
        return <Billing />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-800">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={(route) => {
            setCurrentRoute(route);
            setIsMobileMenuOpen(false);
          }}
          onLogout={onLogout}
          user={user}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>
            <img
              src="https://rajtruedent.com/wp-content/uploads/2023/07/Raj_true_Dent__4_-removebg-preview-e1688891234126.png"
              alt="Logo"
              className="h-8 w-auto"
            />
          </div>

          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-slate-800 capitalize tracking-tight">{currentRoute.replace('-', ' ')}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative rounded-full p-2 text-slate-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-1.5 pr-3 hover:bg-gray-100 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white font-bold shadow-sm">
                  {user?.displayName?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div className="hidden flex-col items-start text-left sm:flex">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{user?.displayName || user?.username}</span>
                  <span className="text-[10px] font-medium uppercase text-slate-400">{user?.role}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Settings</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <UserIcon size={18} />
                      <span className="font-medium">Change Details</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderPage()}
        </main>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdate={onUpdateUser}
      />

      {/* Toast Placeholder */}
      <Toaster position="top-right" />
    </div>
  );
};

const LockdownScreen = () => (
  <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-900/40 p-6 text-center backdrop-blur-md transition-all duration-700 animate-in fade-in">
    <div className="relative w-full max-w-sm space-y-6 rounded-2xl border border-white/40 bg-white/95 p-8 shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 ring-4 ring-red-50">
        <ShieldAlert size={32} className="animate-bounce" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Renewal Required</h2>
        <div className="h-1 w-12 bg-red-500 mx-auto rounded-full" />
        <p className="text-sm text-slate-600 leading-relaxed font-semibold px-2">
          Your subscription for Raj True Dent clinical console has expired. Interaction is now restricted.
        </p>
      </div>

      <a 
        href="mailto:admin@rajtruedent.com?subject=Clinic%20App%20Renewal%20Required"
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-black active:scale-[0.98] transition-all"
      >
        <Mail size={18} />
        Contact Administrator
      </a>
      
      <div className="flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Service: Deactivated
        </p>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHardLocked, setIsHardLocked] = useState(false);
  const [showLockdown, setShowLockdown] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // 1. Lockdown Handshake
      const locked = await api.checkStatus();
      setIsHardLocked(locked);

      // 2. Session Check
      const session = localStorage.getItem('rtd_session');
      const savedUser = localStorage.getItem('rtd_user');
      if (session === 'active' && savedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };

    initApp();

    // Lockdown sync across tabs
    const handleLockStatus = () => {
      setIsHardLocked(localStorage.getItem('app_hard_locked') === 'true');
    };
    window.addEventListener('app_lockdown_status_changed', handleLockStatus);
    return () => window.removeEventListener('app_lockdown_status_changed', handleLockStatus);
  }, []);

  // Lockdown Timer Logic (5 Minute Grace Period)
  useEffect(() => {
    let interval: any;

    if (isAuthenticated && isHardLocked) {
      const FIVE_MINUTES = 5 * 60 * 1000;
      
      // Get or set start time
      let startTimeStr = localStorage.getItem('rtd_lockdown_grace_start');
      let startTime = startTimeStr ? parseInt(startTimeStr) : Date.now();
      
      if (!startTimeStr) {
        localStorage.setItem('rtd_lockdown_grace_start', startTime.toString());
      }

      const checkTime = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= FIVE_MINUTES) {
          setShowLockdown(true);
          clearInterval(interval);
        }
      };

      // Check immediately
      checkTime();
      // Then every 10 seconds
      interval = setInterval(checkTime, 10000);
    } else if (!isHardLocked) {
      setShowLockdown(false);
      localStorage.removeItem('rtd_lockdown_grace_start');
    }

    return () => clearInterval(interval);
  }, [isAuthenticated, isHardLocked]);

  const handleLogin = (userData: User) => {
    localStorage.setItem('rtd_session', 'active');
    localStorage.setItem('rtd_user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleUpdateUser = (updatedUser: User) => {
    localStorage.setItem('rtd_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('rtd_session');
    localStorage.removeItem('rtd_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-teal-50 text-teal-600 font-bold tracking-widest uppercase">Initializing...</div>;
  }

  return (
    <>
      {!isAuthenticated ? (
        <>
          <Login onLogin={handleLogin} />
          <Toaster position="top-right" />
        </>
      ) : (
        <>
          <Router onLogout={handleLogout} user={user} onUpdateUser={handleUpdateUser} />
          {!isHardLocked && <SubscriptionPopup />}
        </>
      )}
      
      {/* Universal Lockdown Overlay - Appears after 5-minute grace period */}
      {showLockdown && <LockdownScreen />}
    </>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;