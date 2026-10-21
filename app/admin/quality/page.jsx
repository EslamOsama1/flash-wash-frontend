'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    RefreshCw,
    Star,
    Users,
    Smile,
    MessageSquare,
    Award,
    TrendingUp,
    Minus,
    Frown,
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

import { api } from '@/lib/api';

const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' },
];

const ratingLabels = {
    5: '5 Stars',
    4: '4 Stars',
    3: '3 Stars',
    2: '2 Stars',
    1: '1 Star',
};

function formatDate(date) {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(date) {
    if (!date) return '—';

    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getRatingLabel(rating) {
    if (rating >= 4) return 'Excellent';
    if (rating === 3) return 'Average';
    return 'Needs Improvement';
}

function getRatingStyle(rating) {
    if (rating >= 4) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (rating === 3) {
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return 'bg-red-50 text-red-700 border-red-200';
}

function Stars({ rating = 0 }) {
    return (
        <div className="flex items-center gap-0.5" >
            {
                [1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={15}
                        className={
                            star <= Math.round(rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                        }
                    />
                ))
            }
        </div >
    );
}

export default function QualityPage() {
    const [data, setData] = useState(null);

    const [selectedPeriod, setSelectedPeriod] =
        useState('all');

    const [selectedFrom, setSelectedFrom] =
        useState('');

    const [selectedTo, setSelectedTo] =
        useState('');

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] = useState('');

    const fetchQuality = async (
        showRefresh = false
    ) => {
        try {
            setError('');

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const params = new URLSearchParams();

            params.set(
                'period',
                selectedPeriod
            );

            if (
                selectedPeriod === 'custom' &&
                selectedFrom &&
                selectedTo
            ) {
                params.set('from', selectedFrom);
                params.set('to', selectedTo);
            }

            const res = await api.get(
                `/quality?${params.toString()}`
            );

            setData(res.data);
        } catch (err) {
            console.error(
                'Failed to load quality data:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Failed to load quality data.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (selectedPeriod !== 'custom') {
            fetchQuality();
        }
    }, [selectedPeriod]);

    const handleApplyCustom = () => {
        if (!selectedFrom || !selectedTo) {
            setError(
                'Please select both From and To dates.'
            );
            return;
        }

        if (selectedFrom > selectedTo) {
            setError(
                'From date cannot be after To date.'
            );
            return;
        }

        fetchQuality();
    };

    const ratingData = useMemo(() => {
        if (!data?.ratingDistribution) {
            return [];
        }

        return data.ratingDistribution.map((item) => ({
            ...item,
            name: ratingLabels[item.rating],
        }));
    }, [data]);

    const sentimentData = useMemo(() => {
        if (!data?.customerSentiment) {
            return [];
        }

        return [
            {
                name: 'Positive',
                value:
                    data.customerSentiment.positive
                        ?.count || 0,
            },
            {
                name: 'Neutral',
                value:
                    data.customerSentiment.neutral
                        ?.count || 0,
            },
            {
                name: 'Negative',
                value:
                    data.customerSentiment.negative
                        ?.count || 0,
            },
        ];
    }, [data]);

    const positivePercentage =
        data?.customerSentiment?.positive
            ?.percentage || 0;

    if (loading && !data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center" >
                <div className="flex items-center gap-3 text-slate-500" >
                    <RefreshCw
                        size={20}
                        className="animate-spin"
                    />
                    <span>
                        Loading quality dashboard...
                    </span>
                </div >
            </div >
        );
    }

    return (
        <div className="min-w-0 space-y-6 pb-8" >
            {/* =========================
                HEADER
            ========================= */}
            < div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between" >
                <div className="min-w-0" >
                    <div className="mb-2 flex items-center gap-2" >
                        <Award
                            size={22}
                            className="text-slate-700"
                        />

                        <span className="text-sm font-semibold text-slate-500" >
                            Customer Experience
                        </span >
                    </div >

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" >
                        Quality Dashboard
                    </h1 >

                    <p className="mt-1 text-sm text-slate-500" >
                        Monitor customer satisfaction,
                        ratings, feedback, and worker
                        quality.
                    </p >
                </div >

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end" >
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Financial Period
                        </label>

                        <select
                            value={selectedPeriod}
                            onChange={(e) =>
                                setSelectedPeriod(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-500 sm:min-w-[170px]"
                        >
                            {
                                periodOptions.map(
                                    (option) => (
                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )
                            }
                        </select >
                    </div >

                    <button
                        type="button"
                        onClick={() =>
                            fetchQuality(true)
                        }
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        Refresh
                    </button >
                </div >
            </div >

            {/* =========================
                CUSTOM RANGE
            ========================= */}
            {
                selectedPeriod === 'custom' && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    From
                                </label>

                                <input
                                    type="date"
                                    value={selectedFrom}
                                    onChange={(e) =>
                                        setSelectedFrom(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
                                />
                            </div >

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    To
                                </label>

                                <input
                                    type="date"
                                    value={selectedTo}
                                    onChange={(e) =>
                                        setSelectedTo(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
                                />
                            </div >

                            <button
                                type="button"
                                onClick={
                                    handleApplyCustom
                                }
                                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Apply
                            </button >
                        </div >
                    </div >
                )
            }

            {/* =========================
                ERROR
            ========================= */}
            {
                error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" >
                        {error}
                    </div >
                )
            }

            {/* =========================
                KPI CARDS
            ========================= */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" >
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" >
                    <div className="flex items-start justify-between" >
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                CSI Score
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900" >
                                {
                                    Number(
                                        data?.csiScore || 0
                                    ).toFixed(2)
                                }
                                <span className="ml-1 text-base font-medium text-slate-400" >
                                    / 5
                                </span >
                            </p >

                            <div className="mt-2" >
                                <Stars
                                    rating={
                                        data?.csiScore ||
                                        0
                                    }
                                />
                            </div >
                        </div >

                        <div className="rounded-lg bg-amber-50 p-3" >
                            <Star
                                size={21}
                                className="fill-amber-400 text-amber-400"
                            />
                        </div >
                    </div >
                </div >

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" >
                    <div className="flex items-start justify-between" >
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Rated Orders
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900" >
                                {data?.ratedOrders ||
                                    0}
                            </p >

                            <p className="mt-2 text-xs text-slate-400" >
                                Customer ratings
                            </p >
                        </div >

                        <div className="rounded-lg bg-blue-50 p-3" >
                            <Users
                                size={21}
                                className="text-blue-600"
                            />
                        </div >
                    </div >
                </div >

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" >
                    <div className="flex items-start justify-between" >
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Average Rating
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900" >
                                {
                                    Number(
                                        data?.averageRating ||
                                        0
                                    ).toFixed(2)}
                            </p >

                            <p className="mt-2 text-xs text-slate-400" >
                                Out of 5 stars
                            </p >
                        </div >

                        <div className="rounded-lg bg-emerald-50 p-3" >
                            <TrendingUp
                                size={21}
                                className="text-emerald-600"
                            />
                        </div >
                    </div >
                </div >

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" >
                    <div className="flex items-start justify-between" >
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Positive Sentiment
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900" >
                                {
                                    positivePercentage.toFixed(
                                        1
                                    )
                                }
                                %
                            </p >

                            <p className="mt-2 text-xs text-emerald-600" >
                                4–5 star ratings
                            </p >
                        </div >

                        <div className="rounded-lg bg-emerald-50 p-3" >
                            <Smile
                                size={21}
                                className="text-emerald-600"
                            />
                        </div >
                    </div >
                </div >
            </div >

            {/* =========================
                CHARTS
            ========================= */}
            < div className="grid grid-cols-1 gap-6 xl:grid-cols-2" >
                {/* Rating Distribution */}
                < div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" >
                    <div className="mb-5" >
                        <h2 className="text-lg font-bold text-slate-900" >
                            Rating Distribution
                        </h2 >

                        <p className="mt-1 text-sm text-slate-500" >
                            Breakdown of customer ratings.
                        </p >
                    </div >

                    <div className="h-[300px] w-full" >
                        {
                            ratingData.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={ratingData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 12,
                                            }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 12,
                                            }}
                                        />

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => [
                                                    value,
                                                    'Ratings',
                                                ]}
                                        />

                                        <Bar
                                            dataKey="count"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0,
                                            ]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState text="No rating data available." />
                            )
                        }
                    </div >
                </div >

                {/* Sentiment */}
                < div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" >
                    <div className="mb-5" >
                        <h2 className="text-lg font-bold text-slate-900" >
                            Customer Sentiment
                        </h2 >

                        <p className="mt-1 text-sm text-slate-500" >
                            Customer satisfaction based
                            on ratings.
                        </p >
                    </div >

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2" >
                        <div className="h-[250px]" >
                            {
                                sentimentData.some(
                                    (item) =>
                                        item.value > 0
                                ) ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={
                                                    sentimentData
                                                }
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={85}
                                                innerRadius={
                                                    50
                                                }
                                                paddingAngle={
                                                    3
                                                }
                                            >
                                                {sentimentData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                index ===
                                                                    0
                                                                    ? '#10b981'
                                                                    : index ===
                                                                        1
                                                                        ? '#f59e0b'
                                                                        : '#ef4444'
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>

                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState text="No sentiment data available." />
                                )
                            }
                        </div >

                        <div className="flex flex-col justify-center gap-4" >
                            <SentimentRow
                                icon={
                                    <Smile
                                        size={18}
                                    />
                                }
                                label="Positive"
                                count={
                                    data
                                        ?.customerSentiment
                                        ?.positive
                                        ?.count || 0
                                }
                                percentage={
                                    data
                                        ?.customerSentiment
                                        ?.positive
                                        ?.percentage ||
                                    0
                                }
                                className="text-emerald-600"
                                bgClass="bg-emerald-50"
                            />

                            <SentimentRow
                                icon={
                                    <Minus
                                        size={18}
                                    />
                                }
                                label="Neutral"
                                count={
                                    data
                                        ?.customerSentiment
                                        ?.neutral
                                        ?.count || 0
                                }
                                percentage={
                                    data
                                        ?.customerSentiment
                                        ?.neutral
                                        ?.percentage ||
                                    0
                                }
                                className="text-amber-600"
                                bgClass="bg-amber-50"
                            />

                            <SentimentRow
                                icon={
                                    <Frown
                                        size={18}
                                    />
                                }
                                label="Negative"
                                count={
                                    data
                                        ?.customerSentiment
                                        ?.negative
                                        ?.count || 0
                                }
                                percentage={
                                    data
                                        ?.customerSentiment
                                        ?.negative
                                        ?.percentage ||
                                    0
                                }
                                className="text-red-600"
                                bgClass="bg-red-50"
                            />
                        </div >
                    </div >
                </div >
            </div >

            {/* =========================
                WORKER QUALITY
            ========================= */}
            < div className="rounded-xl border border-slate-200 bg-white shadow-sm" >
                <div className="border-b border-slate-200 p-5" >
                    <h2 className="text-lg font-bold text-slate-900" >
                        Worker Quality
                    </h2 >

                    <p className="mt-1 text-sm text-slate-500" >
                        Customer ratings grouped by
                        worker.
                    </p >
                </div >

                <div className="overflow-x-auto" >
                    {data?.workerQuality?.length > 0 ? (
                        <table className="w-full min-w-[800px] text-left" >
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Worker
                                    </th>

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Rated Orders
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Average Rating
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Positive
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Neutral
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Negative
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Performance
                                    </th >
                                </tr >
                            </thead >

                            <tbody>
                                {data.workerQuality.map(
                                    (worker) => (
                                        <tr
                                            key={
                                                worker.workerId
                                            }
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-5 py-4" >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {
                                                            worker.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400" >
                                                        {
                                                            worker.phone
                                                        }
                                                    </p>
                                                </div >
                                            </td >

                                            <td className="px-5 py-4 text-sm font-semibold text-slate-700" >
                                                {
                                                    worker.orders
                                                }
                                            </td >

                                            <td className="px-5 py-4" >
                                                <div className="flex items-center gap-2" >
                                                    <Stars
                                                        rating={
                                                            worker.averageRating
                                                        }

                                                    />
                                                    <span className="text-sm font-bold text-slate-700" >
                                                        {
                                                            Number(
                                                                worker.averageRating ||
                                                                0
                                                            ).toFixed(
                                                                2
                                                            )
                                                        }
                                                    </span >
                                                </div >
                                            </td >

                                            <td className="px-5 py-4" >
                                                <span className="font-semibold text-emerald-600" >
                                                    {
                                                        worker.positive
                                                    }
                                                </span >
                                            </td >

                                            <td className="px-5 py-4" >
                                                <span className="font-semibold text-amber-600" >
                                                    {
                                                        worker.neutral
                                                    }
                                                </span >
                                            </td >

                                            <td className="px-5 py-4" >
                                                <span className="font-semibold text-red-600" >
                                                    {
                                                        worker.negative
                                                    }
                                                </span >
                                            </td >

                                            <td className="px-5 py-4" >
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getRatingStyle(
                                                        worker.averageRating
                                                    )}`}
                                                >
                                                    {getRatingLabel(
                                                        worker.averageRating
                                                    )}
                                                </span>
                                            </td >
                                        </tr >
                                    )
                                )}
                            </tbody >
                        </table >
                    ) : (
                        <div className="p-10" >
                            <EmptyState text="No worker rating data available." />
                        </div >
                    )}
                </div >
            </div >

            {/* =========================
                CUSTOMER FEEDBACK
            ========================= */}
            < div className="rounded-xl border border-slate-200 bg-white shadow-sm" >
                <div className="border-b border-slate-200 p-5" >
                    <div className="flex items-start justify-between gap-4" >
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Customer Feedback
                            </h2>

                            <p className="mt-1 text-sm text-slate-500" >
                                Recent comments submitted
                                by customers.
                            </p >
                        </div >

                        <div className="rounded-lg bg-blue-50 p-3" >
                            <MessageSquare
                                size={20}
                                className="text-blue-600"
                            />
                        </div >
                    </div >
                </div >

                <div className="overflow-x-auto" >
                    {data?.recentFeedback?.length >
                        0 ? (
                        <table className="w-full min-w-[850px] text-left" >
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Customer
                                    </th>

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Rating
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Feedback
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Worker
                                    </th >

                                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" >
                                        Date
                                    </th >
                                </tr >
                            </thead >

                            <tbody>
                                {data.recentFeedback.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.orderId
                                            }
                                            className="border-b border-slate-100 last:border-0"
                                        >
                                            <td className="px-5 py-4" >
                                                <p className="font-semibold text-slate-900" >
                                                    {
                                                        item.customerName
                                                    }
                                                </p>
                                            </td >

                                            <td className="px-5 py-4" >
                                                <div className="flex flex-col gap-1.5" >
                                                    <Stars
                                                        rating={
                                                            item.rating
                                                        }

                                                    />

                                                    <span className="text-xs font-semibold text-slate-500" >
                                                        {
                                                            item.rating
                                                        }{' '}
                                                        / 5
                                                    </span >
                                                </div >
                                            </td >

                                            <td className="max-w-[400px] px-5 py-4" >
                                                <p className="break-words text-sm leading-6 text-slate-600" >
                                                    {
                                                        item.feedback
                                                    }
                                                </p >
                                            </td >

                                            <td className="px-5 py-4" >
                                                {
                                                    item.worker ? (
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {
                                                                    item
                                                                        .worker
                                                                        .name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {
                                                                    item
                                                                        .worker
                                                                        .phone
                                                                }
                                                            </p>
                                                        </div >
                                                    ) : (
                                                        <span className="text-xs text-slate-400" >
                                                            Not assigned
                                                        </span >
                                                    )}
                                            </td >

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500" >
                                                {
                                                    formatDateTime(
                                                        item.ratedAt
                                                    )
                                                }
                                            </td >
                                        </tr >
                                    )
                                )}
                            </tbody >
                        </table >
                    ) : (
                        <div className="p-10" >
                            <div className="mx-auto flex max-w-md flex-col items-center text-center" >
                                <div className="mb-3 rounded-full bg-slate-100 p-4" >
                                    <MessageSquare
                                        size={24}
                                        className="text-slate-400"
                                    />
                                </div >

                                <h3 className="font-semibold text-slate-800" >
                                    No written feedback
                                    yet
                                </h3 >

                                <p className="mt-1 text-sm text-slate-500" >
                                    Ratings are available,
                                    but customers have not
                                    submitted written
                                    comments for this period.
                                </p >
                            </div >
                        </div >
                    )}
                </div >
            </div >

            {/* =========================
                QUALITY SUMMARY
            ========================= */}
            < div className="grid grid-cols-1 gap-4 md:grid-cols-3" >
                <SummaryCard
                    title="Positive Reviews"
                    value={
                        data?.customerSentiment
                            ?.positive?.count || 0
                    }
                    subtitle={`${Number(
                        data?.customerSentiment
                            ?.positive?.percentage || 0
                    ).toFixed(1)}% of rated orders`}
                    icon={
                        <Smile size={20} />
                    }
                    iconClass="bg-emerald-50 text-emerald-600"
                />

                <SummaryCard
                    title="Neutral Reviews"
                    value={
                        data?.customerSentiment
                            ?.neutral?.count || 0
                    }
                    subtitle={`${Number(
                        data?.customerSentiment
                            ?.neutral?.percentage || 0
                    ).toFixed(1)}% of rated orders`}
                    icon={
                        <Minus size={20} />
                    }
                    iconClass="bg-amber-50 text-amber-600"
                />

                <SummaryCard
                    title="Negative Reviews"
                    value={
                        data?.customerSentiment
                            ?.negative?.count || 0
                    }
                    subtitle={`${Number(
                        data?.customerSentiment
                            ?.negative?.percentage || 0
                    ).toFixed(1)}% of rated orders`}
                    icon={
                        <Frown size={20} />
                    }
                    iconClass="bg-red-50 text-red-600"
                />
            </div >
        </div >
    );
}

/* =========================
   COMPONENTS
========================= */

function EmptyState({ text }) {
    return (
        <div className="flex h-full min-h-[180px] items-center justify-center text-center" >
            <p className="text-sm text-slate-400" >
                {text}
            </p >
        </div >
    );
}

function SentimentRow({
    icon,
    label,
    count,
    percentage,
    className,
    bgClass,
}) {
    return (
        <div className="flex items-center justify-between gap-3" >
            <div className="flex min-w-0 items-center gap-3" >
                <div
                    className={`shrink-0 rounded-lg p-2 ${bgClass} ${className}`}
                >
                    {icon}
                </div>

                <div className="min-w-0" >
                    <p className="text-sm font-semibold text-slate-800" >
                        {label}
                    </p >

                    <p className="text-xs text-slate-400" >
                        {count} reviews
                    </p >
                </div >
            </div >

            <span
                className={`shrink-0 text-sm font-bold ${className}`}
            >
                {Number(percentage).toFixed(1)}%
            </span>
        </div >
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
    iconClass,
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm" >
            <div className="min-w-0" >
                <p className="text-sm font-medium text-slate-500" >
                    {title}
                </p >

                <p className="mt-1 text-2xl font-bold text-slate-900" >
                    {value}
                </p >

                <p className="mt-1 text-xs text-slate-400" >
                    {subtitle}
                </p >
            </div >

            <div
                className={`shrink-0 rounded-lg p-3 ${iconClass}`}
            >
                {icon}
            </div>
        </div >
    );
}