import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, TreatmentRecord, Appointment, TreatmentType, LabStatus } from '../types';

interface StoreContextType {
  patients: Patient[];
  treatments: TreatmentRecord[];
  appointments: Appointment[];
  addPatient: (p: Patient) => void;
  updatePatient: (p: Patient) => void;
  deletePatient: (id: string) => void;
  addTreatment: (t: TreatmentRecord) => void;
  updateTreatment: (t: TreatmentRecord) => void;
  addAppointment: (a: Appointment) => void;
  updateAppointment: (a: Appointment) => void;
  deleteAppointment: (id: string) => void;
  getPatientTreatments: (patientId: string) => TreatmentRecord[];
  getPendingDues: () => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Initialize with some dummy data if localStorage is empty
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('rtd_patients');
    return saved ? JSON.parse(saved) : [
      { id: '1', serialNumber: 'RTD-001', name: 'John Doe', age: 34, sex: 'Male', phoneNumber: '9876543210', address: '123 Main St', createdAt: new Date().toISOString() },
      { id: '2', serialNumber: 'RTD-002', name: 'Jane Smith', age: 28, sex: 'Female', phoneNumber: '9876543211', address: '456 Park Ave', createdAt: new Date().toISOString() }
    ];
  });

  const [treatments, setTreatments] = useState<TreatmentRecord[]>(() => {
    const saved = localStorage.getItem('rtd_treatments');
    return saved ? JSON.parse(saved) : [
      { id: '101', patientId: '1', patientName: 'John Doe', type: TreatmentType.RCT, date: '2023-10-15', description: 'RCT on molar 26', amount: 5000, paid: 3000, due: 2000 },
      { id: '102', patientId: '2', patientName: 'Jane Smith', type: TreatmentType.CROWN, date: '2023-10-20', description: 'Ceramic Crown', amount: 8000, paid: 8000, due: 0, labStatus: LabStatus.SENT, capSendingDate: '2023-10-21' }
    ];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('rtd_appointments');
    return saved ? JSON.parse(saved) : [
      { id: 'a1', patientId: '1', patientName: 'John Doe', date: new Date().toISOString().split('T')[0], time: '10:00', purpose: 'RCT Sitting 2', assignedStaff: 'Dr. Raj', status: 'Scheduled' }
    ];
  });

  useEffect(() => { localStorage.setItem('rtd_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('rtd_treatments', JSON.stringify(treatments)); }, [treatments]);
  useEffect(() => { localStorage.setItem('rtd_appointments', JSON.stringify(appointments)); }, [appointments]);

  const addPatient = (p: Patient) => setPatients(prev => [...prev, p]);
  const updatePatient = (p: Patient) => setPatients(prev => prev.map(x => x.id === p.id ? p : x));
  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(x => x.id !== id));
    // Cascade delete related records
    setTreatments(prev => prev.filter(x => x.patientId !== id));
    setAppointments(prev => prev.filter(x => x.patientId !== id));
  };

  const addTreatment = (t: TreatmentRecord) => setTreatments(prev => [...prev, t]);
  const updateTreatment = (t: TreatmentRecord) => setTreatments(prev => prev.map(x => x.id === t.id ? t : x));

  const addAppointment = (a: Appointment) => setAppointments(prev => [...prev, a]);
  const updateAppointment = (a: Appointment) => setAppointments(prev => prev.map(x => x.id === a.id ? a : x));
  const deleteAppointment = (id: string) => setAppointments(prev => prev.filter(x => x.id !== id));

  const getPatientTreatments = (id: string) => treatments.filter(t => t.patientId === id);
  const getPendingDues = () => treatments.reduce((acc, curr) => acc + curr.due, 0);

  return (
    <StoreContext.Provider value={{
      patients, treatments, appointments,
      addPatient, updatePatient, deletePatient,
      addTreatment, updateTreatment,
      addAppointment, updateAppointment, deleteAppointment,
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