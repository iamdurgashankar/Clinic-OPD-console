import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, TreatmentRecord, TreatmentType, LabStatus, Appointment, PaymentMode, Staff, User, ClinicNotification, PaymentTransaction, Expense } from '../types';
import { api } from '../services/api';

interface StoreContextType {
  patients: Patient[];
  treatments: TreatmentRecord[];
  appointments: Appointment[];
  payments: PaymentTransaction[];
  staff: Staff[];
  notifications: ClinicNotification[];
  expenses: Expense[];
  addPatient: (p: Patient) => Promise<string>;
  updatePatient: (p: Patient) => void;
  deletePatient: (id: string) => void;
  addTreatment: (t: TreatmentRecord) => Promise<string>;
  updateTreatment: (t: TreatmentRecord) => void;
  addAppointment: (a: Appointment) => Promise<string>;
  updateAppointment: (a: Appointment) => void;
  deleteAppointment: (id: string) => void;
  addPayment: (p: PaymentTransaction) => Promise<string>;
  addStaff: (s: Staff) => void;
  updateStaff: (s: Staff) => void;
  deleteStaff: (id: string) => void;
  getPatientTreatments: (patientId: string) => TreatmentRecord[];
  getPendingDues: () => number;
  markNotificationRead: (id: string) => void;
  addNotification: (userId: string | undefined, message: string, type: 'info' | 'reminder' | 'urgent') => void;
  addExpense: (e: Expense) => Promise<string>;
  updateExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [notifications, setNotifications] = useState<ClinicNotification[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, t, a, pay, s, n, e] = await Promise.all([
          api.getPatients(),
          api.getTreatments(),
          api.getAppointments(),
          api.getPayments(),
          api.getStaff(),
          api.getNotifications(),
          api.getExpenses()
        ]);
        setPatients(p);
        setTreatments(t);
        setAppointments(a);
        setPayments(pay);
        setStaff(s);
        setNotifications(n);
        setExpenses(e);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const addPatient = async (p: Patient): Promise<string> => {
    try {
      const res = await api.createPatient(p);
      setPatients(prev => [...prev, { ...p, id: res.id }]);
      return res.id;
    } catch (error: any) {
      console.error("Failed to add patient", error);
      throw error; // Re-throw to handle in UI (e.g. toast)
    }
  };

  const updatePatient = async (p: Patient) => {
    try {
      await api.updatePatient(p);
      setPatients(prev => prev.map(x => x.id === p.id ? p : x));
    } catch (error) {
      console.error("Failed to update patient", error);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await api.deletePatient(id);
      setPatients(prev => prev.filter(x => x.id !== id));
      setTreatments(prev => prev.filter(x => x.patientId !== id));
      setAppointments(prev => prev.filter(x => x.patientId !== id));
      setPayments(prev => prev.filter(x => x.patientId !== id));
    } catch (error) {
      console.error("Failed to delete patient", error);
    }
  };

  const addTreatment = async (t: TreatmentRecord): Promise<string> => {
    try {
      const res = await api.createTreatment(t);
      setTreatments(prev => [{ ...t, id: res.id }, ...prev]);
      return res.id;
    } catch (error) {
      console.error("Failed to add treatment", error);
      return '';
    }
  };

  const updateTreatment = async (t: TreatmentRecord) => {
    try {
      await api.updateTreatment(t);
      setTreatments(prev => prev.map(x => x.id === t.id ? t : x));
    } catch (error) {
      console.error("Failed to update treatment", error);
    }
  };

  const addAppointment = async (a: Appointment): Promise<string> => {
    try {
      const res = await api.createAppointment(a);
      setAppointments(prev => [...prev, { ...a, id: res.id }]);
      return res.id;
    } catch (error) {
      console.error("Failed to add appointment", error);
      return '';
    }
  };

  const updateAppointment = async (a: Appointment) => {
    try {
      await api.updateAppointment(a);
      setAppointments(prev => prev.map(x => x.id == a.id ? a : x));
    } catch (error) {
      console.error("Failed to update appointment", error);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      setAppointments(prev => prev.filter(x => x.id != id));
    } catch (error) {
      console.error("Failed to delete appointment", error);
    }
  };

  const addPayment = async (p: PaymentTransaction): Promise<string> => {
    try {
      const res = await api.createPayment(p);
      const paymentWithId = { ...p, id: res.id };

      // Update payments state using functional update
      setPayments(prev => [...prev, paymentWithId]);

      // Handle Treatment Allocation
      if (p.treatmentId) {
        // Find the treatment in the current state to calculate the updated record
        const treatmentToUpdate = treatments.find(t => t.id === p.treatmentId);

        if (treatmentToUpdate) {
          const currentPaid = Number(treatmentToUpdate.paid) || 0;
          const treatmentTotal = Number(treatmentToUpdate.amount) || 0;
          const paymentAmount = Number(p.amount) || 0;

          const newPaid = currentPaid + paymentAmount;
          let newDue = treatmentTotal - newPaid;
          if (newDue < 0) newDue = 0;

          const updatedRecord = {
            ...treatmentToUpdate,
            paid: newPaid,
            due: newDue
          };

          // Sync treatment update to backend - await this for data consistency
          await api.updateTreatment(updatedRecord);

          // Update local state reactively
          setTreatments(prevTreatments =>
            prevTreatments.map(t => t.id === p.treatmentId ? updatedRecord : t)
          );
        } else {
          console.warn("Target treatment not found in state for allocation.");
        }
      } else {
        console.warn("Payment added without specific treatment ID. No allocation performed.");
      }

      return res.id;
    } catch (error) {
      console.error("Failed to add payment:", error);
      return '';
    }
  };

  const addStaff = async (s: Staff) => {
    try {
      const res = await api.createStaff(s);
      setStaff(prev => [...prev, { ...s, id: res.id }]);
    } catch (error) {
      console.error("Failed to add staff", error);
    }
  };

  const updateStaff = async (s: Staff) => {
    try {
      await api.updateStaff(s);
      setStaff(prev => prev.map(x => x.id === s.id ? s : x));
    } catch (error) {
      console.error("Failed to update staff", error);
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await api.deleteStaff(id);
      setStaff(prev => prev.filter(x => x.id !== id));
    } catch (error) {
      console.error("Failed to delete staff", error);
    }
  };

  const getPatientTreatments = (id: string) =>
    treatments
      .filter(t => t.patientId == id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getPendingDues = () => treatments.reduce((acc, curr) => acc + curr.due, 0);

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark notification read", error);
    }
  };

  const addNotification = async (userId: string | undefined, message: string, type: 'info' | 'reminder' | 'urgent') => {
    try {
      const res = await api.createNotification({ userId, message, type });
      setNotifications(prev => [{
        id: res.id,
        userId,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      }, ...prev] as ClinicNotification[]);
    } catch (error) {
      console.error("Failed to add notification", error);
    }
  };

  const addExpense = async (e: Expense): Promise<string> => {
    try {
      const res = await api.createExpense(e);
      setExpenses(prev => [{ ...e, id: res.id }, ...prev]);
      return res.id;
    } catch (error) {
      console.error("Failed to add expense", error);
      return '';
    }
  };

  const updateExpense = async (e: Expense) => {
    try {
      await api.updateExpense(e);
      setExpenses(prev => prev.map(x => x.id === e.id ? e : x));
    } catch (error) {
      console.error("Failed to update expense", error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id);
      setExpenses(prev => prev.filter(x => x.id !== id));
    } catch (error) {
      console.error("Failed to delete expense", error);
    }
  };

  return (
    <StoreContext.Provider value={{
      patients, treatments, appointments, payments, staff, notifications,
      addPatient, updatePatient, deletePatient,
      addTreatment, updateTreatment,
      addAppointment, updateAppointment, deleteAppointment,
      addPayment,
      addStaff, updateStaff, deleteStaff,
      getPatientTreatments,
      getPendingDues,
      markNotificationRead,
      addNotification,
      expenses, addExpense, updateExpense, deleteExpense
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