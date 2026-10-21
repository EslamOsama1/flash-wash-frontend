'use client';

import { formatDistanceToNow } from 'date-fns';
import { arEG } from 'date-fns/locale';
import { Trash2, Clock3, CarFront, Droplets } from 'lucide-react';

export default function OrdersTable({
  title,
  orders,
  type,
  onRemove,
}) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" >
      {/* Header */}
      < div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5" >
        <div className="flex items-center gap-3" >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600" >
            {type === 'washing' ? (
              <Droplets size={20} />
            ) : (
              <CarFront size={20} />
            )
            }
          </div >

          <div>
            <h2 className="text-base font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-0.5 text-xs text-slate-400" >
              {orders.length} {orders.length === 1 ? 'طلب' : 'طلبات'}
            </p >
          </div >
        </div >

        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600" >
          {orders.length}
        </span >
      </div >

      {/* Table */}
      < div className="flex-1 overflow-hidden" >
        <table className="w-full table-fixed text-right text-sm" >
          <thead className="border-b border-slate-100 bg-slate-50/70" >
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">
                السيارة
              </th>

              <th className="px-6 py-4 text-xs font-bold text-slate-500" >
                الباقة
              </th >

              <th className="px-6 py-4 text-xs font-bold text-slate-500" >
                العامل
              </th >
              {type !== 'washing' && (
                <th className="px-6 py-4 text-xs font-bold text-slate-500" >
                  المبلغ
                </th >
              )}

              <th className="px-6 py-4 text-xs font-bold text-slate-500" >
                {type === 'washing' ? 'وقت البدء' : 'منذ'}
              </th >

              {type === 'washing' && (
                <th className="px-6 py-4 text-xs font-bold text-slate-500" >
                  الحالة
                </th >
              )}

              {
                type === 'pending' && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500" >
                    إجراء
                  </th >
                )
              }
            </tr >
          </thead >

          <tbody className="divide-y divide-slate-100" >
            {
              orders.map((order) => {
                const id = order.id || order._id;

                let isLate = false;
                let timeLabel = '';

                if (type === 'washing' && order.startedAt) {
                  const start = new Date(order.startedAt);
                  const diffMinutes =
                    (new Date() - start) / 1000 / 60;

                  if (diffMinutes > 45) {
                    isLate = true;
                  }

                  timeLabel = formatDistanceToNow(start, {
                    locale: arEG,
                  });
                } else if (order.createdAt) {
                  timeLabel = formatDistanceToNow(
                    new Date(order.createdAt),
                    {
                      locale: arEG,
                    }
                  );
                }

                const packageName =
                  order.package?.name ||
                  order.package ||
                  order.packageId?.name ||
                  order.packageId ||
                  '—';

                const total =
                  order.totalPrice ??
                  order.totalAmount ??
                  0;

                return (
                  <tr
                    key={id}
                    className={`
                    transition-colors
                    hover:bg-slate-50/70
                    ${isLate ? 'bg-red-50/50' : ''}
                  `}
                  >
                    {/* Car */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <CarFront size={19} />
                        </div>

                        <div>
                          <div className="font-bold text-slate-900">
                            {order.car || '—'}
                          </div>

                          <div className="mt-1 text-xs font-medium text-slate-400" >
                            {order.plateNumber || '—'}
                          </div >
                        </div >
                      </div >
                    </td >

                    {/* Package */}
                    < td className="px-6 py-5" >
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700" >
                        {packageName}
                      </span >
                    </td >

                    {/* Worker */}
                    < td className="px-6 py-5" >
                      {
                        order.worker ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              {order.worker.name || '—'}
                            </div>

                            <div className="mt-1 text-xs font-medium text-slate-400">
                              {order.worker.phone || '—'}
                            </div>
                          </div >
                        ) : (
                          <span className="text-xs font-medium text-slate-400" >
                            غير محدد
                          </span >
                        )}
                    </td >

                    {/* Price */}
                    {
                      type !== 'washing' && (
                        <td className="px-6 py-5" >
                          <span className="font-bold text-slate-900" >
                            {total}
                          </span >

                          <span className="mr-1 text-xs text-slate-400" >
                            ج.م
                          </span >
                        </td >
                      )
                    }

                    {/* Time */}
                    <td
                      className="px-6 py-5 text-slate-500"
                      dir="ltr"
                    >
                      <div className="flex items-center justify-end gap-2" >
                        <Clock3
                          size={15}
                          className="text-slate-400"
                        />

                        <span>{timeLabel || '—'}</span>
                      </div >
                    </td >

                    {/* Washing status */}
                    {
                      type === 'washing' && (
                        <td className="px-6 py-5" >
                          {
                            isLate ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700" >
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                تأخير
                              </span >
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700" >
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
                                جاري
                              </span >
                            )
                          }
                        </td >
                      )}

                    {/* Pending action */}
                    {
                      type === 'pending' && (
                        <td className="px-6 py-5" >
                          <button
                            type="button"
                            onClick={() => onRemove?.(id)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={15} />
                            إزالة
                          </button >
                        </td >
                      )
                    }
                  </tr >
                );
              })}
          </tbody >
        </table >
      </div >
    </div >
  );
}