'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function Rating({ orderId, onComplete }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!rating) {
            setError('من فضلك اختر تقييمًا');
            return;
        }

        if (!orderId) {
            setError('رقم الطلب غير موجود');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await api.post(`/Orders/${orderId}/rating`, {
                rating,
                feedback,
            });

            console.log('RATING RESPONSE:', response);

            const updatedOrder = response?.data?.order;

            if (!updatedOrder) {
                throw new Error('استجابة التقييم غير صحيحة');
            }

            onComplete?.(updatedOrder);
        } catch (err) {
            console.error('SUBMIT RATING ERROR:', err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'تعذر إرسال التقييم'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div dir="rtl" className="mx-auto max-w-lg p-6">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">
                        إيه رأيك في تجربة غسيل سيارتك؟
                    </h2>

                    <p className="mt-2 text-slate-500">
                        قيّم تجربتك معانا
                    </p>
                </div>

                <div className="mt-8 flex justify-center gap-2" dir="ltr">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hoveredRating || rating);

                        return (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onFocus={() => setHoveredRating(star)}
                                onBlur={() => setHoveredRating(0)}
                                aria-label={`${star} من 5 نجوم`}
                                aria-pressed={rating === star}
                                className={`text-4xl transition ${active ? 'text-yellow-400' : 'text-slate-300'
                                    }`}
                            >
                                ★
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6">
                    <label
                        htmlFor="rating-feedback"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        رأيك وملاحظاتك
                        <span className="mr-1 text-slate-400">(اختياري)</span>
                    </label>

                    <textarea
                        id="rating-feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="احكيلنا عن تجربتك..."
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-right text-slate-900 outline-none transition focus:border-slate-400"
                    />
                </div>

                {error && (
                    <p role="alert" className="mt-4 text-sm text-red-500">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !rating}
                    className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'جاري إرسال التقييم...' : 'إرسال التقييم'}
                </button>
            </div>
        </div>
    );
}
