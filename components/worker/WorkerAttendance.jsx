'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function WorkerAttendance({ onAttendanceChange }) {
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [businessSettings, setBusinessSettings] = useState(null);
    const [businessHoursLoading, setBusinessHoursLoading] = useState(true);
    const [isDayOff, setIsDayOff] = useState(false);
    const [dayOffName, setDayOffName] = useState('');

    // Get current location
    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(
                    new Error('Geolocation is not supported by this browser.')
                );
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    if (error.code === 1) {
                        reject(
                            new Error(
                                'Please allow location access to record attendance.'
                            )
                        );
                    } else {
                        reject(
                            new Error('Unable to get your location.')
                        );
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    };

    const isBusinessOpen = (openingTime, closingTime) => {
        const now = new Date();

        const currentTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Africa/Cairo',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(now);

        if (openingTime < closingTime) {
            // Normal working hours
            return (
                currentTime >= openingTime &&
                currentTime < closingTime
            );
        }

        // Overnight working hours
        return (
            currentTime >= openingTime ||
            currentTime < closingTime
        );
    };

    const checkIfTodayIsDayOff = (weeklyDaysOff = []) => {
        const now = new Date();

        const cairoWeekday = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Cairo',
            weekday: 'long',
        }).format(now);

        const weekdayMap = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
        };

        const cairoDayIndex = weekdayMap[cairoWeekday];

        if (weeklyDaysOff.includes(cairoDayIndex)) {
            setIsDayOff(true);
            setDayOffName(cairoWeekday);
            return true;
        }

        setIsDayOff(false);
        setDayOffName('');
        return false;
    };

    // Get today's attendance
    const fetchAttendance = async () => {
        try {
            setError('');

            const res = await api.get('/attendance/me');

            setAttendance(res?.data?.attendance || null);
        } catch (err) {
            console.error('ATTENDANCE FETCH ERROR:', err);

            setError(
                err?.message ||
                'Failed to load attendance.'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchBusinessSettings = async () => {
        try {
            setBusinessHoursLoading(true);

            const res = await api.get('/business-settings');

            const settings = res?.data?.settings || null;

            setBusinessSettings(settings);

            if (settings) {
                checkIfTodayIsDayOff(settings.weeklyDaysOff || []);
            }
        } catch (err) {
            console.error(
                'BUSINESS SETTINGS FETCH ERROR:',
                err
            );
        } finally {
            setBusinessHoursLoading(false);
        }
    };


    useEffect(() => {
        fetchAttendance();
        fetchBusinessSettings();
    }, []);
    // Check In
    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            setError('');
            setSuccess('');

            const location = await getLocation();

            console.log('CHECK-IN LOCATION:', location);

            const res = await api.post(
                '/attendance/check-in',
                location
            );

            console.log('CHECK-IN RESPONSE:', res);

            setAttendance(res?.data?.attendance || null);

            setSuccess(
                'Check-in recorded successfully.'
            );
        } catch (err) {
            console.error('CHECK-IN ERROR:', err);

            setError(
                err?.message ||
                'Failed to check in.'
            );
        } finally {
            setActionLoading(false);
        }
    };

    // Check Out
    const handleCheckOut = async () => {
        try {
            setActionLoading(true);
            setError('');
            setSuccess('');

            const location = await getLocation();

            console.log('CHECK-OUT LOCATION:', location);

            const res = await api.post(
                '/attendance/check-out',
                location
            );

            console.log('CHECK-OUT RESPONSE:', res);

            setAttendance(res?.data?.attendance || null);

            onAttendanceChange?.(false);

            setSuccess(
                'Check-out recorded successfully.'
            );
        } catch (err) {
            console.error('CHECK-OUT ERROR:', err);

            setError(
                err?.message ||
                'Failed to check out.'
            );
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" >
                <p className="text-sm text-slate-500" >
                    Loading attendance...
                </p >
            </div >
        );
    }

    if (!businessHoursLoading && isDayOff) {
        return (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
                        📅
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">
                        Today is a Day Off
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-slate-500">
                        There is no attendance today because today is the weekly day off.
                    </p>

                    <div className="mt-5 rounded-xl bg-slate-50 px-6 py-4">
                        <p className="text-xs font-medium text-slate-500">
                            Weekly Day Off
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                            {dayOffName}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    const checkedIn = Boolean(
        attendance?.checkIn?.time
    );

    const checkedOut = Boolean(
        attendance?.checkOut?.time
    );

    const canCheckIn =
        !businessHoursLoading &&
        !isDayOff &&
        businessSettings &&
        isBusinessOpen(
            businessSettings.openingTime,
            businessSettings.closingTime
        );
    return (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" >
            <div className="mb-5" >
                <h2 className="text-xl font-bold text-slate-900" >
                    Attendance
                </h2 >

                <p className="mt-1 text-sm text-slate-500" >
                    Record your attendance using your current location.
                </p >
            </div >

            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600" >
                    {error}
                </div >
            )
            }

            {
                success && (
                    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600" >
                        {success}
                    </div >
                )
            }

            <div className="mb-5 grid gap-3 sm:grid-cols-2" >
                <div className="rounded-xl bg-slate-50 p-4" >
                    <p className="text-xs font-medium text-slate-500" >
                        Check In
                    </p >

                    <p className="mt-1 font-semibold text-slate-900" >
                        {
                            checkedIn
                                ? new Date(
                                    attendance.checkIn.time
                                ).toLocaleTimeString()
                                : 'Not checked in'}
                    </p >
                </div >

                <div className="rounded-xl bg-slate-50 p-4" >
                    <p className="text-xs font-medium text-slate-500" >
                        Check Out
                    </p >

                    <p className="mt-1 font-semibold text-slate-900" >
                        {
                            checkedOut
                                ? new Date(
                                    attendance.checkOut.time
                                ).toLocaleTimeString()
                                : 'Not checked out'}
                    </p >
                </div >
            </div >

            <div className="flex flex-wrap gap-3" >
                {!checkedIn && canCheckIn && (
                    <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={actionLoading}
                        className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {actionLoading
                            ? 'Checking in...'
                            : 'Check In'}
                    </button>
                )}

                {!checkedIn &&
                    !businessHoursLoading &&
                    businessSettings &&
                    !isDayOff &&
                    !canCheckIn && (
                        <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700">
                            Check-in is currently unavailable.
                            <br />
                            Working hours:{" "}
                            {businessSettings.openingTime} -{" "}
                            {businessSettings.closingTime}
                        </div>
                    )}

                {
                    checkedIn && !checkedOut && (
                        <button
                            type="button"
                            onClick={handleCheckOut}
                            disabled={actionLoading}
                            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {
                                actionLoading
                                    ? 'Checking out...'
                                    : 'Check Out'
                            }
                        </button >
                    )
                }

                {
                    checkedIn && checkedOut && (
                        <div className="flex items-center rounded-xl bg-green-50 px-5 py-3 text-sm font-semibold text-green-700" >
                            Attendance completed for today ✓
                        </div >
                    )
                }
            </div >
        </div >
    );
}
