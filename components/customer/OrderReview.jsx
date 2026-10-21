'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Loader } from '@/components/shared/Loader';

export default function OrderReview({
    orderId,
    initialOrder,
    onApproved,
    onRejected,
}) {
    const [order, setOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(!initialOrder);

    useEffect(() => {
        if (!orderId) {
            console.error('OrderReview: orderId is missing');
            setLoading(false);
            return;
        }

        const checkOrder = async () => {
            try {
                const response = await api.get(`/Orders/${orderId}`);
                const updatedOrder = response?.data?.washOrder;

                if (!updatedOrder) {
                    throw new Error('Wash order not found');
                }

                console.log('REVIEW ORDER:', updatedOrder);
                setOrder(updatedOrder);

                // Manager approved the order
                if (
                    updatedOrder.managerDecision === 'approved' ||
                    (
                        updatedOrder.needsAttention === false &&
                        updatedOrder.status !== 'cancelled'
                    )
                ) {
                    onApproved(updatedOrder);
                    return;
                }

                // Manager rejected/cancelled the order
                if (
                    updatedOrder.managerDecision === 'rejected' ||
                    updatedOrder.status === 'cancelled'
                ) {
                    onRejected(updatedOrder);
                }
            } catch (error) {
                console.error('FAILED TO CHECK ORDER REVIEW:', error);
            } finally {
                setLoading(false);
            }
        };

        checkOrder();
        const interval = setInterval(checkOrder, 10000);

        return () => clearInterval(interval);
    }, [orderId, onApproved, onRejected]);

    if (loading && !order) {
        return (
            <div dir="rtl" className="flex min-h-[500px] items-center justify-center">
                <Loader text="جاري التحقق من حالة الطلب..." />
            </div>
        );
    }

    const isCashPayment = order?.paymentMethod === 'cash';

    return (
        <div dir="rtl" className="min-h-[520px] bg-slate-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-2xl">
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-8 text-white md:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                                <AlertTriangle size={30} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Flash Wash
                                </p>

                                <h1 className="mt-1 text-2xl font-extrabold">
                                    الطلب قيد المراجعة
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Main message */}
                        <div className="text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                                <Clock3 size={38} className="text-amber-500" />
                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-slate-900">
                                {isCashPayment
                                    ? 'في انتظار تأكيد الطلب'
                                    : 'طلبك يحتاج إلى المراجعة'}
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500">
                                {isCashPayment
                                    ? 'تم إرسال طلبك بنجاح، ونحن في انتظار تأكيد مدير التشغيل.'
                                    : 'توجد مشكلة في طلبك، وقد تم تحويله إلى مدير التشغيل لمراجعته.'}
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-400">
                                {isCashPayment
                                    ? 'من فضلك انتظر حتى يتم تأكيد طلبك.'
                                    : 'من فضلك انتظر حتى تنتهي مراجعة طلبك.'}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                                    <Clock3 size={20} className="text-amber-600" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-amber-700">
                                        حالة الطلب الحالية
                                    </p>

                                    <p className="mt-0.5 font-bold text-amber-900">
                                        في انتظار مراجعة مدير التشغيل
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order information */}
                        {order && (
                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        السيارة
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900">
                                        {order.car || '—'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-400">
                                        رقم اللوحة
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900">
                                        {order.plateNumber || '—'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Security/info */}
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                            <ShieldCheck
                                size={20}
                                className="mt-0.5 shrink-0 text-blue-600"
                            />

                            <p className="text-sm leading-6 text-blue-800">
                                لا تحتاج إلى القيام بأي شيء الآن. سيتم تحديث الصفحة تلقائيًا
                                عندما يتخذ مدير التشغيل قراره بشأن طلبك.
                            </p>
                        </div>

                        {/* Polling indicator */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                            جاري التحقق من التحديثات...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
