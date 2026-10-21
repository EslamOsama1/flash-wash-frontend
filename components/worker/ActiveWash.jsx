'use client';

import { useState, useEffect } from 'react';
import {
  Droplets,
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/shared/Button';
import PhotoUpload from './PhotoUpload';

export default function ActiveWash({ order, onFinish }) {
  const [finishing, setFinishing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startedAt = order?.startedAt
      ? new Date(order.startedAt).getTime()
      : Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      setElapsedSeconds(Math.max(0, elapsed));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order?.startedAt]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return [
      hours > 0
        ? String(hours).padStart(2, '0')
        : null,

      String(minutes).padStart(2, '0'),

      String(seconds).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  if (finishing) {
    return (
      <PhotoUpload
        order={order}
        action="finish"
        onCancel={() => setFinishing(false)}
        onSuccess={onFinish}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">

      {/* HEADER */}

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-7 text-white md:px-8">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Droplets size={25} />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-blue-100">
              Flash Wash
            </p>

            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Washing in Progress
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              The car is currently being washed.
            </p>
          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div className="px-6 py-8 md:px-8">

        {/* CAR INFORMATION */}

        <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Car size={24} />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Vehicle
              </p>

              <h3 className="mt-1 truncate text-xl font-bold text-slate-900">
                {order.car}
              </h3>

              <span className="mt-1.5 inline-block rounded-lg bg-white px-3 py-1 text-sm font-bold tracking-wider text-slate-700 shadow-sm ring-1 ring-slate-200">
                {order.plateNumber}
              </span>

            </div>

          </div>

        </div>

        {/* TIMER */}

        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-7 text-center">

          <div className="absolute -right-5 -top-5 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100/60">
            <Droplets
              size={38}
              className="text-blue-300"
            />
          </div>

          <div className="relative">

            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">
              <Clock size={17} />
              <span>Time Elapsed</span>
            </div>

            <p className="font-mono text-5xl font-extrabold tracking-wider text-blue-900 md:text-6xl">
              {formatTime(elapsedSeconds)}
            </p>

            <p className="mt-3 text-xs font-medium text-slate-400">
              Wash time in progress
            </p>

          </div>

        </div>

        {/* STATUS */}

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">

          <CheckCircle2 size={16} />

          <span>
            Washing is currently active
          </span>

        </div>

        {/* ACTION */}

        <Button
          onClick={() => setFinishing(true)}
          size="lg"
          className="mt-7 w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25"
        >
          إنهاء الغسيل
        </Button>

        {/* SECURITY */}

        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">

          <ShieldCheck
            size={15}
            className="text-emerald-500"
          />

          <span>
            Make sure the car is ready before finishing.
          </span>

        </div>

      </div>

    </div>
  );
}