import WorkerLogout from '@/components/worker/WorkerLogout';

export default function WorkerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" >
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm" >
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between" >

          <h1 className="text-xl font-bold text-gray-900" >
            Worker Dashboard
          </h1 >

          <WorkerLogout />

        </div >
      </header >

      <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full" >
        {children}
      </main >
    </div >
  );
}