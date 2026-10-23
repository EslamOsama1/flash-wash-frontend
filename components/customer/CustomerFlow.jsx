'use client';

import { useState, useEffect } from 'react';
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

export default function CustomerFlow() {
  const [currentStep, setCurrentStep] = useState(STEPS.INFO);
  const [customerData, setCustomerData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [order, setOrder] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load saved customer data and active order
  useEffect(() => {
    const saved = storage.get('customerData');

    if (saved) {
      setCustomerData(saved);
    }

    const activeOrderId = storage.get('activeOrderId');

    if (!activeOrderId) {
      setIsInitializing(false);
      return;
    }

    api.get(`/Orders/${activeOrderId}`)
      .then((response) => {
        console.log('RESTORED ORDER RESPONSE:', response);

        const fetchedOrder = response?.data?.washOrder;

        console.log('RESTORED ORDER:', fetchedOrder);

        if (!fetchedOrder) {
          throw new Error('Order not found in response');
        }

        setOrder(fetchedOrder);

        // Restore package and add-ons from the active order
        if (fetchedOrder.package) {
          setSelectedPackage(fetchedOrder.package);
        }

        if (Array.isArray(fetchedOrder.addOns)) {
          setSelectedAddons(fetchedOrder.addOns);
        }

        if (fetchedOrder.status === 'cancelled') {
          setCurrentStep(STEPS.STATUS);
        } else if (fetchedOrder.needsAttention) {
          setCurrentStep(STEPS.REVIEW);
        } else if (fetchedOrder.paymentStatus === 'pending') {
          setCurrentStep(STEPS.PAYMENT);
        } else {
          setCurrentStep(STEPS.STATUS);
        }
      })
      .catch((err) => {
        console.error('FAILED TO RESTORE ORDER:', err);
        storage.remove('activeOrderId');
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

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

      console.log('CREATE ORDER RESPONSE:', res);

      if (!res?.data?.newOrder) {
        throw new Error('Order was created but response is invalid');
      }

      const newOrder = res.data.newOrder;

      setOrder(newOrder);

      storage.set('activeOrderId', newOrder._id);

      setCurrentStep(STEPS.PAYMENT);
    } catch (err) {
      console.error('CREATE ORDER ERROR:', err);

      alert(`Failed to create order: ${err.message}`);
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

  const handleOrderCompleted = (completedOrder) => {
    console.log('ORDER COMPLETED:', completedOrder);

    setOrder(completedOrder);
    setCurrentStep(STEPS.STATUS);
  };

  const handleNewOrder = () => {
    // Keep customer information unchanged.
    // Clear the previous order and package selections only.
    storage.remove('activeOrderId');

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
            customerData={customerData}
            pkg={selectedPackage}
            addons={selectedAddons}
            onBack={() => setCurrentStep(STEPS.PACKAGES)}
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