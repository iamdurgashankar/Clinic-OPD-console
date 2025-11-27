import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, TreatmentRecord, Appointment, TreatmentType, LabStatus, PaymentTransaction } from '../types';

interface StoreContextType {
  patients: Patient[];
  treatments: TreatmentRecord[];
  appointments: Appointment[];
  payments: PaymentTransaction[];
  addPatient: (p: Patient) => void;
  updatePatient: (p: Patient) => void;
  deletePatient: (id: string) => void;
  addTreatment: (t: TreatmentRecord) => void;
  updateTreatment: (t: TreatmentRecord) => void;
  addAppointment: (a: Appointment) => void;
  updateAppointment: (a: Appointment) => void;
  deleteAppointment: (id: string) => void;
  addPayment: (p: PaymentTransaction) => void;
  getPatientTreatments: (patientId: string) => TreatmentRecord[];
  getPendingDues: () => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

// Helper to safely parse JSON from localStorage
const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    // Handle 'undefined' string or null
    if (!item || item === 'undefined' || item === 'null') return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Failed to parse ${key} from localStorage, using fallback.`);
    return fallback;
  }
};

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Initialize with safe parsing
  const [patients, setPatients] = useState<Patient[]>(() => safeParse('rtd_patients', [
    { id: '1', serialNumber: 'RTD-001', name: 'John Doe', age: 34, sex: 'Male', phoneNumber: '9876543210', address: '123 Main St', createdAt: new Date().toISOString() },
    { id: '2', serialNumber: 'RTD-002', name: 'Jane Smith', age: 28, sex: 'Female', phoneNumber: '9876543211', address: '456 Park Ave', createdAt: new Date().toISOString() }
  ]));

  const [treatments, setTreatments] = useState<TreatmentRecord[]>(() => safeParse('rtd_treatments', [
    { id: '101', patientId: '1', patientName: 'John Doe', type: TreatmentType.RCT, date: '2023-10-15', description: 'RCT on molar 26', amount: 5000, paid: 3000, due: 2000 },
    { id: '102', patientId: '2', patientName: 'Jane Smith', type: TreatmentType.CROWN, date: '2023-10-20', description: 'Ceramic Crown', amount: 8000, paid: 8000, due: 0, labStatus: LabStatus.SENT, capSendingDate: '2023-10-21' }
  ]));

  const [appointments, setAppointments] = useState<Appointment[]>(() => safeParse('rtd_appointments', [
    { id: 'a1', patientId: '1', patientName: 'John Doe', date: new Date().toISOString().split('T')[0], time: '10:00', purpose: 'RCT Sitting 2', assignedStaff: 'Dr. Raj', status: 'Scheduled' }
  ]));

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => safeParse('rtd_payments', []));

  useEffect(() => { localStorage.setItem('rtd_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('rtd_treatments', JSON.stringify(treatments)); }, [treatments]);
  useEffect(() => { localStorage.setItem('rtd_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('rtd_payments', JSON.stringify(payments)); }, [payments]);

  const addPatient = (p: Patient) => setPatients(prev => [...prev, p]);
  const updatePatient = (p: Patient) => setPatients(prev => prev.map(x => x.id === p.id ? p : x));
  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(x => x.id !== id));
    setTreatments(prev => prev.filter(x => x.patientId !== id));
    setAppointments(prev => prev.filter(x => x.patientId !== id));
    setPayments(prev => prev.filter(x => x.patientId !== id));
  };

  const addTreatment = (t: TreatmentRecord) => setTreatments(prev => [...prev, t]);
  const updateTreatment = (t: TreatmentRecord) => setTreatments(prev => prev.map(x => x.id === t.id ? t : x));

  const addAppointment = (a: Appointment) => setAppointments(prev => [...prev, a]);
  const updateAppointment = (a: Appointment) => setAppointments(prev => prev.map(x => x.id === a.id ? a : x));
  const deleteAppointment = (id: string) => setAppointments(prev => prev.filter(x => x.id !== id));

  const addPayment = (p: PaymentTransaction) => {
    setPayments(prev => [...prev, p]);
    
    // Auto-allocation logic
    let remaining = p.amount;
    if (remaining <= 0) return;

    const patientTreatments = treatments
      .filter(t => t.patientId === p.patientId && t.due > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (patientTreatments.length > 0) {
      const updatedTreatments = [...treatments];
      
      for (const treatment of patientTreatments) {
        if (remaining <= 0) break;
        
        const index = updatedTreatments.findIndex(ut => ut.id === treatment.id);
        if (index !== -1) {
          const record = updatedTreatments[index];
          const deduct = Math.min(record.due, remaining);
          
          updatedTreatments[index] = {
            ...record,
            paid: record.paid + deduct,
            due: record.due - deduct
          };
          
          remaining -= deduct;
        }
      }
      setTreatments(updatedTreatments);
    }
  };

  const getPatientTreatments = (id: string) => treatments.filter(t => t.patientId === id);
  const getPendingDues = () => treatments.reduce((acc, curr) => acc + curr.due, 0);

  return (
    <StoreContext.Provider value={{
      patients, treatments, appointments, payments,
      addPatient, updatePatient, deletePatient,
      addTreatment, updateTreatment,
      addAppointment, updateAppointment, deleteAppointment,
      addPayment,
      getPatientTreatments, getPendingDues
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};