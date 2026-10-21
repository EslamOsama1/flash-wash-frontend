'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    LogOut,
} from 'lucide-react';

export default function OperationsSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('operationalManagerToken');
        router.push('/operations/login');
    };

    const menuItems = [
        {
            label: 'Dashboard',
            href: '/operations',
            icon: LayoutDashboard,
        },
        {
            label: 'Orders History',
            href: '/operations/orders',
            icon: ClipboardList,
        },
    ];

    return (
        <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white">

            {/* Logo */}
            <div className="border-b border-slate-200 px-6 py-6">
                <h1 className="text-xl font-bold text-slate-900">
                    Flash Wash
                </h1>

                <p className="mt-1 text-xs font-medium text-slate-400">
                    Operational Manager
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        item.href === '/operations'
                            ? pathname === '/operations'
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Icon size={19} />

                            <span>{item.label}</span>
                        </Link>
                    );
                })}

            </nav>

            {/* Logout */}
            <div className="border-t border-slate-200 p-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                    <LogOut size={19} />

                    <span>Logout</span>
                </button>
            </div>

        </aside>
    );
}