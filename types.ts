
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
}

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  pendingDues: number;
  labDeliveriesPending: number;
}
