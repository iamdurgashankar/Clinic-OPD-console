import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateAppointmentReminder } from '../services/geminiService';
import { Clock, Send, Calendar as CalIcon, Trash2 } from 'lucide-react';
import { Appointment } from '../types';
import { DatePicker } from '../components/DatePicker';
import { TimePicker } from '../components/TimePicker';

export const Appointments: React.FC = () => {
  const { appointments, patients, addAppointment, deleteAppointment, staff } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderDraft, setReminderDraft] = useState<{ id: string, text: string } | null>(null);

  const [form, setForm] = useState<Partial<Appointment>>({
    time: '09:00',
    assignedStaff: staff.length > 0 ? staff[0].name : '',
    purpose: 'Consultation'
  });

  const dailyAppointments = appointments.filter(a => a.date === selectedDate);

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10";

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) return;
    const p = patients.find(x => x.id === form.patientId);

    addAppointment({
      id: Date.now().toString(),
      patientId: form.patientId,
      patientName: p?.name || 'Unknown',
      date: selectedDate,
      time: form.time!,
      purpose: form.purpose!,
      assignedStaff: form.assignedStaff!,
      status: 'Scheduled'
    });
    setForm({ ...form, purpose: 'Consultation', time: '10:00' });
  };

  const handleGenerateDraft = async (app: Appointment) => {
    setReminderDraft({ id: app.id, text: 'Generating AI draft...' });
    const text = await generateAppointmentReminder(app.patientName, app.date, app.time);
    setReminderDraft({ id: app.id, text });
  };

  const handleWhatsAppSend = (patientId: string, message: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient?.phoneNumber) {
      alert("Patient phone number not found!");
      return;
    }

    // Clean phone number: remove any non-numeric characters e.g. spaces, hyphens
    const cleanNumber = patient.phoneNumber.replace(/\D/g, '');

    // Construct WhatsApp URL
    // Format: https://wa.me/number?text=URLEncodedText
    const waUrl = `https://wa.me/${cleanNumber.startsWith('91') ? cleanNumber : '91' + cleanNumber}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Calendar & Form Column */}
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">Select Date</h3>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">Book Appointment</h3>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Patient</label>
              <select
                required
                className={inputClass}
                value={form.patientId || ''}
                onChange={e => setForm({ ...form, patientId: e.target.value })}
              >
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Time</label>
              <TimePicker
                value={form.time || '09:00'}
                onChange={(t) => setForm({ ...form, time: t })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Purpose</label>
              <input
                className={inputClass}
                value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Doctor</label>
              <select
                className={inputClass}
                value={form.assignedStaff}
                onChange={e => setForm({ ...form, assignedStaff: e.target.value })}
              >
                <option value="">Select Staff</option>
                {staff.map((d: any) => <option key={d.id} value={d.name}>{d.name} ({d.role})</option>)}
              </select>
            </div>
            <button type="submit" className="w-full rounded-xl bg-teal-600 py-2.5 font-bold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-700 hover:shadow-teal-700/30 transition-all">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>

      {/* List Column */}
      <div className="lg:col-span-2">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800">Schedule for {selectedDate}</h2>
            <p className="text-sm text-gray-500">{dailyAppointments.length} appointments found</p>
          </div>
          <div className="divide-y divide-gray-100">
            {dailyAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(app => (
                <div key={app.id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{app.time} - {app.patientName}</h4>
                        <p className="text-sm text-gray-500">{app.purpose} with {app.assignedStaff}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => deleteAppointment(app.id)}
                        className="rounded p-2 text-red-400 hover:bg-red-50"
                        title="Cancel"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleGenerateDraft(app)}
                        className="flex items-center gap-2 rounded border px-3 py-2 text-sm text-gray-600 hover:border-teal-500 hover:text-teal-600"
                      >
                        <Send size={14} /> Reminder
                      </button>
                    </div>
                  </div>

                  {/* AI Draft Display */}
                  {reminderDraft?.id === app.id && (
                    <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                      <p className="mb-2 text-xs font-bold text-indigo-400">AI GENERATED DRAFT:</p>
                      <p className="text-sm text-gray-800">{reminderDraft.text}</p>
                      <div className="mt-2 flex gap-4">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(reminderDraft.text);
                            alert('Copied to clipboard!');
                          }}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Copy to Clipboard
                        </button>
                        <button
                          onClick={() => handleWhatsAppSend(app.patientId, reminderDraft.text)}
                          className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
                        >
                          Send via WhatsApp
                        </button>
                        <button onClick={() => setReminderDraft(null)} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">Dismiss</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {dailyAppointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CalIcon size={48} className="mb-2 opacity-20" />
                <p>No appointments scheduled for this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};