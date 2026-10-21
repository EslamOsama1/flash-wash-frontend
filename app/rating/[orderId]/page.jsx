'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Rating from '@/components/customer/Rating';
import { Loader } from '@/components/shared/Loader';
import {
    CarFront,
    Sparkles,
    Camera,
    ShieldCheck,
    CheckCircle2,
    Star,
    Droplets,
    Heart,
} from 'lucide-react';

export default function RatingPage({ params }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadOrder = async () => {
            try {
                const resolvedParams = await params;
                const id = resolvedParams.orderId;

                if (!id) {
                    throw new Error('رقم الطلب غير موجود');
                }

                if (isMounted) {
                    setOrderId(id);
                }

                const response = await api.get(`/Orders/${id}`);
                const fetchedOrder = response?.data?.washOrder;

                if (!fetchedOrder) {
                    throw new Error('لم يتم العثور على الطلب');
                }

                if (fetchedOrder.status !== 'completed') {
                    throw new Error(
                        'يمكن تقييم الطلب بعد اكتمال الغسيل فقط'
                    );
                }

                if (fetchedOrder.rating) {
                    if (isMounted) {
                        setSubmitted(true);
                    }
                    return;
                }

                if (isMounted) {
                    setOrder(fetchedOrder);
                }
            } catch (err) {
                console.error('LOAD RATING ORDER ERROR:', err);

                if (isMounted) {
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        'تعذر تحميل بيانات الطلب'
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadOrder();

        return () => {
            isMounted = false;
        };
    }, [params]);

    if (loading) {
        return (
            <main
                dir="rtl"
                className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
            >
                <div className="rounded-3xl bg-white p-10 shadow-lg">
                    <Loader text="جاري تجهيز صور عربيتك..." />
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main
                dir="rtl"
                className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10"
            >
                <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <CarFront size={32} />
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-slate-900">
                        تعذر فتح صفحة التقييم
                    </h1>

                    <p className="mt-3 leading-7 text-slate-500">
                        {error}
                    </p>

                    <p className="mt-5 text-sm text-slate-400">
                        لو استمرت المشكلة، تواصل مع Flash Wash.
                    </p>
                </div>
            </main>
        );
    }

    if (submitted) {
        return (
            <main
                dir="rtl"
                className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-slate-50 to-white px-4 py-10"
            >
                <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white text-center shadow-2xl shadow-blue-900/5">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-12 text-white">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-lg">
                            <CheckCircle2 size={52} />
                        </div>

                        <h1 className="mt-6 text-3xl font-extrabold">
                            شكرًا لتقييمك!
                        </h1>

                        <p className="mt-3 leading-7 text-blue-100">
                            مبسوطين إنك شاركتنا رأيك.
                        </p>
                    </div>

                    <div className="px-8 py-8">
                        <div className="flex justify-center gap-2 text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={28}
                                    fill="currentColor"
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>

                        <p className="mt-5 leading-7 text-slate-600">
                            رأيك بيساعدنا نطوّر خدماتنا ونقدّم لك تجربة أفضل في كل زيارة.
                        </p>

                        <div className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 py-4 text-sm font-semibold text-blue-700">
                            <Heart size={19} />
                            شكرًا لثقتك في Flash Wash
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const beforeImages = order?.beforePhotos?.slice(0, 2) || [];
    const afterImages = order?.afterPhotos?.slice(0, 2) || [];

    return (
        <main
            dir="rtl"
            className="min-h-screen overflow-hidden bg-slate-50 text-slate-900"
        >
            {/* Decorative background */}
            <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-80 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />

            <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="mb-8 overflow-hidden rounded-3xl border border-white/15 bg-white/10 px-6 py-7 text-white shadow-xl backdrop-blur-sm sm:px-8">
                    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg">
                            <CarFront size={36} strokeWidth={1.8} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-center gap-2 sm:justify-start">
                                <Sparkles size={17} className="text-amber-300" />

                                <p className="text-sm font-semibold tracking-wide text-blue-100">
                                    FLASH WASH EXPERIENCE
                                </p>
                            </div>

                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                عربيتك رجعت تلمع ✨
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                                شكرًا لاختيارك Flash Wash. شوف الفرق بنفسك وشاركنا رأيك في تجربتك.
                            </p>
                        </div>

                        <div className="hidden shrink-0 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center sm:block">
                            <Droplets
                                size={25}
                                className="mx-auto text-blue-100"
                            />

                            <p className="mt-2 text-xs font-semibold text-white">
                                Clean & Shine
                            </p>
                        </div>
                    </div>
                </header>

                {/* Photo comparison */}
                <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">
                    <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Camera size={23} />
                            </div>

                            <div>
                                <h2 className="text-xl font-extrabold sm:text-2xl">
                                    شوف الفرق بنفسك
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    عربيتك قبل الغسيل وبعده
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-2">
                        {/* Before photos */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
                                <div>
                                    <h3 className="font-bold text-slate-800">
                                        قبل الغسيل
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        حالة العربية قبل الخدمة
                                    </p>
                                </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                    BEFORE
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-3">
                                {beforeImages.map((image, index) => (
                                    <div
                                        key={`before-${index}`}
                                        className="group relative overflow-hidden rounded-xl bg-slate-200"
                                    >
                                        <img
                                            src={image}
                                            alt={`العربية قبل الغسيل - صورة ${index + 1}`}
                                            loading="lazy"
                                            className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                            الصورة {index + 1}
                                        </div>
                                    </div>
                                ))}

                                {beforeImages.length === 0 && (
                                    <div className="col-span-2 flex min-h-48 items-center justify-center rounded-xl bg-white px-4 text-sm text-slate-500">
                                        لا توجد صور قبل الغسيل.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* After photos */}
                        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/40">
                            <div className="flex items-center justify-between border-b border-emerald-100 bg-white px-4 py-4">
                                <div>
                                    <h3 className="font-bold text-emerald-800">
                                        بعد الغسيل
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        النتيجة بعد انتهاء الخدمة
                                    </p>
                                </div>

                                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                    AFTER
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-3">
                                {afterImages.map((image, index) => (
                                    <div
                                        key={`after-${index}`}
                                        className="group relative overflow-hidden rounded-xl bg-slate-200"
                                    >
                                        <img
                                            src={image}
                                            alt={`العربية بعد الغسيل - صورة ${index + 1}`}
                                            loading="lazy"
                                            className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute bottom-2 right-2 rounded-lg bg-emerald-700/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                            الصورة {index + 1}
                                        </div>
                                    </div>
                                ))}

                                {afterImages.length === 0 && (
                                    <div className="col-span-2 flex min-h-48 items-center justify-center rounded-xl bg-white px-4 text-sm text-slate-500">
                                        لا توجد صور بعد الغسيل.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mx-5 mb-5 flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-4 sm:mx-7 sm:mb-7">
                        <ShieldCheck
                            size={23}
                            className="shrink-0 text-blue-600"
                        />

                        <p className="text-sm leading-6 text-blue-900">
                            بنهتم بأدق التفاصيل علشان نقدم لك أفضل تجربة غسيل ممكنة.
                        </p>
                    </div>
                </section>

                {/* Rating */}
                <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">
                    <div className="bg-gradient-to-l from-slate-900 to-slate-800 px-6 py-7 text-center text-white sm:px-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                            <Star
                                size={29}
                                fill="currentColor"
                                className="text-amber-400"
                            />
                        </div>

                        <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                            رأيك يفرق معانا
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                            ساعدنا نكون أفضل. قيّم تجربتك مع Flash Wash، وإحنا هنستفيد من رأيك.
                        </p>
                    </div>

                    <div className="p-2 sm:p-5">
                        <Rating
                            key={orderId}
                            orderId={orderId}
                            onComplete={() => setSubmitted(true)}
                        />
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-medium text-slate-500 shadow-sm sm:text-sm">
                        <ShieldCheck
                            size={17}
                            className="text-emerald-500"
                        />

                        <span>
                            شكرًا لثقتك في Flash Wash ❤️
                        </span>
                    </div>
                </footer>
            </div>
        </main>
    );
}