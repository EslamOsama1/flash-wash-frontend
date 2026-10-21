'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Droplets,
  Info,
  Car,
  ShieldCheck
} from 'lucide-react';

import { api } from '@/lib/api';
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

  useEffect(() => {
    if (!orderId) {
      console.error('OrderStatus: orderId is missing');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        console.log('Fetching order:', orderId);

        const response = await api.get(`/Orders/${orderId}`);

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
        console.error('Failed to fetch order status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    const interval = setInterval(fetchOrder, 15000);

    return () => clearInterval(interval);
  }, [orderId, onCompleted]);

  if (loading || !order) {
    return (
      <div dir="rtl" className="flex min-h-[500px] items-center justify-center rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100" >
        <Loader text="جارٍ تحميل حالة الطلب..." />
      </div>
    );
  }

  const STATUSES = [
    'pending',
    'waiting',
    'washing',
    'completed'
  ];

  let currentIndex = STATUSES.indexOf(order.status);

  if (order.status === 'pending' && order.needsAttention) {
    currentIndex = 0;
  }

  // =========================
  // CANCELLED
  // =========================

  if (order.status === 'cancelled') {
    return (
      <div dir="rtl" className="mx-auto flex min-h-[500px] w-full max-w-3xl items-center justify-center rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/60 ring-1 ring-slate-100" >

        <div className="flex max-w-md flex-col items-center" >

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50" >
            <Info
              size={42}
              className="text-red-500"
            />
          </div>

          <p className="mb-2 text-sm font-semibold text-blue-600" >
            Flash Wash
          </p>

          <h2 className="text-2xl font-bold text-slate-900" >
            تم إلغاء الطلب
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500" >
            نأسف لإبلاغك بأنه تم إلغاء طلبك من قِبل الإدارة.
          </p>

          <Button
            onClick={onNewOrder}
            className="mt-7 rounded-xl bg-blue-600 px-8 py-3 shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            ابدأ غسلة جديدة
          </Button>

        </div>
      </div>
    );
  }

  const steps = [
    {
      title: 'تم استلام الطلب',
      description:
        order.paymentStatus === 'paid'
          ? 'تم تأكيد الدفع.'
          : 'الدفع في انتظار المراجعة.',
      icon: CheckCircle2
    },
    {
      title: 'في انتظار الغسيل',
      description:
        currentIndex === 1
          ? 'سيارتك التالية في قائمة الانتظار.'
          : currentIndex > 1
            ? 'انتهى وقت الانتظار.'
            : 'في انتظار تأكيد الدفع.',
      icon: Clock
    },
    {
      title: 'جاري الغسيل',
      description:
        currentIndex === 2
          ? 'سيارتك قيد الغسيل حاليًا.'
          : currentIndex > 2
            ? 'اكتمل الغسيل.'
            : 'في انتظار العامل.',
      icon: Droplets
    },
    {
      title: 'مكتمل',
      description:
        currentIndex === 3
          ? 'اكتملت عملية غسيل سيارتك!'
          : 'ستظهر هنا عند اكتمال عملية الغسيل.',
      icon: CheckCircle2
    }
  ];

  return (
    <div dir="rtl" className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100" >

      {/* ================= HEADER ================= */}

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-7 text-white md:px-8" >

        <div className="flex items-center gap-4" >

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10" >
            <Car size={25} />
          </div>

          <div className="min-w-0" >

            <p className="mb-1 text-sm font-medium text-blue-100" >
              Flash Wash
            </p>

            <h2 className="text-2xl font-bold tracking-tight md:text-3xl" >
              حالة الطلب
            </h2>

            <p className="mt-1 truncate text-sm text-blue-100" >
              {order.car} · {order.plateNumber}
            </p>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="flex min-h-0 flex-1 flex-col" >

        <div className="flex-1 overflow-y-auto px-6 py-7 md:px-8" >

          {/* ================= CURRENT STATUS ================= */}

          <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5" >

            <div className="flex items-center gap-4" >

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20" >

                {currentIndex === 2 ? (
                  <Droplets
                    size={23}
                    className="animate-bounce"
                  />
                ) : currentIndex === 3 ? (
                  <CheckCircle2 size={23} />
                ) : (
                  <Clock size={23} />
                )
                }

              </div>

              <div className="min-w-0" >

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600" >
                  الحالة الحالية
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900" >
                  {currentIndex === 0 && 'تم استلام الطلب'}
                  {currentIndex === 1 && 'في انتظار الغسيل'}
                  {currentIndex === 2 && 'جاري الغسيل'}
                  {currentIndex === 3 && 'اكتمل الغسيل'}
                </h3>

              </div>

            </div>

          </div>

          {/* ================= TIMELINE ================= */}

          <section >

            <div className="mb-6" >

              <h3 className="text-lg font-bold text-slate-900" >
                مراحل الغسيل
              </h3>

              <p className="mt-1 text-sm text-slate-500" >
                تابع مراحل غسيل سيارتك من البداية حتى النهاية.
              </p>

            </div>

            <div className="relative" >

              {/* Timeline line */}

              <div className="absolute bottom-8 right-5 top-8 w-0.5 bg-slate-200" />

              {currentIndex > 0 && (
                <div
                  className="absolute right-5 top-8 w-0.5 bg-blue-500 transition-all"
                  style={{
                    height: `${Math.min(currentIndex / 3, 1) * 100}%`
                  }}
                />
              )}

              <div className="space-y-5" >

                {
                  steps.map((step, index) => {

                    const Icon = step.icon;

                    const completed =
                      currentIndex >= index;

                    const active =
                      currentIndex === index;

                    return (
                      <div
                        key={step.title}
                        className="relative flex items-start gap-4"
                      >

                        {/* Icon */}

                        <div
                          className={`
                          relative z-10 flex h-10 w-10 shrink-0
                          items-center justify-center rounded-full
                          border-4 border-white shadow-sm
                          transition-all
                          ${completed
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                            }
                          ${active
                              ? 'ring-4 ring-blue-100'
                              : ''
                            }
                        `}
                        >

                          <Icon
                            size={18}
                            className={
                              active && index === 2
                                ? 'animate-bounce'
                                : ''
                            }
                          />

                        </div>

                        {/* Card */}

                        <div
                          className={`
                          min-w-0 flex-1 rounded-2xl border p-4
                          transition-all
                          ${active
                              ? 'border-blue-200 bg-blue-50/60 shadow-sm'
                              : completed
                                ? 'border-slate-200 bg-white'
                                : 'border-slate-100 bg-slate-50'
                            }
                        `}
                        >

                          <div className="flex items-start justify-between gap-3" >

                            <div>

                              <h4
                                className={`
                                text-sm font-bold
                                ${completed
                                    ? 'text-slate-900'
                                    : 'text-slate-500'
                                  }
                              `}
                              >
                                {step.title}
                              </h4>

                              <p className="mt-1 text-xs leading-5 text-slate-500" >
                                {step.description}
                              </p>

                            </div>

                            {completed && (
                              <CheckCircle2
                                size={18}
                                className="shrink-0 text-blue-600"
                              />
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  })}

              </div>

            </div>

          </section>

          {/* ================= INFO ================= */}

          <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500" >

            <ShieldCheck
              size={16}
              className="text-emerald-500"
            />

            <span>
              يتم تحديث حالة طلبك تلقائيًا.
            </span>

          </div>

        </div>

        {/* ================= COMPLETED ACTION ================= */}

        {
          currentIndex === 3 && (
            <div className="border-t border-slate-100 bg-white px-6 py-5 md:px-8" >

              <Button
                className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25"
                onClick={onNewOrder}
              >
                ابدأ غسلة جديدة
              </Button>

            </div>
          )
        }

      </div>
    </div>
  );
}