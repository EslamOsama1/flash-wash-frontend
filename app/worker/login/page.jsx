'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function WorkerLoginPage() {
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const res = await api.post('/workers/login', {
                phone,
                password,
            });

            console.log('WORKER LOGIN RESPONSE:', res);

            const token = res?.token;
            const worker = res?.data?.worker;

            if (!token) {
                throw new Error(
                    'Login succeeded but no token was returned'
                );
            }

            // Save worker token
            localStorage.setItem('workerToken', token);

            // Save worker data
            if (worker) {
                localStorage.setItem(
                    'worker',
                    JSON.stringify(worker)
                );
            }

            // Save token in cookie for middleware
            document.cookie = `workerToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

            // Go to worker dashboard
            router.push('/worker');

        } catch (err) {
            console.error('WORKER LOGIN ERROR:', err);

            setError(
                err?.message ||
                'Invalid phone number or password'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4" >
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg" >

                {/* HEADER */}
                < div className="mb-8 text-center" >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl text-white" >
                        👷
                    </div >

                    <h1 className="text-3xl font-bold text-slate-900" >
                        Worker Login
                    </h1 >

                    <p className="mt-2 text-sm text-slate-500" >
                        Sign in to access your work dashboard
                    </p >
                </div >

                {/* ERROR */}
                {
                    error && (
                        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" >
                            {error}
                        </div >
                    )
                }

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* PHONE */}
                    < div >
                        <label className="mb-2 block text-sm font-medium text-slate-700" >
                            Phone Number
                        </label >

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                            placeholder="01012345678"
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                        />
                    </div >

                    {/* PASSWORD */}
                    < div >
                        <label className="mb-2 block text-sm font-medium text-slate-700" >
                            Password
                        </label >

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                        />
                    </div >

                    {/* BUTTON */}
                    < button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {
                            loading
                                ? 'Logging in...'
                                : 'Login'
                        }
                    </button >

                </form >
            </div >
        </div >
    );
}