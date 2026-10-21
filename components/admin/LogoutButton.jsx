'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        // Remove JWT from localStorage
        localStorage.removeItem('adminToken');

        // Remove JWT cookie
        document.cookie =
            'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        router.push('/admin/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
            <span>↪</span>
            <span>Logout</span>
        </button >
    );
}