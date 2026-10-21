'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const res = await api.post('/admin/login', {
                username,
                password,
            });

            const token = res?.token;

            if (!token) {
                throw new Error('Login succeeded but no token was returned');
            }

            // Save token for API requests
            localStorage.setItem('adminToken', token);

            // Save token for Next.js middleware
            document.cookie = `adminToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

            // Go to admin dashboard
            router.push('/admin');

        } catch (err) {
            console.error('ADMIN LOGIN ERROR:', err);

            setError(
                err?.message || 'Invalid username or password'
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4" >

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg" >

                <div className="mb-8 text-center" >
                    <h1 className="text-3xl font-bold text-slate-900" >
                        Admin Login
                    </h1 >

                    <p className="mt-2 text-sm text-slate-500" >
                        Sign in to access the admin dashboard
                    </p >
                </div >

                <form onSubmit={handleSubmit} className="space-y-5" >

                    {/* Username */}
                    < div >
                        <label className="mb-2 block text-sm font-medium text-slate-700" >
                            Username
                        </label >

                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                        />
                    </div >

                    {/* Password */}
                    < div >
                        <label className="mb-2 block text-sm font-medium text-slate-700" >
                            Password
                        </label >

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                        />
                    </div >

                    {/* Error */}
                    {
                        error && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" >
                                {error}
                            </div >
                        )
                    }

                    {/* Login */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button >

                </form >
            </div >
        </div >
    );
}