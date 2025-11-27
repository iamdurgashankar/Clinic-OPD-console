import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, User } from 'lucide-react';
import { Patient } from '../types';

interface PatientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patient: Patient) => void;
  title?: string;
}

export const PatientSearchModal: React.FC<PatientSearchModalProps> = ({ isOpen, onClose, onSelect, title = "Search Patient" }) => {
  const { patients } = useStore();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  // Defensive filtering to prevent "Uncaught TypeError: undefined is not an object"
  const results = query.length > 0
    ? patients.filter(p => 
        (p.name || '').toLowerCase().includes(query.toLowerCase()) || 
        (p.phoneNumber || '').includes(query) || 
        (p.serialNumber || '').toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-6">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
              autoFocus
              type="text" 
              placeholder="Start typing name or phone..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
           />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
           {results.map(p => (
             <button 
                key={p.id}
                onClick={() => onSelect(p)}
                className="flex w-full items-center gap-4 rounded-lg border border-gray-100 p-3 hover:bg-teal-50 hover:border-teal-200 transition-colors"
             >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                   <User size={20} />
                </div>
                <div className="text-left">
                   <div className="font-bold text-gray-900">{p.name}</div>
                   <div className="text-xs text-gray-500">{p.serialNumber} • {p.phoneNumber}</div>
                </div>
             </button>
           ))}
           {query.length > 0 && results.length === 0 && (
             <p className="text-center text-gray-400 py-4">No patients found.</p>
           )}
           {query.length === 0 && (
             <p className="text-center text-gray-400 py-4 text-xs">Type to search...</p>
           )}
        </div>
      </div>
    </div>
  );
};