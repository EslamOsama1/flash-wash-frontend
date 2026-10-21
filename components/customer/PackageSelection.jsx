'use client';

import { useState, useEffect } from 'react';
import {
  Check,
  ArrowLeft,
  Car,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';

import { Button } from '@/components/shared/Button';
import { api } from '@/lib/api';
import { Loader } from '@/components/shared/Loader';

const FALLBACK_PACKAGES = [
  {
    id: 'base',
    name: 'الباقة الأساسية',
    price: 50,
    description: 'غسيل وتجفيف السيارة من الخارج.'
  },
  {
    id: 'premium',
    name: 'الباقة المميزة',
    price: 100,
    description: 'غسيل خارجي وتنظيف داخلي بالمكنسة وشمع.'
  }
];

const FALLBACK_ADDONS = [
  {
    id: 'engine',
    name: 'تنظيف المحرك',
    price: 30
  },
  {
    id: 'wax',
    name: 'Wax',
    price: 25
  },
  {
    id: 'interior',
    name: 'تنظيف داخلي عميق',
    price: 40
  }
];

export default function PackageSelection({
  onBack,
  onSelect,
  initialPackage,
  initialAddons = []
}) {
  const [packages, setPackages] = useState([]);
  const [addonsList, setAddonsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPkg, setSelectedPkg] = useState(
    initialPackage || null
  );

  const [selectedAddons, setSelectedAddons] = useState(
    initialAddons
  );

  useEffect(() => {
    api.get('/packages')
      .then((response) => {
        const allServices = response?.data?.packages || [];

        const basePackages = allServices.filter(
          item => item.type === 'base'
        );

        const addons = allServices.filter(
          item => item.type === 'add_on'
        );

        setPackages(
          basePackages.length > 0
            ? basePackages
            : FALLBACK_PACKAGES
        );

        setAddonsList(
          addons.length > 0
            ? addons
            : FALLBACK_ADDONS
        );

        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load packages:', error);

        setPackages(FALLBACK_PACKAGES);
        setAddonsList(FALLBACK_ADDONS);

        setLoading(false);
      });
  }, []);

  const isSameItem = (a, b) => {
    if (!a || !b) return false;

    if (a._id && b._id) {
      return a._id === b._id;
    }

    if (a.id && b.id) {
      return a.id === b.id;
    }

    return a.name === b.name;
  };

  const toggleAddon = (addon) => {
    const isSelected = selectedAddons.some(
      selected => isSameItem(selected, addon)
    );

    if (isSelected) {
      setSelectedAddons(prev =>
        prev.filter(
          selected => !isSameItem(selected, addon)
        )
      );
    } else {
      setSelectedAddons(prev => [
        ...prev,
        addon
      ]);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-12" >
        <Loader text="جاري تحميل الباقات..." />
      </div >
    );
  }

  return (
    <div dir="rtl" className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100" >

      {/* ================= HEADER ================= */}
      < div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-7 text-white md:px-8" >

        <div className="flex items-center gap-4" >

          <button
            onClick={onBack}
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20"
            aria-label="رجوع"
          >
            <ArrowLeft size={21} className="rotate-180" />
          </button >

          <div>
            <p className="mb-1 text-sm font-medium text-blue-100">
              فلاش ووش
            </p>

            <h2 className="text-2xl font-bold tracking-tight md:text-3xl" >
              اختار خدمة الغسيل
            </h2 >

            <p className="mt-1 text-sm text-blue-100" >
              اختار الباقة المناسبة لسيارتك، وأضف أي خدمات إضافية لو حابب.
            </p >
          </div >

        </div >
      </div >

      {/* ================= CONTENT ================= */}
      < div className="flex min-h-0 flex-1 flex-col" >

        <div className="flex-1 overflow-y-auto px-6 py-7 md:px-8" >

          {/* ================= PACKAGES ================= */}
          < section >

            <div className="mb-4 flex items-center justify-between" >
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  باقات الغسيل
                </h3>

                <p className="mt-1 text-sm text-slate-500" >
                  اختار الخدمة المناسبة لسيارتك.
                </p >
              </div >

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex" >
                <Car size={20} />
              </div >
            </div >

            <div className="grid gap-4 sm:grid-cols-2" >

              {
                packages.map(pkg => {
                  const isSelected =
                    selectedPkg
                      ? isSameItem(selectedPkg, pkg)
                      : false;

                  return (
                    <div
                      key={pkg._id || pkg.id || pkg.name}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`
                      group relative cursor-pointer overflow-hidden rounded-2xl
                      border-2 p-5 transition-all duration-200
                      ${isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-lg shadow-blue-100'
                          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md'
                        }
                    `}
                    >

                      {/* Selected badge */}
                      {isSelected && (
                        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm" >
                          <Check size={16} strokeWidth={3} />
                        </div>
                      )
                      }

                      <div className="mb-5 flex items-start gap-4" >

                        <div
                          className={`
                          flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl
                          transition-colors
                          ${isSelected
                              ? 'bg-blue-100 ring-2 ring-blue-500'
                              : 'bg-slate-100'
                            }
                        `}
                        >
                          {pkg.image?.url ? (
                            <img
                              src={pkg.image.url.replace(
                                '/upload/',
                                '/upload/f_auto,q_auto:best,w_700,h_700,c_limit/'
                              )}
                              alt={pkg.name}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Car size={25} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                          )}
                        </div>

                        <div className="min-w-0 pr-8" >
                          <h4 className="text-base font-bold text-slate-900" >
                            {pkg.name}
                          </h4 >

                          {
                            pkg.description && (
                              <p className="mt-1.5 text-sm leading-5 text-slate-500">
                                {pkg.description}
                              </p>
                            )
                          }
                        </div >

                      </div >

                      <div className="flex items-end justify-between border-t border-slate-200/80 pt-4" >

                        <div>
                          {pkg.duration && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500" >
                              <Clock size={14} />
                              <span>{pkg.duration} دقيقة</span>
                            </div>
                          )
                          }
                        </div >

                        <div className="text-left" >
                          <span className="text-2xl font-extrabold tracking-tight text-blue-600" >
                            {pkg.price}
                          </span >

                          <span className="ml-1 text-xs font-semibold text-slate-500" >
                            جنيه
                          </span >
                        </div >

                      </div >

                    </div >
                  );
                })}

            </div >
          </section >

          {/* ================= ADDONS ================= */}
          < section className="mt-8" >

            <div className="mb-4 flex items-center justify-between" >

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    الخدمات الإضافية
                  </h3>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500" >
                    اختياري
                  </span >
                </div >

                <p className="mt-1 text-sm text-slate-500" >
                  أضف خدمات إضافية لطلب الغسيل.
                </p >
              </div >

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex" >
                <Sparkles size={20} />
              </div >

            </div >

            <div className="space-y-3" >

              {
                addonsList.map(addon => {
                  const isSelected = selectedAddons.some(
                    selected => isSameItem(selected, addon)
                  );

                  return (
                    <div
                      key={addon._id || addon.id || addon.name}
                      onClick={() => toggleAddon(addon)}
                      className={`
                      group flex cursor-pointer items-center justify-between
                      rounded-2xl border-2 p-4 transition-all duration-200
                      ${isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                        }
                    `}
                    >

                      <div className="flex min-w-0 items-center gap-4">

                        {/* Checkbox */}
                        <div
                          className={`
                          flex h-6 w-6 shrink-0 items-center justify-center rounded-lg
                          border-2 transition-all
                          ${isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white group-hover:border-blue-400'
                            }
                        `}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              strokeWidth={3}
                            />
                          )}
                        </div>

                        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-600">
                          {addon.image?.url ? (
                            <img
                              src={addon.image.url.replace(
                                '/upload/',
                                '/upload/f_auto,q_auto:best,w_700,h_700,c_limit/'
                              )}
                              alt={addon.name}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Sparkles size={20} />
                          )}
                        </div>

                        <div className="min-w-0" >
                          <span className="block text-sm font-bold text-slate-900" >
                            {addon.name}
                          </span >

                          <span className="mt-0.5 block text-xs text-slate-500" >
                            خدمة إضافية
                          </span >
                        </div >

                      </div >

                      <span
                        className={`
                        ml-4 shrink-0 text-sm font-bold
                        ${isSelected
                            ? 'text-blue-600'
                            : 'text-slate-700'
                          }
                      `}
                      >
                        +{addon.price} جنيه
                      </span>

                    </div >
                  );
                })}

            </div >
          </section >

          {/* Trust indicator */}
          < div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500" >
            <ShieldCheck size={16} className="text-blue-600" />
            <span>خدمة احترافية للعناية بسيارتك</span>
          </div >

        </div >

        {/* ================= CONTINUE ================= */}
        < div className="border-t border-slate-100 bg-white px-6 py-5 md:px-8" >

          <Button
            className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedPkg}
            onClick={() =>
              onSelect(
                selectedPkg,
                selectedAddons
              )
            }
          >
            متابعة
          </Button>

          {
            !selectedPkg && (
              <p className="mt-2 text-center text-xs text-slate-400" >
                من فضلك اختار باقة غسيل للمتابعة.
              </p >
            )
          }

        </div >

      </div >
    </div >
  );
}