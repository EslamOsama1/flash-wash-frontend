import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">

            <AdminSidebar />

            <main className="min-h-screen lg:pl-64">
                {children}
            </main>

        </div>
    );
}