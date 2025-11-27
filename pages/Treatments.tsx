import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { TreatmentType, LabStatus, TreatmentRecord } from '../types';
import { 
  Plus, Filter, CheckCircle, 
  FileText, Droplet, Layers, 
  Palette, Hash, Activity, Scissors 
} from 'lucide-react';
import { DatePicker } from '../components/DatePicker';

interface TreatmentsProps {
  type: string;
}

// Standard Clinical Options
const RCT_FILES_OPTS = ["Rotary Protaper", "Rotary Gold", "Hand K-Files", "H-Files", "Reciproc"];
const RCT_IRRIGANTS_OPTS = ["Sodium Hypochlorite (NaOCl)", "Saline", "EDTA", "Chlorhexidine", "MTAD"];
const CROWN_MAT_OPTS = ["Zirconia", "PFM (Porcelain Fused to Metal)", "E-Max (Lithium Disilicate)", "Full Metal", "Acrylic Temp"];
const ORTHO_SYSTEMS_OPTS = ["MBT", "Roth", "Damon", "Begg", "Standard Edgewise"];
const ORTHO_WIRES_OPTS = ["012 NiTi", "014 NiTi", "016 NiTi", "16x22 NiTi", "17x25 SS", "19x25 SS", "TMA"];

export const Treatments: React.FC<TreatmentsProps> = ({ type }) => {
  const { treatments, patients, addTreatment, updateTreatment } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filterDue, setFilterDue] = useState(false);
  const isAllView = type === 'all';

  // Map route param to Enum
  const getTreatmentType = (route: string): TreatmentType | 'all' => {
    switch(route) {
      case 'rct': return TreatmentType.RCT;
      case 'pulpectomy': return TreatmentType.PULPECTOMY;
      case 'crown': return TreatmentType.CROWN;
      case 'ortho': return TreatmentType.ORTHODONTICS;
      case 'all': return 'all';
      default: return TreatmentType.RCT;
    }
  };

  const pageType = getTreatmentType(type);
  
  const filteredTreatments = treatments.filter(t => {
    const typeMatch = isAllView ? true : t.type === pageType;
    const dueMatch = filterDue ? t.due > 0 : true;
    return typeMatch && dueMatch;
  });

  const initialFormState: Partial<TreatmentRecord> = {
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    paid: 0,
    due: 0,
    labStatus: LabStatus.PENDING,
    type: isAllView ? TreatmentType.RCT : (pageType as TreatmentType),
    // Initialize specific fields
    rctFileTypes: '',
    rctIrrigation: '',
    crownMaterial: '',
    crownShade: '',
    orthoBracketSystem: '',
    orthoWireType: '',
    bracesType: ''
  };

  const [form, setForm] = useState<Partial<TreatmentRecord>>(initialFormState);
  
  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10";

  // Reset form type when page changes
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      type: isAllView ? TreatmentType.RCT : (pageType as TreatmentType)
    }));
  }, [type, isAllView, pageType]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) return;
    const p = patients.find(x => x.id === form.patientId);
    
    addTreatment({
      id: Date.now().toString(),
      type: form.type || TreatmentType.GENERAL, // Use form type, fallback to general
      patientId: form.patientId,
      patientName: p?.name || 'Unknown',
      date: form.date!,
      description: form.description || form.type || 'Treatment',
      amount: form.amount || 0,
      paid: form.paid || 0,
      due: (form.amount || 0) - (form.paid || 0),
      // Specifics
      labStatus: form.labStatus,
      capSendingDate: form.capSendingDate,
      // Enhanced Fields
      rctFileTypes: form.rctFileTypes,
      rctIrrigation: form.rctIrrigation,
      crownMaterial: form.crownMaterial,
      crownShade: form.crownShade,
      bracesType: form.bracesType,
      orthoBracketSystem: form.orthoBracketSystem,
      orthoWireType: form.orthoWireType,
    } as TreatmentRecord);
    setShowModal(false);
    setForm(initialFormState);
  };

  // Helper to update Lab Status inline
  const cycleLabStatus = (t: TreatmentRecord) => {
    const flow = [LabStatus.PENDING, LabStatus.SENT, LabStatus.RECEIVED, LabStatus.FIXED];
    const currentIndex = flow.indexOf(t.labStatus || LabStatus.PENDING);
    const nextStatus = flow[(currentIndex + 1) % flow.length];
    
    const today = new Date().toISOString().split('T')[0];
    let updates: Partial<TreatmentRecord> = { labStatus: nextStatus };

    // Auto-update dates based on status transition
    if (nextStatus === LabStatus.SENT) {
      updates.capSendingDate = today;
    } else if (nextStatus === LabStatus.RECEIVED) {
      updates.capReceivedDate = today;
    } else if (nextStatus === LabStatus.FIXED) {
      updates.capFixedDate = today;
    } else if (nextStatus === LabStatus.PENDING) {
      // Optional: Reset dates if cycling back to start, or keep history
      // updates.capSendingDate = undefined;
      // updates.capReceivedDate = undefined;
      // updates.capFixedDate = undefined;
    }

    updateTreatment({ ...t, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          {isAllView ? 'All Treatments Log' : `${type} Module`}
        </h2>
        <div className="flex gap-2">
           <button 
            onClick={() => setFilterDue(!filterDue)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 border ${filterDue ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600'}`}
          >
            <Filter size={18} /> Due Only
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white shadow hover:bg-teal-700"
          >
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Patient</th>
              {isAllView && <th className="px-6 py-3">Type</th>}
              <th className="px-6 py-3">Clinical Details</th>
              {(isAllView || pageType === TreatmentType.CROWN) && <th className="px-6 py-3">Lab Status</th>}
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-right">Due</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTreatments.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{t.date}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {t.patientName}
                </td>
                {isAllView && (
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.type === TreatmentType.RCT ? 'bg-orange-100 text-orange-800' :
                      t.type === TreatmentType.CROWN ? 'bg-purple-100 text-purple-800' :
                      t.type === TreatmentType.ORTHODONTICS ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{t.description}</div>
                  
                  {/* RCT Details Display */}
                  {t.type === TreatmentType.RCT && (t.rctFileTypes || t.rctIrrigation) && (
                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500">
                      {t.rctFileTypes && (
                        <div className="flex items-center gap-1.5">
                          <FileText size={12} className="text-orange-500"/> 
                          <span>Files: <span className="font-medium text-slate-700">{t.rctFileTypes}</span></span>
                        </div>
                      )}
                      {t.rctIrrigation && (
                        <div className="flex items-center gap-1.5">
                          <Droplet size={12} className="text-blue-500"/>
                          <span>Irrig: <span className="font-medium text-slate-700">{t.rctIrrigation}</span></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Crown Details Display */}
                  {t.type === TreatmentType.CROWN && (t.crownMaterial || t.crownShade) && (
                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500">
                      {t.crownMaterial && (
                        <div className="flex items-center gap-1.5">
                          <Layers size={12} className="text-purple-500"/> 
                          <span>Mat: <span className="font-medium text-slate-700">{t.crownMaterial}</span></span>
                        </div>
                      )}
                      {t.crownShade && (
                         <div className="flex items-center gap-1.5">
                           <Palette size={12} className="text-pink-500"/> 
                           <span>Shade: <span className="font-medium text-slate-700">{t.crownShade}</span></span>
                         </div>
                      )}
                    </div>
                  )}

                  {/* Ortho Details Display */}
                  {t.type === TreatmentType.ORTHODONTICS && (
                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500">
                      {t.bracesType && (
                        <div className="flex items-center gap-1.5">
                           <Scissors size={12} className="text-teal-500"/> 
                           <span>Type: <span className="font-medium text-slate-700">{t.bracesType}</span></span>
                        </div>
                      )}
                      {t.orthoBracketSystem && (
                        <div className="flex items-center gap-1.5">
                          <Hash size={12} className="text-indigo-500"/> 
                          <span>System: <span className="font-medium text-slate-700">{t.orthoBracketSystem}</span></span>
                        </div>
                      )}
                      {t.orthoWireType && (
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-rose-500"/> 
                          <span>Wire: <span className="font-medium text-slate-700">{t.orthoWireType}</span></span>
                        </div>
                      )}
                    </div>
                  )}
                </td>
                
                {(isAllView || pageType === TreatmentType.CROWN) && (
                  <td className="px-6 py-4">
                    {t.type === TreatmentType.CROWN ? (
                      <div className="flex flex-col items-start gap-1">
                        <button 
                          onClick={() => cycleLabStatus(t)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:opacity-80 ${
                            t.labStatus === 'Fixed' ? 'bg-green-100 text-green-700' :
                            t.labStatus === 'Sent to Lab' ? 'bg-blue-100 text-blue-700' :
                            t.labStatus === 'Received' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {t.labStatus}
                        </button>
                        {/* Auto-display relevant date based on status */}
                        {t.labStatus === LabStatus.SENT && t.capSendingDate && (
                          <span className="text-[10px] text-gray-500">Sent: {t.capSendingDate}</span>
                        )}
                        {t.labStatus === LabStatus.RECEIVED && t.capReceivedDate && (
                          <span className="text-[10px] text-gray-500">Recv: {t.capReceivedDate}</span>
                        )}
                        {t.labStatus === LabStatus.FIXED && t.capFixedDate && (
                          <span className="text-[10px] text-gray-500">Fixed: {t.capFixedDate}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                )}

                <td className="px-6 py-4 text-right">₹{t.amount}</td>
                <td className="px-6 py-4 text-right">
                  {t.due > 0 ? (
                    <span className="font-bold text-red-500">₹{t.due}</span>
                  ) : (
                    <span className="flex items-center justify-end gap-1 text-green-600"><CheckCircle size={14} /> Paid</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-xs font-medium text-teal-600 hover:text-teal-800 hover:underline">View Receipt</button>
                </td>
              </tr>
            ))}
            {filteredTreatments.length === 0 && <tr><td colSpan={isAllView ? 8 : 7} className="py-12 text-center text-gray-400">No treatment records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* New Treatment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-gray-800">
              {isAllView ? 'New General Record' : `New ${type} Record`}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <select 
                  required 
                  className={inputClass}
                  value={form.patientId || ''}
                  onChange={e => setForm({...form, patientId: e.target.value})}
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.serialNumber})</option>)}
                </select>
              </div>

              <div className={`grid gap-4 ${isAllView ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <DatePicker 
                    value={form.date || ''}
                    onChange={(date) => setForm({...form, date})}
                    required
                  />
                </div>
                {/* If All View, allow selecting type */}
                {isAllView && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Treatment Type</label>
                    <select 
                      required 
                      className={inputClass}
                      value={form.type || TreatmentType.RCT}
                      onChange={e => setForm({...form, type: e.target.value as TreatmentType})}
                    >
                      {Object.values(TreatmentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment Description</label>
                <input 
                  type="text" 
                  className={inputClass} 
                  value={form.description || ''}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="e.g. Molar RCT, Ceramic Bridge..."
                />
              </div>

              {/* Dynamic Fields based on form.type */}
              {form.type === TreatmentType.RCT && (
                <div className="rounded-lg border border-orange-100 bg-orange-50/50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-800">
                    <FileText size={14}/> Clinical Specifics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">File Types Used</label>
                      <input 
                        list="rct-files"
                        className={inputClass} 
                        placeholder="Select or Type..."
                        value={form.rctFileTypes || ''}
                        onChange={e => setForm({...form, rctFileTypes: e.target.value})}
                      />
                      <datalist id="rct-files">
                         {RCT_FILES_OPTS.map(o => <option key={o} value={o} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Irrigation Method</label>
                      <input 
                        list="rct-irrigants"
                        className={inputClass} 
                        placeholder="Select or Type..."
                        value={form.rctIrrigation || ''}
                        onChange={e => setForm({...form, rctIrrigation: e.target.value})}
                      />
                      <datalist id="rct-irrigants">
                         {RCT_IRRIGANTS_OPTS.map(o => <option key={o} value={o} />)}
                      </datalist>
                    </div>
                  </div>
                </div>
              )}

              {form.type === TreatmentType.CROWN && (
                <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4">
                   <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-purple-800">
                    <Layers size={14}/> Material & Shade
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Crown Material</label>
                      <input 
                        list="crown-mats"
                        className={inputClass} 
                        placeholder="Select or Type..."
                        value={form.crownMaterial || ''}
                        onChange={e => setForm({...form, crownMaterial: e.target.value})}
                      />
                      <datalist id="crown-mats">
                         {CROWN_MAT_OPTS.map(o => <option key={o} value={o} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Shade Guide</label>
                      <input 
                        className={inputClass} 
                        placeholder="e.g. A1, A2, B1"
                        value={form.crownShade || ''}
                        onChange={e => setForm({...form, crownShade: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {form.type === TreatmentType.ORTHODONTICS && (
                 <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                   <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-800">
                    <Hash size={14}/> Ortho Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Braces Type</label>
                      <input 
                        className={inputClass} 
                        placeholder="e.g. Metal, Ceramic, Self-Ligating"
                        value={form.bracesType || ''}
                        onChange={e => setForm({...form, bracesType: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600">Bracket System</label>
                        <input 
                          list="ortho-systems"
                          className={inputClass} 
                          placeholder="Select or Type..."
                          value={form.orthoBracketSystem || ''}
                          onChange={e => setForm({...form, orthoBracketSystem: e.target.value})}
                        />
                        <datalist id="ortho-systems">
                          {ORTHO_SYSTEMS_OPTS.map(o => <option key={o} value={o} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600">Wire Type</label>
                        <input 
                          list="ortho-wires"
                          className={inputClass} 
                          placeholder="Select or Type..."
                          value={form.orthoWireType || ''}
                          onChange={e => setForm({...form, orthoWireType: e.target.value})}
                        />
                         <datalist id="ortho-wires">
                          {ORTHO_WIRES_OPTS.map(o => <option key={o} value={o} />)}
                        </datalist>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                      <input type="number" className={`${inputClass} pl-8`} value={form.amount} onChange={e => setForm({...form, amount: +e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Paid Today</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                      <input type="number" className={`${inputClass} pl-8`} value={form.paid} onChange={e => setForm({...form, paid: +e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};