'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SettingsPage() {
    // =========================
    // Payment Settings
    // =========================
    const [vodafoneCashNumber, setVodafoneCashNumber] = useState('');
    const [instapayAccount, setInstapayAccount] = useState('');

    // =========================
    // Working Hours
    // =========================
    const [openingTime, setOpeningTime] = useState('');
    const [closingTime, setClosingTime] = useState('');
    const [weeklyDaysOff, setWeeklyDaysOff] = useState([]);

    // =========================
    // Loading
    // =========================
    const [loading, setLoading] = useState(true);

    // =========================
    // Saving states
    // =========================
    const [savingPayment, setSavingPayment] = useState(false);
    const [savingHours, setSavingHours] = useState(false);
    const [savingDaysOff, setSavingDaysOff] = useState(false);

    // =========================
    // Messages
    // =========================
    const [paymentError, setPaymentError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState('');

    const [hoursError, setHoursError] = useState('');
    const [hoursSuccess, setHoursSuccess] = useState('');
    const [daysOffError, setDaysOffError] = useState('');
    const [daysOffSuccess, setDaysOffSuccess] = useState('');

    // Car Wash Location
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [attendanceRadius, setAttendanceRadius] = useState(100);
    const [customerServiceRadius, setCustomerServiceRadius] = useState(100);

    const [gettingLocation, setGettingLocation] = useState(false);
    const [savingLocation, setSavingLocation] = useState(false);

    const [locationError, setLocationError] = useState('');
    const [locationSuccess, setLocationSuccess] = useState('');

    // Business Logo
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [savingLogo, setSavingLogo] = useState(false);
    const [logoError, setLogoError] = useState('');
    const [logoSuccess, setLogoSuccess] = useState('');
    // =========================
    // Fetch Payment Settings
    // =========================
    const fetchPaymentSettings = async () => {
        try {
            const res = await api.get('/payment-settings');

            const settings = res?.data?.paymentSetting;

            if (settings) {
                setVodafoneCashNumber(
                    settings.vodafoneCashNumber || ''
                );

                setInstapayAccount(
                    settings.instapayAccount || ''
                );
            }
        } catch (err) {
            console.error(
                'GET PAYMENT SETTINGS ERROR:',
                err
            );

            setPaymentError(
                err?.message ||
                'Failed to load payment settings'
            );
        }
    };

    // =========================
    // Fetch Business Settings
    // =========================
    const fetchBusinessSettings = async () => {
        try {
            const res = await api.get('/business-settings');

            const settings = res?.data?.settings;

            if (settings) {
                setLogoUrl(settings.logo?.url || '');

                setLatitude(
                    settings.location?.latitude ?? ''
                );

                setLongitude(
                    settings.location?.longitude ?? ''
                );

                setAttendanceRadius(
                    settings.attendanceRadius ?? 100
                );

                setCustomerServiceRadius(
                    settings.customerServiceRadius ?? 100
                );

                setOpeningTime(
                    settings.openingTime || ''
                );

                setClosingTime(
                    settings.closingTime || ''
                );

                setWeeklyDaysOff(
                    Array.isArray(settings.weeklyDaysOff)
                        ? settings.weeklyDaysOff
                        : []
                );
            }
        } catch (err) {
            console.error(
                'GET BUSINESS SETTINGS ERROR:',
                err
            );

            setHoursError(
                err?.message ||
                'Failed to load working hours'
            );
        }
    };

    // =========================
    // Load all settings
    // =========================
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);

                await Promise.all([
                    fetchPaymentSettings(),
                    fetchBusinessSettings(),
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    // =========================
    // Save Payment Settings
    // =========================
    const handleSavePayment = async (e) => {
        e.preventDefault();

        setPaymentError('');
        setPaymentSuccess('');

        if (!vodafoneCashNumber.trim()) {
            setPaymentError(
                'Vodafone Cash number is required'
            );
            return;
        }

        if (!instapayAccount.trim()) {
            setPaymentError(
                'InstaPay account is required'
            );
            return;
        }

        try {
            setSavingPayment(true);

            await api.patch('/payment-settings', {
                vodafoneCashNumber:
                    vodafoneCashNumber.trim(),

                instapayAccount:
                    instapayAccount.trim(),
            });

            setPaymentSuccess(
                'Payment settings updated successfully.'
            );

            await fetchPaymentSettings();
        } catch (err) {
            console.error(
                'UPDATE PAYMENT SETTINGS ERROR:',
                err
            );

            setPaymentError(
                err?.message ||
                'Failed to update payment settings'
            );
        } finally {
            setSavingPayment(false);
        }
    };

    // =========================
    // Save Working Hours
    // =========================
    const handleSaveWorkingHours = async (e) => {
        e.preventDefault();

        setHoursError('');
        setHoursSuccess('');

        if (!openingTime) {
            setHoursError(
                'Opening time is required'
            );
            return;
        }

        if (!closingTime) {
            setHoursError(
                'Closing time is required'
            );
            return;
        }

        try {
            setSavingHours(true);

            await api.patch('/business-settings', {
                openingTime,
                closingTime,
            });

            setHoursSuccess(
                'Working hours updated successfully.'
            );

            await fetchBusinessSettings();
        } catch (err) {
            console.error(
                'UPDATE BUSINESS SETTINGS ERROR:',
                err
            );

            setHoursError(
                err?.message ||
                'Failed to update working hours'
            );
        } finally {
            setSavingHours(false);
        }
    };

    const handleGetCurrentLocation = () => {
        setLocationError('');
        setLocationSuccess('');

        if (!navigator.geolocation) {
            setLocationError(
                'Geolocation is not supported by this browser.'
            );
            return;
        }

        setGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);

                setGettingLocation(false);

                setLocationSuccess(
                    'Current location captured. Save to apply it.'
                );
            },
            (error) => {
                let message = 'Unable to get your current location.';

                if (error.code === error.PERMISSION_DENIED) {
                    message =
                        'Location permission denied. Please allow location access.';
                } else if (
                    error.code === error.POSITION_UNAVAILABLE
                ) {
                    message = 'Your current location is unavailable.';
                } else if (
                    error.code === error.TIMEOUT
                ) {
                    message = 'Getting your location timed out. Try again.';
                }

                setLocationError(message);
                setGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    const handleSaveLocationSettings = async (e) => {
        e.preventDefault();

        setLocationError('');
        setLocationSuccess('');

        const lat = Number(latitude);
        const lng = Number(longitude);
        const attendance = Number(attendanceRadius);
        const customerRadius = Number(customerServiceRadius);

        if (
            latitude === '' ||
            longitude === '' ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            setLocationError(
                'Please set a valid car wash location first.'
            );
            return;
        }

        if (
            !Number.isFinite(attendance) ||
            attendance < 1 ||
            !Number.isFinite(customerRadius) ||
            customerRadius < 1
        ) {
            setLocationError(
                'Both service radiuses must be at least 1 meter.'
            );
            return;
        }

        try {
            setSavingLocation(true);

            await api.patch('/business-settings', {
                latitude: lat,
                longitude: lng,
                attendanceRadius: attendance,
                customerServiceRadius: customerRadius,
            });

            await fetchBusinessSettings();

            setLocationSuccess(
                'Car wash location and service areas updated successfully.'
            );
        } catch (err) {
            console.error(
                'UPDATE LOCATION SETTINGS ERROR:',
                err
            );

            setLocationError(
                err?.message ||
                'Failed to update location settings.'
            );
        } finally {
            setSavingLocation(false);
        }
    };

    // =========================
    // Save Weekly Days Off
    // =========================
    const handleSaveDaysOff = async () => {
        setDaysOffError('');
        setDaysOffSuccess('');

        try {
            setSavingDaysOff(true);

            await api.patch('/business-settings', {
                weeklyDaysOff,
            });

            setDaysOffSuccess(
                'Weekly days off updated successfully.'
            );

            await fetchBusinessSettings();
        } catch (err) {
            console.error(
                'UPDATE WEEKLY DAYS OFF ERROR:',
                err
            );

            setDaysOffError(
                err?.message ||
                'Failed to update weekly days off'
            );
        } finally {
            setSavingDaysOff(false);
        }
    };

    const toggleWeeklyDay = (day) => {
        setWeeklyDaysOff((current) =>
            current.includes(day)
                ? current.filter((item) => item !== day)
                : [...current, day].sort((a, b) => a - b)
        );

        setDaysOffError('');
        setDaysOffSuccess('');
    };

    // =========================
    // Business Logo
    // =========================
    const handleSaveLogo = async (e) => {
        e.preventDefault();

        setLogoError('');
        setLogoSuccess('');

        if (!logoFile) {
            setLogoError('Please select an image first.');
            return;
        }

        if (!logoFile.type.startsWith('image/')) {
            setLogoError('Please select a valid image file.');
            return;
        }

        try {
            setSavingLogo(true);

            const formData = new FormData();
            formData.append('image', logoFile);

            await api.patch('/business-settings/logo', formData);

            setLogoFile(null);
            await fetchBusinessSettings();
            setLogoSuccess('Business logo updated successfully.');
        } catch (err) {
            console.error('UPDATE BUSINESS LOGO ERROR:', err);
            setLogoError(err?.message || 'Failed to update business logo.');
        } finally {
            setSavingLogo(false);
        }
    };

    const handleDeleteLogo = async () => {
        if (!logoUrl) return;

        const confirmed = window.confirm(
            'Are you sure you want to delete the business logo?'
        );

        if (!confirmed) return;

        setLogoError('');
        setLogoSuccess('');

        try {
            setSavingLogo(true);

            await api.delete('/business-settings/logo');

            setLogoUrl('');
            setLogoFile(null);
            setLogoSuccess('Business logo deleted successfully.');
        } catch (err) {
            console.error('DELETE BUSINESS LOGO ERROR:', err);
            setLogoError(err?.message || 'Failed to delete business logo.');
        } finally {
            setSavingLogo(false);
        }
    };

    // =========================
    // Loading
    // =========================
    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                    <p className="text-slate-500">
                        Loading settings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">

            {/* =========================
                Page Header
            ========================= */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Settings
                </h1>

                <p className="mt-1 text-slate-500">
                    Manage payment accounts, working hours, and weekly days off
                </p>
            </div>

            <div className="space-y-8">

                {/* Business Logo */}
                <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm lg:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Business Logo
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Upload or replace the logo shown on the customer form.
                        </p>
                    </div>

                    {logoSuccess && (
                        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {logoSuccess}
                        </div>
                    )}

                    {logoError && (
                        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {logoError}
                        </div>
                    )}

                    <div className="mb-6 flex flex-wrap items-center gap-5">
                        {logoUrl ? (
                            <img
                                src={logoUrl.replace(
                                    '/upload/',
                                    '/upload/f_auto,q_auto,w_400,c_limit/'
                                )}
                                alt="Business logo"
                                loading="eager"
                                decoding="async"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = logoUrl;
                                }}
                                className="h-28 w-28 rounded-xl border border-slate-200 bg-white object-contain p-2"
                            />
                        ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-400">
                                No logo uploaded
                            </div>
                        )}

                        <div className="text-sm text-slate-500">
                            {logoUrl
                                ? 'Current business logo'
                                : 'Choose an image to set the business logo.'}
                            {logoFile && (
                                <p className="mt-2 break-all font-medium text-slate-700">
                                    Selected: {logoFile.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSaveLogo} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Select Logo Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setLogoFile(e.target.files?.[0] || null);
                                    setLogoError('');
                                    setLogoSuccess('');
                                }}
                                disabled={savingLogo}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
                            />
                            <p className="mt-2 text-xs text-slate-400">
                                Select an image file. Uploading a new logo replaces the current one.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            {logoUrl && (
                                <button
                                    type="button"
                                    onClick={handleDeleteLogo}
                                    disabled={savingLogo}
                                    className="rounded-lg border border-red-200 px-5 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Delete Logo
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={savingLogo || !logoFile}
                                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingLogo
                                    ? 'Saving...'
                                    : logoUrl
                                        ? 'Replace Logo'
                                        : 'Upload Logo'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Car Wash Location */}
                <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm lg:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Car Wash Location & Service Area
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Set the car wash location and define the allowed
                            distance for workers and customers.
                        </p>
                    </div>

                    {locationSuccess && (
                        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {locationSuccess}
                        </div>
                    )}

                    {locationError && (
                        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {locationError}
                        </div>
                    )}

                    <form
                        onSubmit={handleSaveLocationSettings}
                        className="space-y-6"
                    >
                        <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={gettingLocation || savingLocation}
                            className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {gettingLocation
                                ? 'Getting Current Location...'
                                : '📍 Set Current Location'}
                        </button>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Latitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    readOnly
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Longitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    readOnly
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Attendance Radius (meters)
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={attendanceRadius}
                                onChange={(e) =>
                                    setAttendanceRadius(e.target.value)
                                }
                                disabled={savingLocation}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                Maximum distance allowed for worker attendance.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Customer Service Radius (meters)
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={customerServiceRadius}
                                onChange={(e) =>
                                    setCustomerServiceRadius(e.target.value)
                                }
                                disabled={savingLocation}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                Customers must be within this distance to create
                                a wash order.
                            </p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingLocation || gettingLocation}
                                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingLocation
                                    ? 'Saving...'
                                    : 'Save Location Settings'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* =========================
                    Payment Settings
                ========================= */}
                <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm lg:p-8">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Payment Settings
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage the payment accounts used by customers
                        </p>
                    </div>

                    {paymentSuccess && (
                        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {paymentSuccess}
                        </div>
                    )}

                    {paymentError && (
                        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {paymentError}
                        </div>
                    )}

                    <form
                        onSubmit={handleSavePayment}
                        className="space-y-6"
                    >

                        {/* Vodafone Cash */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Vodafone Cash Number
                            </label>

                            <input
                                type="tel"
                                value={vodafoneCashNumber}
                                onChange={(e) =>
                                    setVodafoneCashNumber(
                                        e.target.value
                                    )
                                }
                                placeholder="01012345678"
                                disabled={savingPayment}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                This number will be displayed to customers
                                when they choose Vodafone Cash.
                            </p>
                        </div>

                        {/* InstaPay */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                InstaPay Account
                            </label>

                            <input
                                type="text"
                                value={instapayAccount}
                                onChange={(e) =>
                                    setInstapayAccount(
                                        e.target.value
                                    )
                                }
                                placeholder="@your_instapay"
                                disabled={savingPayment}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                This account will be displayed to customers
                                when they choose InstaPay.
                            </p>
                        </div>

                        {/* Save Payment */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingPayment}
                                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingPayment
                                    ? 'Saving...'
                                    : 'Save Payment Settings'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* =========================
                    Working Hours
                ========================= */}
                <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm lg:p-8">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Working Hours
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Set the opening and closing time of the car wash
                        </p>
                    </div>

                    {hoursSuccess && (
                        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {hoursSuccess}
                        </div>
                    )}

                    {hoursError && (
                        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {hoursError}
                        </div>
                    )}

                    <form
                        onSubmit={handleSaveWorkingHours}
                        className="space-y-6"
                    >

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                            {/* Opening Time */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Opening Time
                                </label>

                                <input
                                    type="time"
                                    value={openingTime}
                                    onChange={(e) =>
                                        setOpeningTime(
                                            e.target.value
                                        )
                                    }
                                    disabled={savingHours}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                                />
                            </div>

                            {/* Closing Time */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Closing Time
                                </label>

                                <input
                                    type="time"
                                    value={closingTime}
                                    onChange={(e) =>
                                        setClosingTime(
                                            e.target.value
                                        )
                                    }
                                    disabled={savingHours}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-400">
                            These working hours will be used by the system
                            to determine when the car wash is open.
                        </p>

                        {/* Save Working Hours */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={savingHours}
                                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingHours
                                    ? 'Saving...'
                                    : 'Save Working Hours'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* =========================
                    Weekly Days Off
                ========================= */}
                <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm lg:p-8">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Weekly Days Off
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Select the regular weekly days when the car wash is closed.
                        </p>
                    </div>

                    {daysOffSuccess && (
                        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {daysOffSuccess}
                        </div>
                    )}

                    {daysOffError && (
                        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {daysOffError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { value: 0, label: 'Sunday' },
                            { value: 1, label: 'Monday' },
                            { value: 2, label: 'Tuesday' },
                            { value: 3, label: 'Wednesday' },
                            { value: 4, label: 'Thursday' },
                            { value: 5, label: 'Friday' },
                            { value: 6, label: 'Saturday' },
                        ].map((day) => {
                            const selected = weeklyDaysOff.includes(day.value);

                            return (
                                <label
                                    key={day.value}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${selected
                                        ? 'border-slate-900 bg-slate-50'
                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => toggleWeeklyDay(day.value)}
                                        disabled={savingDaysOff}
                                        className="h-4 w-4"
                                    />

                                    <span className="text-sm font-medium text-slate-700">
                                        {day.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                        These days will be excluded from monthly working-day and absence calculations.
                    </p>

                    <div className="flex justify-end pt-5">
                        <button
                            type="button"
                            onClick={handleSaveDaysOff}
                            disabled={savingDaysOff}
                            className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {savingDaysOff
                                ? 'Saving...'
                                : 'Save Weekly Days Off'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}