'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Car,
  Clock,
  Package,
  Sparkles,
  ArrowRight,
  Timer,
} from 'lucide-react';

import { Button } from '@/components/shared/Button';
import PhotoUpload from './PhotoUpload';

export default function WaitingCars({ cars, onStart }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (selectedOrder) {
    return (
      <PhotoUpload
        order={selectedOrder}
        action="start"
        onCancel={() => setSelectedOrder(null)}
        onSuccess={(updatedOrder) => onStart(updatedOrder)}
      />
    );
  }

  if (cars.length === 0) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center rounded-3xl bg-white px-6 text-center shadow-sm ring-1 ring-slate-100">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Car size={38} />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          No Cars Waiting
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          There are currently no cars waiting for a wash.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-400">
          <Clock size={15} />
          <span>Take a short break!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Worker Dashboard
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Waiting Cars
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Cars ready to start their wash.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Car size={24} />
        </div>
      </div>

      {/* ================= COUNTER ================= */}

      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Timer size={19} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">
            Cars in queue
          </p>

          <p className="text-lg font-bold text-slate-900">
            {cars.length}{' '}
            {cars.length === 1 ? 'car' : 'cars'}
          </p>
        </div>
      </div>

      {/* ================= CARS ================= */}

      <div className="space-y-4">
        {cars.map((car) => {

          // =========================
          // Package Name
          // =========================

          const packageName =
            car.package?.name ||
            car.package ||
            car.packageId?.name ||
            car.packageId ||
            'Package';

          // =========================
          // Add-ons
          // =========================

          const addons =
            Array.isArray(car.addOns)
              ? car.addOns
              : Array.isArray(car.addons)
                ? car.addons
                : [];

          const addonIds =
            Array.isArray(car.addonIds)
              ? car.addonIds
              : [];

          const addonsCount =
            addons.length || addonIds.length || 0;

          const addonNames = addons
            .map((addon) => {
              if (typeof addon === 'string') {
                return addon;
              }

              return addon?.name;
            })
            .filter(Boolean);

          return (
            <div
              key={car.id || car._id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              {/* Card Header */}

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  {/* Car */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Car size={23} />
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {car.car}
                      </h3>

                      <span className="mt-1 inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold tracking-wider text-slate-600">
                        {car.plateNumber}
                      </span>

                    </div>

                  </div>

                  {/* Details */}

                  <div className="mt-5 flex flex-wrap gap-2">

                    {/* Package */}

                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">

                      <Package
                        size={14}
                        className="text-blue-600"
                      />

                      <span>
                        {packageName?.name || packageName}
                      </span>

                    </div>

                    {/* Add-ons */}

                    {addonsCount > 0 && (
                      <div className="flex max-w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">

                        <Sparkles
                          size={14}
                          className="shrink-0 text-blue-600"
                        />

                        {addonNames.length > 0 ? (
                          <span className="break-words">
                            {addonNames.join(' • ')}
                          </span>
                        ) : (
                          <span>
                            {addonsCount}{' '}
                            {addonsCount === 1
                              ? 'Add-on'
                              : 'Add-ons'}
                          </span>
                        )}

                      </div>
                    )}

                    {/* Waiting Time */}

                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">

                      <Clock size={14} />

                      <span>
                        Waiting{' '}
                        {formatDistanceToNow(
                          new Date(
                            car.createdAt ||
                            Date.now()
                          )
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Start */}

                <Button
                  onClick={() =>
                    setSelectedOrder(car)
                  }
                  className="group/btn w-full shrink-0 rounded-xl bg-blue-600 py-3 font-semibold shadow-md shadow-blue-600/15 transition-all hover:bg-blue-700 hover:shadow-lg sm:w-auto"
                >
                  ابدأ الغسيل

                  <ArrowRight
                    size={18}
                    className="ml-2 transition-transform group-hover/btn:translate-x-1"
                  />
                </Button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}