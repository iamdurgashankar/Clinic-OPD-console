import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Check, Bell, AlertCircle, Info, Clock } from 'lucide-react';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const { notifications, markNotificationRead } = useStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Bell size={20} className="text-teal-600" />
                        <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {notifications.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-slate-400">
                            <Bell size={48} className="mb-4 opacity-20" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`group relative rounded-xl border p-4 transition-all ${notif.isRead
                                            ? 'border-slate-100 bg-white opacity-75'
                                            : 'border-teal-100 bg-teal-50/30 ring-1 ring-teal-100/50'
                                        }`}
                                >
                                    {!notif.isRead && (
                                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-teal-500" />
                                    )}

                                    <div className="flex gap-3">
                                        <div className={`mt-0.5 rounded-lg p-2 ${notif.type === 'urgent' ? 'bg-red-100 text-red-600' :
                                                notif.type === 'reminder' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {notif.type === 'urgent' ? <AlertCircle size={18} /> :
                                                notif.type === 'reminder' ? <Clock size={18} /> :
                                                    <Info size={18} />}
                                        </div>

                                        <div className="flex-1 pr-6">
                                            <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                                                {notif.message}
                                            </p>
                                            <span className="mt-2 block text-xs text-slate-400">
                                                {new Date(notif.createdAt).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {!notif.isRead && (
                                        <button
                                            onClick={() => markNotificationRead(notif.id)}
                                            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
                                        >
                                            <Check size={14} /> Mark as read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 p-4">
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Close Panel
                    </button>
                </div>
            </div>
        </div>
    );
};
