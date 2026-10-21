'use client';

import { useEffect, useState } from 'react';
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  CreditCard,
  Image as ImageIcon,
  ShieldCheck,
  Copy,
  X,
} from 'lucide-react';

import { Button } from '@/components/shared/Button';
import { api } from '@/lib/api';

// =====================================================
// COPY
// =====================================================

const copyToClipboard = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// =====================================================
// COMPONENT
// =====================================================

export default function PaymentUpload({ order, onComplete, onBack }) {
  const [method, setMethod] = useState('vodafone_cash');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // =====================================================
  // FILE
  // =====================================================
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const res = await api.get('/payment-settings');

        console.log('PAYMENT SETTINGS RESPONSE:', res.data);

        const settings = res?.data?.paymentSetting;

        console.log('PAYMENT SETTING OBJECT:', settings);
        console.log('VODAFONE NUMBER:', settings?.vodafoneCashNumber);
        console.log('INSTAPAY ACCOUNT:', settings?.instapayAccount);

        setPaymentSettings(settings);
      } catch (err) {
        console.error('Failed to fetch payment settings:', err);
        setError('Failed to load payment settings.');
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  console.log('CURRENT PAYMENT SETTINGS:', paymentSettings);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  // =====================================================
  // COPY PAYMENT DATA
  // =====================================================

  const handleCopy = async (value, type) => {
    const copiedSuccessfully = await copyToClipboard(value);

    if (copiedSuccessfully) {
      setCopied(type);

      setTimeout(() => {
        setCopied('');
      }, 2000);
    }
  };

  // =====================================================
  // SELECT PAYMENT METHOD
  // =====================================================

  const selectMethod = (selectedMethod) => {
    setMethod(selectedMethod);
    setError('');
  };

  // =====================================================
  // SUBMIT PAYMENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (method !== 'cash' && !file) {
      setError('Please upload a payment screenshot');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('paymentMethod', method);

      if (method !== 'cash') {
        formData.append('photo', file);
      }

      const orderId = order.id || order._id;

      const res = await api.post(
        `/Orders/${orderId}/payment`,
        formData
      );

      const updatedOrder = res?.data?.washOrder;

      if (!updatedOrder?._id) {
        throw new Error('Backend did not return a valid wash order');
      }

      setSuccess(
        method === 'cash'
          ? 'Cash payment request submitted successfully. Waiting for manager approval.'
          : 'Payment uploaded successfully! Pending manual review if needed.'
      );

      setTimeout(() => {
        onComplete(updatedOrder);
      }, 2000);
    } catch (err) {
      console.error('PAYMENT ERROR:', err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit payment.'
      );

      setLoading(false);
    }
  };

  const total = order?.totalPrice ?? order?.totalAmount ?? 0;

  const vodafoneCashNumber =
    paymentSettings?.vodafoneCashNumber || '';

  const instapayAccount =
    paymentSettings?.instapayAccount || '';

  // =====================================================
  // SUCCESS
  // =====================================================

  if (success) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-xl items-center justify-center rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              size={46}
              className="text-emerald-500"
              strokeWidth={2}
            />
          </div>

          <p className="mb-2 text-sm font-semibold text-blue-600">
            Flash Wash
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {method === 'cash' ? 'Cash Request Submitted' : 'Payment Submitted'}
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
            {success}
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            {method === 'cash'
              ? 'Waiting for manager approval'
              : 'Your payment is being verified'}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div dir="rtl" className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
      {/* ================= HEADER ================= */}

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-7 text-white md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <CreditCard size={24} />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-blue-100">
              Flash Wash
            </p>

            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              الدفع
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              اختار طريقة الدفع للمتابعة.
            </p>
          </div>
        </div>
      </div>

      {/* ================= BACK BUTTON ================= */}

      <div className="px-6 pt-5 md:px-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          الرجوع إلى ملخص الطلب
        </button>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="flex min-h-0 flex-1 flex-col">
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-7 md:px-8">
            {/* ================= TOTAL ================= */}

            <div className="mb-7 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    المبلغ الإجمالي
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    المبلغ المطلوب لهذا الطلب
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

            {/* ================= PAYMENT METHOD ================= */}

            <section>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  طريقة الدفع
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  اختار طريقة الدفع المناسبة.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* ================= VODAFONE CASH ================= */}

                <button
                  type="button"
                  onClick={() => selectMethod('vodafone_cash')}
                  className={`
                    relative overflow-hidden rounded-2xl border-2 p-5 text-left
                    transition-all duration-200
                    ${method === 'vodafone_cash'
                      ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }
                  `}
                >
                  {method === 'vodafone_cash' && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <CheckCircle2 size={15} />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                        ${method === 'vodafone_cash'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                        }
                      `}
                    >
                      <Smartphone size={23} />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        Vodafone Cash
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        محفظة إلكترونية
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium text-slate-500">
                      حوّل المبلغ إلى
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="break-all font-bold text-slate-900">
                        {settingsLoading ? 'جاري التحميل...' : vodafoneCashNumber}
                      </span>

                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(vodafoneCashNumber, 'vodafone');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            handleCopy(vodafoneCashNumber, 'vodafone');
                          }
                        }}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-200"
                      >
                        <Copy size={14} />
                        {copied === 'vodafone' ? 'تم النسخ' : 'نسخ'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* ================= INSTAPAY ================= */}

                <button
                  type="button"
                  onClick={() => selectMethod('instapay')}
                  className={`
                    relative overflow-hidden rounded-2xl border-2 p-5 text-left
                    transition-all duration-200
                    ${method === 'instapay'
                      ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }
                  `}
                >
                  {method === 'instapay' && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <CheckCircle2 size={15} />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                        ${method === 'instapay'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                        }
                      `}
                    >
                      <CreditCard size={23} />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        InstaPay
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        تحويل بنكي فوري
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium text-slate-500">
                      حوّل المبلغ إلى
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="break-all font-bold text-slate-900">
                        {settingsLoading ? 'Loading...' : instapayAccount}
                      </span>

                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(instapayAccount, 'instapay');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            handleCopy(instapayAccount, 'instapay');
                          }
                        }}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-200"
                      >
                        <Copy size={14} />
                        {copied === 'instapay' ? 'Copied' : 'Copy'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* ================= CASH ================= */}

                <button
                  type="button"
                  onClick={() => selectMethod('cash')}
                  className={`
                    relative overflow-hidden rounded-2xl border-2 p-5 text-left
                    transition-all duration-200
                    ${method === 'cash'
                      ? 'border-green-600 bg-green-50 shadow-md shadow-green-100'
                      : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-sm'
                    }
                  `}
                >
                  {method === 'cash' && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                      <CheckCircle2 size={15} />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                        ${method === 'cash'
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                        }
                      `}
                    >
                      <span className="text-2xl">💵</span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        الدفع النقدي
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        الدفع في المغسلة
                      </p>
                    </div>
                  </div>

                  {method === 'cash' && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-white p-3">
                      <p className="text-sm font-semibold text-green-700">
                        يتطلب موافقة المدير
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        سيُراجع المدير طلب الدفع النقدي قبل إضافة طلبك إلى قائمة الانتظار.
                      </p>
                    </div>
                  )}
                </button>
              </div>
            </section>

            {/* ================= UPLOAD ================= */}

            {method !== 'cash' && (
              <section className="mt-7">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    صورة إيصال الدفع
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    ارفع صورة واضحة لإيصال الدفع.
                  </p>
                </div>

                {!file ? (
                  <label className="group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 transition-all hover:border-blue-400 hover:bg-blue-50/50">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition-colors group-hover:text-blue-600">
                      <Upload size={25} />
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      اضغط لرفع صورة الإيصال
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      PNG أو JPG أو JPEG
                    </p>

                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <ImageIcon size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {file.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            تم اختيار صورة إيصال الدفع
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeFile}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition-colors hover:text-red-500"
                        aria-label="حذف الملف"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ================= ERROR ================= */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* ================= SECURITY ================= */}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck size={15} className="text-emerald-500" />
              {method === 'cash'
                ? 'طلب الدفع النقدي الخاص بك سيتم مراجعته بأمان.'
                : 'يتم التحقق من إيصال الدفع الخاص بك بأمان.'}
            </div>
          </div>

          {/* ================= SUBMIT ================= */}

          <div className="border-t border-slate-100 bg-white px-6 py-5 md:px-8">
            <Button
              type="submit"
              className="group w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25"
              size="lg"
              isLoading={loading}
            >
              {method === 'cash' ? 'طلب الدفع النقدي' : 'تأكيد الدفع'}

              {!loading && (
                <ArrowRight
                  size={19}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
