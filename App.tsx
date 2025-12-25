import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Treatments } from './pages/Treatments';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { User } from './types';
import { Toaster } from 'react-hot-toast';
import { Menu, Bell, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useStore } from './context/StoreContext';
import { NotificationsPanel } from './components/NotificationsPanel';
import { ProfileModal } from './components/ProfileModal';

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

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('rtd_session');
    const savedUser = localStorage.getItem('rtd_user');
    if (session === 'active' && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

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
    return <div className="flex h-screen items-center justify-center bg-teal-50 text-teal-600 font-bold tracking-widest uppercase">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <StoreProvider>
      <Router onLogout={handleLogout} user={user} onUpdateUser={handleUpdateUser} />
    </StoreProvider>
  );
};

export default App;