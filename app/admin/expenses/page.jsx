'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const categoryLabels = {
    cleaning_supplies: 'Cleaning Supplies',
    electricity: 'Electricity',
    water: 'Water',
    maintenance: 'Maintenance',
    salaries: 'Salaries',
    rent: 'Rent',
    other: 'Other',
};

const emptyForm = {
    title: '',
    category: 'cleaning_supplies',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
};

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Commission Settings
    const [workerCommission, setWorkerCommission] = useState('');
    const [cafeCommission, setCafeCommission] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    // ==========================================
    // Fetch Expenses
    // ==========================================

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/expenses');

            setExpenses(res.data?.expenses || []);
        } catch (err) {
            console.error('Expenses error:', err);

            setError(
                err?.message || 'Failed to load expenses'
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Fetch Business Settings
    // ==========================================

    const fetchSettings = async () => {
        try {
            const res = await api.get('/business-settings');

            const settings = res.data?.settings;

            setWorkerCommission(settings?.workerCommission ?? '');
            setCafeCommission(settings?.cafeCommission ?? '');
        } catch (err) {
            console.error('Business settings error:', err);

            setError(
                err?.message || 'Failed to load business settings'
            );
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchSettings();
    }, []);

    // ==========================================
    // Form
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const openAddForm = () => {
        setEditingExpense(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEditForm = (expense) => {
        setEditingExpense(expense);

        setForm({
            title: expense.title || '',
            category:
                expense.category || 'cleaning_supplies',
            amount: expense.amount ?? '',
            date: expense.date
                ? new Date(expense.date)
                    .toISOString()
                    .split('T')[0]
                : new Date()
                    .toISOString()
                    .split('T')[0],
            description: expense.description || '',
        });

        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingExpense(null);
        setForm(emptyForm);
    };

    // ==========================================
    // Save Expense
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');

            const payload = {
                title: form.title.trim(),
                category: form.category,
                amount: Number(form.amount),
                date: form.date,
                description: form.description.trim(),
            };

            if (!payload.title) {
                throw new Error(
                    'Expense title is required'
                );
            }

            if (!payload.amount || payload.amount <= 0) {
                throw new Error(
                    'Expense amount must be greater than 0'
                );
            }

            if (editingExpense) {
                await api.patch(
                    `/expenses/${editingExpense._id}`,
                    payload
                );
            } else {
                await api.post('/expenses', payload);
            }

            closeForm();
            await fetchExpenses();
        } catch (err) {
            console.error('Save expense error:', err);

            setError(
                err?.message || 'Failed to save expense'
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // Save Commission Settings
    // ==========================================

    const handleSaveCommissionSettings = async (e) => {
        e.preventDefault();

        try {
            setSavingSettings(true);
            setError('');

            const workerValue = Number(workerCommission);
            const cafeValue = Number(cafeCommission);

            if (Number.isNaN(workerValue) || workerValue < 0) {
                throw new Error(
                    'Worker commission must be 0 or greater'
                );
            }

            if (Number.isNaN(cafeValue) || cafeValue < 0) {
                throw new Error(
                    'Cafe commission must be 0 or greater'
                );
            }

            const res = await api.patch(
                '/business-settings',
                {
                    workerCommission: workerValue,
                    cafeCommission: cafeValue,
                }
            );

            const settings = res.data?.settings;

            setWorkerCommission(settings?.workerCommission ?? 0);
            setCafeCommission(settings?.cafeCommission ?? 0);
        } catch (err) {
            console.error(
                'Save commission settings error:',
                err
            );

            setError(
                err?.message ||
                'Failed to save commission settings'
            );
        } finally {
            setSavingSettings(false);
        }
    };

    // ==========================================
    // Delete Expense
    // ==========================================

    const handleDelete = async (expense) => {
        const confirmed = window.confirm(
            `Delete "${expense.title}"?`
        );

        if (!confirmed) return;

        try {
            setError('');

            await api.delete(
                `/expenses/${expense._id}`
            );

            await fetchExpenses();
        } catch (err) {
            console.error('Delete expense error:', err);

            setError(
                err?.message || 'Failed to delete expense'
            );
        }
    };

    // ==========================================
    // Statistics
    // ==========================================

    const totalExpenses = expenses.reduce(
        (total, expense) =>
            total + (Number(expense.amount) || 0),
        0
    );

    const now = new Date();

    const thisMonthExpenses = expenses
        .filter((expense) => {
            const date = new Date(expense.date);

            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() ===
                now.getFullYear()
            );
        })
        .reduce(
            (total, expense) =>
                total +
                (Number(expense.amount) || 0),
            0
        );

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8" >
                <div className="flex min-h-[400px] items-center justify-center" >
                    <p className="text-lg text-slate-600" >
                        Loading expenses...
                    </p >
                </div >
            </div >
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8" >

            {/* Header */}

            < div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" >

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Expense Management
                    </h1>

                    <p className="mt-1 text-slate-500" >
                        Manage business expenses and operating costs.
                    </p >
                </div >

                <button
                    onClick={openAddForm}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800"
                >
                    + Add Expense
                </button >

            </div >

            {/* Error */}

            {
                error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700" >
                        {error}
                    </div >
                )
            }

            {/* Commission Settings */}

            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Commission Settings
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Set the commission amount applied to each completed wash order.
                    </p>
                </div>

                <form
                    onSubmit={handleSaveCommissionSettings}
                    className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-end"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Worker Commission (EGP)
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={workerCommission}
                            onChange={(e) =>
                                setWorkerCommission(e.target.value)
                            }
                            placeholder="e.g. 15"
                            disabled={savingSettings}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Cafe Commission (EGP)
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cafeCommission}
                            onChange={(e) =>
                                setCafeCommission(e.target.value)
                            }
                            placeholder="e.g. 5"
                            disabled={savingSettings}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={savingSettings}
                        className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {savingSettings
                            ? 'Saving...'
                            : 'Save Commission Settings'}
                    </button>
                </form>
            </div>

            {/* Statistics */}

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" >

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" >
                    <p className="text-sm font-medium text-slate-500" >
                        Total Expenses
                    </p >

                    <h2 className="mt-3 text-3xl font-bold text-slate-900" >
                        {totalExpenses.toLocaleString()} EGP
                    </h2 >

                    <p className="mt-2 text-sm text-slate-500" >
                        All recorded expenses
                    </p >
                </div >

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" >
                    <p className="text-sm font-medium text-slate-500" >
                        This Month
                    </p >

                    <h2 className="mt-3 text-3xl font-bold text-slate-900" >
                        {thisMonthExpenses.toLocaleString()} EGP
                    </h2 >

                    <p className="mt-2 text-sm text-slate-500" >
                        Expenses this month
                    </p >
                </div >

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" >
                    <p className="text-sm font-medium text-slate-500" >
                        Expense Records
                    </p >

                    <h2 className="mt-3 text-3xl font-bold text-slate-900" >
                        {expenses.length}
                    </h2 >

                    <p className="mt-2 text-sm text-slate-500" >
                        Recorded transactions
                    </p >
                </div >

            </div >

            {/* Expenses Table */}

            < div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" >

                <div className="border-b border-slate-200 px-6 py-5" >
                    <h2 className="text-lg font-bold text-slate-900" >
                        Expenses
                    </h2 >

                    <p className="mt-1 text-sm text-slate-500" >
                        All business expenses
                    </p >
                </div >

                {
                    expenses.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-slate-500">
                                No expenses recorded yet.
                            </p>

                            <button
                                onClick={openAddForm}
                                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Add First Expense
                            </button >
                        </div >
                    ) : (
                        <div className="overflow-x-auto" >

                            <table className="w-full min-w-[850px]" >

                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">

                                        <th className="px-6 py-4 font-medium">
                                            Title
                                        </th>

                                        <th className="px-6 py-4 font-medium" >
                                            Category
                                        </th >

                                        <th className="px-6 py-4 font-medium" >
                                            Amount
                                        </th >

                                        <th className="px-6 py-4 font-medium" >
                                            Date
                                        </th >

                                        <th className="px-6 py-4 font-medium" >
                                            Description
                                        </th >

                                        <th className="px-6 py-4 text-right font-medium" >
                                            Actions
                                        </th >

                                    </tr >
                                </thead >

                                <tbody>

                                    {expenses.map((expense) => (
                                        <tr
                                            key={expense._id}
                                            className="border-b border-slate-100 last:border-0"
                                        >

                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {expense.title}
                                            </td>

                                            <td className="px-6 py-4" >
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700" >
                                                    {
                                                        categoryLabels[
                                                        expense.category
                                                        ] ||
                                                        expense.category
                                                    }
                                                </span >
                                            </td >

                                            <td className="px-6 py-4 font-bold text-slate-900" >
                                                {
                                                    Number(
                                                        expense.amount
                                                    ).toLocaleString()
                                                }{' '}
                                                EGP
                                            </td >

                                            <td className="px-6 py-4 text-slate-600" >
                                                {
                                                    new Date(
                                                        expense.date
                                                    ).toLocaleDateString()
                                                }
                                            </td >

                                            <td className="max-w-[250px] px-6 py-4 text-sm text-slate-500" >
                                                {
                                                    expense.description ||
                                                    '—'
                                                }
                                            </td >

                                            <td className="px-6 py-4" >

                                                <div className="flex justify-end gap-2" >

                                                    <button
                                                        onClick={() =>
                                                            openEditForm(
                                                                expense
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button >

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                expense
                                                            )
                                                        }
                                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                                    >
                                                        Delete
                                                    </button >

                                                </div >

                                            </td >

                                        </tr >
                                    ))
                                    }

                                </tbody >

                            </table >

                        </div >
                    )}

            </div >

            {/* Add / Edit Modal */}

            {
                showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" >

                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" >

                            <div className="mb-6 flex items-center justify-between" >

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {editingExpense
                                            ? 'Edit Expense'
                                            : 'Add Expense'}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500" >
                                        Enter the expense details.
                                    </p >
                                </div >

                                <button
                                    onClick={closeForm}
                                    className="text-xl text-slate-400 hover:text-slate-700"
                                >
                                    ×
                                </button >

                            </div >

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Cleaning supplies"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-500"
                                        required
                                    />
                                </div >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-500"
                                    >
                                        {
                                            Object.entries(
                                                categoryLabels
                                            ).map(
                                                ([
                                                    value,
                                                    label,
                                                ]) => (
                                                    <option
                                                        key={
                                                            value
                                                        }
                                                        value={
                                                            value
                                                        }
                                                    >
                                                        {label}
                                                    </option>
                                                )
                                            )
                                        }
                                    </select >
                                </div >

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" >

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Amount
                                        </label>

                                        <input
                                            type="number"
                                            name="amount"
                                            value={
                                                form.amount
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="0"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-500"
                                            required
                                        />
                                    </div >

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                            Date
                                        </label>

                                        <input
                                            type="date"
                                            name="date"
                                            value={
                                                form.date
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-500"
                                            required
                                        />
                                    </div >

                                </div >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={3}
                                        placeholder="Optional description"
                                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-500"
                                    />
                                </div >

                                <div className="flex justify-end gap-3 pt-4" >

                                    <button
                                        type="button"
                                        onClick={
                                            closeForm
                                        }
                                        disabled={saving}
                                        className="rounded-lg border border-slate-200 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button >

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {
                                            saving
                                                ? 'Saving...'
                                                : editingExpense
                                                    ? 'Update Expense'
                                                    : 'Add Expense'
                                        }
                                    </button >

                                </div >

                            </form >

                        </div >

                    </div >
                )
            }

        </div >
    );
}