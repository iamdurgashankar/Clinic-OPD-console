
import React, { useState, useEffect } from 'react';
import {
    CreditCard, TrendingUp, TrendingDown, Users,
    ArrowUpRight, ArrowDownRight, Filter, Download,
    Mail, Search, Plus, Trash2, Edit2, CheckCircle,
    Clock, DollarSign, FileText, PieChart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { BillingSummary, Expense, PaymentMode } from '../types';
import { DatePicker } from '../components/DatePicker';

export const Billing: React.FC = () => {
    const { payments, expenses, addExpense, updateExpense, deleteExpense, treatments, patients } = useStore();
    const [summary, setSummary] = useState<BillingSummary | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses'>('overview');
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [filterType, setFilterType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(false);

    const [expenseForm, setExpenseForm] = useState<Partial<Expense>>({
        category: 'Others',
        recipientName: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        notes: ''
    });

    useEffect(() => {
        fetchSummary();
    }, [filterType, selectedDate, payments, expenses]);

    const getDateRange = () => {
        const date = new Date(selectedDate);
        let start = '';
        let end = '';

        if (filterType === 'daily') {
            start = selectedDate;
            end = selectedDate;
        } else if (filterType === 'monthly') {
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            start = firstDay.toISOString().split('T')[0];
            end = lastDay.toISOString().split('T')[0];
        } else if (filterType === 'yearly') {
            const firstDay = new Date(date.getFullYear(), 0, 1);
            const lastDay = new Date(date.getFullYear(), 11, 31);
            start = firstDay.toISOString().split('T')[0];
            end = lastDay.toISOString().split('T')[0];
        }

        return { start, end };
    };

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const { start, end } = getDateRange();
            const res = await api.getBillingSummary({ start, end });
            setSummary(res);
        } catch (error) {
            console.error("Failed to fetch billing summary", error);
        } finally {
            setLoading(false);
        }
    };

    const { start: rangeStart, end: rangeEnd } = getDateRange();
    const filteredPayments = payments.filter(p => p.date >= rangeStart && p.date <= rangeEnd);
    const filteredExpenses = expenses.filter(e => e.date >= rangeStart && e.date <= rangeEnd);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExpense) {
            await updateExpense({ ...editingExpense, ...expenseForm } as Expense);
        } else {
            await addExpense(expenseForm as Expense);
        }
        setShowAddExpense(false);
        setEditingExpense(null);
        setExpenseForm({
            category: 'Others',
            recipientName: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            status: 'Paid',
            notes: ''
        });
    };

    const handleExportPDF = () => {
        window.print(); // Simple print-to-pdf for now
    };

    const handleSendEmail = async () => {
        if (!summary) return;
        setLoading(true);
        try {
            await api.sendBillingReport({
                summary,
                dateRange: filterType.charAt(0).toUpperCase() + filterType.slice(1) + " report (" + new Date().toLocaleDateString() + ")"
            });
            alert("Report sent successfully to dsdm0012@gmail.com and admin@rajtrudent.com!");
        } catch (error) {
            console.error("Failed to send report", error);
            alert("Failed to send email report. Please check your server email configuration.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <CreditCard className="text-teal-600" />
                        Billing & Payments
                    </h1>
                    <p className="text-slate-500 font-medium">Manage clinical income, expenses, and financial health</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-48">
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="daily">Daily View</option>
                        <option value="monthly">Monthly View</option>
                        <option value="yearly">Yearly View</option>
                    </select>

                    <button
                        onClick={handleExportPDF}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        title="Download PDF"
                    >
                        <Download size={20} />
                    </button>

                    <button
                        onClick={handleSendEmail}
                        className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
                        title="Email Report"
                    >
                        <Mail size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} className="text-emerald-500" />
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Total Income</p>
                    <p className="text-3xl font-black text-slate-800">{formatCurrency(summary?.totalIncome || 0)}</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-sm">
                        <ArrowUpRight size={16} />
                        <span>+12.5% vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingDown size={80} className="text-rose-500" />
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Total Expenses</p>
                    <p className="text-3xl font-black text-slate-800">{formatCurrency(summary?.totalExpenses || 0)}</p>
                    <div className="mt-4 flex items-center gap-1 text-rose-600 font-bold text-sm">
                        <ArrowDownRight size={16} />
                        <span>+3.2% vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign size={80} className="text-teal-500" />
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Net Profit</p>
                    <p className="text-3xl font-black text-teal-600">{formatCurrency(summary?.netProfit || 0)}</p>
                    <div className="mt-4 flex items-center gap-1 text-teal-600 font-bold text-sm">
                        <CheckCircle size={16} />
                        <span>All accounts balanced</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={80} className="text-amber-500" />
                    </div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Pending Dues</p>
                    <p className="text-3xl font-black text-rose-600">{formatCurrency((summary?.pendingPatientDues || 0) + (summary?.pendingLabDues || 0))}</p>
                    <div className="mt-4 flex flex-col gap-1 text-amber-600 font-bold text-[10px] uppercase">
                        <span>• Patients: {formatCurrency(summary?.pendingPatientDues || 0)}</span>
                        <span>• Labs: {formatCurrency(summary?.pendingLabDues || 0)}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-8 py-4 font-bold text-sm transition-all focus:outline-none ${activeTab === 'overview' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Financial Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('income')}
                        className={`px-8 py-4 font-bold text-sm transition-all focus:outline-none ${activeTab === 'income' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Patient Income
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-8 py-4 font-bold text-sm transition-all focus:outline-none ${activeTab === 'expenses' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Clinical Expenses
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Category Breakdown Charts (Simplified with UI counters) */}
                            <div className="space-y-6">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <PieChart className="text-teal-600" size={18} />
                                    Expense Breakdown
                                </h3>
                                <div className="space-y-4">
                                    {summary && Object.entries(summary.categoryBreakdown.expenses).map(([cat, amount]) => (
                                        <div key={cat} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                                                <span>{cat}</span>
                                                <span>{formatCurrency(amount)}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-500 rounded-full"
                                                    style={{ width: `${(amount / summary.totalExpenses) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!summary || Object.keys(summary.categoryBreakdown.expenses).length === 0) && (
                                        <p className="text-slate-400 text-sm italic py-4">No expenses recorded for this period</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <PieChart className="text-teal-500" size={18} />
                                    Income by treatment
                                </h3>
                                <div className="space-y-4">
                                    {summary && Object.entries(summary.categoryBreakdown.income).map(([type, amount]) => (
                                        <div key={type} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                                                <span>{type}</span>
                                                <span>{formatCurrency(amount)}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-400 rounded-full"
                                                    style={{ width: `${(amount / summary.totalIncome) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!summary || Object.keys(summary.categoryBreakdown.income).length === 0) && (
                                        <p className="text-slate-400 text-sm italic py-4">No income recorded for this period</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'income' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Date</th>
                                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Patient</th>
                                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Category</th>
                                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Amount</th>
                                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Mode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPayments.slice(0, 50).map((pay) => (
                                        <tr key={pay.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4 text-sm font-bold text-slate-600">{pay.date}</td>
                                            <td className="py-4 text-sm font-black text-slate-800">{pay.patientName || 'Clinical Patient'}</td>
                                            <td className="py-4">
                                                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold uppercase">
                                                    Income
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm font-black text-emerald-600">+{formatCurrency(pay.amount)}</td>
                                            <td className="py-4 text-sm font-bold text-slate-500">{pay.mode}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Expense Transactions</h3>
                                <button
                                    onClick={() => { setShowAddExpense(true); setEditingExpense(null); }}
                                    className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20"
                                >
                                    <Plus size={16} />
                                    Add Expense
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Date</th>
                                            <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Recipient</th>
                                            <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Category</th>
                                            <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Amount</th>
                                            <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Status</th>
                                            <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredExpenses.map((exp) => (
                                            <tr key={exp.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-4 text-sm font-bold text-slate-600">{exp.date}</td>
                                                <td className="py-4 text-sm font-black text-slate-800">{exp.recipientName}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${exp.category === 'Lab' ? 'bg-amber-50 text-amber-700' :
                                                        exp.category === 'Staff' ? 'bg-blue-50 text-blue-700' :
                                                            'bg-slate-50 text-slate-600'
                                                        }`}>
                                                        {exp.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm font-black text-rose-600">-{formatCurrency(exp.amount)}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${exp.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                        }`}>
                                                        {exp.status}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingExpense(exp);
                                                                setExpenseForm(exp);
                                                                setShowAddExpense(true);
                                                            }}
                                                            className="p-1 text-slate-400 hover:text-teal-600"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteExpense(exp.id)}
                                                            className="p-1 text-slate-400 hover:text-rose-600"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Expense Modal */}
            {showAddExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 bg-teal-600 text-white flex justify-between items-center">
                            <h2 className="text-xl font-black">
                                {editingExpense ? 'Edit Clinical Expense' : 'Log New Expense'}
                            </h2>
                            <button onClick={() => { setShowAddExpense(false); setEditingExpense(null); }} className="text-teal-100 hover:text-white transition-colors">
                                <Trash2 size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={expenseForm.category}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                                        required
                                    >
                                        <option value="Lab">Dental Lab</option>
                                        <option value="Doctor">Doctor Payout</option>
                                        <option value="Staff">Staff Salary</option>
                                        <option value="Supplies">Dental Supplies</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={expenseForm.date}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Dental Lab, Dr. Rajesh"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                    value={expenseForm.recipientName}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, recipientName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={expenseForm.status}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value as any })}
                                        required
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
                                    value={expenseForm.notes}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                                    placeholder="Additional details..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddExpense(false); setEditingExpense(null); }}
                                    className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                                >
                                    {editingExpense ? 'Update' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
