'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader } from '@/components/shared/Loader';
import { Button } from '@/components/shared/Button';
import { RefreshCw } from 'lucide-react';
import DashboardStats from '@/components/operations/DashboardStats';
import NeedsAttentionList from '@/components/operations/NeedsAttentionList';
import OrdersTable from '@/components/operations/OrdersTable';
import CancellationRequests from '@/components/operations/CancellationRequests';

export default function OperationsDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const dashboardRequest = useRef(null);
  const actionsInFlight = useRef(new Set());
  const mounted = useRef(false);

  const fetchDashboard = useCallback(() => {
    if (!mounted.current) return;
    if (dashboardRequest.current) return dashboardRequest.current.promise;

    const token = localStorage.getItem('operationalManagerToken');

    if (!token) {
      router.replace('/operations/login');
      return;
    }

    const request = {};
    dashboardRequest.current = request;
    request.promise = (async () => {
      try {
        const res = await api.get('/operations/dashboard');
        if (dashboardRequest.current !== request) return dashboardRequest.current?.promise;

        setData(res.data);
        setLastUpdate(new Date());
      } catch (err) {
        if (dashboardRequest.current !== request) return dashboardRequest.current?.promise;
        console.error(err);

        if (
          err?.status === 401 ||
          err?.response?.status === 401 ||
          err?.message?.includes('not logged in') ||
          err?.message?.includes('Invalid token')
        ) {
          localStorage.removeItem('operationalManagerToken');
          router.replace('/operations/login');
        }
      } finally {
        if (dashboardRequest.current === request) {
          dashboardRequest.current = null;
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return request.promise;
  }, [router]);

  useEffect(() => {
    mounted.current = true;
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);

    return () => {
      clearInterval(interval);
      mounted.current = false;
      dashboardRequest.current = null;
    };
  }, [fetchDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const refreshAfterAction = () => {
    // Any GET started before the successful mutation may contain old data.
    dashboardRequest.current = null;
    return fetchDashboard();
  };

  const runOrderAction = async (orderId, action, errorMessage) => {
    const pending = actionsInFlight.current;
    if (pending.has(orderId)) return;
    pending.add(orderId);
    try {
      await api.patch(`/operations/orders/${orderId}/${action}`);
      await refreshAfterAction();
    } catch (err) {
      if (action === 'remove') {
        console.error('REMOVE PENDING ORDER ERROR:', err);
      }
      alert(action === 'remove' && err.message ? err.message : errorMessage);
      await fetchDashboard();
    } finally {
      pending.delete(orderId);
    }
  };

  if (loading && !data) {
    return (
      <Loader
        text="جاري تحميل اللوحة..."
        className="mt-20"
      />
    );
  }

  if (!data) {
    return (
      <div className="text-center mt-20 text-red-500">
        حدث خطأ في جلب البيانات
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div className="text-sm text-gray-500">
          آخر تحديث:{' '}
          <span
            className="font-semibold text-gray-900"
            suppressHydrationWarning
          >
            {lastUpdate.toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          isLoading={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          تحديث
        </Button>
      </div>

      <DashboardStats stats={data.stats} />
      <CancellationRequests orders={data.cancellationRequests} onApproved={refreshAfterAction} />

      {data.needsAttentionOrders?.length > 0 && (
        <NeedsAttentionList
          orders={data.needsAttentionOrders}
          onConfirm={id => runOrderAction(id, 'confirm-payment', 'فشل في تأكيد الدفع')}
          onCancel={id => runOrderAction(id, 'cancel', 'فشل في الإلغاء')}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OrdersTable
          title="في الانتظار"
          orders={data.waitingOrders}
          type="waiting"
        />

        <OrdersTable
          title="جاري الغسيل"
          orders={data.washingOrders}
          type="washing"
        />
      </div>

      {data.pendingOrders?.length > 0 && (
        <div className="mt-8">
          <OrdersTable
            title="الطلبات المعلقة (Pending)"
            orders={data.pendingOrders}
            type="pending"
            onRemove={id => runOrderAction(id, 'remove', 'فشل في إزالة الطلب')}
          />
        </div>
      )}
    </div>
  );
}
