import OperationsSidebar from './components/OperationsSidebar';

export default function OperationsLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <OperationsSidebar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}