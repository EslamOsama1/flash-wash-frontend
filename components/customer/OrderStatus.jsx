'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Clock,
  Droplets,
  Info,
  Car,
  ShieldCheck
} from 'lucide-react';

import { api } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Loader } from '@/components/shared/Loader';
import { Button } from '@/components/shared/Button';

export default function OrderStatus({
  orderId,
  initialOrder,
  onNewOrder,
  onCompleted
}) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [requestingCancellation, setRequestingCancellation] = useState(false);
  const [cancellationError, setCancellationError] = useState('');
  const cancellationInFlight = useRef(false);
  const trackingRequest = useRef(null);

  useEffect(() => {
    let active = true;

    if (!orderId) {
      console.error('OrderStatus: orderId is missing');
      return;
    }

    const fetchOrder = async () => {
      if (trackingRequest.current) return;
      const request = {};
      trackingRequest.current = request;
      try {
        console.log('Fetching order:', orderId);

        const response = await api.get(`/Orders/${orderId}`);

        if (!active || trackingRequest.current !== request) return;

        console.log('Order response:', response);

        const fetchedOrder = response?.data?.washOrder;

        if (!fetchedOrder) {
          throw new Error('Wash order not found in API response');
        }

        setOrder(fetchedOrder);

        // Move customer to Rating after the wash is completed
        if (
          fetchedOrder.status === 'completed' &&
          !fetchedOrder.rating
        ) {
          onCompleted?.(fetchedOrder);
        }
      } catch (err) {
        if (active) console.error('Failed to fetch order status:', err);
      } finally {
        if (active && trackingRequest.current === request) {
          trackingRequest.current = null;
          setLoading(false);
        }
      }
    };

    fetchOrder();

    const interval = setInterval(fetchOrder, 15000);

    return () => {
      active = false;
      trackingRequest.current = null;
      clearInterval(interval);
    };
  }, [orderId, onCompleted]);

  const requestCancellation = async () => {
    if (cancellationInFlight.current) return;
    setCancellationError('');
    const credential = storage.get('activeOrderCancellation');
    if (!credential?.token || credential.orderId !== orderId) {
      setCancellationError('تواصل مع الإدارة لإلغاء الطلب، لأن بيانات التحقق من الحجز مش متاحة على الجهاز ده.');
      return;
    }
    if (!window.confirm('متأكد إنك عايز تطلب إلغاء الطلب؟')) return;

    cancellationInFlight.current = true;
    setRequestingCancellation(true);
    try {
      const response = await api.post(`/Orders/${orderId}/cancellation-request`, {
        cancellationToken: credential.token,
      });
      trackingRequest.current = null;
      setOrder(current => current.status === 'cancelled' ? current : response.data.washOrder);
    } catch (error) {
      setCancellationError(error.status === 409 || error.status === 403
        ? error.message
        : 'حصلت مشكلة وإحنا بنبعت طلب الإلغاء. جرّب تاني.');
    } finally {
      cancellationInFlight.current = false;
      setRequestingCancellation(false);
    }
  };

  if (loading || !order) {
    return (
      <div dir="rtl" className="flex min-h-64 items-center justify-center rounded-3xl bg-white p-5">
        <Loader text="جارٍ تحميل حالة الطلب..." />
      </div>
    );
  }

  const steps = [
    {
      status: 'pending', title: 'استلام الطلب', icon: CheckCircle2,
      detail: order.paymentStatus === 'paid' ? 'تم تأكيد الدفع.' : 'الدفع في انتظار المراجعة.'
    },
    {
      status: 'waiting', title: 'في انتظار الغسيل', icon: Clock,
      detail: 'هيبدأ الغسيل لما العامل يستلم الطلب.'
    },
    {
      status: 'washing', title: 'جاري الغسيل', icon: Droplets,
      detail: 'سيارتك قيد الغسيل حاليًا.'
    },
    {
      status: 'completed', title: 'اكتمل الغسيل', icon: CheckCircle2,
      detail: 'غسيل سيارتك خلص.'
    },
  ];

  const index = steps.findIndex(step => step.status === order.status);
  const cancelled = order.status === 'cancelled';
  const reviewing = order.status === 'waiting' && Boolean(order.cancellationRequestedAt);
  const current = steps[index];
  const statusKey = reviewing ? 'review' : order.status;
  const Icon = cancelled ? Info : reviewing ? Clock : current?.icon || Info;
  const title = cancelled
    ? (order.cancellationApprovedAt ? 'تم إلغاء طلبك' : 'تم إلغاء الطلب')
    : reviewing ? 'طلب الإلغاء قيد المراجعة' : current?.title || 'حالة الطلب';
  const detail = cancelled
    ? (order.cancellationApprovedAt ? null : 'تم إلغاء طلبك من قِبل الإدارة.')
    : reviewing ? 'طلب الإلغاء اتبعت للمسؤولين، وهيتم الرد عليك.' : current?.detail;
  const statusTone = reviewing
    ? 'border-amber-200 bg-amber-50 text-amber-950'
    : cancelled ? 'border-slate-200 bg-slate-50 text-slate-900'
      : order.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
        : 'border-blue-100 bg-blue-50 text-blue-950';

  return (
    <div dir="rtl" className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <header className="flex items-center gap-3 bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-5 text-white sm:px-7">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
          <Car size={24} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold sm:text-xl">متابعة الغسيل</h2>
          <p className="mt-1 break-words text-sm leading-6 text-blue-100">
            {order.car}{order.plateNumber && <> · <bdi>{order.plateNumber}</bdi></>}
          </p>
        </div>
      </header>

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-7">
        <div role="status" aria-live="polite" aria-atomic="true">
          <div key={statusKey} className={`status-enter rounded-2xl border p-4 sm:p-6 ${statusTone}`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-current/10 sm:h-14 sm:w-14">
                <span aria-hidden="true" className={`status-icon status-icon--${statusKey}`}><Icon size={25} /></span>
              </span>
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold leading-snug sm:text-2xl">{title}</h3>
                {detail && <p className="mt-1.5 text-sm leading-6">{detail}</p>}
              </div>
            </div>
          </div>
        </div>

        {!cancelled && (
          <section aria-labelledby="wash-progress-title">
            <h3 id="wash-progress-title" className="mb-3 text-base font-bold text-slate-900">مراحل الغسيل</h3>
            <ol className="space-y-0">
              {steps.map((step, stepIndex) => {
                const active = index === stepIndex;
                const done = index > stepIndex || (index === 3 && stepIndex === 3);
                const StepIcon = done ? CheckCircle2 : step.icon;

                return (
                  <li
                    key={step.status}
                    aria-current={active ? 'step' : undefined}
                    className="relative flex items-start gap-3 pb-3 last:pb-0 sm:gap-4"
                  >
                    {stepIndex < steps.length - 1 && (
                      <span aria-hidden="true" className={`absolute bottom-0 right-[19px] top-9 w-0.5 ${index > stepIndex ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    )}
                    <span aria-hidden="true" className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white ${active && reviewing ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : active ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : done ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      <StepIcon size={19} />
                    </span>
                    <div className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 ${active && reviewing ? 'border-amber-200 bg-amber-50'
                      : active ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'
                      }`}>
                      <p className="text-sm font-bold leading-6 text-slate-900">{step.title}</p>
                      {active && reviewing && <p className="text-sm leading-6 text-amber-900">الغسيل متوقف لحين مراجعة طلب الإلغاء.</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {order.status === 'waiting' && !reviewing && (
          <Button type="button" variant="outline" className="min-h-12 w-full sm:w-auto" onClick={requestCancellation} isLoading={requestingCancellation}>
            إلغاء الطلب
          </Button>
        )}

        {cancellationError && !order.cancellationRequestedAt && !cancelled && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">{cancellationError}</p>
        )}

        {(cancelled || order.status === 'completed') && (
          <Button type="button" onClick={onNewOrder} className="min-h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            ابدأ غسلة جديدة
          </Button>
        )}

        {!cancelled && order.status !== 'completed' && (
          <p className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
            <ShieldCheck size={17} className="shrink-0 text-emerald-600" aria-hidden="true" />
            حالة طلبك بتتحدّث تلقائيًا.
          </p>
        )}
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          .status-enter { animation: status-enter 280ms ease-out both; }
          .status-icon--pending,
          .status-icon--waiting,
          .status-icon--review { animation: status-pulse 2s ease-in-out infinite; }
          .status-icon--washing { animation: status-float 1.6s ease-in-out infinite; }
          .status-icon--completed,
          .status-icon--cancelled { animation: status-confirm 380ms ease-out both; }
        }
        @keyframes status-enter {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes status-pulse {
          50% { opacity: .65; transform: scale(1.18); }
        }
        @keyframes status-float {
          50% { transform: translateY(-6px); }
        }
        @keyframes status-confirm {
          from { opacity: .5; transform: scale(.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
