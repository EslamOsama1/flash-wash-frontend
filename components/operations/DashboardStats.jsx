'use client';

import {
  AlertCircle,
  Clock,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  List,
  TrendingUp,
} from 'lucide-react';

export default function DashboardStats({ stats = {} }) {
  const cards = [
    {
      label: 'يحتاج تدخل',
      value: stats.needsAttention || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      iconBg: 'bg-red-100',
    },
    {
      label: 'في الانتظار',
      value: stats.waiting || 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'جاري الغسيل',
      value: stats.washing || 0,
      icon: Droplets,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      iconBg: 'bg-cyan-100',
    },
    {
      label: 'متأخر',
      value: stats.late || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      iconBg: 'bg-orange-100',
    },
    {
      label: 'مكتمل',
      value: stats.completed || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'معلق',
      value: stats.pending || 0,
      icon: List,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6" >
      {
        cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`
              group relative overflow-hidden rounded-2xl border
              ${card.border} ${card.bg}
              p-5
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-lg
            `}
            >
              {/* Decorative background */}
              <div
                className={`
                pointer-events-none absolute -right-8 -top-8
                h-24 w-24 rounded-full
                ${card.iconBg}
                opacity-60
                transition-transform duration-300
                group-hover:scale-125
              `}
              />

              <div className="relative flex flex-col">
                {/* Icon */}
                <div
                  className={`
                  mb-4 flex h-11 w-11 items-center justify-center
                  rounded-xl ${card.iconBg}
                `}
                >
                  <Icon
                    size={22}
                    strokeWidth={2.2}
                    className={card.color}
                  />
                </div>

                {/* Label */}
                <p className="text-sm font-medium text-slate-500" >
                  {card.label}
                </p >

                {/* Value */}
                < div className="mt-1 flex items-end justify-between" >
                  <span
                    className={`
                    text-3xl font-extrabold tracking-tight
                    ${card.color}
                  `}
                  >
                    {card.value}
                  </span>

                  <TrendingUp
                    size={16}
                    className={`${card.color} opacity-0 transition-opacity duration-300 group-hover:opacity-40`}
                  />
                </div >
              </div >
            </div >
          );
        })
      }
    </div >
  );
}