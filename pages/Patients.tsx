import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Patient } from '../types';
import { Search, Plus, Trash2, Edit2, FileText, ArrowRightCircle } from 'lucide-react';
import { AddPatientModal } from '../components/AddPatientModal';
import { PatientProfile } from '../components/PatientProfile';

export const Patients: React.FC = () => {
  const { patients, treatments, addPatient, updatePatient, deletePatient } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Controls the full profile view
  const [selectedProfile, setSelectedProfile] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phoneNumber.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setShowAddModal(true);
  };

  const handleSavePatient = (data: Partial<Patient>) => {
    // Create Mode only
    if (data.name && data.phoneNumber) {
      const id = Date.now().toString();
      addPatient({
        id,
        serialNumber: `RTD-${1000 + patients.length + 1}`,
        createdAt: data.createdAt || new Date().toISOString(), // Use selected date
        name: data.name!,
        phoneNumber: data.phoneNumber!,
        age: data.age || 0,
        sex: data.sex as any || 'Male',
        address: data.address || ''
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold text-gray-800">Patient Master</h2>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white shadow hover:bg-teal-700"
        >
          <Plus size={18} /> Add Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by Name, Serial No, or Phone..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-slate-700 shadow-sm transition-all placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patient Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Serial #</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Billing Summary</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map(patient => {
                const ptTreatments = treatments.filter(t => t.patientId === patient.id);
                const totalBilled = ptTreatments.reduce((sum, t) => sum + t.amount, 0);
                const totalPaid = ptTreatments.reduce((sum, t) => sum + t.paid, 0);
                const totalDue = totalBilled - totalPaid;

                return (
                  <tr key={patient.id} className="group hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{patient.serialNumber}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedProfile(patient)} className="font-semibold text-gray-900 hover:text-teal-600 hover:underline text-left">
                        {patient.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.age} Y / {patient.sex}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">{patient.phoneNumber}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[150px]">{patient.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                          <span>Billed</span>
                          <span>Paid</span>
                        </div>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-gray-900">₹{totalBilled}</span>
                          <span className="text-green-600">₹{totalPaid}</span>
                        </div>
                        <div className={`mt-1 rounded px-2 py-0.5 text-center text-xs font-bold ${totalDue > 0 ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                          {totalDue > 0 ? `Due: ₹${totalDue}` : 'Settled'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setSelectedProfile(patient)}
                          className="flex items-center gap-1 text-teal-600 hover:text-teal-800"
                          title="Edit / Manage Patient"
                        >
                          <Edit2 size={18} /> <span className="text-xs font-bold uppercase">Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this patient?')) {
                              deletePatient(patient.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Search size={40} className="mb-2 opacity-10" />
                      <p>No patients found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal (Creation Only) */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSavePatient}
      />

      {/* FULL PATIENT PROFILE DASHBOARD */}
      {selectedProfile && (
        <PatientProfile
          patient={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};