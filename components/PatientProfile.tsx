import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Patient, TreatmentRecord, TreatmentType, LabStatus, Appointment } from '../types';
import { 
  X, Calendar, CreditCard, Activity, Plus, 
  FileText, Save, CheckCircle, Clock, Trash2, 
  Phone, User, MapPin, Printer, Clipboard
} from 'lucide-react';
import { MOCK_DOCTORS } from '../constants';
import { DatePicker } from './DatePicker';

interface PatientProfileProps {
  patient: Patient;
  onClose: () => void;
  initialTab?: 'overview' | 'treatments' | 'appointments' | 'billing';
  initialAction?: 'none' | 'add_appointment' | 'add_treatment';
}

type Tab = 'overview' | 'treatments' | 'appointments' | 'billing';

export const PatientProfile: React.FC<PatientProfileProps> = ({ 
  patient, 
  onClose, 
  initialTab = 'overview',
  initialAction = 'none'
}) => {
  const { 
    updatePatient, 
    addTreatment, 
    getPatientTreatments, 
    appointments, 
    addAppointment,
    updateAppointment,
    deleteAppointment 
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>(initialTab as Tab);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Patient>(patient);
  
  // Treatment Form State - Auto open if action is set
  const [showTreatmentForm, setShowTreatmentForm] = useState(initialAction === 'add_treatment');
  const [newTreatment, setNewTreatment] = useState<Partial<TreatmentRecord>>({
    type: TreatmentType.GENERAL,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    paid: 0,
    due: 0,
    labStatus: LabStatus.PENDING,
    description: ''
  });

  // Appointment Form State - Auto open if action is set
  const [showApptForm, setShowApptForm] = useState(initialAction === 'add_appointment');
  const [newAppt, setNewAppt] = useState<Partial<Appointment>>({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    purpose: 'Follow-up',
    assignedStaff: MOCK_DOCTORS[0]
  });

  const patientTreatments = getPatientTreatments(patient.id);
  const patientAppointments = appointments.filter(a => a.patientId === patient.id).sort((a,b) => b.date.localeCompare(a.date));
  
  const totalBill = patientTreatments.reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = patientTreatments.reduce((sum, t) => sum + t.paid, 0);
  const balance = totalBill - totalPaid; // If negative, it's credit/advance

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10";
  const smallInputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10";

  const handleUpdateInfo = () => {
    updatePatient(editedPatient);
    setIsEditingInfo(false);
  };

  const handleAddTreatment = () => {
    addTreatment({
      ...newTreatment,
      id: Date.now().toString(),
      patientId: patient.id,
      patientName: patient.name,
      due: (newTreatment.amount || 0) - (newTreatment.paid || 0)
    } as TreatmentRecord);
    setShowTreatmentForm(false);
    setNewTreatment({
        type: TreatmentType.GENERAL,
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        paid: 0,
        due: 0,
        labStatus: LabStatus.PENDING,
        description: ''
    });
  };

  const handleAddAppointment = () => {
    addAppointment({
      ...newAppt,
      id: Date.now().toString(),
      patientId: patient.id,
      patientName: patient.name,
      status: 'Scheduled'
    } as Appointment);
    setShowApptForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-xl font-bold text-white">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="font-mono">{patient.serialNumber}</span>
                <span>•</span>
                <span>{patient.sex}, {patient.age}y</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone size={12}/> {patient.phoneNumber}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Navigation for Profile */}
          <div className="w-64 border-r border-gray-100 bg-gray-50 p-4">
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
               <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Financial Overview</div>
               <div className="mb-1 flex justify-between text-sm">
                 <span className="text-gray-600">Total Billed:</span>
                 <span className="font-bold">₹{totalBill}</span>
               </div>
               <div className="mb-1 flex justify-between text-sm">
                 <span className="text-gray-600">Total Paid:</span>
                 <span className="font-bold text-green-600">₹{totalPaid}</span>
               </div>
               <div className="mt-2 border-t pt-2 flex justify-between text-sm">
                 <span className="font-bold text-gray-800">Balance:</span>
                 <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                   {balance > 0 ? `Due ₹${balance}` : balance < 0 ? `Cr ₹${Math.abs(balance)}` : '₹0'}
                 </span>
               </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview & Info', icon: User },
                { id: 'treatments', label: 'Treatment History', icon: Activity },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto bg-white p-8">
            
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <div className="max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Patient Information</h3>
                  {!isEditingInfo ? (
                    <button onClick={() => setIsEditingInfo(true)} className="text-sm font-medium text-teal-600 hover:underline">Edit Details</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingInfo(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                      <button onClick={handleUpdateInfo} className="flex items-center gap-1 rounded bg-teal-600 px-3 py-1 text-sm font-medium text-white hover:bg-teal-700">
                        <Save size={14} /> Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold uppercase text-gray-500">Full Name</label>
                      {isEditingInfo ? (
                        <input className={smallInputClass} value={editedPatient.name} onChange={e => setEditedPatient({...editedPatient, name: e.target.value})} />
                      ) : (
                        <p className="mt-1 text-gray-900">{patient.name}</p>
                      )}
                    </div>
                    <div>
                       <label className="text-xs font-semibold uppercase text-gray-500">Phone Number</label>
                       {isEditingInfo ? (
                        <input className={smallInputClass} value={editedPatient.phoneNumber} onChange={e => setEditedPatient({...editedPatient, phoneNumber: e.target.value})} />
                      ) : (
                        <p className="mt-1 flex items-center gap-2 text-gray-900"><Phone size={14} className="text-gray-400"/> {patient.phoneNumber}</p>
                      )}
                    </div>
                    <div>
                       <label className="text-xs font-semibold uppercase text-gray-500">Age & Sex</label>
                       {isEditingInfo ? (
                        <div className="flex gap-2">
                           <input type="number" className={`w-20 ${smallInputClass}`} value={editedPatient.age} onChange={e => setEditedPatient({...editedPatient, age: +e.target.value})} />
                           <select className={`flex-1 ${smallInputClass}`} value={editedPatient.sex} onChange={e => setEditedPatient({...editedPatient, sex: e.target.value as any})}>
                             <option>Male</option><option>Female</option><option>Other</option>
                           </select>
                        </div>
                      ) : (
                        <p className="mt-1 text-gray-900">{patient.age} Years, {patient.sex}</p>
                      )}
                    </div>
                    <div>
                       <label className="text-xs font-semibold uppercase text-gray-500">Registration Date</label>
                       <p className="mt-1 text-gray-900">{new Date(patient.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                     <label className="text-xs font-semibold uppercase text-gray-500">Address</label>
                     {isEditingInfo ? (
                        <textarea className={smallInputClass} value={editedPatient.address} onChange={e => setEditedPatient({...editedPatient, address: e.target.value})} />
                      ) : (
                        <p className="mt-1 flex items-start gap-2 text-gray-900"><MapPin size={14} className="mt-1 text-gray-400"/> {patient.address || 'N/A'}</p>
                      )}
                  </div>
                </div>

                <div className="mt-8 border-t pt-6">
                  <h4 className="flex items-center gap-2 font-bold text-gray-800">
                    <Clipboard size={18} className="text-teal-600"/> Clinical Notes / Medical History
                  </h4>
                  <p className="mb-3 text-xs text-gray-500">Add detailed notes about patient history, follow-ups, and allergies here.</p>
                  
                  {isEditingInfo ? (
                    <textarea 
                      className={inputClass}
                      placeholder="Enter details..."
                      rows={5}
                      value={editedPatient.medicalHistory || ''}
                      onChange={e => setEditedPatient({...editedPatient, medicalHistory: e.target.value})}
                    />
                  ) : (
                    <div className="min-h-[100px] rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                      {patient.medicalHistory ? (
                        <p className="whitespace-pre-wrap">{patient.medicalHistory}</p>
                      ) : (
                        <p className="text-gray-400 italic">No notes recorded.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TREATMENTS TAB --- */}
            {activeTab === 'treatments' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Treatment History</h3>
                  <button 
                    onClick={() => setShowTreatmentForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-700"
                  >
                    <Plus size={16} /> Add Treatment
                  </button>
                </div>

                {/* Treatment List */}
                <div className="space-y-4">
                  {patientTreatments.map((t) => (
                    <div key={t.id} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                      <div className="flex justify-between">
                        <div className="flex gap-4">
                          <div className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                            t.type === 'RCT' ? 'bg-orange-100 text-orange-600' :
                            t.type === 'Crown' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <Activity size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                               <h4 className="font-bold text-gray-900">{t.type}</h4>
                               <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{t.date}</span>
                            </div>
                            <p className="mt-1 text-gray-600">{t.description}</p>
                            
                            {/* Detailed Fields */}
                            <div className="mt-3 flex flex-wrap gap-2">
                               {t.rctFileTypes && <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-1 text-xs text-orange-700 border border-orange-100">Files: {t.rctFileTypes}</span>}
                               {t.rctIrrigation && <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-1 text-xs text-orange-700 border border-orange-100">Irrig: {t.rctIrrigation}</span>}
                               {t.crownMaterial && <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-1 text-xs text-purple-700 border border-purple-100">Mat: {t.crownMaterial}</span>}
                               {t.crownShade && <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-1 text-xs text-purple-700 border border-purple-100">Shade: {t.crownShade}</span>}
                               {t.orthoBracketSystem && <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700 border border-indigo-100">Sys: {t.orthoBracketSystem}</span>}
                               {t.orthoWireType && <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700 border border-indigo-100">Wire: {t.orthoWireType}</span>}
                               
                               {t.labStatus && t.labStatus !== 'Pending' && (
                                 <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 border border-blue-100">Lab: {t.labStatus}</span>
                               )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">₹{t.amount}</div>
                          <div className="text-xs text-gray-500">Paid: ₹{t.paid}</div>
                          {t.due > 0 ? (
                            <div className="mt-1 font-bold text-red-600">Due: ₹{t.due}</div>
                          ) : (
                            <div className="mt-1 flex items-center justify-end gap-1 font-bold text-green-600"><CheckCircle size={12}/> Paid</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {patientTreatments.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 text-gray-400">
                      <Activity size={40} className="mb-2 opacity-20" />
                      <p>No treatments recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- APPOINTMENTS TAB --- */}
            {activeTab === 'appointments' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Appointments</h3>
                  <button 
                    onClick={() => setShowApptForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-700"
                  >
                    <Plus size={16} /> Schedule
                  </button>
                </div>
                
                <div className="space-y-3">
                   {patientAppointments.map(appt => (
                     <div key={appt.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center justify-center rounded-lg bg-teal-50 px-3 py-1 text-teal-800">
                              <span className="text-xs font-bold uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-lg font-bold">{new Date(appt.date).getDate()}</span>
                           </div>
                           <div>
                              <div className="font-bold text-gray-900">{appt.purpose}</div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                 <Clock size={14} /> {appt.time}
                                 <span>•</span>
                                 <User size={14} /> {appt.assignedStaff}
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
                             appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                             appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                             'bg-amber-100 text-amber-800'
                           }`}>
                             {appt.status}
                           </div>
                           {appt.status === 'Scheduled' && (
                             <button onClick={() => updateAppointment({...appt, status: 'Cancelled'})} className="text-gray-400 hover:text-red-500">
                               <Trash2 size={18} />
                             </button>
                           )}
                        </div>
                     </div>
                   ))}
                   {patientAppointments.length === 0 && (
                      <p className="py-8 text-center text-gray-500">No appointments found.</p>
                   )}
                </div>
              </div>
            )}

            {/* --- BILLING TAB --- */}
            {activeTab === 'billing' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Billing & Payments</h3>
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Printer size={16} /> Print Statement
                  </button>
                </div>
                
                <div className="mb-8 grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-gray-50 p-5">
                    <div className="text-xs font-semibold uppercase text-gray-500">Total Billed</div>
                    <div className="text-2xl font-bold text-gray-900">₹{totalBill}</div>
                  </div>
                  <div className="rounded-xl bg-green-50 p-5">
                    <div className="text-xs font-semibold uppercase text-green-700">Total Received</div>
                    <div className="text-2xl font-bold text-green-700">₹{totalPaid}</div>
                  </div>
                  <div className={`rounded-xl p-5 ${balance > 0 ? 'bg-red-50' : 'bg-teal-50'}`}>
                    <div className={`text-xs font-semibold uppercase ${balance > 0 ? 'text-red-700' : 'text-teal-700'}`}>
                      {balance > 0 ? 'Pending Due' : 'Advance / Credit'}
                    </div>
                    <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-700' : 'text-teal-700'}`}>
                      ₹{Math.abs(balance)}
                    </div>
                  </div>
                </div>

                <h4 className="mb-3 font-bold text-gray-700">Transaction History</h4>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Treatment / Description</th>
                          <th className="px-4 py-3 text-right">Cost</th>
                          <th className="px-4 py-3 text-right">Paid</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {patientTreatments.map(t => (
                          <tr key={t.id}>
                            <td className="px-4 py-3 text-gray-500">{t.date}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{t.type} - {t.description}</td>
                            <td className="px-4 py-3 text-right font-medium">₹{t.amount}</td>
                            <td className="px-4 py-3 text-right text-green-600">₹{t.paid}</td>
                            <td className="px-4 py-3 text-right">
                               {t.due > 0 ? (
                                 <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Due ₹{t.due}</span>
                               ) : (
                                 <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Paid</span>
                               )}
                            </td>
                          </tr>
                        ))}
                        {patientTreatments.length === 0 && (
                          <tr><td colSpan={5} className="py-4 text-center text-gray-500">No transactions yet.</td></tr>
                        )}
                      </tbody>
                   </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- ADD TREATMENT MODAL OVERLAY --- */}
      {showTreatmentForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm">
           <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-bold">Add New Treatment</h3>
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="w-1/3">
                      <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Date</label>
                      <DatePicker 
                        value={newTreatment.date || ''}
                        onChange={(date) => setNewTreatment({...newTreatment, date})}
                      />
                    </div>
                    <div className="flex-1">
                       <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Type</label>
                       <select 
                          className={inputClass}
                          value={newTreatment.type}
                          onChange={e => setNewTreatment({...newTreatment, type: e.target.value as TreatmentType})}
                       >
                          {Object.values(TreatmentType).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                 </div>
                 <input 
                    placeholder="Description (e.g. Lower Molar RCT)"
                    className={inputClass}
                    value={newTreatment.description}
                    onChange={e => setNewTreatment({...newTreatment, description: e.target.value})}
                 />
                 
                 {/* Dynamic Mini Fields */}
                 {newTreatment.type === TreatmentType.RCT && (
                   <div className="flex flex-col gap-2">
                     <input placeholder="File Types used..." className={`bg-orange-50 border-orange-200 ${smallInputClass}`} 
                       value={newTreatment.rctFileTypes || ''} onChange={e => setNewTreatment({...newTreatment, rctFileTypes: e.target.value})} />
                     <input placeholder="Irrigation (e.g. Saline, NaOCl)" className={`bg-orange-50 border-orange-200 ${smallInputClass}`} 
                       value={newTreatment.rctIrrigation || ''} onChange={e => setNewTreatment({...newTreatment, rctIrrigation: e.target.value})} />
                   </div>
                 )}
                 {newTreatment.type === TreatmentType.CROWN && (
                   <div className="flex gap-2">
                     <input placeholder="Material" className={`w-1/2 bg-purple-50 border-purple-200 ${smallInputClass}`} 
                       value={newTreatment.crownMaterial || ''} onChange={e => setNewTreatment({...newTreatment, crownMaterial: e.target.value})} />
                     <input placeholder="Shade" className={`w-1/2 bg-purple-50 border-purple-200 ${smallInputClass}`} 
                       value={newTreatment.crownShade || ''} onChange={e => setNewTreatment({...newTreatment, crownShade: e.target.value})} />
                   </div>
                 )}
                 {newTreatment.type === TreatmentType.ORTHODONTICS && (
                   <div className="flex flex-col gap-2">
                     <div className="flex gap-2">
                       <input placeholder="System (e.g. MBT)" className={`w-1/2 bg-indigo-50 border-indigo-200 ${smallInputClass}`} 
                         value={newTreatment.orthoBracketSystem || ''} onChange={e => setNewTreatment({...newTreatment, orthoBracketSystem: e.target.value})} />
                       <input placeholder="Wire (e.g. 014 NiTi)" className={`w-1/2 bg-indigo-50 border-indigo-200 ${smallInputClass}`} 
                         value={newTreatment.orthoWireType || ''} onChange={e => setNewTreatment({...newTreatment, orthoWireType: e.target.value})} />
                     </div>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Total Cost" className={inputClass} 
                       value={newTreatment.amount || ''} onChange={e => setNewTreatment({...newTreatment, amount: +e.target.value})} />
                    <input type="number" placeholder="Paid Today" className={inputClass} 
                       value={newTreatment.paid || ''} onChange={e => setNewTreatment({...newTreatment, paid: +e.target.value})} />
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowTreatmentForm(false)} className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleAddTreatment} className="rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Save</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- ADD APPOINTMENT MODAL OVERLAY --- */}
      {showApptForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm">
           <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-bold">Schedule Appointment</h3>
              <div className="space-y-4">
                 <div className="relative">
                    <DatePicker 
                       value={newAppt.date || ''}
                       onChange={(date) => setNewAppt({...newAppt, date})}
                    />
                 </div>
                 <input type="time" className={`${inputClass} cursor-pointer`} 
                    value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                    onClick={(e) => e.currentTarget.showPicker()}
                 />
                 <input placeholder="Purpose" className={inputClass} 
                    value={newAppt.purpose} onChange={e => setNewAppt({...newAppt, purpose: e.target.value})} />
                 <select className={inputClass} value={newAppt.assignedStaff} onChange={e => setNewAppt({...newAppt, assignedStaff: e.target.value})}>
                    {MOCK_DOCTORS.map(d => <option key={d}>{d}</option>)}
                 </select>
                 <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowApptForm(false)} className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleAddAppointment} className="rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Schedule</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};