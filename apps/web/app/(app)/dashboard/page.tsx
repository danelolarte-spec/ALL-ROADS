'use client';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { formatCurrency } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  Banknote,
  ClipboardList,
  Truck,
  Users,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { data } = useSWR('/dashboard', fetcher);

  if (!data) return <div className="text-sm text-gray-500">Cargando dashboard…</div>;
  const { kpis, series14d } = data;

  return (
    <>
      <PageHeader title="Dashboard gerencial" subtitle="Vista 360° de la operación" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Servicios hoy" value={kpis.serviciosHoy} icon={<ClipboardList size={18} />} />
        <KpiCard label="Pendientes" value={kpis.serviciosPendientes} tone="warning" icon={<Activity size={18} />} />
        <KpiCard label="Vehículos activos" value={kpis.vehiclesActivos} icon={<Truck size={18} />} />
        <KpiCard label="Conductores activos" value={kpis.driversActivos} icon={<Users size={18} />} />
        <KpiCard
          label="Ingresos del mes"
          value={formatCurrency(kpis.ingresosMes)}
          tone="positive"
          icon={<Banknote size={18} />}
        />
        <KpiCard
          label="Rentabilidad"
          value={`${kpis.rentabilidadPct}%`}
          hint={formatCurrency(kpis.rentabilidadMes)}
          tone={kpis.rentabilidadPct >= 30 ? 'positive' : kpis.rentabilidadPct >= 10 ? 'warning' : 'danger'}
          icon={<TrendingUp size={18} />}
        />
        <KpiCard
          label="Alertas documentales"
          value={kpis.alertasDocumentales}
          tone={kpis.docsVencidos > 0 ? 'danger' : 'warning'}
          hint={`${kpis.docsVencidos} vencidos`}
          icon={<AlertTriangle size={18} />}
        />
        <KpiCard
          label="Mantenimientos próx."
          value={kpis.mantenimientosProximos}
          tone="warning"
          icon={<Wrench size={18} />}
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold">Actividad últimos 14 días</div>
            <div className="text-xs text-gray-500">Servicios e ingresos</div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={series14d}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f5dee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1f5dee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="fecha" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="servicios"
                stroke="#1f5dee"
                strokeWidth={2}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
