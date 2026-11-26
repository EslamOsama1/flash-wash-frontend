'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { api } from '@/lib/api';
import CustomerForm from './CustomerForm';
import PackageSelection from './PackageSelection';
import OrderSummary from './OrderSummary';
import PaymentUpload from './PaymentUpload';
import OrderStatus from './OrderStatus';
import { Loader } from '@/components/shared/Loader';
import OrderReview from './OrderReview';
import Rating from './Rating';

const STEPS = {
  INFO: 'INFO',
  PACKAGES: 'PACKAGES',
  SUMMARY: 'SUMMARY',
  PAYMENT: 'PAYMENT',
  REVIEW: 'REVIEW',
  STATUS: 'STATUS',
  RATING: 'RATING',
};

const getOrderStep = (existingOrder) => {
  if (['cancelled', 'completed', 'waiting', 'washing'].includes(existingOrder.status)) {
    return STEPS.STATUS;
  }

  if (existingOrder.status !== 'pending') return null;
  if (existingOrder.needsAttention) return STEPS.REVIEW;
  if (existingOrder.paymentStatus === 'pending') return STEPS.PAYMENT;
  if (existingOrder.paymentStatus === 'paid') return STEPS.STATUS;

  return null;
};

export default function CustomerFlow() {
  const [currentStep, setCurrentStep] = useState(STEPS.INFO);
  const [customerData, setCustomerData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [order, setOrder] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [restoreError, setRestoreError] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const creationInFlight = useRef(false);

  // Load saved customer data and active order
  useEffect(() => {
    let active = true;
    const saved = storage.get('customerData');

    if (saved) {
      setCustomerData(saved);
    }

    const activeOrderId = storage.get('activeOrderId');

    if (!activeOrderId) {
      setIsInitializing(false);
      return;
    }

    setRestoreError('');
    api.get(`/Orders/${activeOrderId}`)
      .then((response) => {
        const fetchedOrder = response?.data?.washOrder;
        const nextStep = fetchedOrder && getOrderStep(fetchedOrder);

        if (
          !fetchedOrder?._id ||
          String(fetchedOrder._id) !== String(activeOrderId) ||
          !nextStep ||
          (nextStep === STEPS.PAYMENT &&
            (typeof fetchedOrder.package !== 'object' ||
              !fetchedOrder.package ||
              !Array.isArray(fetchedOrder.addOns)))
        ) {
          throw new Error('The saved order could not be verified.');
        }

        if (!active) return;

        const restoredCustomer = {
          customerName: fetchedOrder.customerName,
          phone: fetchedOrder.phone,
          car: fetchedOrder.car,
          plateNumber: fetchedOrder.plateNumber,
          helper: fetchedOrder.helper?._id || fetchedOrder.helper || '',
        };

        setCustomerData(restoredCustomer);
        storage.set('customerData', restoredCustomer);
        setOrder(fetchedOrder);

        setSelectedPackage(fetchedOrder.package && typeof fetchedOrder.package === 'object'
          ? { ...fetchedOrder.package, price: fetchedOrder.packagePrice }
          : null);
        setSelectedAddons(Array.isArray(fetchedOrder.addOns)
          ? fetchedOrder.addOns.map((addon, index) => ({
            ...addon,
            ...fetchedOrder.addOnSnapshots?.[index],
          }))
          : []);
        setCurrentStep(nextStep);
      })
      .catch((err) => {
        if (!active) return;
        console.error('FAILED TO RESTORE ORDER:', err);
        if (err.status === 404 && err.message === 'Wash order not found') {
          storage.remove('activeOrderId');
          setOrder(null);
          setCurrentStep(STEPS.INFO);
        } else {
          setRestoreError('Unable to verify your existing order. Please retry before creating another order.');
        }
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
    };
  }, [restoreAttempt]);

  const retryRestore = () => {
    setIsInitializing(true);
    setRestoreAttempt((attempt) => attempt + 1);
  };

  const handleInfoSubmit = (data) => {
    setCustomerData(data);
    storage.set('customerData', data);
    setCurrentStep(STEPS.PACKAGES);
  };

  const handlePackageSubmit = (pkg, addons) => {
    setSelectedPackage(pkg);
    setSelectedAddons(addons);
    setCurrentStep(STEPS.SUMMARY);
  };

  const handleOrderConfirm = async () => {
    if (creationInFlight.current) return;

    if (order?._id || order?.id) {
      retryRestore();
      return;
    }

    if (storage.get('activeOrderId')) {
      retryRestore();
      return;
    }

    creationInFlight.current = true;
    setIsCreatingOrder(true);

    try {
      const payload = {
        customerName: customerData.customerName,
        phone: customerData.phone,
        car: customerData.car,
        plateNumber: customerData.plateNumber,
        package: selectedPackage._id,
        addOns: selectedAddons.map((addon) => addon._id),
        helper: customerData.helper || null,
      };


      console.log('CREATE ORDER PAYLOAD:', payload);

      const res = await api.post('/Orders/', payload);

      if (!res?.data?.newOrder?._id) {
        throw new Error('Order was created but response is invalid');
      }

      const newOrder = res.data.newOrder;

      setOrder(newOrder);
      setSelectedPackage((selected) => ({
        ...selected,
        price: newOrder.packagePrice,
      }));
      const selectedAddonsById = new Map(
        selectedAddons.map((addon) => [String(addon._id), addon])
      );
      setSelectedAddons((newOrder.addOns || []).map((addonId, index) => ({
        ...selectedAddonsById.get(String(addonId)),
        _id: addonId,
        ...newOrder.addOnSnapshots?.[index],
      })));

      storage.set('activeOrderCancellation', {
        orderId: newOrder._id,
        token: res.data.cancellationToken,
      });
      storage.set('activeOrderId', newOrder._id);

      setCurrentStep(STEPS.PAYMENT);
    } catch (err) {
      console.error('CREATE ORDER ERROR:', err);

      alert(`Failed to create order: ${err.message}`);
    } finally {
      creationInFlight.current = false;
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentComplete = (updatedOrder) => {
    console.log('PAYMENT COMPLETED ORDER:', updatedOrder);
    console.log('NEEDS ATTENTION:', updatedOrder?.needsAttention);
    console.log('ORDER ID:', updatedOrder?._id || updatedOrder?.id);

    setOrder(updatedOrder);

    const orderNeedsReview =
      updatedOrder?.needsAttention === true;

    if (orderNeedsReview) {
      setCurrentStep(STEPS.REVIEW);
      return;
    }

    setCurrentStep(STEPS.STATUS);
  };

  const handleOrderCompleted = useCallback((completedOrder) => {
    const activeOrderId = storage.get('activeOrderId');
    if (!activeOrderId || String(activeOrderId) !== String(completedOrder?._id || completedOrder?.id)) {
      return;
    }

    console.log('ORDER COMPLETED:', completedOrder);

    setOrder(completedOrder);
    setCurrentStep(STEPS.STATUS);
  }, []);

  const handleNewOrder = () => {
    // Keep customer information unchanged.
    // Clear the previous order and package selections only.
    storage.remove('activeOrderId');
    storage.remove('activeOrderCancellation');

    setOrder(null);
    setSelectedPackage(null);
    setSelectedAddons([]);

    // Return directly to package selection.
    setCurrentStep(STEPS.PACKAGES);
  };

  if (isInitializing) {
    return (
      <div className="p-12" >
        <Loader text="Loading..." />
      </div >
    );
  }

  if (restoreError) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
        <p role="alert" className="mb-5 text-red-600">{restoreError}</p>
        <button type="button" onClick={retryRestore} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
          Retry loading order
        </button>
      </div>
    );
  }

  return (
    <div className="w-full" >
      {currentStep === STEPS.INFO && (
        <CustomerForm
          initialData={customerData}
          onSubmit={handleInfoSubmit}
        />
      )
      }

      {
        currentStep === STEPS.PACKAGES && (
          <PackageSelection
            onBack={() => setCurrentStep(STEPS.INFO)}
            onSelect={handlePackageSubmit}
            initialPackage={selectedPackage}
            initialAddons={selectedAddons}
          />
        )
      }

      {
        currentStep === STEPS.SUMMARY && (
          <OrderSummary
            customerData={order || customerData}
            pkg={selectedPackage}
            addons={selectedAddons}
            totalPrice={order?.totalPrice}
            isLoading={isCreatingOrder}
            onBack={() => {
              if (creationInFlight.current) return;
              if (order) {
                retryRestore();
              } else {
                setCurrentStep(STEPS.PACKAGES);
              }
            }}
            onConfirm={handleOrderConfirm}
          />
        )
      }

      {
        currentStep === STEPS.PAYMENT && (
          <PaymentUpload
            order={order}
            onComplete={handlePaymentComplete}
            onBack={() => setCurrentStep(STEPS.SUMMARY)}
          />
        )
      }

      {
        currentStep === STEPS.STATUS && (
          <OrderStatus
            orderId={order?._id || order?.id}
            initialOrder={order}
            onNewOrder={handleNewOrder}
            onCompleted={handleOrderCompleted}
          />
        )
      }

      {
        currentStep === STEPS.REVIEW && (
          <OrderReview
            orderId={order?._id || order?.id}
            initialOrder={order}
            onApproved={(updatedOrder) => {
              setOrder(updatedOrder);
              setCurrentStep(STEPS.STATUS);
            }}
            onRejected={(updatedOrder) => {
              setOrder(updatedOrder);
              setCurrentStep(STEPS.STATUS);
            }}
          />
        )
      }

      {
        currentStep === STEPS.RATING && (
          <Rating
            orderId={order?._id || order?.id}
            onComplete={(updatedOrder) => {
              setOrder(updatedOrder || order);
              setCurrentStep(STEPS.STATUS);
            }}
          />
        )
      }
    </div >
  );
}
