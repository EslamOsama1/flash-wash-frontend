'use client';

import { useRouter } from 'next/navigation';

export default function WorkerLogout() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('workerToken');
        localStorage.removeItem('worker');

        document.cookie =
            'workerToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        router.push('/worker/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
        >
            Logout
        </button >
    );
}