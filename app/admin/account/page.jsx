'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    User,
    ShieldCheck,
    KeyRound,
    Save,
    Plus,
    RefreshCw,
} from 'lucide-react';

export default function AdminAccountPage() {
    // =========================
    // ADMIN ACCOUNT
    // =========================
    const [admin, setAdmin] = useState(null);
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminLoading, setAdminLoading] = useState(true);
    const [adminSaving, setAdminSaving] = useState(false);
    const [adminMessage, setAdminMessage] = useState('');
    const [adminError, setAdminError] = useState('');

    // =========================
    // OPERATIONAL MANAGER
    // =========================
    const [operationalManager, setOperationalManager] = useState(null);

    const [managerUsername, setManagerUsername] = useState('');
    const [managerPassword, setManagerPassword] = useState('');

    const [managerLoading, setManagerLoading] = useState(true);
    const [managerSaving, setManagerSaving] = useState(false);

    const [managerMessage, setManagerMessage] = useState('');
    const [managerError, setManagerError] = useState('');

    // =========================
    // LOAD DATA
    // =========================
    const fetchAccountData = async () => {
        try {
            setAdminLoading(true);
            setManagerLoading(true);

            setAdminError('');
            setManagerError('');

            const [adminRes, managerRes] = await Promise.all([
                api.get('/admin/me'),
                api.get('/admin/operational-manager'),
            ]);

            const currentAdmin = adminRes?.data?.admin || null;
            const currentManager =
                managerRes?.data?.operationalManager || null;

            setAdmin(currentAdmin);
            setAdminUsername(currentAdmin?.username || '');

            setOperationalManager(currentManager);

            if (currentManager) {
                setManagerUsername(
                    currentManager.username || ''
                );
            } else {
                setManagerUsername('');
            }
        } catch (err) {
            console.error('ACCOUNT DATA ERROR:', err);

            setAdminError(
                err?.message || 'Failed to load account data'
            );
        } finally {
            setAdminLoading(false);
            setManagerLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountData();
    }, []);

    // =========================
    // UPDATE ADMIN
    // =========================
    const handleUpdateAdmin = async (e) => {
        e.preventDefault();

        setAdminError('');
        setAdminMessage('');

        if (!adminUsername.trim()) {
            setAdminError('Username is required');
            return;
        }

        if (
            adminPassword &&
            adminPassword.length < 6
        ) {
            setAdminError(
                'Password must be at least 6 characters'
            );
            return;
        }

        try {
            setAdminSaving(true);

            const body = {
                username: adminUsername.trim(),
            };

            if (adminPassword.trim()) {
                body.password = adminPassword;
            }

            const res = await api.patch(
                '/admin/me',
                body
            );

            const updatedAdmin =
                res?.data?.admin || null;

            if (updatedAdmin) {
                setAdmin(updatedAdmin);
                setAdminUsername(
                    updatedAdmin.username || ''
                );
            }

            setAdminPassword('');

            setAdminMessage(
                'Admin account updated successfully.'
            );
        } catch (err) {
            console.error('UPDATE ADMIN ERROR:', err);

            setAdminError(
                err?.message || 'Failed to update admin account'
            );
        } finally {
            setAdminSaving(false);
        }
    };

    // =========================
    // CREATE OPERATIONAL MANAGER
    // =========================
    const handleCreateManager = async (e) => {
        e.preventDefault();

        setManagerError('');
        setManagerMessage('');

        if (!managerUsername.trim()) {
            setManagerError('Username is required');
            return;
        }

        if (managerPassword.length < 6) {
            setManagerError(
                'Password must be at least 6 characters'
            );
            return;
        }

        try {
            setManagerSaving(true);

            const res = await api.post(
                '/admin/operational-manager',
                {
                    username: managerUsername.trim(),
                    password: managerPassword,
                }
            );

            const createdManager =
                res?.data?.operationalManager || null;

            setOperationalManager(createdManager);

            setManagerUsername(
                createdManager?.username ||
                managerUsername.trim()
            );

            setManagerPassword('');

            setManagerMessage(
                'Operational Manager created successfully.'
            );
        } catch (err) {
            console.error(
                'CREATE OPERATIONAL MANAGER ERROR:',
                err
            );

            setManagerError(
                err?.message ||
                'Failed to create Operational Manager'
            );
        } finally {
            setManagerSaving(false);
        }
    };

    // =========================
    // UPDATE OPERATIONAL MANAGER
    // =========================
    const handleUpdateManager = async (e) => {
        e.preventDefault();

        setManagerError('');
        setManagerMessage('');

        if (!managerUsername.trim()) {
            setManagerError('Username is required');
            return;
        }

        if (
            managerPassword &&
            managerPassword.length < 6
        ) {
            setManagerError(
                'Password must be at least 6 characters'
            );
            return;
        }

        if (!operationalManager?._id) {
            setManagerError(
                'Operational Manager account was not found'
            );
            return;
        }

        try {
            setManagerSaving(true);

            const body = {
                username: managerUsername.trim(),
            };

            if (managerPassword.trim()) {
                body.password = managerPassword;
            }

            const res = await api.patch(
                `/admin/operational-manager/${operationalManager._id}`,
                body
            );

            const updatedManager =
                res?.data?.operationalManager || null;

            if (updatedManager) {
                setOperationalManager(updatedManager);
                setManagerUsername(
                    updatedManager.username || ''
                );
            }

            setManagerPassword('');

            setManagerMessage(
                'Operational Manager updated successfully.'
            );
        } catch (err) {
            console.error(
                'UPDATE OPERATIONAL MANAGER ERROR:',
                err
            );

            setManagerError(
                err?.message ||
                'Failed to update Operational Manager'
            );
        } finally {
            setManagerSaving(false);
        }
    };

    const loading =
        adminLoading || managerLoading;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="flex items-center gap-3 text-slate-500">
                        <RefreshCw
                            size={20}
                            className="animate-spin"
                        />
                        Loading account settings...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Account Management
                </h1>

                <p className="mt-1 text-slate-500">
                    Manage your admin account and Operational Manager account.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {/* =========================
                    ADMIN ACCOUNT
                ========================= */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <User size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Admin Account
                            </h2>

                            <p className="text-sm text-slate-500">
                                Update your administrator credentials.
                            </p>
                        </div>
                    </div>

                    {adminError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {adminError}
                        </div>
                    )}

                    {adminMessage && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                            {adminMessage}
                        </div>
                    )}

                    <form
                        onSubmit={handleUpdateAdmin}
                        className="space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Username
                            </label>

                            <input
                                type="text"
                                value={adminUsername}
                                onChange={(e) =>
                                    setAdminUsername(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                New Password
                            </label>

                            <div className="relative">
                                <KeyRound
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) =>
                                        setAdminPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Leave empty to keep current password"
                                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={adminSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />
                            {adminSaving
                                ? 'Updating...'
                                : 'Update Admin Account'}
                        </button>
                    </form>
                </section>

                {/* =========================
                    OPERATIONAL MANAGER
                ========================= */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Operational Manager
                            </h2>

                            <p className="text-sm text-slate-500">
                                {operationalManager
                                    ? 'Update the Operational Manager credentials.'
                                    : 'Create the Operational Manager account.'}
                            </p>
                        </div>
                    </div>

                    {managerError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {managerError}
                        </div>
                    )}

                    {managerMessage && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                            {managerMessage}
                        </div>
                    )}

                    <form
                        onSubmit={
                            operationalManager
                                ? handleUpdateManager
                                : handleCreateManager
                        }
                        className="space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Username
                            </label>

                            <input
                                type="text"
                                value={managerUsername}
                                onChange={(e) =>
                                    setManagerUsername(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                {operationalManager
                                    ? 'New Password'
                                    : 'Password'}
                            </label>

                            <div className="relative">
                                <KeyRound
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="password"
                                    value={managerPassword}
                                    onChange={(e) =>
                                        setManagerPassword(
                                            e.target.value
                                        )
                                    }
                                    required={
                                        !operationalManager
                                    }
                                    placeholder={
                                        operationalManager
                                            ? 'Leave empty to keep current password'
                                            : 'Enter password'
                                    }
                                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={managerSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {operationalManager ? (
                                <Save size={18} />
                            ) : (
                                <Plus size={18} />
                            )}

                            {managerSaving
                                ? operationalManager
                                    ? 'Updating...'
                                    : 'Creating...'
                                : operationalManager
                                    ? 'Update Operational Manager'
                                    : 'Create Operational Manager'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
