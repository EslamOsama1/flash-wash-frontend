'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function OperationsLoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const data = await api.post('/admin/login', {
                username,
                password,
            });

            if (data?.data?.admin?.role !== 'operational_manager') {
                throw new Error(
                    'This account is not an Operational Manager account'
                );
            }

            localStorage.setItem(
                'operationalManagerToken',
                data.token
            );

            router.push('/operations');
        } catch (error) {
            setError(
                error.message ||
                'Invalid username or password'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                <h1 className="text-2xl font-bold text-center mb-2">
                    Operational Manager Login
                </h1>

                <p className="text-gray-500 text-center mb-6">
                    Sign in to access the Operations Dashboard
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 p-3 text-sm">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading
                            ? 'Logging in...'
                            : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}