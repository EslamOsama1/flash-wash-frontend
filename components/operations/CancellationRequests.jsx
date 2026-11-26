'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/shared/Button';

const paymentMethods = {
  cash: 'كاش',
  vodafone_cash: 'فودافون كاش',
  instapay: 'إنستاباي',
};

export default function CancellationRequests({ orders = [], onApproved }) {
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState('');
  const approvalInFlight = useRef(false);

  const approve = async (orderId) => {
    if (approvalInFlight.current) return;
    approvalInFlight.current = true;
    setApprovingId(orderId);
    setError('');
    try {
      await api.patch(`/operations/orders/${orderId}/cancellation-request/approve`);
      await onApproved();
    } catch (err) {
      setError(err.status === 409 ? err.message : 'تعذر اعتماد الإلغاء. جرّب تاني.');
    } finally {
      approvalInFlight.current = false;
      setApprovingId(null);
    }
  };

  if (orders.length === 0) return null;

  return (
    <section dir="rtl" className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-bold text-slate-900">طلبات الإلغاء</h2>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <ul className="mt-3 divide-y divide-slate-100">
        {orders.map(order => (
          <li
            key={order._id}
            className="grid gap-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
          >
            <div className="min-w-0 space-y-1">
              <h3 className="font-bold text-slate-900 wrap-break-word">{order.customerName}</h3>
              <p className="text-sm text-slate-700 wrap-break-word">
                <span className="font-semibold">نوع العربية</span> <bdi>{order.car}</bdi>
              </p>
            </div>
            <dl className="space-y-1 text-sm text-slate-700">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">طريقة الدفع</dt>
                <dd>{paymentMethods[order.paymentMethod] || 'غير محددة'}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">المبلغ الإجمالي</dt>
                <dd className="whitespace-nowrap"><bdi>{order.totalPrice}</bdi> ج.م.</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="danger"
              className="w-full whitespace-nowrap md:w-auto"
              disabled={approvingId !== null}
              isLoading={approvingId === order._id}
              onClick={() => approve(order._id)}
            >
              اعتماد الإلغاء
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
