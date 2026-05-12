'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Briefcase,
  ClipboardList,
  LayoutGrid,
  Wrench,
  DollarSign,
  FileSpreadsheet,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/operations', label: 'Operaciones', icon: LayoutGrid },
  { href: '/services', label: 'Servicios', icon: ClipboardList },
  { href: '/vehicles', label: 'Vehículos', icon: Truck },
  { href: '/drivers', label: 'Conductores', icon: Users },
  { href: '/hr', label: 'Gestión humana', icon: Briefcase },
  { href: '/maintenance', label: 'Mantenimiento', icon: Wrench },
  { href: '/contracts', label: 'Contratos', icon: FileText },
  { href: '/excel', label: 'Carga masiva', icon: FileSpreadsheet },
  { href: '/financial', label: 'Financiero', icon: DollarSign },
  { href: '/routes', label: 'Rutas', icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-200">
        <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
          <Truck size={18} />
        </div>
        <div>
          <div className="font-semibold text-sm tracking-tight">ALL ROADS</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Logística</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon size={17} />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-gray-200 text-[11px] text-gray-400">
        v0.1.0 — SaaS modular
      </div>
    </aside>
  );
}
