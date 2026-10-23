'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { api } from '@/lib/api';
import {
  Car,
  Phone,
  User,
  CreditCard,
  ArrowRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { UserRound } from "lucide-react";

export default function CustomerForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || '',
    phone: initialData?.phone || '',
    car: initialData?.car || '',
    plateNumber: initialData?.plateNumber || '',
    helper: initialData?.helper?._id || initialData?.helper || '',
  });

  const [helpers, setHelpers] = useState([]);
  const [helpersLoading, setHelpersLoading] = useState(true);
  const [helpersError, setHelpersError] = useState('');
  const [isEditing, setIsEditing] = useState(!initialData);

  // =========================
  // Business Hours
  // =========================
  const [businessStatus, setBusinessStatus] = useState('loading');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [weeklyDaysOff, setWeeklyDaysOff] = useState([]);
  const [dayOffName, setDayOffName] = useState('');
  const [businessError, setBusinessError] = useState('');
  const [businessLogo, setBusinessLogo] = useState('/images/logo.png');

  const checkBusinessHours = async () => {
    try {
      setBusinessStatus('loading');
      setBusinessError('');

      const res = await api.get('/business-settings');

      const settings = res?.data?.settings;

      if (!settings) {
        throw new Error('Business settings not found');
      }

      const opening = settings.openingTime;
      const closing = settings.closingTime;

      if (settings.logo?.url) {
        setBusinessLogo(
          settings.logo.url.replace(
            '/upload/',
            '/upload/f_auto,q_auto,w_900,c_limit/'
          )
        );
      } else {
        setBusinessLogo('/images/logo.png');
      }
      const daysOff = Array.isArray(settings.weeklyDaysOff)
        ? settings.weeklyDaysOff
        : [];

      setOpeningTime(opening || '');
      setClosingTime(closing || '');
      setWeeklyDaysOff(daysOff);

      const now = new Date();

      const currentTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);

      const cairoWeekday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        weekday: 'long',
      }).format(now);

      const weekdayMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const cairoDayIndex = weekdayMap[cairoWeekday];

      if (daysOff.includes(cairoDayIndex)) {
        setDayOffName(cairoWeekday);
        setBusinessStatus('day-off');
        return;
      }

      setDayOffName('');

      let isOpen;

      if (opening < closing) {
        // Normal working hours
        isOpen =
          currentTime >= opening &&
          currentTime < closing;
      } else {
        // Overnight working hours
        isOpen =
          currentTime >= opening ||
          currentTime < closing;
      }

      setBusinessStatus(
        isOpen ? 'open' : 'closed'
      );
    } catch (err) {
      console.error(
        'CHECK BUSINESS HOURS ERROR:',
        err
      );

      setBusinessError(
        err?.message ||
        'Failed to check business hours'
      );

      setBusinessStatus('error');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchActiveHelpers = async () => {
      try {
        setHelpersLoading(true);
        setHelpersError('');

        const res = await api.get('/helpers/active');
        const activeHelpers = res?.data?.helpers || [];

        if (!isMounted) return;

        setHelpers(activeHelpers);

        setFormData((prev) => {
          const savedHelperId =
            typeof prev.helper === 'object'
              ? prev.helper?._id
              : prev.helper;

          const helperStillActive = activeHelpers.some(
            (helper) => helper._id === savedHelperId
          );

          if (savedHelperId && !helperStillActive) {
            const updatedFormData = {
              ...prev,
              helper: '',
            };

            try {
              const savedCustomerData = JSON.parse(
                localStorage.getItem('customerData') || 'null'
              );

              if (savedCustomerData) {
                savedCustomerData.helper = '';

                localStorage.setItem(
                  'customerData',
                  JSON.stringify(savedCustomerData)
                );
              }
            } catch (storageError) {
              console.error(
                'UPDATE SAVED CUSTOMER DATA ERROR:',
                storageError
              );
            }

            return updatedFormData;
          }

          return prev;
        });
      } catch (err) {
        console.error('FETCH ACTIVE HELPERS ERROR:', err);

        if (isMounted) {
          setHelpersError('تعذر تحميل قائمة المساعدين.');
        }
      } finally {
        if (isMounted) {
          setHelpersLoading(false);
        }
      }
    };

    fetchActiveHelpers();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    checkBusinessHours();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.phone ||
      !formData.car ||
      !formData.plateNumber
    ) {
      alert('Please fill all fields');
      return;
    }

    onSubmit(formData);
  };

  // =========================
  // Loading
  // =========================
  if (businessStatus === 'loading') {
    return (
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Clock size={28} />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Checking availability...
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while we check our working hours.
        </p>
      </div>
    );
  }

  // =========================
  // Error
  // =========================
  if (businessStatus === 'error') {
    return (
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Clock size={28} />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Unable to check availability
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {businessError}
        </p>

        <button
          type="button"
          onClick={checkBusinessHours}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  // =========================
  // WEEKLY DAY OFF
  // =========================
  if (businessStatus === 'day-off') {
    return (
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-10 text-center text-white md:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Clock size={32} />
          </div>

          <p className="mb-2 text-sm font-medium text-orange-100">
            Flash Wash
          </p>

          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Today is a Day Off
          </h2>

          <p className="mt-3 text-sm leading-6 text-orange-100">
            We are closed today because it is our weekly day off.
          </p>
        </div>

        <div className="space-y-5 p-6 md:p-8">

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center">
            <p className="text-sm font-medium text-amber-700">
              Weekly Day Off
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {dayOffName}
            </p>
          </div>

          <button
            type="button"
            onClick={checkBusinessHours}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <RefreshCw size={19} />
            Check Again
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // CLOSED
  // =========================
  if (businessStatus === 'closed') {
    return (
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 px-6 py-10 text-center text-white md:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <Clock size={32} />
          </div>

          <p className="mb-2 text-sm font-medium text-slate-300">
            Flash Wash
          </p>

          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            We're Currently Closed
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            We are currently outside our working hours.
            Please come back during our opening hours.
          </p>
        </div>

        <div className="space-y-5 p-6 md:p-8">

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
            <p className="text-sm font-medium text-slate-500">
              Working Hours
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {openingTime} - {closingTime}
            </p>
          </div>

          <button
            type="button"
            onClick={checkBusinessHours}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <RefreshCw size={19} />
            Check Again
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // Returning customer
  // =========================
  if (!isEditing && initialData) {
    return (
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">

        {/* Header */}
        <div
          dir="rtl"
          className="relative h-72 w-full overflow-hidden bg-slate-900 text-white sm:h-80"
        >
          {/* Logo Background */}
          <img
            src={businessLogo}
            alt="شعار فلاش ووش"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/logo.png';
            }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Text Over Image */}
          <div className="absolute inset-x-0 top-5 z-10 px-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              بياناتك وسيارتك
            </h2>

            <p className="mt-2 text-sm leading-7 text-white">
              من فضلك أدخل بياناتك وبيانات سيارتك للبدء.
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 p-6 md:p-8">

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="space-y-4">

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound size={18} />
                  </div>

                  <span className="text-sm text-slate-500">
                    الاسم
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {initialData?.customerName || "الاسم غير متوفر"}
                </span>
              </div>


              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Phone size={18} />
                  </div>

                  <span className="text-sm text-slate-500">
                    رقم الوتس
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {initialData.phone}
                </span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Car size={18} />
                  </div>

                  <span className="text-sm text-slate-500">
                    نوع السيارة
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {initialData.car}
                </span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CreditCard size={18} />
                  </div>

                  <span className="text-sm text-slate-500">
                    رقم اللوحة
                  </span>
                </div>

                <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold tracking-wider text-slate-900 shadow-sm ring-1 ring-slate-200">
                  {initialData.plateNumber}
                </span>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="w-full rounded-xl border-slate-200 py-3"
              onClick={() => setIsEditing(true)}
            >
              تعديل البيانات
            </Button>

            <Button
              className="w-full rounded-xl bg-blue-600 py-3 shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              onClick={() => onSubmit(initialData)}
            >
              متابعة
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // =========================
  // New customer form
  // =========================
  return (
    <form
      dir="rtl"
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100"
    >

      {/* Header */}
      <div className="relative h-72 w-full overflow-hidden bg-slate-900 sm:h-80">
        {/* Logo Background */}
        <img
          src={businessLogo}
          alt="Flash Wash"
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/logo.png';
          }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-950/40" />

        {/* Text Over Image */}
        <div className="absolute inset-x-0 top-5 z-10 px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            بياناتك وسيارتك
          </h2>

          <p className="mt-2 text-sm leading-7 text-white">
            من فضلك أدخل بياناتك وبيانات سيارتك للبدء.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5 p-6 md:p-8">

        {/* Full Name */}
        <div>
          <label
            htmlFor="customerName"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            الاسم
          </label>

          <div className="relative">
            <User
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="customerName"
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder="أدخل اسمك بالكامل"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            رقم الوتس
          </label>

          <div className="relative">
            <Phone
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>
        </div>

        {/* Car */}
        <div>
          <label
            htmlFor="car"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            نوع السياره
          </label>

          <div className="relative">
            <Car
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="car"
              type="text"
              name="car"
              value={formData.car}
              onChange={handleChange}
              className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder="Toyota Corolla"
              required
            />
          </div>
        </div>

        {/* Plate */}
        <div>
          <label
            htmlFor="plateNumber"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            رقم اللوحة
          </label>

          <div className="relative">
            <CreditCard
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="plateNumber"
              type="text"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder="أ ب ت 123"
              required
            />
          </div>
        </div>
        {/* Helper */}
        <div>
          <label
            htmlFor="helper"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            المساعد (اختياري)
          </label>

          <div className="relative">
            <UserRound
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="helper"
              name="helper"
              value={formData.helper}
              onChange={handleChange}
              disabled={helpersLoading}
              className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
            >
              <option value="">
                {helpersLoading
                  ? 'جاري تحميل المساعدين...'
                  : 'بدون مساعد'}
              </option>

              {helpers.map((helper) => (
                <option key={helper._id} value={helper._id}>
                  {helper.name}
                </option>
              ))}
            </select>
          </div>

          {helpersError && (
            <p className="mt-2 text-xs text-red-600">
              {helpersError}
            </p>
          )}

          {!helpersLoading && !helpersError && helpers.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">
              لا يوجد مساعدون نشطون حاليًا.
            </p>
          )}
        </div>
        {/* Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="group w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25"
          >
            متابعة

            <ArrowRight
              size={19}
              className="ml-2 transition-transform group-hover:translate-x-1"
            />
          </Button>
        </div>

        {/* Small hint */}
        <p className="text-center text-xs text-slate-400">
          تُستخدم بياناتك لإتمام طلب غسيل سيارتك فقط.
        </p>

      </div>
    </form>
  );
}