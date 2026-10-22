import { Button } from '@/components/shared/Button';
import { AlertCircle, Eye } from 'lucide-react';
import { useState } from 'react';

export default function NeedsAttentionList({ orders, onConfirm, onCancel }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6" >
      <div className="flex items-center gap-2 mb-6 text-red-700" >
        <AlertCircle size={24} />
        <h2 className="text-xl font-bold" > طلبات تحتاج للتدخل({orders.length})</h2 >
      </div >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
        {
          orders.map(order => {
            console.log('NEEDS ATTENTION ORDER:', order);
            console.log('PAYMENT SCREENSHOT:', order.paymentScreenshot);
            const id = order.id || order._id;
            return (
              <div key={id} className="bg-white rounded-xl shadow-sm border border-red-100 p-4 flex flex-col gap-4" >
                <div className="flex justify-between items-start" >
                  <div>
                    <h3 className="font-bold text-gray-900">{order.customerName} - {order.car}</h3>
                    <p className="text-sm text-gray-500 mt-1" > {order.phone} | لوحة: {order.plateNumber}</p >
                  </div >
                  <div className="text-left" >
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded" > يحتاج تدخل</span >
                  </div >
                </div >

                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2" >
                  <div className="flex justify-between" >
                    <span className="text-gray-500" > الإجمالي:</span >
                    <span className="font-bold" > {order.totalPrice} ج.م</span >
                  </div >
                  <div className="flex justify-between" >
                    <span className="text-gray-500" > طريقة الدفع:</span >
                    <span className="font-medium capitalize" > {order.paymentMethod?.replace('_', ' ')}</span >
                  </div >
                  {
                    order.attentionReason && (
                      <div className="text-red-600 mt-2 text-xs font-medium">
                        السبب: {order.attentionReason}
                      </div >
                    )
                  }
                </div >

                {
                  order.paymentScreenshot && (
                    <button
                      onClick={() => setSelectedImage(order.paymentScreenshot)}
                      className="flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors border border-blue-100"
                    >
                      <Eye size={16} /> عرض إيصال الدفع
                    </button>
                  )
                }

                <div className="flex gap-3 mt-auto pt-2" >
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من تأكيد الدفع لهذا الطلب؟')) {
                        onConfirm(id);
                      }
                    }}
                  >
                    تأكيد الدفع
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من إلغاء هذا الطلب نهائياً؟')) {
                        onCancel(id);
                      }
                    }}
                  >
                    إلغاء الطلب
                  </Button>
                </div >
              </div >
            );
          })}
      </div >

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl items-center justify-center overflow-auto rounded-xl bg-black p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Payment Receipt"
              className="block h-auto w-auto max-h-[85vh] max-w-full rounded-lg object-contain"
            />

            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white px-4 py-2 font-bold text-black shadow-lg hover:bg-gray-100"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

    </div >
  );
}
