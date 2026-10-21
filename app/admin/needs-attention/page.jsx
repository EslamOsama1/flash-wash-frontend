'use client';

import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    User,
    Car,
    CreditCard,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

import { api } from '@/lib/api';

export default function NeedsAttentionPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            setRefreshing(true);
            setError('');

            const res = await api.get('/operations/dashboard');

            console.log(
                'NEEDS ATTENTION RESPONSE:',
                res.data
            );

            setOrders(
                res?.data?.needsAttentionOrders || []
            );
        } catch (err) {
            console.error(
                'NEEDS ATTENTION ERROR:',
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to load orders.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ================= APPROVE PAYMENT =================

    const handleApprove = async (orderId) => {
        try {
            setActionLoading(orderId);
            setError('');

            await api.patch(
                `/Orders/${orderId}/payment/approve`
            );

            // Remove order from Needs Attention
            setOrders((prev) =>
                prev.filter(
                    (order) =>
                        (order._id || order.id) !== orderId
                )
            );
        } catch (err) {
            console.error(
                'APPROVE PAYMENT ERROR:',
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to approve payment.'
            );
        } finally {
            setActionLoading(null);
        }
    };

    // ================= REJECT PAYMENT =================

    const handleReject = async (orderId) => {
        try {
            setActionLoading(orderId);
            setError('');

            await api.patch(
                `/Orders/${orderId}/payment/reject`,
                {
                    reason: 'Payment rejected by manager',
                }
            );

            setOrders((prev) =>
                prev.filter(
                    (order) =>
                        (order._id || order.id) !== orderId
                )
            );
        } catch (err) {
            console.error(
                'REJECT PAYMENT ERROR:',
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to reject payment.'
            );
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen" >

            {/* ================= HEADER ================= */}

            < header className="border-b border-slate-200 bg-white" >
                <div className="flex min-h-20 items-center justify-between gap-4 px-6 lg:px-8" >

                    <div>
                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <AlertTriangle size={21} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Needs Attention
                                </h1>

                                <p className="mt-1 text-sm text-slate-500" >
                                    Orders that require manual review
                                </p >
                            </div >

                        </div >
                    </div >

                    <button
                        type="button"
                        onClick={fetchOrders}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
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
                    </button >

                </div >
            </header >

            {/* ================= CONTENT ================= */}

            < main className="px-6 py-8 lg:px-8" >

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" >
                        {error}
                    </div >
                )
                }

                {
                    loading ? (

                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 shadow-sm" >
                            Loading orders...
                        </div >

                    ) : orders.length === 0 ? (

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-12 text-center" >

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm" >
                                <CheckCircle2 size={28} />
                            </div >

                            <h2 className="mt-4 text-lg font-bold text-slate-900" >
                                No orders need attention
                            </h2 >

                            <p className="mt-1 text-sm text-slate-500" >
                                Everything looks good right now.
                            </p >

                        </div >

                    ) : (

                        <div className="space-y-5" >

                            {
                                orders.map((order) => {

                                    const orderId =
                                        order._id || order.id;

                                    const isProcessing =
                                        actionLoading === orderId;

                                    return (
                                        <div
                                            key={orderId}
                                            className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm"
                                        >

                                            {/* ================= ORDER HEADER ================= */}

                                            < div className="flex flex-col gap-4 border-b border-amber-100 bg-amber-50/60 px-5 py-5 md:flex-row md:items-center md:justify-between" >

                                                <div className="flex items-center gap-3" >

                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600" >
                                                        <AlertTriangle size={21} />
                                                    </div >

                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            Manual Review Required
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500" >
                                                            Order ID: {orderId}
                                                        </p >
                                                    </div >

                                                </div >

                                                <div className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700" >
                                                    {
                                                        order.attentionReason ||
                                                        'Requires attention'
                                                    }
                                                </div >

                                            </div >

                                            {/* ================= ORDER INFO ================= */}

                                            < div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4" >

                                                {/* Customer */}

                                                < div className="rounded-xl bg-slate-50 p-4" >

                                                    <div className="flex items-center gap-2 text-slate-400" >
                                                        <User size={16} />

                                                        <span className="text-xs font-semibold" >
                                                            Customer
                                                        </span >
                                                    </div >

                                                    <p className="mt-2 font-bold text-slate-900" >
                                                        {
                                                            order.customerName ||
                                                            '—'
                                                        }
                                                    </p >

                                                    <p className="mt-1 text-sm text-slate-500" >
                                                        {order.phone || '—'}
                                                    </p >

                                                </div >

                                                {/* Car */}

                                                < div className="rounded-xl bg-slate-50 p-4" >

                                                    <div className="flex items-center gap-2 text-slate-400" >
                                                        <Car size={16} />

                                                        <span className="text-xs font-semibold" >
                                                            Vehicle
                                                        </span >
                                                    </div >

                                                    <p className="mt-2 font-bold text-slate-900" >
                                                        {order.car || '—'}
                                                    </p >

                                                    <p className="mt-1 text-sm text-slate-500" >
                                                        Plate: {' '}
                                                        {
                                                            order.plateNumber ||
                                                            '—'
                                                        }
                                                    </p >

                                                </div >

                                                {/* Payment */}

                                                < div className="rounded-xl bg-slate-50 p-4" >

                                                    <div className="flex items-center gap-2 text-slate-400" >
                                                        <CreditCard size={16} />

                                                        <span className="text-xs font-semibold" >
                                                            Payment
                                                        </span >
                                                    </div >

                                                    <p className="mt-2 font-bold text-slate-900" >
                                                        {order.totalPrice ?? 0}{' '}
                                                        EGP
                                                    </p >

                                                    <p className="mt-1 text-sm text-slate-500" >
                                                        {
                                                            order.paymentMethod ||
                                                            '—'
                                                        }
                                                    </p >

                                                </div >

                                                {/* Status */}

                                                < div className="rounded-xl bg-slate-50 p-4" >

                                                    <p className="text-xs font-semibold text-slate-400" >
                                                        Payment Status
                                                    </p >

                                                    <p className="mt-2 font-bold text-amber-600" >
                                                        {
                                                            order.paymentStatus ||
                                                            '—'
                                                        }
                                                    </p >

                                                    <p className="mt-1 text-sm text-slate-500" >
                                                        Order status: {' '}
                                                        {order.status || '—'}
                                                    </p >

                                                </div >

                                            </div >

                                            {/* ================= SCREENSHOT ================= */}

                                            < div className="border-t border-slate-100 p-5" >

                                                <div className="mb-4" >
                                                    <h3 className="font-bold text-slate-900" >
                                                        Payment Screenshot
                                                    </h3 >

                                                    <p className="mt-1 text-sm text-slate-500" >
                                                        Review the uploaded payment receipt.
                                                    </p >
                                                </div >

                                                {
                                                    order.paymentScreenshot ? (

                                                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                                                            <img
                                                                src={
                                                                    order.paymentScreenshot
                                                                }
                                                                alt="Payment screenshot"
                                                                className="max-h-[500px] w-full object-contain"
                                                            />

                                                            < div className="flex justify-end border-t border-slate-200 bg-white p-3" >

                                                                <a
                                                                    href={
                                                                        order.paymentScreenshot
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                    Open Full Image
                                                                </a>

                                                            </div >

                                                        </div >

                                                    ) : (

                                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-400" >
                                                            No payment screenshot available.
                                                        </div >

                                                    )
                                                }

                                            </div >

                                            {/* ================= ACTIONS ================= */}

                                            < div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end" >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleReject(orderId)
                                                    }
                                                    disabled={isProcessing}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <XCircle size={18} />

                                                    {
                                                        isProcessing
                                                            ? 'Processing...'
                                                            : 'Reject Payment'
                                                    }
                                                </button >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleApprove(orderId)
                                                    }
                                                    disabled={isProcessing}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <CheckCircle2 size={18} />

                                                    {
                                                        isProcessing
                                                            ? 'Processing...'
                                                            : 'Approve Payment'
                                                    }
                                                </button >

                                            </div >

                                        </div >
                                    );
                                })}

                        </div >

                    )}

            </main >

        </div >
    );
}