'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

import WaitingCars from '@/components/worker/WaitingCars';
import ActiveWash from '@/components/worker/ActiveWash';
import WorkerAttendance from '@/components/worker/WorkerAttendance';
import { Loader } from '@/components/shared/Loader';

export default function WorkerPage() {
  const [activeWash, setActiveWash] = useState(null);
  const [waitingCars, setWaitingCars] = useState([]);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const [loading, setLoading] = useState(true);

  // =========================
  // CHECK ATTENDANCE
  // =========================

  const fetchAttendance = useCallback(async () => {
    try {
      setAttendanceLoading(true);

      const res = await api.get('/attendance/me');

      console.log('WORKER ATTENDANCE:', res);

      const attendance = res?.data?.attendance;

      const checkedIn =
        !!attendance?.checkIn?.time &&
        !attendance?.checkOut?.time;

      setIsCheckedIn(checkedIn);

      return checkedIn;
    } catch (err) {
      console.error(
        'FAILED TO FETCH ATTENDANCE:',
        err
      );

      setIsCheckedIn(false);

      return false;
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  // =========================
  // FETCH ACTIVE WASH
  // =========================

  const fetchActiveWash = useCallback(async () => {
    try {
      const res = await api.get('/Orders/my-active-wash');

      console.log('ACTIVE WASH RESPONSE:', res);

      const order = res?.data?.washOrder;

      if (order && order.status === 'washing') {
        setActiveWash(order);
      } else {
        setActiveWash(null);
      }
    } catch (err) {
      console.error('FAILED TO FETCH ACTIVE WASH:', err);
    }
  }, []);

  // =========================
  // FETCH WAITING CARS
  // =========================

  const fetchCars = useCallback(async () => {
    try {
      const res = await api.get('/Orders/waiting');

      console.log('WORKER RESPONSE:', res);

      const cars = res?.data?.washOrders || [];

      console.log('WAITING CARS:', cars);

      const waiting = cars.filter(
        (car) => car.status === 'waiting'
      );

      setWaitingCars(waiting);
    } catch (err) {
      console.error(
        'FAILED TO FETCH WAITING CARS:',
        err
      );

      // Keep the current UI state if polling temporarily fails.
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    const initializeWorker = async () => {
      const checkedIn = await fetchAttendance();

      if (!checkedIn) {
        setActiveWash(null);
        setWaitingCars([]);
        setLoading(false);
        return;
      }

      // Restore active wash after refresh.
      await fetchActiveWash();

      // Fetch waiting cars.
      await fetchCars();
    };

    initializeWorker();
  }, [fetchAttendance, fetchActiveWash, fetchCars]);

  // =========================
  // WAITING CARS POLLING
  // =========================

  useEffect(() => {
    // Do not request waiting cars after check-out or while a wash is active.
    if (!isCheckedIn || activeWash) {
      return;
    }

    fetchCars();

    const interval = setInterval(() => {
      fetchCars();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isCheckedIn, activeWash, fetchCars]);

  // =========================
  // LOADING
  // =========================

  if (loading || attendanceLoading) {
    return (
      <Loader
        text="Checking attendance..."
        className="mt-20"
      />
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen">
      <WorkerAttendance
        onAttendanceChange={(checkedIn) => {
          setIsCheckedIn(checkedIn);

          if (!checkedIn) {
            setWaitingCars([]);
          }
        }}
      />

      {isCheckedIn && (
        <>
          {activeWash ? (
            <ActiveWash
              order={activeWash}
              onFinish={async () => {
                setActiveWash(null);
                await fetchCars();
              }}
            />
          ) : (
            <WaitingCars
              cars={waitingCars}
              onStart={(order) => {
                setActiveWash(order);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
