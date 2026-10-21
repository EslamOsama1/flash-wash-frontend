import CustomerFlow from '@/components/customer/CustomerFlow';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <CustomerFlow />
      </div>
    </main>
  );
}