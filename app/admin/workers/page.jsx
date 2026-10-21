'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

export default function WorkersPage() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Attendance Dashboard
    const [attendance, setAttendance] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [monthlyWorkingDays, setMonthlyWorkingDays] = useState(0);
    const [monthlyWeeklyDaysOff, setMonthlyWeeklyDaysOff] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [attendanceError, setAttendanceError] = useState('');
    const [attendanceMonth, setAttendanceMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, '0')}`;
    });
    const [selectedAttendanceWorker, setSelectedAttendanceWorker] =
        useState('all');

    // Add Worker
    const [showAddForm, setShowAddForm] = useState(false);
    const [workerName, setWorkerName] = useState('');
    const [workerPhone, setWorkerPhone] = useState('');
    const [workerPassword, setWorkerPassword] = useState('');
    const [workerLoading, setWorkerLoading] = useState(false);
    const [workerError, setWorkerError] = useState('');

    // Edit Worker
    const [editingWorker, setEditingWorker] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    // Action loading
    const [actionLoading, setActionLoading] = useState(null);

    // Fetch Workers
    const fetchWorkers = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/workers');

            setWorkers(res?.data?.workers || []);
        } catch (err) {
            console.error('GET WORKERS ERROR:', err);

            setError(
                err?.message || 'Failed to load workers'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    // =========================
    // ATTENDANCE DASHBOARD
    // =========================

    const getAttendanceArray = (res) => {
        const data = res?.data;

        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.attendance)) return data.attendance;
        if (Array.isArray(data?.records)) return data.records;
        if (Array.isArray(data?.data)) return data.data;

        return [];
    };

    const fetchAttendance = async () => {
        try {
            setAttendanceLoading(true);
            setAttendanceError('');

            const res = await api.get(
                `/attendance?month=${attendanceMonth}`
            );

            const data = res?.data;

            setAttendance(getAttendanceArray(res));
            setMonthlySummary(
                Array.isArray(data?.monthlySummary)
                    ? data.monthlySummary
                    : []
            );
            setMonthlyWorkingDays(Number(data?.workingDays || 0));
            setMonthlyWeeklyDaysOff(
                Array.isArray(data?.weeklyDaysOff)
                    ? data.weeklyDaysOff
                    : []
            );
        } catch (err) {
            console.error('GET ATTENDANCE ERROR:', err);

            setAttendanceError(
                err?.message ||
                'Failed to load attendance data'
            );
            setAttendance([]);
        } finally {
            setAttendanceLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attendanceMonth]);

    const attendanceRecords = useMemo(() => {
        return attendance.map((record) => {
            const worker =
                typeof record?.worker === 'object'
                    ? record.worker
                    : null;

            const workerId =
                typeof record?.worker === 'string'
                    ? record.worker
                    : worker?._id ||
                    record?.workerId ||
                    record?.worker?._id;

            const checkIn =
                record?.checkIn?.time ||
                record?.checkInTime ||
                record?.clockIn ||
                record?.arrivalTime;

            const checkOut =
                record?.checkOut?.time ||
                record?.checkOutTime ||
                record?.clockOut ||
                record?.departureTime;

            const lateMinutes =
                Number(
                    record?.lateMinutes ??
                    record?.delayMinutes ??
                    record?.late ??
                    0
                ) || 0;

            const workedMinutes =
                checkIn && checkOut
                    ? Math.max(
                        0,
                        Math.round(
                            (new Date(checkOut).getTime() -
                                new Date(checkIn).getTime()) /
                            60000
                        )
                    )
                    : 0;

            return {
                id:
                    record?._id ||
                    `${workerId}-${checkIn || record?.date}`,
                workerId: workerId
                    ? String(workerId)
                    : '',
                workerName:
                    worker?.name ||
                    record?.workerName ||
                    workers.find(
                        (item) =>
                            String(item._id) ===
                            String(workerId)
                    )?.name ||
                    'Worker',
                phone:
                    worker?.phone ||
                    record?.workerPhone ||
                    workers.find(
                        (item) =>
                            String(item._id) ===
                            String(workerId)
                    )?.phone ||
                    '--',
                date:
                    record?.date ||
                    record?.createdAt ||
                    checkIn,
                checkIn,
                checkOut,
                lateMinutes,
                workedMinutes,
                status:
                    record?.status ||
                    (checkOut
                        ? 'checked_out'
                        : checkIn
                            ? 'working'
                            : 'absent'),
            };
        });
    }, [attendance, workers]);

    const todayAttendance = useMemo(() => {
        const now = new Date();

        return attendanceRecords.filter((record) => {
            if (!record.date) return false;

            const date = new Date(record.date);

            return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate()
            );
        });
    }, [attendanceRecords]);

    const monthlyAttendance = useMemo(() => {
        return monthlySummary.map((item) => ({
            id: String(
                item.worker?._id ||
                item.workerId ||
                item.id
            ),

            name:
                item.worker?.name ||
                item.name ||
                'Worker',

            phone:
                item.worker?.phone ||
                item.phone ||
                '--',

            present: Number(item.presentDays || 0),
            absent: Number(item.absentDays || 0),
            lateDays: Number(item.lateDays || 0),
            lateMinutes: Number(item.lateMinutes || 0),
            workedMinutes: Number(item.workedMinutes || 0),

            carsWashed: Number(
                item.carsWashed || 0
            ),

            workerCommission: Number(
                item.workerCommission || 0
            ),

            attendanceRate: Number(
                item.attendanceRate || 0
            ),
        }));
    }, [monthlySummary]);

    const selectedMonthlyAttendance = useMemo(() => {
        if (selectedAttendanceWorker === 'all') {
            return monthlyAttendance;
        }

        return monthlyAttendance.filter(
            (item) =>
                item.id === selectedAttendanceWorker
        );
    }, [
        monthlyAttendance,
        selectedAttendanceWorker,
    ]);

    const attendanceTotals = useMemo(() => {
        return todayAttendance.reduce(
            (acc, record) => {
                acc.present += record.checkIn ? 1 : 0;

                if (record.checkIn && !record.checkOut) {
                    acc.working += 1;
                }

                if (record.checkOut) {
                    acc.checkedOut += 1;
                }

                return acc;
            },
            {
                present: 0,
                working: 0,
                checkedOut: 0,
            }
        );
    }, [todayAttendance]);

    const formatAttendanceTime = (value) => {
        if (!value) return '--';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '--';
        }

        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAttendanceDate = (value) => {
        if (!value) return '--';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '--';
        }

        return date.toLocaleDateString('en-GB');
    };

    const formatAttendanceMinutes = (minutes) => {
        const value = Number(minutes) || 0;

        if (value < 60) {
            return `${value} min`;
        }

        const hours = Math.floor(value / 60);
        const mins = value % 60;

        return mins
            ? `${hours}h ${mins}m`
            : `${hours}h`;
    };

    // =========================
    // ADD WORKER
    // =========================

    const handleAddWorker = async (e) => {
        e.preventDefault();

        setWorkerError('');

        if (!workerName.trim()) {
            setWorkerError('Worker name is required');
            return;
        }

        if (!workerPhone.trim()) {
            setWorkerError('Worker phone is required');
            return;
        }

        if (workerPassword.length < 6) {
            setWorkerError('Password must be at least 6 characters');
            return;
        }

        try {
            setWorkerLoading(true);

            await api.post('/workers', {
                name: workerName.trim(),
                phone: workerPhone.trim(),
                password: workerPassword,
            });

            setWorkerName('');
            setWorkerPhone('');
            setWorkerPassword('');

            setShowAddForm(false);

            await fetchWorkers();

        } catch (err) {
            console.error('ADD WORKER ERROR:', err);

            setWorkerError(
                err?.message || 'Failed to create worker'
            );
        } finally {
            setWorkerLoading(false);
        }
    };

    const handleCloseAddForm = () => {
        if (workerLoading) return;

        setShowAddForm(false);
        setWorkerError('');
        setWorkerName('');
        setWorkerPhone('');
        setWorkerPassword('');
    };

    // =========================
    // EDIT WORKER
    // =========================

    const handleOpenEdit = (worker) => {
        setEditingWorker(worker);

        setEditName(worker.name || '');
        setEditPhone(worker.phone || '');
        setEditPassword('');
        setEditError('');
    };

    const handleCloseEdit = () => {
        if (editLoading) return;

        setEditingWorker(null);
        setEditName('');
        setEditPhone('');
        setEditPassword('');
        setEditError('');
    };

    const handleEditWorker = async (e) => {
        e.preventDefault();

        if (!editingWorker) return;

        setEditError('');

        if (!editName.trim()) {
            setEditError('Worker name is required');
            return;
        }

        if (!editPhone.trim()) {
            setEditError('Worker phone is required');
            return;
        }

        if (editPassword && editPassword.length < 6) {
            setEditError('Password must be at least 6 characters');
            return;
        }

        try {
            setEditLoading(true);

            const body = {
                name: editName.trim(),
                phone: editPhone.trim(),
            };

            // Only send password if admin entered a new one
            if (editPassword.trim()) {
                body.password = editPassword;
            }

            await api.patch(
                `/workers/${editingWorker._id}`,
                body
            );

            handleCloseEdit();

            await fetchWorkers();

        } catch (err) {
            console.error('EDIT WORKER ERROR:', err);

            setEditError(
                err?.message || 'Failed to update worker'
            );
        } finally {
            setEditLoading(false);
        }
    };

    // =========================
    // ACTIVATE / DEACTIVATE
    // =========================

    const handleToggleStatus = async (worker) => {
        try {
            setActionLoading(worker._id);

            await api.patch(`/workers/${worker._id}`, {
                isActive: !worker.isActive,
            });

            await fetchWorkers();

        } catch (err) {
            console.error('TOGGLE WORKER ERROR:', err);

            setError(
                err?.message || 'Failed to update worker status'
            );
        } finally {
            setActionLoading(null);
        }
    };

    // =========================
    // DELETE WORKER
    // =========================

    const handleDeleteWorker = async (worker) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${worker.name}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(worker._id);

            await api.delete(`/workers/${worker._id}`);

            await fetchWorkers();

        } catch (err) {
            console.error('DELETE WORKER ERROR:', err);

            setError(
                err?.message || 'Failed to delete worker'
            );
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 lg:p-8">

            {/* =========================
                HEADER
            ========================= */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Workers
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Manage your car wash workers
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setShowAddForm(true);
                        setWorkerError('');
                    }}
                    className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
                >
                    + Add Worker
                </button>

            </div>

            {/* =========================
                TODAY'S ATTENDANCE
            ========================= */}

            <section className="mb-8">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Today's Attendance
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Track worker attendance and working hours.
                    </p>
                </div>

                {attendanceError && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {attendanceError}
                    </div>
                )}

                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <AttendanceCard
                        label="Total Workers"
                        value={workers.length}
                    />

                    <AttendanceCard
                        label="Present Today"
                        value={attendanceTotals.present}
                        valueClass="text-emerald-600"
                    />

                    <AttendanceCard
                        label="Working Now"
                        value={attendanceTotals.working}
                        valueClass="text-blue-600"
                    />

                    <AttendanceCard
                        label="Checked Out"
                        value={attendanceTotals.checkedOut}
                        valueClass="text-violet-600"
                    />

                    <AttendanceCard
                        label="Absent"
                        value={Math.max(
                            0,
                            workers.length -
                            attendanceTotals.present
                        )}
                        valueClass="text-red-600"
                    />
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {attendanceLoading ? (
                        <div className="p-10 text-center text-slate-500">
                            Loading attendance...
                        </div>
                    ) : todayAttendance.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            No attendance records for today.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="border-b bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Worker
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Phone
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Check In
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Check Out
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Working Time
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {todayAttendance.map(
                                        (record) => (
                                            <tr
                                                key={record.id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4 font-semibold text-slate-900">
                                                    {
                                                        record.workerName
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-slate-600">
                                                    {
                                                        record.phone
                                                    }
                                                </td>

                                                <td className="px-5 py-4">
                                                    {formatAttendanceTime(
                                                        record.checkIn
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    {formatAttendanceTime(
                                                        record.checkOut
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    {record.workedMinutes
                                                        ? formatAttendanceMinutes(
                                                            record.workedMinutes
                                                        )
                                                        : '--'}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold ${record.checkOut
                                                            ? 'bg-violet-50 text-violet-700'
                                                            : record.checkIn
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-red-50 text-red-700'
                                                            }`}
                                                    >
                                                        {record.checkOut
                                                            ? 'Checked Out'
                                                            : record.checkIn
                                                                ? 'Working'
                                                                : 'Absent'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* =========================
                MONTHLY ATTENDANCE
            ========================= */}

            <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Monthly Attendance
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Review attendance, absence, and lateness for each worker.
                        </p>

                        <div className="mt-2 text-sm font-medium text-slate-600">
                            Working Days: {monthlyWorkingDays}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">
                                Month
                            </label>

                            <input
                                type="month"
                                value={attendanceMonth}
                                onChange={(e) =>
                                    setAttendanceMonth(
                                        e.target.value
                                    )
                                }
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">
                                Worker
                            </label>

                            <select
                                value={
                                    selectedAttendanceWorker
                                }
                                onChange={(e) =>
                                    setSelectedAttendanceWorker(
                                        e.target.value
                                    )
                                }
                                className="min-w-[180px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                            >
                                <option value="all">
                                    All Workers
                                </option>

                                {workers.map((worker) => (
                                    <option
                                        key={worker._id}
                                        value={String(
                                            worker._id
                                        )}
                                    >
                                        {worker.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={fetchAttendance}
                            disabled={attendanceLoading}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {attendanceLoading
                                ? 'Refreshing...'
                                : 'Refresh'}
                        </button>
                    </div>
                </div>

                {selectedMonthlyAttendance.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No worker attendance data available for this month.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px]">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Worker
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Present
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Absent
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Late Days
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Late Time
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Worked Time
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Cars Washed
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Worker Commission
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Attendance Rate
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {selectedMonthlyAttendance.map(
                                    (item) => {
                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {
                                                            item.name
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            item.phone
                                                        }
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 font-bold text-emerald-600">
                                                    {
                                                        item.present
                                                    }
                                                </td>

                                                <td className="px-5 py-4 font-bold text-red-600">
                                                    {
                                                        item.absent
                                                    }
                                                </td>

                                                <td className="px-5 py-4 font-bold text-amber-600">
                                                    {
                                                        item.lateDays
                                                    }
                                                </td>

                                                <td className="px-5 py-4">
                                                    {formatAttendanceMinutes(
                                                        item.lateMinutes
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    {formatAttendanceMinutes(
                                                        item.workedMinutes
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 font-bold text-blue-600">
                                                    {item.carsWashed}
                                                </td>

                                                <td className="px-5 py-4 font-bold text-emerald-600">
                                                    {item.workerCommission.toFixed(2)} EGP
                                                </td>

                                                <td className="px-5 py-4 font-bold text-slate-900">
                                                    {item.attendanceRate.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* =========================
                ADD WORKER
            ========================= */}

            {showAddForm && (
                <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Add Worker
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Create a new worker account
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleCloseAddForm}
                            disabled={workerLoading}
                            className="text-xl text-slate-400 hover:text-slate-700"
                        >
                            ×
                        </button>

                    </div>

                    {workerError && (
                        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {workerError}
                        </div>
                    )}

                    <form
                        onSubmit={handleAddWorker}
                        className="grid gap-5 md:grid-cols-2"
                    >

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Worker Name
                            </label>

                            <input
                                type="text"
                                value={workerName}
                                onChange={(e) =>
                                    setWorkerName(e.target.value)
                                }
                                placeholder="Enter worker name"
                                required
                                disabled={workerLoading}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Phone
                            </label>

                            <input
                                type="text"
                                value={workerPhone}
                                onChange={(e) =>
                                    setWorkerPhone(e.target.value)
                                }
                                placeholder="01012345678"
                                required
                                disabled={workerLoading}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>

                            <input
                                type="password"
                                value={workerPassword}
                                onChange={(e) =>
                                    setWorkerPassword(e.target.value)
                                }
                                placeholder="Minimum 6 characters"
                                required
                                minLength={6}
                                disabled={workerLoading}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                            />
                        </div>

                        <div className="flex items-end gap-3">

                            <button
                                type="submit"
                                disabled={workerLoading}
                                className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                                {workerLoading
                                    ? 'Creating...'
                                    : 'Create Worker'}
                            </button>

                            <button
                                type="button"
                                onClick={handleCloseAddForm}
                                disabled={workerLoading}
                                className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                        </div>

                    </form>
                </div>
            )}

            {/* =========================
                GENERAL ERROR
            ========================= */}

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* =========================
                EDIT WORKER MODAL
            ========================= */}

            {editingWorker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

                        <div className="mb-6 flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Edit Worker
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update worker information
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseEdit}
                                disabled={editLoading}
                                className="text-xl text-slate-400 hover:text-slate-700"
                            >
                                ×
                            </button>

                        </div>

                        {editError && (
                            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                {editError}
                            </div>
                        )}

                        <form
                            onSubmit={handleEditWorker}
                            className="space-y-5"
                        >

                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Worker Name
                                </label>

                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    required
                                    disabled={editLoading}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Phone
                                </label>

                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={(e) =>
                                        setEditPhone(e.target.value)
                                    }
                                    required
                                    disabled={editLoading}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) =>
                                        setEditPassword(e.target.value)
                                    }
                                    placeholder="Leave empty to keep current password"
                                    disabled={editLoading}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                                />

                                <p className="mt-1 text-xs text-slate-400">
                                    Leave empty if you do not want to change the password.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    disabled={editLoading}
                                    className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                >
                                    {editLoading
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =========================
                LOADING
            ========================= */}

            {loading ? (

                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                    <p className="text-slate-500">
                        Loading workers...
                    </p>
                </div>

            ) : workers.length === 0 ? (

                /* =========================
                EMPTY STATE
                ========================= */

                <div className="rounded-xl bg-white p-8 text-center shadow-sm">

                    <p className="text-slate-500">
                        No workers found.
                    </p>

                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="mt-4 text-sm font-medium text-slate-900 hover:underline"
                    >
                        Add your first worker
                    </button>

                </div>

            ) : (

                /* =========================
                WORKERS TABLE
                ========================= */

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="border-b bg-slate-50">

                                <tr>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                        Name
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                        Phone
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y">

                                {workers.map((worker) => (

                                    <tr
                                        key={worker._id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">
                                                {worker.name}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {worker.phone}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${worker.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {worker.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-4">

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenEdit(worker)
                                                    }
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>

                                                {/* Activate / Deactivate */}
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading === worker._id
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(worker)
                                                    }
                                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
                                                >
                                                    {actionLoading === worker._id
                                                        ? '...'
                                                        : worker.isActive
                                                            ? 'Deactivate'
                                                            : 'Activate'}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    disabled={
                                                        actionLoading === worker._id
                                                    }
                                                    onClick={() =>
                                                        handleDeleteWorker(worker)
                                                    }
                                                    className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
}

function AttendanceCard({
    label,
    value,
    valueClass = 'text-slate-900',
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
                {label}
            </p>

            <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
                {value}
            </p>
        </div>
    );
}

