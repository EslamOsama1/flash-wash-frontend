'use client';

import {
  ArrowLeft,
  User,
  Car,
  CreditCard,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/shared/Button';

export default function OrderSummary({
  customerData,
  pkg,
  addons,
  onBack,
  onConfirm
}) {
  const total =
    Number(pkg?.price || 0) +
    addons.reduce((sum, a) => sum + Number(a?.price || 0), 0);
  console.log('PACKAGE DATA:', pkg);
  console.log('ADDONS DATA:', addons);
  const optimizedImageUrl = (url, width = 600, height = 600) => {
    if (!url) return '';
    return url.replace(
      '/upload/',
      `/upload/f_auto,q_auto,w_${width},h_${height},c_fill/`
    );
  };

  return (
    <div dir="rtl" className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-7 text-white md:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20"
            aria-label="رجوع"
          >
            <ArrowLeft size={21} className="rotate-180" />
          </button>

          <div>
            <p className="mb-1 text-sm font-medium text-blue-100">Flash Wash</p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              مراجعة الطلب
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              راجع بياناتك قبل تأكيد الطلب.
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-7 md:px-8">
          {/* CUSTOMER */}
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                بيانات العميل والسيارة
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                بياناتك الخاصة بطلب الغسيل.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
                    <User size={18} />
                  </div>
                  <span className="text-sm text-slate-500">الاسم</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {customerData.customerName}
                </span>
              </div>

              <div className="mx-4 h-px bg-slate-200" />

              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
                    <Car size={18} />
                  </div>
                  <span className="text-sm text-slate-500">نوع السيارة</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {customerData.car}
                </span>
              </div>

              <div className="mx-4 h-px bg-slate-200" />

              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
                    <CreditCard size={18} />
                  </div>
                  <span className="text-sm text-slate-500">رقم اللوحة</span>
                </div>
                <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold tracking-wider text-slate-900 shadow-sm ring-1 ring-slate-200">
                  {customerData.plateNumber}
                </span>
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  الخدمات المختارة
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  باقة الغسيل والخدمات الإضافية المختارة.
                </p>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* MAIN PACKAGE */}
              <div className="flex items-center justify-between gap-4 bg-slate-50 p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600">
                    {pkg?.image?.url ? (
                      <img
                        src={optimizedImageUrl(pkg.image.url)}
                        alt={pkg.name || 'صورة باقة الغسيل'}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                        }}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Car size={24} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {pkg.name}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                        الباقة الأساسية
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      خدمة الغسيل الرئيسية
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-sm font-bold text-slate-900">
                  {pkg.price} EGP
                </span>
              </div>

              {/* ADDONS */}
              {addons.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {addons.map((a) => (
                    <div
                      key={a.id || a._id || a.name}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600">
                          {a?.image?.url ? (
                            <img
                              src={optimizedImageUrl(a.image.url, 500, 500)}
                              alt={a.name || 'صورة خدمة إضافية'}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}
                        </div>

                        <span className="text-sm text-slate-600">{a.name}</span>
                      </div>

                      <span className="shrink-0 text-sm font-medium text-slate-700">
                        {a.price} EGP
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TOTAL */}
              <div className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">الإجمالي</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      شامل جميع الخدمات المختارة
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold tracking-tight text-blue-700">
                      {total}
                    </span>
                    <span className="ml-1 text-sm font-bold text-blue-600">
                      EGP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ACTIONS */}
        <div className="border-t border-slate-100 bg-white px-6 py-5 md:px-8">
          <Button
            className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25"
            size="lg"
            onClick={onConfirm}
          >
            تأكيد الطلب
          </Button>
          <p className="mt-2 text-center text-xs text-slate-400">
            هتنتقل لخطوة الدفع بعد تأكيد طلبك.
          </p>
        </div>
      </div>
    </div>
  );
}
