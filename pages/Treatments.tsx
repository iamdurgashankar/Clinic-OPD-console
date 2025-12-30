
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { TreatmentType, LabStatus, TreatmentRecord } from '../types';
import {
  Plus, Filter, CheckCircle,
  FileText, Droplet, Layers,
  Palette, Hash, Activity, Scissors, Printer
} from 'lucide-react';
import { DatePicker } from '../components/DatePicker';

interface TreatmentsProps {
  type: string;
}

// Standard Clinical Options
const RCT_FILES_OPTS = ["Rotary Protaper", "Rotary Gold", "Hand K-Files", "H-Files", "Reciproc"];
const RCT_IRRIGANTS_OPTS = ["Sodium Hypochlorite (NaOCl)", "Saline", "EDTA", "Chlorhexidine", "MTAD"];
const CROWN_MAT_OPTS = ["Zirconia", "PFM (Porcelain Fused to Metal)", "E-Max (Lithium Disilicate)", "Full Metal", "Acrylic Temp"];
const CROWN_SHADE_OPTS = ["A1", "A2", "A3", "A3.5", "B1", "B2", "C1", "D2", "Custom"];
const ORTHO_SYSTEMS_OPTS = ["MBT", "Roth", "Damon", "Begg", "Standard Edgewise"];
const ORTHO_WIRES_OPTS = ["012 NiTi", "014 NiTi", "016 NiTi", "16x22 NiTi", "17x25 SS", "19x25 SS", "TMA"];

export const Treatments: React.FC<TreatmentsProps> = ({ type }) => {
  const { treatments, patients, addTreatment, updateTreatment, staff } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filterDue, setFilterDue] = useState(false);
  const isAllView = type === 'all';

  // Map route param to Enum
  const getTreatmentType = (route: string): TreatmentType | 'all' => {
    switch (route) {
      case 'rct': return TreatmentType.RCT;
      case 'pulpectomy': return TreatmentType.PULPECTOMY;
      case 'crown': return TreatmentType.CROWN;
      case 'ortho': return TreatmentType.ORTHODONTICS;
      case 'all': return 'all';
      default: return TreatmentType.RCT;
    }
  };

  const pageType = getTreatmentType(type);

  const filteredTreatments = treatments
    .filter(t => {
      const typeMatch = isAllView ? true : t.type === pageType;
      const dueMatch = filterDue ? t.due > 0 : true;
      return typeMatch && dueMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    bracesType: '',
    doctorName: staff.length > 0 ? staff[0].name : 'General Staff',
    nextFollowUp: ''
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
    const p = patients.find(x => x.id == form.patientId);

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
      doctorName: form.doctorName,
      nextFollowUp: form.nextFollowUp
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
    }

    updateTreatment({ ...t, ...updates });
  };

  const handlePrintReceipt = (t: TreatmentRecord) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    // Get specific details string based on type
    let specifics = '';
    if (t.type === TreatmentType.RCT || t.type === TreatmentType.PULPECTOMY) {
      if (t.rctFileTypes) specifics += `<p><strong>Files Used:</strong> ${t.rctFileTypes}</p>`;
      if (t.rctIrrigation) specifics += `<p><strong>Irrigation:</strong> ${t.rctIrrigation}</p>`;
    } else if (t.type === TreatmentType.CROWN) {
      if (t.crownMaterial) specifics += `<p><strong>Material:</strong> ${t.crownMaterial}</p>`;
      if (t.crownShade) specifics += `<p><strong>Shade:</strong> ${t.crownShade}</p>`;
    } else if (t.type === TreatmentType.ORTHODONTICS) {
      if (t.orthoBracketSystem) specifics += `<p><strong>Bracket System:</strong> ${t.orthoBracketSystem}</p>`;
      if (t.orthoWireType) specifics += `<p><strong>Wire:</strong> ${t.orthoWireType}</p>`;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Receipt #${t.id}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #0f766e; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 5px 0; color: #666; font-size: 14px; }
            
            .receipt-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .info-block h3 { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 5px; letter-spacing: 0.5px; }
            .info-block p { font-size: 15px; font-weight: bold; margin: 0; color: #1e293b; }

            .details-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
            .details-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 12px; }
            .details-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            
            .financials { display: flex; justify-content: flex-end; }
            .financials table { width: 300px; border-collapse: collapse; }
            .financials td { padding: 8px 0; }
            .financials .label { text-align: left; color: #64748b; font-size: 14px; }
            .financials .value { text-align: right; font-weight: bold; font-size: 14px; }
            .total { border-top: 2px solid #1e293b; margin-top: 10px; }
            .total td { padding-top: 10px; font-size: 18px; }

            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Raj True Dent</h1>
            <p>Advanced Dental Care Center</p>
            <p>Receipt Generated: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="receipt-info">
            <div class="info-block">
              <h3>Patient Name</h3>
              <p>${t.patientName}</p>
            </div>
            <div class="info-block">
              <h3>Treatment Date</h3>
              <p>${t.date}</p>
            </div>
            <div class="info-block">
              <h3>Receipt ID</h3>
              <p>#${t.id.slice(-6)}</p>
            </div>
            <div class="info-block">
              <h3>Doctor</h3>
              <p>${t.doctorName || 'General Staff'}</p>
            </div>
          </div>

          <div class="details-box">
             <div class="details-row">
               <span><strong>Treatment Type:</strong> ${t.type}</span>
             </div>
             <div class="details-row">
               <span><strong>Description:</strong> ${t.description}</span>
             </div>
             ${specifics ? `<div style="margin-top:15px; font-size: 13px; color: #475569; background: #f8fafc; padding: 10px; border-radius: 6px;">${specifics}</div>` : ''}
          </div>

          <div class="financials">
            <table>
              <tr>
                <td class="label">Total Amount</td>
                <td class="value">₹${t.amount}</td>
              </tr>
              <tr>
                <td class="label">Amount Paid</td>
                <td class="value">₹${t.paid}</td>
              </tr>
              <tr class="total">
                <td class="label">Balance Due</td>
                <td class="value" style="color: ${t.due > 0 ? '#ef4444' : '#10b981'}">₹${t.due}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for visiting Raj True Dent.</p>
            <p>For appointments, call: +91 98765 43210</p>
            <p>Computer Generated Receipt</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
            onClick={() => {
              setForm(initialFormState);
              setShowModal(true);
            }}
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
              <th className="px-6 py-3">Doctor</th>
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
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.type === TreatmentType.RCT ? 'bg-orange-100 text-orange-800' :
                      t.type === TreatmentType.CROWN ? 'bg-purple-100 text-purple-800' :
                        t.type === TreatmentType.ORTHODONTICS ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {t.type}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900">{t.doctorName || 'Not Assigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{t.description}</div>

                  {/* RCT & Pulpectomy Details Display */}
                  {(t.type === TreatmentType.RCT || t.type === TreatmentType.PULPECTOMY) && (t.rctFileTypes || t.rctIrrigation) && (
                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500">
                      {t.rctFileTypes && (
                        <div className="flex items-center gap-1.5">
                          <FileText size={12} className="text-orange-500" />
                          <span>Files: <span className="font-medium text-slate-700">{t.rctFileTypes}</span></span>
                        </div>
                      )}
                      {t.rctIrrigation && (
                        <div className="flex items-center gap-1.5">
                          <Droplet size={12} className="text-blue-500" />
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
                          <Layers size={12} className="text-purple-500" />
                          <span>Mat: <span className="font-medium text-slate-700">{t.crownMaterial}</span></span>
                        </div>
                      )}
                      {t.crownShade && (
                        <div className="flex items-center gap-1.5">
                          <Palette size={12} className="text-pink-500" />
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
                          <Scissors size={12} className="text-teal-500" />
                          <span>Type: <span className="font-medium text-slate-700">{t.bracesType}</span></span>
                        </div>
                      )}
                      {t.orthoBracketSystem && (
                        <div className="flex items-center gap-1.5">
                          <Hash size={12} className="text-indigo-500" />
                          <span>System: <span className="font-medium text-slate-700">{t.orthoBracketSystem}</span></span>
                        </div>
                      )}
                      {t.orthoWireType && (
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-rose-500" />
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
                        <select
                          value={t.labStatus || LabStatus.PENDING}
                          onChange={(e) => {
                            const newStatus = e.target.value as LabStatus;
                            const today = new Date().toISOString().split('T')[0];
                            let updates: Partial<TreatmentRecord> = { labStatus: newStatus };
                            if (newStatus === LabStatus.SENT) updates.capSendingDate = today;
                            if (newStatus === LabStatus.RECEIVED) updates.capReceivedDate = today;
                            if (newStatus === LabStatus.FIXED) updates.capFixedDate = today;
                            updateTreatment({ ...t, ...updates });
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border-none outline-none ${t.labStatus === 'Fixed' ? 'bg-green-100 text-green-700' :
                            t.labStatus === 'Sent to Lab' ? 'bg-blue-100 text-blue-700' :
                              t.labStatus === 'Received' ? 'bg-purple-100 text-purple-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                          <option value={LabStatus.PENDING}>Pending</option>
                          <option value={LabStatus.SENT}>Sent to Lab</option>
                          <option value={LabStatus.RECEIVED}>Received</option>
                          <option value={LabStatus.FIXED}>Fixed</option>
                        </select>
                        {/* Auto-display relevant date based on status */}
                        {t.labStatus === LabStatus.SENT && t.capSendingDate && (
                          <span className="text-[10px] text-gray-500 ml-1">Sent: {t.capSendingDate}</span>
                        )}
                        {t.labStatus === LabStatus.RECEIVED && t.capReceivedDate && (
                          <span className="text-[10px] text-gray-500 ml-1">Recv: {t.capReceivedDate}</span>
                        )}
                        {t.labStatus === LabStatus.FIXED && t.capFixedDate && (
                          <span className="text-[10px] text-gray-500 ml-1">Fixed: {t.capFixedDate}</span>
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
                  <button
                    onClick={() => handlePrintReceipt(t)}
                    className="flex items-center justify-end gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 hover:underline w-full"
                  >
                    <Printer size={14} /> View Receipt
                  </button>
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
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Patient</label>
                  <select
                    required
                    className={inputClass}
                    value={form.patientId || ''}
                    onChange={e => setForm({ ...form, patientId: e.target.value })}
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.serialNumber})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Assign Doctor</label>
                  <select
                    required
                    className={inputClass}
                    value={form.doctorName || ''}
                    onChange={e => setForm({ ...form, doctorName: e.target.value })}
                  >
                    <option value="">Select Doctor/Nurse</option>
                    {staff.map((d: any) => <option key={d.id} value={d.name}>{d.name} ({d.role})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Treatment Date</label>
                  <DatePicker
                    value={form.date || ''}
                    onChange={(date) => setForm({ ...form, date })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Next Follow-up</label>
                  <DatePicker
                    value={form.nextFollowUp || ''}
                    onChange={(date) => setForm({ ...form, nextFollowUp: date })}
                  />
                </div>
              </div>

              <div className={isAllView ? "grid grid-cols-2 gap-3" : ""}>
                {isAllView && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Treatment Type</label>
                    <select
                      required
                      className={inputClass}
                      value={form.type || TreatmentType.RCT}
                      onChange={e => setForm({ ...form, type: e.target.value as TreatmentType })}
                    >
                      {Object.values(TreatmentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Description</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Molar RCT..."
                  />
                </div>
              </div>

              {/* Dynamic Fields based on form.type */}
              {(form.type === TreatmentType.RCT || form.type === TreatmentType.PULPECTOMY) && (
                <div className="rounded-lg border border-orange-100 bg-orange-50/30 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-orange-800 uppercase">Files</label>
                      <select className={inputClass} value={form.rctFileTypes || ''} onChange={e => setForm({ ...form, rctFileTypes: e.target.value })}>
                        <option value="">Select File</option>
                        {RCT_FILES_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-orange-800 uppercase">Irrigation</label>
                      <select className={inputClass} value={form.rctIrrigation || ''} onChange={e => setForm({ ...form, rctIrrigation: e.target.value })}>
                        <option value="">Select Irrigation</option>
                        {RCT_IRRIGANTS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {form.type === TreatmentType.CROWN && (
                <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-800 uppercase">Material</label>
                      <select className={inputClass} value={form.crownMaterial || ''} onChange={e => setForm({ ...form, crownMaterial: e.target.value })}>
                        <option value="">Select Material</option>
                        {CROWN_MAT_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-purple-800 uppercase">Shade</label>
                      <select className={inputClass} value={form.crownShade || ''} onChange={e => setForm({ ...form, crownShade: e.target.value })}>
                        <option value="">Select Shade</option>
                        {CROWN_SHADE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {form.type === TreatmentType.ORTHODONTICS && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-indigo-800 uppercase">Braces Type</label>
                      <input className={inputClass} placeholder="e.g. Metal" value={form.bracesType || ''} onChange={e => setForm({ ...form, bracesType: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-800 uppercase">System</label>
                      <select className={inputClass} value={form.orthoBracketSystem || ''} onChange={e => setForm({ ...form, orthoBracketSystem: e.target.value })}>
                        <option value="">Select</option>
                        {ORTHO_SYSTEMS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-800 uppercase">Wire</label>
                      <select className={inputClass} value={form.orthoWireType || ''} onChange={e => setForm({ ...form, orthoWireType: e.target.value })}>
                        <option value="">Select</option>
                        {ORTHO_WIRES_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Total Amount</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500">₹</span>
                    <input type="number" className={`${inputClass} pl-8`} value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Paid Today</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500">₹</span>
                    <input type="number" className={`${inputClass} pl-8`} value={form.paid} onChange={e => setForm({ ...form, paid: +e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-teal-500/30 hover:bg-teal-700">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
