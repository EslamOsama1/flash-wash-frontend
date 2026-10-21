'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader } from '@/components/shared/Loader';
import { Button } from '@/components/shared/Button';
import { RefreshCw } from 'lucide-react';
import DashboardStats from '@/components/operations/DashboardStats';
import NeedsAttentionList from '@/components/operations/NeedsAttentionList';
import OrdersTable from '@/components/operations/OrdersTable';

export default function OperationsDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchDashboard = useCallback(async (isManualRefresh = false) => {
    const token = localStorage.getItem('operationalManagerToken');

    if (!token) {
      router.replace('/operations/login');
      return;
    }

    if (isManualRefresh) setRefreshing(true);

    try {
      const res = await api.get('/operations/dashboard');
      setData(res.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);

      if (
        err?.status === 401 ||
        err?.response?.status === 401 ||
        err?.message?.includes('not logged in') ||
        err?.message?.includes('Invalid token')
      ) {
        localStorage.removeItem('operationalManagerToken');
        router.replace('/operations/login');
        return;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleConfirmPayment = async (orderId) => {
    setData(prev => {
      if (!prev) return prev;

      const order = prev.needsAttentionOrders?.find(
        o => o.id === orderId || o._id === orderId
      );

      if (!order) return prev;

      const updatedOrder = {
        ...order,
        paymentStatus: 'paid',
        status: 'waiting',
        needsAttention: false,
      };

      return {
        ...prev,
        needsAttentionOrders: prev.needsAttentionOrders.filter(
          o => o.id !== orderId && o._id !== orderId
        ),
        waitingOrders: [updatedOrder, ...prev.waitingOrders],
        stats: {
          ...prev.stats,
          needsAttention: Math.max(
            0,
            prev.stats.needsAttention - 1
          ),
          waiting: prev.stats.waiting + 1,
        },
      };
    });

    try {
      await api.patch(
        `/operations/orders/${orderId}/confirm-payment`
      );
    } catch (err) {
      alert('فشل في تأكيد الدفع');
      fetchDashboard();
    }
  };

  const handleRemovePendingOrder = async (orderId) => {
    try {
      console.log('REMOVING PENDING ORDER:', orderId);

      const res = await api.patch(
        `/operations/orders/${orderId}/remove`
      );

      console.log('REMOVE RESPONSE:', res);

      await fetchDashboard();
    } catch (err) {
      console.error('REMOVE PENDING ORDER ERROR:', err);

      alert(err.message || 'فشل في إزالة الطلب');

      await fetchDashboard();
    }
  };

  const handleCancelOrder = async (orderId) => {
    setData(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        needsAttentionOrders:
          prev.needsAttentionOrders.filter(
            o => o.id !== orderId && o._id !== orderId
          ),
        pendingOrders: prev.pendingOrders.filter(
          o => o.id !== orderId && o._id !== orderId
        ),
        stats: {
          ...prev.stats,
          needsAttention: Math.max(
            0,
            prev.stats.needsAttention - 1
          ),
        },
      };
    });

    try {
      await api.patch(
        `/operations/orders/${orderId}/cancel`
      );
    } catch (err) {
      alert('فشل في الإلغاء');
      fetchDashboard();
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
          onClick={() => fetchDashboard(true)}
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

      {data.needsAttentionOrders?.length > 0 && (
        <NeedsAttentionList
          orders={data.needsAttentionOrders}
          onConfirm={handleConfirmPayment}
          onCancel={handleCancelOrder}
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
            onRemove={handleRemovePendingOrder}
          />
        </div>
      )}
    </div>
  );
}
