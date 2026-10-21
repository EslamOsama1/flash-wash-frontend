'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const PIE_COLORS = [
    '#2563eb',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
];

const money = (value) =>
    `${Number(value || 0).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    })} EGP`;

const percent = (value) =>
    `${Number(value || 0).toLocaleString(undefined, {
        maximumFractionDigits: 1,
    })}%`;

const paymentLabel = (method) => {
    if (method === 'vodafone_cash') return 'Vodafone Cash';
    if (method === 'instapay') return 'InstaPay';
    if (method === 'cash') return 'Cash';
    return method || 'Other';
};

export default function FinancialPage() {
    const [financial, setFinancial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [period, setPeriod] = useState('all');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const fetchFinancial = async (
        selectedPeriod = period,
        selectedFrom = from,
        selectedTo = to
    ) => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            params.set('period', selectedPeriod);

            if (
                selectedPeriod === 'custom' &&
                selectedFrom &&
                selectedTo
            ) {
                params.set('from', selectedFrom);
                params.set('to', selectedTo);
            }

            const res = await api.get(
                `/financial?${params.toString()}`
            );

            setFinancial(res?.data || null);
        } catch (err) {
            console.error('Financial error:', err);
            setError(
                err?.message || 'Failed to load financial data'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (period !== 'custom') {
            fetchFinancial(period, '', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]);

    const handleCustomApply = () => {
        if (!from || !to) {
            setError('Please select both From and To dates.');
            return;
        }

        if (from > to) {
            setError('The From date cannot be after the To date.');
            return;
        }

        fetchFinancial('custom', from, to);
    };

    const data = financial || {};

    const {
        totalRevenue = 0,
        netProfit = 0,
        profitMargin = 0,
        paidOrders = 0,
        averageOrderValue = 0,
        completedOrders = 0,
        pendingPayments = 0,
        revenueByDay = [],
        revenueByPaymentMethod = [],
        revenueByPackage = [],
        revenueByAddOn = [],
        profitByDay = [],
        upsellRate = 0,
        ordersWithAddOns = 0,
    } = data;

    /*
     * The API currently exposes totalExpenses separately from order costs.
     * For this dashboard, "Total Expenses" means the actual cost of serving
     * the orders + general expenses, so the dashboard stays consistent with
     * Net Profit and the Daily Financial Summary.
     */
    const dailyFinancialData = useMemo(() => {
        if (!Array.isArray(profitByDay)) return [];

        return profitByDay.map((item) => {
            const revenue = Number(item.revenue) || 0;
            const packageCosts = Number(item.packageCosts) || 0;
            const addOnCosts = Number(item.addOnCosts) || 0;
            const workerCommissions =
                Number(item.workerCommissions) || 0;
            const cafeCommissions =
                Number(item.cafeCommissions) || 0;
            const generalExpenses =
                Number(item.generalExpenses) || 0;

            const orderCosts =
                Number(item.orderCosts) ||
                packageCosts +
                addOnCosts +
                workerCommissions +
                cafeCommissions;

            const totalCosts =
                orderCosts + generalExpenses;

            const profit = Number.isFinite(Number(item.profit))
                ? Number(item.profit)
                : revenue - totalCosts;

            return {
                ...item,
                revenue,
                packageCosts,
                addOnCosts,
                workerCommissions,
                cafeCommissions,
                generalExpenses,
                orderCosts,
                totalCosts,
                expenses: totalCosts,
                profit,
            };
        });
    }, [profitByDay]);

    const calculatedExpenses = useMemo(
        () =>
            dailyFinancialData.reduce(
                (sum, item) => sum + item.totalCosts,
                0
            ),
        [dailyFinancialData]
    );

    const calculatedProfit =
        Number.isFinite(Number(netProfit))
            ? Number(netProfit)
            : Number(totalRevenue) - calculatedExpenses;

    const calculatedMargin =
        Number.isFinite(Number(profitMargin))
            ? Number(profitMargin)
            : totalRevenue
                ? (calculatedProfit / Number(totalRevenue)) * 100
                : 0;

    const totalOrders = dailyFinancialData.reduce(
        (sum, item) => sum + (Number(item.orders) || 0),
        0
    );

    const costPerCar = totalOrders
        ? calculatedExpenses / totalOrders
        : 0;

    // Frontend-only KPI: no backend/database changes required.
    const profitPerCar = totalOrders
        ? calculatedProfit / totalOrders
        : 0;

    const expenseBreakdown = useMemo(() => {
        const result = [
            {
                label: 'Package Costs',
                value: dailyFinancialData.reduce(
                    (sum, item) => sum + item.packageCosts,
                    0
                ),
            },
            {
                label: 'Add-on Costs',
                value: dailyFinancialData.reduce(
                    (sum, item) => sum + item.addOnCosts,
                    0
                ),
            },
            {
                label: 'Worker Commission',
                value: dailyFinancialData.reduce(
                    (sum, item) => sum + item.workerCommissions,
                    0
                ),
            },
            {
                label: 'Cafe Commission',
                value: dailyFinancialData.reduce(
                    (sum, item) => sum + item.cafeCommissions,
                    0
                ),
            },
            {
                label: 'General Expenses',
                value: dailyFinancialData.reduce(
                    (sum, item) => sum + item.generalExpenses,
                    0
                ),
            },
        ];

        return result.filter((item) => item.value > 0);
    }, [dailyFinancialData]);

    const paymentChartData = Array.isArray(
        revenueByPaymentMethod
    )
        ? revenueByPaymentMethod.map((item) => ({
            ...item,
            label: paymentLabel(item.method),
            revenue: Number(item.revenue) || 0,
        }))
        : [];

    const packageData = Array.isArray(revenueByPackage)
        ? revenueByPackage.map((item) => ({
            ...item,
            orders: Number(item.orders) || 0,
            revenue: Number(item.revenue) || 0,
            cost: Number(item.cost) || 0,
            profit:
                Number.isFinite(Number(item.profit))
                    ? Number(item.profit)
                    : (Number(item.revenue) || 0) -
                    (Number(item.cost) || 0),
        }))
        : [];

    const addOnData = Array.isArray(revenueByAddOn)
        ? revenueByAddOn.map((item) => ({
            ...item,
            name:
                item.addOnName ||
                item.name ||
                'Add-on',
            orders: Number(item.orders) || 0,
            revenue: Number(item.revenue) || 0,
            cost: Number(item.cost) || 0,
            profit:
                Number.isFinite(Number(item.profit))
                    ? Number(item.profit)
                    : (Number(item.revenue) || 0) -
                    (Number(item.cost) || 0),
        }))
        : [];

    const trendData =
        dailyFinancialData.length > 0
            ? dailyFinancialData
            : Array.isArray(revenueByDay)
                ? revenueByDay.map((item) => ({
                    date: item.date,
                    revenue: Number(item.revenue) || 0,
                    expenses: 0,
                    profit: Number(item.revenue) || 0,
                }))
                : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="flex min-h-[400px] items-center justify-center">
                    <p className="text-lg text-slate-600">
                        Loading financial data...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !financial) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <p className="font-medium text-red-700">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            fetchFinancial(
                                period,
                                from,
                                to
                            )
                        }
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Financial Dashboard
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Track revenue, costs, profit, and business
                        performance.
                    </p>
                </div>

                <button
                    onClick={() =>
                        fetchFinancial(
                            period,
                            period === 'custom' ? from : '',
                            period === 'custom' ? to : ''
                        )
                    }
                    className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800"
                >
                    Refresh
                </button>
            </div>

            {/* PERIOD */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Financial Period
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        All financial figures below are based on
                        the selected period.
                    </p>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                    <div className="w-full lg:max-w-xs">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Period
                        </label>

                        <select
                            value={period}
                            onChange={(e) =>
                                setPeriod(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                        >
                            <option value="all">
                                All Time
                            </option>
                            <option value="today">
                                Today
                            </option>
                            <option value="week">
                                This Week
                            </option>
                            <option value="month">
                                This Month
                            </option>
                            <option value="custom">
                                Custom Range
                            </option>
                        </select>
                    </div>

                    {period === 'custom' && (
                        <>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={from}
                                    onChange={(e) =>
                                        setFrom(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={(e) =>
                                        setTo(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
                                />
                            </div>

                            <button
                                onClick={handleCustomApply}
                                className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800"
                            >
                                Apply
                            </button>
                        </>
                    )}
                </div>

                {error && financial && (
                    <p className="mt-3 text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}
            </div>

            {/* PRIMARY KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Total Revenue"
                    value={money(totalRevenue)}
                    description="Revenue from paid orders"
                />

                <MetricCard
                    label="Total Expenses"
                    value={money(calculatedExpenses)}
                    description="Direct order costs + general expenses"
                />

                <MetricCard
                    label="Net Profit"
                    value={money(calculatedProfit)}
                    description="Revenue minus total expenses"
                    valueClass={
                        calculatedProfit >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                    }
                />

                <MetricCard
                    label="Profit Margin"
                    value={percent(calculatedMargin)}
                    description="Net profit as a percentage of revenue"
                />
            </div>

            {/* SECONDARY KPIs */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                    label="Profit per Car"
                    value={money(profitPerCar)}
                    description="Average net profit per completed car"
                    valueClass={
                        profitPerCar >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                    }
                />

                <MetricCard
                    label="Completed Orders"
                    value={completedOrders}
                    description="Finished washes"
                />

                <MetricCard
                    label="Average Order Value"
                    value={money(averageOrderValue)}
                    description="Average revenue per paid order"
                />

                <MetricCard
                    label="Cost per Car"
                    value={money(costPerCar)}
                    description="Average total cost per order"
                />

                <MetricCard
                    label="Upsell Rate"
                    value={percent(upsellRate)}
                    description={`${ordersWithAddOns} order${ordersWithAddOns === 1 ? '' : 's'} with add-ons`}
                />
            </div>

            {/* TREND */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Revenue, Expenses & Profit Trend
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Daily financial performance for the selected
                        period.
                    </p>
                </div>

                <div className="h-[330px]">
                    {trendData.length === 0 ? (
                        <EmptyState text="No trend data available." />
                    ) : (
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <LineChart data={trendData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        money(value),
                                        name,
                                    ]}
                                />
                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 3 }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Expenses"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    name="Profit"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </section>

            {/* EXPENSES + PAYMENTS */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <FinancialPanel
                    title="Expenses Breakdown"
                    description="Where the business cost is going in the selected period."
                >
                    {expenseBreakdown.length === 0 ? (
                        <EmptyState text="No expense data available." />
                    ) : (
                        <>
                            <div className="h-[280px]">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <PieChart>
                                        <Pie
                                            data={expenseBreakdown}
                                            dataKey="value"
                                            nameKey="label"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={95}
                                            label
                                        >
                                            {expenseBreakdown.map(
                                                (item, index) => (
                                                    <Cell
                                                        key={
                                                            item.label
                                                        }
                                                        fill={
                                                            PIE_COLORS[
                                                            index %
                                                            PIE_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) =>
                                                money(value)
                                            }
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 space-y-2">
                                {expenseBreakdown.map(
                                    (item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                                        >
                                            <span className="font-medium text-slate-700">
                                                {item.label}
                                            </span>
                                            <span className="font-bold text-slate-900">
                                                {money(
                                                    item.value
                                                )}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </FinancialPanel>

                <FinancialPanel
                    title="Revenue by Payment Method"
                    description="How customers are paying during the selected period."
                >
                    {paymentChartData.length === 0 ? (
                        <EmptyState text="No payment data available." />
                    ) : (
                        <>
                            <div className="h-[280px]">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <PieChart>
                                        <Pie
                                            data={paymentChartData}
                                            dataKey="revenue"
                                            nameKey="label"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={95}
                                            label
                                        >
                                            {paymentChartData.map(
                                                (item, index) => (
                                                    <Cell
                                                        key={
                                                            item.method
                                                        }
                                                        fill={
                                                            PIE_COLORS[
                                                            index %
                                                            PIE_COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) =>
                                                money(value)
                                            }
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 space-y-2">
                                {paymentChartData.map(
                                    (item) => (
                                        <div
                                            key={item.method}
                                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.orders || 0}{' '}
                                                    order
                                                    {item.orders !==
                                                        1
                                                        ? 's'
                                                        : ''}
                                                </p>
                                            </div>

                                            <span className="font-bold text-slate-900">
                                                {money(
                                                    item.revenue
                                                )}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </FinancialPanel>
            </div>

            {/* PACKAGE + ADD-ONS */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <FinancialPanel
                    title="Package Performance"
                    description="Revenue and profit generated by each base package."
                >
                    {packageData.length === 0 ? (
                        <EmptyState text="No package data available." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                                        <th className="px-3 py-3">
                                            Package
                                        </th>
                                        <th className="px-3 py-3">
                                            Orders
                                        </th>
                                        <th className="px-3 py-3">
                                            Revenue
                                        </th>
                                        <th className="px-3 py-3">
                                            Cost
                                        </th>
                                        <th className="px-3 py-3">
                                            Profit
                                        </th>
                                        <th className="px-3 py-3">
                                            Margin
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {packageData.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.packageName
                                                }
                                                className="border-b border-slate-100 last:border-0"
                                            >
                                                <td className="px-3 py-4 font-semibold text-slate-900">
                                                    {
                                                        item.packageName
                                                    }
                                                </td>
                                                <td className="px-3 py-4">
                                                    {
                                                        item.orders
                                                    }
                                                </td>
                                                <td className="px-3 py-4 font-semibold">
                                                    {money(
                                                        item.revenue
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {money(
                                                        item.cost
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 font-bold text-emerald-600">
                                                    {money(
                                                        item.profit
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {percent(
                                                        item.revenue
                                                            ? (item.profit /
                                                                item.revenue) *
                                                            100
                                                            : 0
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </FinancialPanel>

                <FinancialPanel
                    title="Add-ons Performance"
                    description="Which additional services are generating revenue and profit."
                >
                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-medium text-slate-500">
                                Upsell Rate
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-900">
                                {percent(upsellRate)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-medium text-slate-500">
                                Orders with Add-ons
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-900">
                                {ordersWithAddOns}
                            </p>
                        </div>
                    </div>

                    {addOnData.length === 0 ? (
                        <EmptyState text="No add-on data available." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                                        <th className="px-3 py-3">
                                            Add-on
                                        </th>
                                        <th className="px-3 py-3">
                                            Orders
                                        </th>
                                        <th className="px-3 py-3">
                                            Revenue
                                        </th>
                                        <th className="px-3 py-3">
                                            Cost
                                        </th>
                                        <th className="px-3 py-3">
                                            Profit
                                        </th>
                                        <th className="px-3 py-3">
                                            Margin
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {addOnData.map(
                                        (item) => (
                                            <tr
                                                key={item.name}
                                                className="border-b border-slate-100 last:border-0"
                                            >
                                                <td className="px-3 py-4 font-semibold text-slate-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {item.orders}
                                                </td>
                                                <td className="px-3 py-4 font-semibold">
                                                    {money(
                                                        item.revenue
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {money(
                                                        item.cost
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 font-bold text-emerald-600">
                                                    {money(
                                                        item.profit
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {percent(
                                                        item.revenue
                                                            ? (item.profit /
                                                                item.revenue) *
                                                            100
                                                            : 0
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </FinancialPanel>
            </div>

            {/* UPSELL + DAILY SUMMARY */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <FinancialPanel
                    title="Upsell Analysis"
                    description="A quick view of how often customers buy additional services."
                >
                    <div className="mb-5 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-500">
                                Upsell Rate
                            </p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {percent(upsellRate)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {ordersWithAddOns} of{' '}
                                {totalOrders || paidOrders}{' '}
                                orders
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-500">
                                Add-on Revenue
                            </p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {money(
                                    addOnData.reduce(
                                        (sum, item) =>
                                            sum +
                                            item.revenue,
                                        0
                                    )
                                )}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Revenue generated by additional
                                services
                            </p>
                        </div>
                    </div>

                    {addOnData.length === 0 ? (
                        <EmptyState text="No add-on performance available." />
                    ) : (
                        <div className="space-y-2">
                            {addOnData.map((item) => (
                                <div
                                    key={`upsell-${item.name}`}
                                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {item.name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.orders} order
                                            {item.orders !==
                                                1
                                                ? 's'
                                                : ''}
                                        </p>
                                    </div>

                                    <span className="font-bold text-slate-900">
                                        {money(item.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </FinancialPanel>

                <FinancialPanel
                    title="Daily Financial Summary"
                    description="Revenue, every cost component, total costs, and net profit by day."
                >
                    {dailyFinancialData.length === 0 ? (
                        <EmptyState text="No daily financial data available." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                                        <th className="px-3 py-3">
                                            Date
                                        </th>
                                        <th className="px-3 py-3">
                                            Orders
                                        </th>
                                        <th className="px-3 py-3">
                                            Revenue
                                        </th>
                                        <th className="px-3 py-3">
                                            Package Cost
                                        </th>
                                        <th className="px-3 py-3">
                                            Add-on Cost
                                        </th>
                                        <th className="px-3 py-3">
                                            Worker
                                        </th>
                                        <th className="px-3 py-3">
                                            Cafe
                                        </th>
                                        <th className="px-3 py-3">
                                            General
                                        </th>
                                        <th className="px-3 py-3">
                                            Total Costs
                                        </th>
                                        <th className="px-3 py-3">
                                            Net Profit
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dailyFinancialData.map(
                                        (item) => (
                                            <tr
                                                key={item.date}
                                                className="border-b border-slate-100 last:border-0"
                                            >
                                                <td className="px-3 py-4 text-slate-700">
                                                    {item.date}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {item.orders ||
                                                        0}
                                                </td>
                                                <td className="px-3 py-4 font-bold text-slate-900">
                                                    {money(
                                                        item.revenue
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {money(
                                                        item.packageCosts
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {money(
                                                        item.addOnCosts
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {money(
                                                        item.workerCommissions
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {money(
                                                        item.cafeCommissions
                                                    )}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {money(
                                                        item.generalExpenses
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 font-bold text-red-600">
                                                    {money(
                                                        item.totalCosts
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 font-bold text-emerald-600">
                                                    {money(
                                                        item.profit
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </FinancialPanel>
            </div>

            {/* FOOT NOTE */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                <strong className="text-slate-700">
                    Financial logic:
                </strong>{' '}
                revenue comes from paid orders. Direct order costs
                include package cost, add-on cost, worker commission,
                and cafe commission. General expenses are added
                separately.
            </div>
        </div>
    );
}

function MetricCard({
    label,
    value,
    description,
    valueClass = 'text-slate-900',
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
                {label}
            </p>

            <p
                className={`mt-2 text-2xl font-bold ${valueClass}`}
            >
                {value}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function FinancialPanel({
    title,
    description,
    children,
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>

            {children}
        </section>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">
            {text}
        </div>
    );
}
