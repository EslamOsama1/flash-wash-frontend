'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function HelpersPage() {
    const [helpers, setHelpers] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const fetchHelpers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get(`/helpers?month=${selectedMonth}&year=${selectedYear}`);

            setHelpers(res?.data?.helpers || []);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Failed to load helpers. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        fetchHelpers();
    }, [fetchHelpers]);

    const handleAddHelper = async (e) => {
        e.preventDefault();

        const helperName = name.trim();

        if (!helperName) {
            setError('Please enter the helper name.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            await api.post('/helpers', {
                name: helperName,
            });

            setName('');
            setSuccess('Helper added successfully.');

            await fetchHelpers();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Failed to add helper. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (helper) => {
        try {
            setError('');
            setSuccess('');

            await api.patch(`/helpers/${helper._id}/toggle-status`);

            setSuccess(
                `${helper.name} has been ${helper.isActive ? 'deactivated' : 'activated'
                } successfully.`
            );

            await fetchHelpers();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Failed to update helper status.'
            );
        }
    };

    const handleDeleteHelper = async (helper) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${helper.name}"?`
        );

        if (!confirmed) return;

        try {
            setError('');
            setSuccess('');

            await api.delete(`/helpers/${helper._id}`);

            setSuccess('Helper deleted successfully.');

            await fetchHelpers();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Failed to delete helper. The helper may be linked to existing orders.'
            );
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Helpers</h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage helpers and track their completed wash orders.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchHelpers}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                    >
                        {success}
                    </div>
                )}

                {/* Add Helper */}
                <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-4 text-xl font-semibold">Add New Helper</h2>

                    <form
                        onSubmit={handleAddHelper}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter helper name"
                            maxLength={100}
                            disabled={saving}
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                        />

                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Adding...' : 'Add Helper'}
                        </button>
                    </form>
                </section>

                {/* Statistics */}
                <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Helpers</p>

                        <p className="mt-2 text-3xl font-bold">{helpers.length}</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Active Helpers</p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {helpers.filter((helper) => helper.isActive).length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Inactive Helpers</p>

                        <p className="mt-2 text-3xl font-bold text-gray-500">
                            {helpers.filter((helper) => !helper.isActive).length}
                        </p>
                    </div>
                </section>

                {/* Helpers Table */}
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">All Helpers</h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Points represent wash orders completed during the selected month.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                Month
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {[
                                        'January', 'February', 'March', 'April',
                                        'May', 'June', 'July', 'August',
                                        'September', 'October', 'November', 'December',
                                    ].map((monthName, index) => (
                                        <option key={monthName} value={index + 1}>
                                            {monthName}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                Year
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    {Array.from(
                                        { length: Math.max(5, currentDate.getFullYear() - 2020 + 1) },
                                        (_, index) => currentDate.getFullYear() - index
                                    ).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-500">
                            Loading helpers...
                        </div>
                    ) : helpers.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="font-medium text-gray-700">
                                No helpers found.
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                Add your first helper using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Name</th>
                                        <th className="px-5 py-4 font-semibold">Status</th>
                                        <th className="px-5 py-4 font-semibold">Points</th>
                                        <th className="px-5 py-4 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {helpers.map((helper) => (
                                        <tr key={helper._id} className="hover:bg-gray-50">
                                            <td className="px-5 py-4 font-medium">
                                                {helper.name}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${helper.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    {helper.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-semibold">
                                                    {helper.points ?? 0}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(helper)}
                                                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${helper.isActive
                                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            }`}
                                                    >
                                                        {helper.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteHelper(helper)}
                                                        className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}