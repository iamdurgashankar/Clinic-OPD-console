import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Staff, User } from '../types';
import { api } from '../services/api';
import {
    Users, UserPlus, Trash2, Key,
    Stethoscope, Activity, ShieldCheck,
    CheckCircle, XCircle, Plus, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminPanel: React.FC = () => {
    const { staff, addStaff, deleteStaff, updateStaff } = useStore();
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'staff' | 'users'>('staff');

    // Staff Form State
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffForm, setStaffForm] = useState<Partial<Staff>>({
        name: '',
        role: 'Doctor',
        specialization: '',
        active: true
    });

    // User Form State
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({
        username: '',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (e) {
            toast.error("Failed to load users");
        }
    };

    const handleCreateStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffForm.name) return;
        addStaff(staffForm as Staff);
        setShowStaffModal(false);
        setStaffForm({ name: '', role: 'Doctor', specialization: '', active: true });
        toast.success("Staff profile created");
    };

    const handleDeleteStaff = (id: string) => {
        if (window.confirm("Are you sure you want to remove this staff member?")) {
            deleteStaff(id);
            toast.success("Staff profile removed");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createUser(userForm);
            toast.success("Staff login ID created");
            setShowUserModal(false);
            setUserForm({ username: '', password: '' });
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to create user");
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this login ID?")) {
            try {
                await api.deleteUser(id);
                toast.success("Login ID deleted");
                fetchUsers();
            } catch (err: any) {
                toast.error(err.message || "Failed to delete user");
            }
        }
    };

    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Clinic Administration</h2>
                    <p className="text-sm text-slate-500">Manage clinical staff and system access</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'staff' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Staff Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'users' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Access Management
                    </button>
                </div>
            </div>

            {activeTab === 'staff' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Stethoscope size={20} className="text-teal-600" /> Clinical Staff
                        </h3>
                        <button
                            onClick={() => setShowStaffModal(true)}
                            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition"
                        >
                            <UserPlus size={18} /> Add Medical Staff
                        </button>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Specialization</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staff.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${s.role === 'Doctor' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {s.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{s.specialization || 'General'}</td>
                                    <td className="px-6 py-4">
                                        {s.active ? (
                                            <span className="flex items-center gap-1 text-green-600 font-medium tracking-tight">
                                                <CheckCircle size={14} /> Active Agent
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-400 font-medium">
                                                <XCircle size={14} /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteStaff(s.id)}
                                            className="text-slate-400 hover:text-rose-600 transition p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">No medical staff found in directory</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Key size={20} className="text-teal-600" /> Staff Login IDs
                        </h3>
                        <button
                            onClick={() => setShowUserModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                        >
                            <ShieldCheck size={18} /> Create Staff ID
                        </button>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">System Role</th>
                                <th className="px-6 py-4">Created On</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{u.username}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{new Date().toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="text-slate-400 hover:text-rose-600 transition p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400">No staff login IDs created yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Staff Modal */}
            {showStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Register Staff</h3>
                            <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Full Name</label>
                                <input
                                    required
                                    className={inputClass}
                                    value={staffForm.name}
                                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                    placeholder="e.g. Dr. Raj"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Role</label>
                                <select
                                    className={inputClass}
                                    value={staffForm.role}
                                    onChange={e => setStaffForm({ ...staffForm, role: e.target.value as any })}
                                >
                                    <option value="Doctor">Doctor</option>
                                    <option value="Nurse">Nurse / Staff</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Specialization</label>
                                <input
                                    className={inputClass}
                                    value={staffForm.specialization}
                                    onChange={e => setStaffForm({ ...staffForm, specialization: e.target.value })}
                                    placeholder="e.g. Orthodontist"
                                />
                            </div>
                            <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-700/20 mt-4">
                                Add to Directory
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Create Staff Account</h3>
                            <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Username</label>
                                <input
                                    required
                                    className={inputClass}
                                    value={userForm.username}
                                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                                    placeholder="e.g. sarah_ortho"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Password</label>
                                <input
                                    required
                                    type="password"
                                    className={inputClass}
                                    value={userForm.password}
                                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded">
                                * Staff will have limited access. They cannot view financial reports or administrative settings.
                            </p>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-700/20 mt-4">
                                Generate Login ID
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
