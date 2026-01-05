
export enum TreatmentType {
  RCT = 'RCT',
  PULPECTOMY = 'Pulpectomy',
  CROWN = 'Crown',
  ORTHODONTICS = 'Orthodontics',
  GENERAL = 'General Checkup'
}

export enum PaymentMode {
  CASH = 'Cash',
  ONLINE = 'Online',
  INSURANCE = 'Insurance'
}

export enum LabStatus {
  PENDING = 'Pending',
  SENT = 'Sent to Lab',
  RECEIVED = 'Received',
  FIXED = 'Fixed'
}

export interface Staff {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse';
  specialization?: string;
  active: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  displayName?: string;
}

export interface Patient {
  id: string;
  serialNumber: string;
  name: string;
  phoneNumber: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  createdAt: string; // ISO Date
  medicalHistory?: string; // New field for notes/follow-up details
}

export interface TreatmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  type: TreatmentType;
  date: string;
  description: string;
  amount: number;
  paid: number;
  due: number;

  // Specific fields for Crown/Lab
  labStatus?: LabStatus;
  capSendingDate?: string;
  capReceivedDate?: string;
  capFixedDate?: string;
  capFixingPerson?: string;
  crownMaterial?: string; // New: e.g. Zirconia, PFM
  crownShade?: string;    // New: e.g. A1, A2

  // RCT specifics
  rctFileTypes?: string;  // New: e.g. K-Files, Rotary
  rctIrrigation?: string; // New: e.g. Hypo, Saline

  // Ortho specifics
  bracesType?: string;
  orthoBracketSystem?: string; // New: e.g. MBT, Roth
  orthoWireType?: string;      // New: e.g. NiTi 014
  treatmentStartDate?: string;
  doctorName?: string; // New: Assigned Doctor
  nextFollowUp?: string; // New: YYYY-MM-DD
  reminderSent?: boolean; // New
}

export interface PaymentTransaction {
  id: string;
  patientId: string;
  treatmentId?: string;
  treatmentType?: string; // New field from backend
  date: string;
  amount: number;
  mode: PaymentMode;
  notes?: string;
  patientName?: string; // Virtual field for display
}

export interface Expense {
  id: string;
  category: 'Lab' | 'Doctor' | 'Staff' | 'Rent' | 'Utilities' | 'Supplies' | 'Others';
  recipientName: string;
  amount: number;
  date: string;
  notes?: string;
  status: 'Pending' | 'Paid';
}

export interface BillingSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingPatientDues: number;
  pendingLabDues: number;
  categoryBreakdown: {
    income: Record<string, number>;
    expenses: Record<string, number>;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  purpose: string;
  assignedStaff: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  reminderSent?: boolean; // New
}

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  pendingDues: number;
  labDeliveriesPending: number;
}

export interface ClinicNotification {
  id: string;
  userId?: string;
  message: string;
  type: 'info' | 'reminder' | 'urgent';
  isRead: boolean;
  createdAt: string;
}