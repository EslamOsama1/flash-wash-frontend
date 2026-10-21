'use client';

import { useEffect, useState } from 'react';
import {
    ClipboardList,
    AlertTriangle,
    CarFront,
    CheckCircle2,
    Clock3,
    RefreshCw,
} from 'lucide-react';

import { api } from '@/lib/api';

const statsConfig = [
    {
        key: 'pending',
        title: 'Pending Orders',
        icon: ClipboardList,
    },
    {
        key: 'needsAttention',
        title: 'Needs Attention',
        icon: AlertTriangle,
    },
    {
        key: 'waiting',
        title: 'Waiting',
        icon: Clock3,
    },
    {
        key: 'washing',
        title: 'Washing',
        icon: CarFront,
    },
    {
        key: 'completed',
        title: 'Completed',
        icon: CheckCircle2,
    },
    {
        key: 'late',
        title: 'Late Orders',
        icon: AlertTriangle,
    },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        pending: 0,
        needsAttention: 0,
        waiting: 0,
        washing: 0,
        completed: 0,
        late: 0,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchDashboard = async () => {
        try {
            setError('');

            const res = await api.get('/operations/dashboard');

            console.log('ADMIN DASHBOARD RESPONSE:', res.data);

            const dashboardStats =
                res?.data?.stats;

            if (!dashboardStats) {
                throw new Error('Dashboard stats not found');
            }

            setStats({
                pending: dashboardStats.pending ?? 0,
                needsAttention: dashboardStats.needsAttention ?? 0,
                waiting: dashboardStats.waiting ?? 0,
                washing: dashboardStats.washing ?? 0,
                completed: dashboardStats.completed ?? 0,
                late: dashboardStats.late ?? 0,
            });
        } catch (err) {
            console.error('ADMIN DASHBOARD ERROR:', err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to load dashboard data.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboard();
    };

    return (
        <div className="min-h-screen" >

            {/* ================= HEADER ================= */}

            < header className="border-b border-slate-200 bg-white" >
                <div className="flex h-20 items-center justify-between px-6 lg:px-8" >

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-slate-500" >
                            Flash Wash management overview
                        </p >
                    </div >

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={refreshing ? 'animate-spin' : ''}
                        />

                        Refresh
                    </button >

                </div >
            </header >

            {/* ================= CONTENT ================= */}

            < main className="px-6 py-8 lg:px-8" >

                {/* Welcome */}

                < div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-600/20" >

                    <p className="text-sm font-medium text-blue-100" >
                        Flash Wash
                    </p >

                    <h2 className="mt-1 text-2xl font-bold" >
                        Welcome to Admin Dashboard
                    </h2 >

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100" >
                        Monitor orders, washing operations and important
                        issues from one place.
                    </p >

                </div >

                {/* Error */}

                {
                    error && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600" >
                            <AlertTriangle size={18} />

                            <span>{error}</span>
                        </div >
                    )
                }

                {/* ================= STATS ================= */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" >

                    {
                        statsConfig.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.key}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                                >

                                    <div className="flex items-start justify-between" >

                                        <div>

                                            <p className="text-sm font-medium text-slate-500">
                                                {stat.title}
                                            </p>

                                            <p className="mt-2 text-3xl font-bold text-slate-900" >
                                                {loading ? '—' : stats[stat.key]}
                                            </p >

                                        </div >

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600" >
                                            <Icon size={21} />
                                        </div >

                                    </div >

                                </div >
                            );
                        })
                    }

                </div >

                {/* ================= QUICK OVERVIEW ================= */}

                < div className="mt-8 grid gap-6 lg:grid-cols-2" >

                    {/* Current Operations */}

                    < div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" >

                        <h3 className="text-lg font-bold text-slate-900" >
                            Current Operations
                        </h3 >

                        <p className="mt-1 text-sm text-slate-500" >
                            Current car wash activity
                        </p >

                        <div className="mt-6 space-y-4" >

                            <div className="flex items-center justify-between" >
                                <span className="text-sm font-medium text-slate-600" >
                                    Waiting
                                </span >

                                <span className="font-bold text-slate-900" >
                                    {loading ? '—' : stats.waiting}
                                </span >
                            </div >

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100" >
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all"
                                    style={{
                                        width: `${Math.min(
                                            stats.waiting * 10,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div >

                            <div className="flex items-center justify-between" >
                                <span className="text-sm font-medium text-slate-600" >
                                    Washing
                                </span >

                                <span className="font-bold text-slate-900" >
                                    {loading ? '—' : stats.washing}
                                </span >
                            </div >

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100" >
                                <div
                                    className="h-full rounded-full bg-indigo-500 transition-all"
                                    style={{
                                        width: `${Math.min(
                                            stats.washing * 10,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div >

                        </div >

                    </div >

                    {/* Attention */}

                    < div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" >

                        <div className="flex items-start justify-between" >

                            <div>

                                <h3 className="text-lg font-bold text-slate-900">
                                    Attention Required
                                </h3>

                                <p className="mt-1 text-sm text-slate-500" >
                                    Orders that may require manual review
                                </p >

                            </div >

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600" >
                                <AlertTriangle size={21} />
                            </div >

                        </div >

                        <div className="mt-6 flex items-end gap-3" >

                            <span className="text-4xl font-extrabold text-slate-900" >
                                {loading ? '—' : stats.needsAttention}
                            </span >

                            <span className="pb-1 text-sm text-slate-500" >
                                orders
                            </span >

                        </div >

                        <p className="mt-3 text-sm text-slate-500" >
                            Review payment or order issues that need
                            manual attention.
                        </p >

                    </div >

                </div >

            </main >
        </div >
    );
}