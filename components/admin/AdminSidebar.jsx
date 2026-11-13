'use client';

import { useEffect, useRef, useState } from 'react';
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
    Menu,
    X,
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
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const menuButtonRef = useRef(null);
    const closeButtonRef = useRef(null);
    const mobileDrawerRef = useRef(null);

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

    useEffect(() => {
        if (!isMobileOpen) return;

        const previousOverflow = document.body.style.overflow;
        const menuButton = menuButtonRef.current;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsMobileOpen(false);
            }

            if (event.key !== 'Tab') return;
            const focusable = mobileDrawerRef.current?.querySelectorAll('a[href], button:not([disabled])');
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        const closeOnDesktop = () => {
            if (window.innerWidth >= 1024) setIsMobileOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', closeOnDesktop);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', closeOnDesktop);
            if (menuButton?.isConnected) menuButton.focus();
        };
    }, [isMobileOpen]);

    return (
        <>
            {pathname !== '/admin/login' && (
                <header className="flex h-16 w-full items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
                    <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setIsMobileOpen(true)}
                        aria-label="Open admin navigation"
                        aria-expanded={isMobileOpen}
                        aria-controls="admin-mobile-navigation"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="min-w-0 truncate text-base font-bold text-slate-900">Flash Wash Admin</span>
                </header>
            )}

            {isMobileOpen && (
                <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    aria-label="Close admin navigation"
                    className="fixed inset-0 z-[60] bg-slate-900/50 lg:hidden"
                />
            )}

            <aside
                id="admin-mobile-navigation"
                ref={mobileDrawerRef}
                role="dialog"
                aria-label="Admin navigation"
                aria-modal={isMobileOpen ? true : undefined}
                aria-hidden={!isMobileOpen}
                inert={!isMobileOpen}
                className={`fixed inset-y-0 left-0 z-[70] flex w-64 max-w-[calc(100vw-2rem)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:hidden ${isMobileOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'}`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
                            <CarFront size={24} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">Flash Wash</p>
                            <p className="text-xs font-medium text-slate-400">Admin Panel</p>
                        </div>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close admin navigation"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                        <X size={21} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Admin pages">
                    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Management</p>
                    <div className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    aria-current={isActive ? 'page' : undefined}
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

                <div className="shrink-0 border-t border-slate-100 p-4">
                    <Link
                        href="/admin/account"
                        onClick={() => setIsMobileOpen(false)}
                        aria-current={isAccountActive ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${isAccountActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                            }`}
                    >
                        <Settings size={19} />
                        <span>Administrator</span>
                    </Link>
                    <div className="mt-3" onClick={() => setIsMobileOpen(false)}>
                        <LogoutButton />
                    </div>
                </div>
            </aside>

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
        </>
    );
}
