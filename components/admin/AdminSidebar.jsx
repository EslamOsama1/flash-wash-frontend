'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { api } from '@/lib/api';

import {
    LayoutDashboard,
    ClipboardList,
    AlertTriangle,
    Users,
    UserRound,
    Package,
    Wallet,
    Receipt,
    Star,
    CarFront,
    Settings,
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Needs Attention', href: '/admin/needs-attention', icon: AlertTriangle },
    { label: 'Workers', href: '/admin/workers', icon: Users },
    { label: 'Helpers', href: '/admin/helpers', icon: UserRound },
    { label: 'Packages', href: '/admin/packages', icon: Package },
    { label: 'Settings', href: '/admin/payment-settings', icon: Settings },
    { label: 'Financial', href: '/admin/financial', icon: Wallet },
    { label: 'Expenses', href: '/admin/expenses', icon: Receipt },
    { label: 'Quality', href: '/admin/quality', icon: Star },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const isAccountActive = pathname.startsWith('/admin/account');

    const [businessLogo, setBusinessLogo] = useState('');
    const [logoFailed, setLogoFailed] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchBusinessLogo = async () => {
            try {
                const res = await api.get('/business-settings');
                const url = res?.data?.settings?.logo?.url;

                if (active && url) {
                    setBusinessLogo(
                        url.replace('/upload/', '/upload/f_auto,q_auto,w_240,h_240,c_fit/')
                    );
                    setLogoFailed(false);
                }
            } catch (error) {
                console.error('FETCH SIDEBAR BUSINESS LOGO ERROR:', error);
            }
        };

        fetchBusinessLogo();

        return () => {
            active = false;
        };
    }, []);

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
            {/* LOGO */}
            <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-white shadow-lg shadow-blue-600/20">
                    {businessLogo && !logoFailed ? (
                        <img
                            src={businessLogo}
                            alt="Flash Wash logo"
                            width="44"
                            height="44"
                            loading="eager"
                            decoding="async"
                            onError={() => setLogoFailed(true)}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-600">
                            <CarFront size={24} />
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <h1 className="text-lg font-bold tracking-tight text-slate-900">
                        Flash Wash
                    </h1>
                    <p className="text-xs font-medium text-slate-400">
                        Admin Panel
                    </p>
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Management
                </p>

                <div className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* BOTTOM SECTION */}
            <div className="shrink-0 border-t border-slate-100 p-4">
                <Link
                    href="/admin/account"
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${isAccountActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                        }`}
                >
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isAccountActive ? 'bg-blue-100' : 'bg-slate-200'
                            }`}
                    >
                        <Settings
                            size={17}
                            className={isAccountActive ? 'text-blue-600' : 'text-slate-600'}
                        />
                    </div>

                    <div className="min-w-0">
                        <p
                            className={`truncate text-sm font-semibold ${isAccountActive ? 'text-blue-700' : 'text-slate-800'
                                }`}
                        >
                            Administrator
                        </p>
                        <p className="text-xs text-slate-400">System Admin</p>
                    </div>
                </Link>

                <div className="mt-3">
                    <LogoutButton />
                </div>
            </div>
        </aside>
    );
}
