
import { Appointment, Patient } from "../types";

const CLINIC_PHONE = ""; // Optional: Add clinic signature

export const openWhatsApp = (phoneNumber: string, message: string) => {
  if (!phoneNumber) {
    alert("Phone number is missing.");
    return;
  }

  // Basic cleanup to ensure number format (assuming India +91 if not specified, or just strip chars)
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If number is 10 digits, assume default country code (e.g., 91 for India). 
  // You can change '91' to your region's code.
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const sendPatientReminder = (appointment: Appointment, patientPhone: string) => {
  const message = `Hello ${appointment.patientName}, this is a gentle reminder from Raj True Dent for your appointment today (${appointment.date}) at ${appointment.time}. Please arrive 10 mins early. Thank you!`;
  openWhatsApp(patientPhone, message);
};

export const sendDoctorSchedule = (doctorName: string, appointments: Appointment[]) => {
  if (appointments.length === 0) {
    alert("No appointments to send.");
    return;
  }

  let message = `*Daily Schedule for ${doctorName}*\nDate: ${appointments[0].date}\n\n`;
  
  appointments
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((app, index) => {
    message += `${index + 1}. *${app.time}* - ${app.patientName} (${app.purpose})\n`;
  });

  message += `\nTotal Patients: ${appointments.length}`;
  
  // In a real app, you'd store the doctor's phone number. 
  // For now, we prompt or use a placeholder.
  const doctorPhone = prompt("Enter Doctor's WhatsApp Number:", "");
  if (doctorPhone) {
    openWhatsApp(doctorPhone, message);
  }
};
