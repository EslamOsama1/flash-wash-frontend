'use client';

import { useCallback, useEffect, useState } from 'react';
import WaitingCars from '@/components/worker/WaitingCars';
import ActiveWash from '@/components/worker/ActiveWash';
import { api } from '@/lib/api';

export default function WorkerPage() {
    const [waitingCars, setWaitingCars] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchWaitingOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/Orders/waiting');

            console.log('========== WORKER DEBUG ==========');
            console.log('FULL RESPONSE:', res);
            console.log('res.data:', res?.data);
            console.log('washOrders:', res?.data?.washOrders);
            console.log('==================================');

            const orders = res?.data?.washOrders || [];

            setWaitingCars(orders);
        } catch (err) {
            console.error('Failed to fetch waiting orders:', err);
            setError(err.message || 'Failed to load waiting cars');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWaitingOrders();
    }, [fetchWaitingOrders]);

    const handleStart = (updatedOrder) => {
        setActiveOrder(updatedOrder);

        setWaitingCars((prev) =>
            prev.filter(
                (order) =>
                    (order._id || order.id) !==
                    (updatedOrder._id || updatedOrder.id)
            )
        );
    };

    const handleFinish = () => {
        setActiveOrder(null);
        fetchWaitingOrders();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]" >
                <p className="text-gray-500" > Loading...</p >
            </div >
        );
    }

    if (error) {
        return (
            <div className="text-center mt-20" >
                <p className="text-red-500 mb-4" > {error}</p >

                <button
                    onClick={fetchWaitingOrders}
                    className="px-4 py-2 bg-black text-white rounded-lg"
                >
                    Try Again
                </button >
            </div >
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4" >
            <h1 className="text-2xl font-bold mb-6" >
                Worker Dashboard
            </h1 >

            {
                activeOrder ? (
                    <ActiveWash
                        order={activeOrder}
                        onFinish={handleFinish}
                    />
                ) : (
                    <WaitingCars
                        cars={waitingCars}
                        onStart={handleStart}
                    />
                )
            }
        </div >
    );
}