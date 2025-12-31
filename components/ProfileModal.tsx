import React, { useState } from 'react';
import { X, User, Lock, Save, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType | null;
    onUpdate: (updatedUser: UserType) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens or user changes
    React.useEffect(() => {
        if (isOpen && user) {
            setUsername(user.username || '');
            setDisplayName(user.displayName || '');
            setPassword('');
            setConfirmPassword('');
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.updateProfile({
                id: user.id,
                username,
                displayName,
                password: password || undefined
            });

            toast.success("Profile updated successfully");

            // Use the data returned from server to ensure perfect sync
            if (response.user) {
                onUpdate({
                    ...user,
                    ...response.user
                });
            } else {
                onUpdate({
                    ...user,
                    username,
                    displayName: displayName || username
                });
            }
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{user.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-gray-100 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <User size={16} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Display Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <User size={16} />
                            </div>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="How your name appears"
                                className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2 mb-3 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                            <AlertCircle size={16} />
                            <p className="text-[11px] font-bold">Leave password blank to keep current one.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Confirm</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
