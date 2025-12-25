import React, { useState } from 'react';
import { Lock, User, ArrowRight, Stethoscope } from 'lucide-react';
import { CLINIC_NAME } from '../constants';
import { User as UserType } from '../types';
import toast from 'react-hot-toast';

interface LoginProps {
    onLogin: (user: UserType) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Try backend login first
            const response = await fetch('http://localhost:8000/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Welcome back, ${data.user.username}!`);
                onLogin(data.user);
            } else {
                // If backend returns specific error (like invalid creds), show it
                if (response.status === 401) {
                    toast.error('Invalid credentials. Please try again.');
                    setIsLoading(false);
                } else {
                    throw new Error(data.error || 'Login failed');
                }
            }
        } catch (error) {
            console.log('Backend unreachable or error, falling back to local demo mode');
            // Fallback for demo/offline mode
            setTimeout(() => {
                if (username === 'admin' && password === 'admin') {
                    toast.success('Welcome back, admin! (Offline Mode)');
                    onLogin({ id: 'demo-admin', username: 'admin', role: 'admin', displayName: 'admin' });
                } else {
                    toast.error('Invalid credentials (Offline Mode).');
                    setIsLoading(false);
                }
            }, 800);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-teal-50 opacity-50 blur-3xl"></div>
                <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-teal-50 opacity-50 blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 p-8 shadow-2xl shadow-teal-200/50 border border-teal-400/20">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-6 flex items-center justify-center">
                        <img
                            src="https://rajtruedent.com/wp-content/uploads/2023/07/Raj_true_Dent__4_-removebg-preview-e1688891234126.png"
                            alt={CLINIC_NAME}
                            className="h-32 w-auto object-contain drop-shadow-lg"
                        />
                    </div>

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
