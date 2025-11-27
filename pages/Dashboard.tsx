import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Users, Calendar, Clock, Activity, 
  UserPlus, Search, Phone, FileText, 
  CheckCircle, PlayCircle, AlertCircle, 
  Stethoscope, CreditCard, ArrowRight
} from 'lucide-react';
import { AddPatientModal } from '../components/AddPatientModal';
import { PatientProfile } from '../components/PatientProfile';
import { PatientSearchModal } from '../components/PatientSearchModal';
import { ReportsModal } from '../components/ReportsModal';
import { MOCK_DOCTORS } from '../constants';
import { Patient } from '../types';

export const Dashboard: React.FC = () => {
  const { patients, appointments, getPendingDues, addPatient, getPatientTreatments, updateAppointment, addAppointment } = useStore();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Specific view state for Profile (to open billing/appointments directly)
  const [profileInitialTab, setProfileInitialTab] = useState<'overview' | 'billing' | 'appointments'>('overview');
  const [profileInitialAction, setProfileInitialAction] = useState<'none' | 'add_appointment' | 'add_treatment'>('none');

  // New Modals State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchPurpose, setSearchPurpose] = useState<'billing' | 'appointment'>('billing');
  const [showReports, setShowReports] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // --- Logic ---
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.date === today);
  
  // Stats
  const totalOPD = todaysAppointments.length;
  const waitingCount = todaysAppointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = todaysAppointments.filter(a => a.status === 'Completed').length;
  const pendingDues = getPendingDues();

  // Search Logic (Defensive)
  const searchResults = searchQuery.length > 0 
    ? patients.filter(p => 
        (p.phoneNumber || '').includes(searchQuery) || 
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleRegisterPatient = (data: Partial<Patient>, assignedDoctor?: string) => {
    if (data.name && data.phoneNumber) {
      const id = Date.now().toString();
      const regDate = data.createdAt || new Date().toISOString(); 

      // 1. Create Patient
      addPatient({
        id,
        serialNumber: `RTD-${1000 + patients.length + 1}`,
        createdAt: regDate,
        name: data.name!,
        phoneNumber: data.phoneNumber!,
        age: data.age || 0,
        sex: data.sex as any || 'Male',
        address: data.address || ''
      });

      // 2. Auto-Book Appointment for OPD Queue
      const appointmentDate = regDate.split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      addAppointment({
        id: `apt-${Date.now()}`,
        patientId: id,
        patientName: data.name!,
        date: appointmentDate,
        time: currentTime,
        purpose: 'New Registration / Consultation',
        assignedStaff: assignedDoctor || MOCK_DOCTORS[0], 
        status: 'Scheduled'
      });

      setShowRegisterModal(false);
    }
  };

  const updateStatus = (id: string, status: 'Completed' | 'Cancelled' | 'Scheduled') => {
    const app = appointments.find(a => a.id === id);
    if (app) updateAppointment({ ...app, status });
  };

  // Handler for opening search modal
  const openSearchFor = (purpose: 'billing' | 'appointment') => {
    setSearchPurpose(purpose);
    setIsSearchModalOpen(true);
  };

  // Handler for patient search selection
  const handlePatientSearchSelect = (p: Patient) => {
    setIsSearchModalOpen(false);
    setSelectedPatient(p);
    
    if (searchPurpose === 'billing') {
      setProfileInitialTab('billing');
      setProfileInitialAction('none');
    } else if (searchPurpose === 'appointment') {
      setProfileInitialTab('appointments');
      setProfileInitialAction('add_appointment');
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-6">
      {/* Top Header & Search & Stats */}
      <div className="flex flex-col gap-4">
        
        {/* 1. Header */}
        <div className="flex items-center justify-between rounded-xl bg-slate-900 p-4 text-white shadow-lg">
          <div>
            <h1 className="text-xl font-bold tracking-wide">OPD Management Console</h1>
            <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-400"
            >
              <UserPlus size={18} /> New Registration
            </button>
            <button 
              onClick={() => openSearchFor('appointment')}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Calendar size={18} /> Book Appt
            </button>
          </div>
        </div>

        {/* 2. Global Search Bar */}
        <div className="relative z-20">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-4 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search Patient by Phone Number..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-slate-700 shadow-sm transition-all placeholder:text-slate-400 hover:border-teal-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Search Results Dropdown */}
          {searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl p-2">
               {searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                   {searchResults.map(p => {
                     const pTreatments = getPatientTreatments(p.id);
                     const totalDue = pTreatments.reduce((sum, t) => sum + t.due, 0);
                     return (
                       <div key={p.id} className="flex flex-col justify-between rounded-lg border border-teal-100 bg-teal-50 p-3 hover:bg-teal-100 transition-colors">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-gray-900">{p.name}</span>
                              <span className="text-xs font-mono text-gray-500 bg-white px-1 rounded">{p.serialNumber}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                               <Phone size={12}/> {p.phoneNumber}
                            </div>
                            <div className="mt-2 text-xs">
                               <span className={`font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {totalDue > 0 ? `Outstanding: ₹${totalDue}` : 'No Dues'}
                               </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setProfileInitialTab('overview');
                              setProfileInitialAction('none');
                              setSelectedPatient(p);
                              setSearchQuery('');
                            }}
                            className="mt-3 flex items-center justify-center gap-1 w-full rounded border border-teal-200 bg-white py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-600 hover:text-white transition-colors"
                          >
                            View Profile <ArrowRight size={12}/>
                          </button>
                       </div>
                     )
                   })}
                 </div>
               ) : (
                 <div className="p-4 text-center text-sm text-gray-400">No patient found with this number.</div>
               )}
            </div>
          )}
        </div>

        {/* 3. Operational Stats Strip */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total OPD</p>
              <p className="text-2xl font-bold text-gray-900">{totalOPD}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Waiting</p>
              <p className="text-2xl font-bold text-gray-900">{waitingCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Due</p>
              <p className="text-2xl font-bold text-gray-900">₹{pendingDues}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
        {/* Left Column: Live Queue (Takes 2/3 width) */}
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Activity className="text-teal-600" size={20} /> 
              Live Patient Queue
            </h2>
            <div className="text-xs font-medium text-gray-500">
              Sorted by Time
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Patient Details</th>
                  <th className="px-6 py-3">Doctor / Purpose</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todaysAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((app) => (
                  <tr key={app.id} className={`group hover:bg-slate-50 ${app.status === 'Completed' ? 'bg-gray-50/50 opacity-75' : ''}`}>
                    <td className="px-6 py-4 font-mono font-medium text-gray-600">
                      {app.time}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{app.patientName}</div>
                      <div className="text-xs text-gray-500">ID: {patients.find(p => p.id === app.patientId)?.serialNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{app.assignedStaff.split(' ')[0]}...</span>
                       </div>
                       <div className="mt-1 text-xs text-gray-500">{app.purpose}</div>
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'Scheduled' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <Clock size={12} /> Waiting
                        </span>
                      )}
                      {app.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <CheckCircle size={12} /> Done
                        </span>
                      )}
                      {app.status === 'Cancelled' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {app.status === 'Scheduled' ? (
                         <div className="flex justify-end gap-2">
                           <button 
                            onClick={() => updateStatus(app.id, 'Completed')}
                            className="flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                           >
                             <CheckCircle size={14} /> Finish
                           </button>
                           <button className="flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                             <PlayCircle size={14} /> Call
                           </button>
                         </div>
                       ) : (
                         <span className="text-xs text-gray-400">-</span>
                       )}
                    </td>
                  </tr>
                ))}
                {todaysAppointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Calendar size={40} className="mb-2 opacity-20" />
                        <p>No appointments scheduled for today.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Tools & Info */}
        <div className="flex flex-col gap-6">
          
          {/* 1. Available Doctors */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
             <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
               <Stethoscope size={16} /> Doctor Availability
             </h3>
             <ul className="space-y-3">
               {MOCK_DOCTORS.map((doc, idx) => (
                 <li key={idx} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="text-sm font-medium text-gray-700">{doc}</span>
                   </div>
                   <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">IN OPD</span>
                 </li>
               ))}
             </ul>
          </div>

          {/* 2. Quick Actions Grid (WIRED UP) */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => openSearchFor('billing')}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-gray-600 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
            >
               <CreditCard size={24} />
               <span className="text-xs font-semibold">Create Bill</span>
            </button>
            <button 
              onClick={() => setShowReports(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-gray-600 shadow-sm transition hover:border-teal-500 hover:text-teal-600"
            >
               <FileText size={24} />
               <span className="text-xs font-semibold">Reports</span>
            </button>
          </div>

        </div>
      </div>

      <AddPatientModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
        onSave={handleRegisterPatient}
      />
      
      {/* Search Result Profile Viewer */}
      {selectedPatient && (
        <PatientProfile 
          patient={selectedPatient} 
          onClose={() => {
            setSelectedPatient(null);
            setProfileInitialTab('overview');
            setProfileInitialAction('none');
          }}
          initialTab={profileInitialTab}
          initialAction={profileInitialAction}
        />
      )}

      {/* New Functional Modals */}
      <PatientSearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={handlePatientSearchSelect}
        title={searchPurpose === 'billing' ? "Select Patient for Billing" : "Select Patient to Book Appointment"}
      />

      <ReportsModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
      />

    </div>
  );
};