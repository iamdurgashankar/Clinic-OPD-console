import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Treatments } from './pages/Treatments';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';

// Simple Router Component since we can't use react-router-dom in this environment easily
const Router = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        return <Treatments type={currentRoute} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 text-slate-800">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentRoute={currentRoute} onNavigate={(route) => {
          setCurrentRoute(route);
          setIsMobileMenuOpen(false);
        }} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm lg:hidden">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="text-xl">Raj True Dent</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderPage()}
        </main>
      </div>
      
      {/* Toast Placeholder */}
      <Toaster position="top-right" />
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
};

export default App;