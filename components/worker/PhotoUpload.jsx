'use client';

import { useState } from 'react';
import {
  Camera,
  X,
  Check,
  RefreshCw,
  Car,
  ShieldCheck,
  ImagePlus
} from 'lucide-react';

import { Button } from '@/components/shared/Button';
import { api } from '@/lib/api';

export default function PhotoUpload({
  order,
  action,
  onCancel,
  onSuccess,
}) {
  const [photos, setPhotos] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = (index, e) => {
    const file = e.target.files?.[0];

    if (file) {
      const newPhotos = [...photos];
      newPhotos[index] = file;
      setPhotos(newPhotos);
    }
  };

  const handleRetake = (index) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!photos[0] || !photos[1]) {
      setError('يرجى التقاط الصورتين أولاً');
      return;
    }

    const orderId = order?._id || order?.id;

    console.log('PHOTO UPLOAD ORDER:', order);
    console.log('PHOTO UPLOAD ORDER ID:', orderId);

    if (!orderId) {
      setError('Order ID غير موجود');
      setLoading(false);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('photos', photos[0]);
      formData.append('photos', photos[1]);

      const endpoint =
        action === 'start'
          ? `/Orders/${orderId}/start`
          : `/Orders/${orderId}/finish`;

      console.log('PHOTO ENDPOINT:', endpoint);

      const res = await api.post(endpoint, formData);

      console.log('PHOTO UPLOAD RESPONSE:', res);

      const updatedOrder = res?.data?.washOrder;

      console.log('START RESPONSE:', res);
      console.log('WASH ORDER:', updatedOrder);

      if (!updatedOrder?._id) {
        throw new Error(
          'Backend did not return a valid wash order'
        );
      }

      onSuccess(updatedOrder);

    } catch (err) {
      console.error('PHOTO UPLOAD ERROR:', err);

      setError(
        err.message || 'حدث خطأ أثناء رفع الصور'
      );

      setLoading(false);
    }
  };

  const isStarting = action === 'start';

  const title = isStarting
    ? 'التقاط صور قبل الغسيل'
    : 'التقاط صور بعد الغسيل';

  const description = isStarting
    ? 'التقط صورتين واضحتين للسيارة قبل بدء عملية الغسيل.'
    : 'التقط صورتين واضحتين للسيارة بعد الانتهاء من الغسيل.';

  const buttonLabel = isStarting
    ? 'بدء الغسيل'
    : 'إنهاء الغسيل';

  return (
    <div
      className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100"
      dir="rtl"
    >

      {/* ================= HEADER ================= */}

      < div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-7 text-white md:px-8" >

        <div className="flex items-center justify-between gap-4" >

          <div className="flex items-center gap-4" >

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10" >
              <Car size={25} />
            </div >

            <div>

              <p className="mb-1 text-sm font-medium text-blue-100">
                Flash Wash
              </p>

              <h2 className="text-xl font-bold tracking-tight md:text-2xl" >
                {title}
              </h2 >

            </div >

          </div >

          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Cancel"
          >
            <X size={21} />
          </button >

        </div >

      </div >

      {/* ================= CONTENT ================= */}

      < div className="flex min-h-0 flex-1 flex-col" >

        <div className="flex-1 overflow-y-auto px-6 py-7 md:px-8" >

          {/* Order information */}

          < div className="mb-7 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4" >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white" >
              <Camera size={19} />
            </div >

            <div>
              <p className="text-sm font-bold text-slate-900">
                {isStarting
                  ? 'Before Wash Photos'
                  : 'After Wash Photos'}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500" >
                {description}
              </p >
            </div >

          </div >

          {/* ================= PHOTOS ================= */}

          < div className="grid gap-5 md:grid-cols-2" >

            {
              [0, 1].map((index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >

                  <div className="mb-3 flex items-center justify-between" >

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        صورة {index + 1}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400" >
                        {
                          photos[index]
                            ? 'تم التقاط الصورة'
                            : 'الصورة مطلوبة'}
                      </p >
                    </div >

                    {
                      photos[index] && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check size={15} strokeWidth={3} />
                        </div>
                      )
                    }

                  </div >

                  {!photos[index] ? (

                    <label className="group flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-blue-400 hover:bg-blue-50/50" >

                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition-colors group-hover:text-blue-600" >
                        <Camera size={27} />
                      </div >

                      <span className="text-sm font-bold text-slate-700" >
                        افتح الكاميرا
                      </span >

                      <span className="mt-1 text-xs text-slate-400" >
                        التقاط صورة للسيارة
                      </span >

                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) =>
                          handleCapture(index, e)
                        }
                      />

                    </label >

                  ) : (

                    <div className="group relative h-52 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100" >

                      <img
                        src={URL.createObjectURL(photos[index])}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {/* Desktop overlay */}

                      < div className="absolute inset-0 hidden items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 md:flex" >

                        <button
                          type="button"
                          onClick={() =>
                            handleRetake(index)
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg transition-colors hover:bg-slate-100"
                          aria-label="Retake photo"
                        >
                          <RefreshCw size={19} />
                        </button >

                      </div >

                      {/* Mobile retake */}

                      < button
                        type="button"
                        onClick={() =>
                          handleRetake(index)
                        }
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-lg backdrop-blur md:hidden"
                      >
                        <RefreshCw size={15} />
                        إعادة
                      </button >

                      {/* Success */}

                      < div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg" >
                        <Check size={17} strokeWidth={3} />
                      </div >

                    </div >

                  )}

                </div >

              ))}

          </div >

          {/* ================= PROGRESS ================= */}

          < div className="mt-6" >

            <div className="mb-2 flex items-center justify-between" >

              <span className="text-xs font-semibold text-slate-500" >
                Photos
              </span >

              <span className="text-xs font-bold text-blue-600" >
                {photos.filter(Boolean).length} / 2
              </span >

            </div >

            <div className="h-2 overflow-hidden rounded-full bg-slate-100" >

              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${(photos.filter(Boolean).length / 2) * 100
                    }%`
                }}
              />

            </div >

          </div >

          {/* ================= ERROR ================= */}

          {
            error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600" >
                {error}
              </div >
            )
          }

          {/* Security */}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400" >

            <ShieldCheck
              size={15}
              className="text-emerald-500"
            />

            <span>
              الصور مرتبطة بطلب الغسيل الحالي
            </span>

          </div >

        </div >

        {/* ================= ACTION ================= */}

        < div className="border-t border-slate-100 bg-white px-6 py-5 md:px-8" >

          <Button
            className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-50"
            size="lg"
            onClick={handleSubmit}
            disabled={
              !photos[0] ||
              !photos[1] ||
              loading
            }
            isLoading={loading}
          >
            {buttonLabel}
          </Button>

          {
            (!photos[0] || !photos[1]) && (
              <p className="mt-2 text-center text-xs text-slate-400" >
                التقط الصورتين أولاً للمتابعة.
              </p >
            )
          }

        </div >

      </div >

    </div >
  );
}