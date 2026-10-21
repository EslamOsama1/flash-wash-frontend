'use client';

import { useEffect, useState } from 'react';
import {
    Search,
    RefreshCw,
    CalendarDays,
} from 'lucide-react';

import { api } from '@/lib/api';

const statusLabels = {
    pending: 'Pending',
    waiting: 'Waiting',
    washing: 'Washing',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function OperationsOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, '0')}`;
    });

    const fetchOrders = async () => {
        try {
            setRefreshing(true);

            const res = await api.get(
                `/Orders/history?month=${selectedMonth}`
            );

            console.log(
                'OPERATIONS ORDERS HISTORY RESPONSE:',
                res.data
            );

            const data = res?.data;

            setOrders(
                Array.isArray(data?.washOrders)
                    ? data.washOrders
                    : []
            );
        } catch (err) {
            console.error(
                'OPERATIONS ORDERS HISTORY ERROR:',
                err
            );

            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedMonth]);

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            statusFilter === 'all' ||
            order.status === statusFilter;

        const searchValue = search.toLowerCase();

        const matchesSearch =
            !searchValue ||
            order.customerName
                ?.toLowerCase()
                .includes(searchValue) ||
            order.phone?.includes(searchValue) ||
            order.car
                ?.toLowerCase()
                .includes(searchValue) ||
            order.plateNumber
                ?.toLowerCase()
                .includes(searchValue);

        return matchesStatus && matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-700';

            case 'waiting':
                return 'bg-blue-50 text-blue-700';

            case 'washing':
                return 'bg-indigo-50 text-indigo-700';

            case 'completed':
                return 'bg-emerald-50 text-emerald-700';

            case 'cancelled':
                return 'bg-red-50 text-red-700';

            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="min-h-screen">

            {/* ================= HEADER ================= */}

            <header className="border-b border-slate-200 bg-white">
                <div className="flex min-h-20 flex-col justify-center gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Orders History
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View and monitor all wash orders
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchOrders}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        Refresh
                    </button>

                </div>
            </header>

            {/* ================= CONTENT ================= */}

            <main className="px-6 py-8 lg:px-8">

                {/* ================= FILTERS ================= */}

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                    <div className="flex flex-col gap-4 lg:flex-row">

                        {/* Search */}

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search customer, phone, car or plate..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        {/* Status */}

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">
                                All Statuses
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="waiting">
                                Waiting
                            </option>

                            <option value="washing">
                                Washing
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="cancelled">
                                Cancelled
                            </option>
                        </select>

                        {/* Month */}

                        <div className="relative">

                            <CalendarDays
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(
                                        e.target.value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                </div>

                {/* ================= TABLE ================= */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px] text-left">

                            <thead className="border-b border-slate-200 bg-slate-50">

                                <tr>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Customer
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Car
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Plate
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Package
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Add-ons
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Total
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Payment
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Worker
                                    </th>

                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-5 py-12 text-center text-sm text-slate-400"
                                        >
                                            Loading orders...
                                        </td>
                                    </tr>

                                ) : filteredOrders.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="11"
                                            className="px-5 py-12 text-center text-sm text-slate-400"
                                        >
                                            No orders found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredOrders.map((order) => (

                                        <tr
                                            key={order._id}
                                            className="transition hover:bg-slate-50"
                                        >

                                            {/* Date */}

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {order.createdAt
                                                    ? new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString(
                                                        'en-GB'
                                                    )
                                                    : '—'}
                                            </td>

                                            {/* Customer */}

                                            <td className="px-5 py-4">

                                                <div>

                                                    <p className="font-semibold text-slate-900">
                                                        {order.customerName ||
                                                            '—'}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {order.phone ||
                                                            '—'}
                                                    </p>

                                                </div>

                                            </td>

                                            {/* Car */}

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {order.car || '—'}
                                            </td>

                                            {/* Plate */}

                                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                {order.plateNumber ||
                                                    '—'}
                                            </td>

                                            {/* Package */}

                                            <td className="px-5 py-4">

                                                <span className="text-sm font-semibold text-slate-700">
                                                    {order.package?.name ||
                                                        '—'}
                                                </span>

                                            </td>

                                            {/* Add-ons */}

                                            <td className="px-5 py-4">

                                                {order.addOnSnapshots
                                                    ?.length ? (

                                                    <div className="space-y-1">

                                                        {order.addOnSnapshots.map(
                                                            (
                                                                addOn,
                                                                index
                                                            ) => (

                                                                <div
                                                                    key={`${order._id}-addon-${index}`}
                                                                    className="text-xs text-slate-600"
                                                                >
                                                                    {
                                                                        addOn.name
                                                                    }{' '}
                                                                    (
                                                                    {
                                                                        addOn.price
                                                                    }{' '}
                                                                    EGP)
                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-slate-400">
                                                        None
                                                    </span>

                                                )}

                                            </td>

                                            {/* Total */}

                                            <td className="px-5 py-4">

                                                <span className="font-bold text-slate-900">
                                                    {order.totalPrice ??
                                                        0}
                                                </span>

                                                <span className="ml-1 text-xs text-slate-400">
                                                    EGP
                                                </span>

                                            </td>

                                            {/* Payment */}

                                            <td className="px-5 py-4">

                                                <div className="text-sm font-medium text-slate-700">
                                                    {order.paymentMethod ||
                                                        '—'}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-400">
                                                    {order.paymentStatus ||
                                                        '—'}
                                                </div>

                                            </td>

                                            {/* Worker */}

                                            <td className="px-5 py-4">

                                                {order.worker ? (

                                                    <div>

                                                        <p className="font-semibold text-slate-900">
                                                            {order.worker
                                                                .name ||
                                                                '—'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {order.worker
                                                                .phone ||
                                                                '—'}
                                                        </p>

                                                    </div>

                                                ) : (

                                                    <span className="text-xs font-medium text-slate-400">
                                                        Not assigned
                                                    </span>

                                                )}

                                            </td>

                                            {/* Status */}

                                            <td className="px-5 py-4">

                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                                                        order.status
                                                    )}`}
                                                >
                                                    {statusLabels[
                                                        order.status
                                                    ] ||
                                                        order.status ||
                                                        '—'}
                                                </span>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* Count */}

                <div className="mt-4 text-sm text-slate-400">
                    Showing {filteredOrders.length} of{' '}
                    {orders.length} orders
                </div>

            </main>

        </div>
    );
}