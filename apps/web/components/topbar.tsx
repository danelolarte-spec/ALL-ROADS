'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Search } from 'lucide-react';
import { clearToken, getStoredUser } from '@/lib/api';

export function Topbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function logout() {
    clearToken();
    router.replace('/login');
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Search size={16} />
        <input
          className="bg-transparent outline-none w-72"
          placeholder="Buscar servicios, vehículos, conductores…"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Bell size={18} className="text-gray-500" />
        </button>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <div className="font-medium text-gray-800">{user.fullName}</div>
              <div className="text-gray-500">{user.role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
              {(user.fullName || 'U').slice(0, 1)}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title="Salir"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
