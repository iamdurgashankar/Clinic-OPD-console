import React, { useState } from 'react';
import { Lock, User, ArrowRight, Stethoscope } from 'lucide-react';
import { CLINIC_NAME } from '../constants';
import toast from 'react-hot-toast';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay for a premium feel
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                toast.success('Welcome back, Dr. Raj!');
                onLogin();
            } else {
                toast.error('Invalid credentials. Please try again.');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-teal-50 opacity-50 blur-3xl"></div>
                <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-teal-50 opacity-50 blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 p-8 shadow-2xl shadow-teal-200/50 border border-teal-400/20">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 shadow-lg shadow-black/10 backdrop-blur-sm">
                        <Stethoscope className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">{CLINIC_NAME}</h1>
                    <p className="mt-2 text-teal-100">Secure Access Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-teal-50 ml-1">Username</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <User className="h-5 w-5 text-teal-200 group-focus-within:text-white transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-3 text-white placeholder-teal-200/50 focus:border-white/30 focus:bg-white/20 focus:outline-none focus:ring-0 transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-teal-50 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="h-5 w-5 text-teal-200 group-focus-within:text-white transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-3 text-white placeholder-teal-200/50 focus:border-white/30 focus:bg-white/20 focus:outline-none focus:ring-0 transition-all"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-white py-3.5 text-teal-700 shadow-lg transition-all hover:bg-teal-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <span className="relative z-10 flex items-center gap-2 font-bold">
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                            {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </span>
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-teal-200/70">
                        Protected by secure encryption. Authorized personnel only.
                    </p>
                </div>
            </div>
        </div>
    );
};
