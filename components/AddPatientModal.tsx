
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Patient } from '../types';
import { DatePicker } from './DatePicker';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Partial<Patient>, assignedDoctor?: string) => void;
  initialData?: Patient;
}

// Helper to get local YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { staff } = useStore();
  const [formData, setFormData] = useState<Partial<Patient>>({
    sex: 'Male',
    age: 18,
    createdAt: getTodayString()
  });

  const [selectedDoctor, setSelectedDoctor] = useState('');

  useEffect(() => {
    if (staff.length > 0 && !selectedDoctor) {
      setSelectedDoctor(staff[0].name);
    }
  }, [staff, selectedDoctor]);

  // Reset or populate form when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          sex: 'Male',
          age: 18,
          name: '',
          phoneNumber: '',
          address: '',
          createdAt: getTodayString()
        });
        setSelectedDoctor(staff.length > 0 ? staff[0].name : '');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, !initialData ? selectedDoctor : undefined);
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;
  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Patient Details' : 'New Registration'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Doctor Selection Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date of Visit / Reg</label>
              <DatePicker
                value={formData.createdAt ? formData.createdAt.split('T')[0] : ''}
                onChange={(date) => setFormData({ ...formData, createdAt: date })}
                required
              />
            </div>
            {!isEditMode && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Assign Doctor</label>
                <select
                  className={inputClass}
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="">Select Doctor</option>
                  {staff.map(doc => <option key={doc.id} value={doc.name}>{doc.name} ({doc.role})</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                required
                className={inputClass}
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                required
                className={inputClass}
                value={formData.phoneNumber || ''}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Contact No"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                className={inputClass}
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sex</label>
              <select
                className={inputClass}
                value={formData.sex}
                onChange={e => setFormData({ ...formData, sex: e.target.value as any })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              className={inputClass}
              rows={3}
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full Address"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
            >
              {isEditMode ? 'Update Details' : 'Register & Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
