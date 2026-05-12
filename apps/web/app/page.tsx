'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? '/dashboard' : '/login');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-gray-500">Cargando…</div>
    </div>
  );
}
