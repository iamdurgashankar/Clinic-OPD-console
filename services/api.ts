const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isDev ? 'http://localhost:8000/api' : '/backend/api';

const fetcher = async (url: string, options: any = {}) => {
    const response = await fetch(url, options);
    
    // Detect hard lockdown from server via custom header or status code
    const isLocked = response.headers.get('X-App-Locked') === 'true' || response.status === 402;
    
    if (isLocked) {
        localStorage.setItem('app_hard_locked', 'true');
        window.dispatchEvent(new Event('app_lockdown_status_changed'));
    } else {
        // If we get a clean response from our API without the lock header, 
        // it means the lockdown has been lifted.
        if (url.includes(API_URL)) {
             localStorage.removeItem('app_hard_locked');
             window.dispatchEvent(new Event('app_lockdown_status_changed'));
        }
    }
    
    return response;
};

export const api = {
    checkStatus: async () => {
        try {
            // Explicitly call login.php (or any backend file) to check for lockdown headers
            // Use a cache-busting query parameter to ensure we get fresh results
            await fetcher(`${API_URL}/login.php?t=${Date.now()}`);
            return localStorage.getItem('app_hard_locked') === 'true';
        } catch (error) {
            console.error('Lockdown check failed', error);
            return false;
        }
    },

    login: async (credentials: { username: string; password: string }) => {
        try {
            const response = await fetcher(`${API_URL}/login.php`, {
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
            const response = await fetcher(`${API_URL}/patients.php`);
            if (!response.ok) throw new Error('Failed to fetch patients');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createPatient: async (patient: any) => {
        try {
            const response = await fetcher(`${API_URL}/patients.php`, {
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
            const response = await fetcher(`${API_URL}/patients.php`, {
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
            const response = await fetcher(`${API_URL}/patients.php?id=${id}`, {
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
            const response = await fetcher(`${API_URL}/appointments.php`);
            if (!response.ok) throw new Error('Failed to fetch appointments');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createAppointment: async (appointment: any) => {
        try {
            const response = await fetcher(`${API_URL}/appointments.php`, {
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
            const response = await fetcher(`${API_URL}/appointments.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointment),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error during update:', errorText);
                throw new Error('Failed to update appointment: ' + errorText);
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteAppointment: async (id: string) => {
        try {
            const response = await fetcher(`${API_URL}/appointments.php?id=${id}`, {
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
            const response = await fetcher(`${API_URL}/treatments.php`);
            if (!response.ok) throw new Error('Failed to fetch treatments');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createTreatment: async (treatment: any) => {
        try {
            const response = await fetcher(`${API_URL}/treatments.php`, {
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
            const response = await fetcher(`${API_URL}/treatments.php`, {
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
            const response = await fetcher(`${API_URL}/payments.php`);
            if (!response.ok) throw new Error('Failed to fetch payments');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createPayment: async (payment: any) => {
        try {
            const response = await fetcher(`${API_URL}/payments.php`, {
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

    // Expenses
    getExpenses: async () => {
        try {
            const response = await fetcher(`${API_URL}/expenses.php`);
            if (!response.ok) throw new Error('Failed to fetch expenses');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createExpense: async (expense: any) => {
        try {
            const response = await fetcher(`${API_URL}/expenses.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
            });
            if (!response.ok) throw new Error('Failed to create expense');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updateExpense: async (expense: any) => {
        try {
            const response = await fetcher(`${API_URL}/expenses.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
            });
            if (!response.ok) throw new Error('Failed to update expense');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteExpense: async (id: string) => {
        try {
            const response = await fetcher(`${API_URL}/expenses.php?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete expense');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    getBillingSummary: async (params?: { start?: string; end?: string }) => {
        try {
            let url = `${API_URL}/billing_summary.php`;
            if (params?.start && params?.end) {
                url += `?start=${params.start}&end=${params.end}`;
            }
            const response = await fetcher(url);
            if (!response.ok) throw new Error('Failed to fetch billing summary');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    sendBillingReport: async (data: { summary: any; dateRange: string }) => {
        try {
            const response = await fetcher(`${API_URL}/send_billing_report.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to send email report');
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // Staff Management
    getStaff: async () => {
        try {
            const response = await fetcher(`${API_URL}/staff.php`);
            if (!response.ok) throw new Error('Failed to fetch staff');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createStaff: async (staff: any) => {
        try {
            const response = await fetcher(`${API_URL}/staff.php`, {
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
            const response = await fetcher(`${API_URL}/staff.php`, {
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
            const response = await fetcher(`${API_URL}/staff.php?id=${id}`, {
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
            const response = await fetcher(`${API_URL}/users.php`);
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createUser: async (user: any) => {
        try {
            const response = await fetcher(`${API_URL}/users.php`, {
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
            const response = await fetcher(`${API_URL}/users.php?id=${id}`, {
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
            const response = await fetcher(url);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },
    createNotification: async (notif: any) => {
        try {
            const response = await fetcher(`${API_URL}/notifications.php`, {
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
            const response = await fetcher(`${API_URL}/notifications.php`, {
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
            const response = await fetcher(`${API_URL}/update_profile.php`, {
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
