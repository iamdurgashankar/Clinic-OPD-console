const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isDev ? 'http://localhost:8000/backend/api' : '/backend/api';

export const api = {
    login: async (credentials: { username: string; password: string }) => {
        try {
            const response = await fetch(`${API_URL}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    getPatients: async () => {
        try {
            const response = await fetch(`${API_URL}/patients.php`);
            if (!response.ok) throw new Error('Failed to fetch patients');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createPatient: async (patient: any) => {
        try {
            const response = await fetch(`${API_URL}/patients.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patient),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create patient');
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updatePatient: async (patient: any) => {
        try {
            const response = await fetch(`${API_URL}/patients.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patient),
            });
            if (!response.ok) throw new Error('Failed to update patient');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    deletePatient: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/patients.php?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete patient');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // Appointments
    getAppointments: async () => {
        try {
            const response = await fetch(`${API_URL}/appointments.php`);
            if (!response.ok) throw new Error('Failed to fetch appointments');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createAppointment: async (appointment: any) => {
        try {
            const response = await fetch(`${API_URL}/appointments.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointment),
            });
            if (!response.ok) throw new Error('Failed to create appointment');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updateAppointment: async (appointment: any) => {
        try {
            const response = await fetch(`${API_URL}/appointments.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointment),
            });
            if (!response.ok) throw new Error('Failed to update appointment');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteAppointment: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/appointments.php?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete appointment');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // Treatments
    getTreatments: async () => {
        try {
            const response = await fetch(`${API_URL}/treatments.php`);
            if (!response.ok) throw new Error('Failed to fetch treatments');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createTreatment: async (treatment: any) => {
        try {
            const response = await fetch(`${API_URL}/treatments.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(treatment),
            });
            if (!response.ok) throw new Error('Failed to create treatment');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updateTreatment: async (treatment: any) => {
        try {
            const response = await fetch(`${API_URL}/treatments.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(treatment),
            });
            if (!response.ok) throw new Error('Failed to update treatment');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // Payments
    getPayments: async () => {
        try {
            const response = await fetch(`${API_URL}/payments.php`);
            if (!response.ok) throw new Error('Failed to fetch payments');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createPayment: async (payment: any) => {
        try {
            const response = await fetch(`${API_URL}/payments.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payment),
            });
            if (!response.ok) throw new Error('Failed to create payment');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // Staff Management
    getStaff: async () => {
        try {
            const response = await fetch(`${API_URL}/staff.php`);
            if (!response.ok) throw new Error('Failed to fetch staff');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createStaff: async (staff: any) => {
        try {
            const response = await fetch(`${API_URL}/staff.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staff),
            });
            if (!response.ok) throw new Error('Failed to create staff');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updateStaff: async (staff: any) => {
        try {
            const response = await fetch(`${API_URL}/staff.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staff),
            });
            if (!response.ok) throw new Error('Failed to update staff');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteStaff: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/staff.php?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete staff');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // User ID Management
    getUsers: async () => {
        try {
            const response = await fetch(`${API_URL}/users.php`);
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createUser: async (user: any) => {
        try {
            const response = await fetch(`${API_URL}/users.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create user');
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteUser: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/users.php?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete user');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // Notifications
    getNotifications: async (userId?: string) => {
        const url = userId ? `${API_URL}/notifications.php?userId=${userId}` : `${API_URL}/notifications.php`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },
    createNotification: async (notif: any) => {
        try {
            const response = await fetch(`${API_URL}/notifications.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notif)
            });
            if (!response.ok) throw new Error('Failed to create notification');
            return response.json();
        } catch (error) {
            throw error;
        }
    },
    markNotificationRead: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/notifications.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isRead: true })
            });
            if (!response.ok) throw new Error('Failed to mark notification as read');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (userData: { id: string, username: string, displayName?: string, password?: string }) => {
        try {
            const response = await fetch(`${API_URL}/update_profile.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update profile');
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    }
};
