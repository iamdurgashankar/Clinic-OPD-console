
import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, TrendingUp, AlertCircle, Users, DollarSign } from 'lucide-react';
import { TreatmentType } from '../types';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const { treatments, patients, appointments } = useStore();

  if (!isOpen) return null;

  // Stats Logic
  const totalRevenue = treatments.reduce((sum, t) => sum + t.paid, 0);
  const totalPending = treatments.reduce((sum, t) => sum + t.due, 0);
  const totalPatients = patients.length;
  
  // Treatment Breakdown
  const rctCount = treatments.filter(t => t.type === TreatmentType.RCT).length;
  const crownCount = treatments.filter(t => t.type === TreatmentType.CROWN).length;
  const orthoCount = treatments.filter(t => t.type === TreatmentType.ORTHODONTICS).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Clinic Reports & Analytics</h3>
            <p className="text-sm text-gray-500">Overview of financial and operational performance</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-6 text-white shadow-lg shadow-teal-500/20">
              <div className="flex items-center gap-3 mb-2 opacity-90">
                 <DollarSign size={20} /> <span className="text-sm font-semibold uppercase tracking-wider">Total Revenue</span>
              </div>
              <div className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <div className="mt-2 text-xs opacity-75">Lifetime earnings</div>
           </div>
           
           <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg shadow-red-500/20">
              <div className="flex items-center gap-3 mb-2 opacity-90">
                 <AlertCircle size={20} /> <span className="text-sm font-semibold uppercase tracking-wider">Outstanding Dues</span>
              </div>
              <div className="text-3xl font-bold">₹{totalPending.toLocaleString()}</div>
              <div className="mt-2 text-xs opacity-75">Pending payments</div>
           </div>

           <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2 text-gray-500">
                 <Users size={20} /> <span className="text-sm font-semibold uppercase tracking-wider">Total Patients</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{totalPatients}</div>
              <div className="mt-2 text-xs text-gray-400">Registered database</div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <h4 className="mb-4 font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={18}/> Treatment Distribution</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                    <span className="font-medium text-gray-700">Root Canals (RCT)</span>
                    <span className="rounded bg-orange-100 px-3 py-1 font-bold text-orange-700">{rctCount}</span>
                 </div>
                 <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                    <span className="font-medium text-gray-700">Crowns & Bridges</span>
                    <span className="rounded bg-purple-100 px-3 py-1 font-bold text-purple-700">{crownCount}</span>
                 </div>
                 <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                    <span className="font-medium text-gray-700">Orthodontics</span>
                    <span className="rounded bg-indigo-100 px-3 py-1 font-bold text-indigo-700">{orthoCount}</span>
                 </div>
              </div>
           </div>
           
           <div>
              <h4 className="mb-4 font-bold text-gray-800">Recent Transactions</h4>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                       <tr>
                          <th className="px-4 py-2 font-semibold text-gray-600">Patient</th>
                          <th className="px-4 py-2 font-semibold text-gray-600 text-right">Paid</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {treatments.slice(-5).reverse().map(t => (
                          <tr key={t.id}>
                             <td className="px-4 py-2 text-gray-700">{t.patientName}</td>
                             <td className="px-4 py-2 text-right font-medium text-green-600">+₹{t.paid}</td>
                          </tr>
                       ))}
                       {treatments.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-400">No data</td></tr>}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
