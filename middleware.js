import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    const adminToken =
        request.cookies.get('adminToken')?.value;

    const workerToken =
        request.cookies.get('workerToken')?.value;

    // =========================
    // ADMIN PROTECTION
    // =========================

    if (
        pathname.startsWith('/admin') &&
        pathname !== '/admin/login'
    ) {
        if (!adminToken) {
            return NextResponse.redirect(
                new URL('/admin/login', request.url)
            );
        }
    }

    // If admin is already logged in
    if (
        pathname === '/admin/login' &&
        adminToken
    ) {
        return NextResponse.redirect(
            new URL('/admin', request.url)
        );
    }

    // =========================
    // WORKER PROTECTION
    // =========================

    if (
        pathname.startsWith('/worker') &&
        pathname !== '/worker/login'
    ) {
        if (!workerToken && !adminToken) {
            return NextResponse.redirect(
                new URL('/worker/login', request.url)
            );
        }
    }
    // If worker is already logged in
    if (
        pathname === '/worker/login' &&
        workerToken
    ) {
        return NextResponse.redirect(
            new URL('/worker', request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/worker/:path*',
    ],
};