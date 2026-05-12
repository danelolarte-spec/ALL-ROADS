'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Wand2 } from 'lucide-react';
import { api, fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';
import { KpiCard } from '@/components/kpi-card';
import { formatDate, statusBadge } from '@/lib/utils';

export default function OperationsPage() {
  const { data, mutate } = useSWR<any>('/operations/board', fetcher, { refreshInterval: 10000 });
  const [assignFor, setAssignFor] = useState<any | null>(null);

  if (!data) return <div className="text-sm text-gray-500">Cargando tablero…</div>;

  return (
    <>
      <PageHeader title="Operaciones" subtitle="Tablero en tiempo real (auto-refresh 10s)" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Vehículos libres" value={data.counters.vehiclesDisponibles} />
        <KpiCard label="En servicio" value={data.counters.vehiclesOcupados} tone="warning" />
        <KpiCard label="Conductores activos" value={data.counters.driversActivos} />
        <KpiCard label="Pendientes" value={data.counters.pendientes} tone="warning" />
        <KpiCard label="Asignados" value={data.counters.asignados} />
        <KpiCard label="En ejecución" value={data.counters.enEjecucion} tone="positive" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <KanbanColumn title="Pendientes" tone="badge-yellow" services={data.services.pendientes} onAssign={setAssignFor} />
        <KanbanColumn title="Asignados" tone="badge-blue" services={data.services.asignados} onStart={(s) => updateStatus(s.id, 'EN_EJECUCION', mutate)} />
        <KanbanColumn title="En ejecución" tone="badge-green" services={data.services.enEjecucion} onComplete={(s) => updateStatus(s.id, 'COMPLETADO', mutate)} />
      </div>

      {assignFor && (
        <AssignModal service={assignFor} onClose={() => setAssignFor(null)} onAssigned={() => { setAssignFor(null); mutate(); }} />
      )}
    </>
  );
}

async function updateStatus(id: string, status: string, mutate: any) {
  await api(`/services/${id}/status`, { method: 'POST', json: { status } });
  mutate();
}

function KanbanColumn({
  title,
  tone,
  services,
  onAssign,
  onStart,
  onComplete,
}: {
  title: string;
  tone: string;
  services: any[];
  onAssign?: (s: any) => void;
  onStart?: (s: any) => void;
  onComplete?: (s: any) => void;
}) {
  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <span className={`badge ${tone}`}>{title}</span>
        <span className="text-xs text-gray-500">{services.length} servicios</span>
      </div>
      <div className="p-3 space-y-2 max-h-[70vh] overflow-auto">
        {services.map((s) => (
          <div key={s.id} className="p-3 rounded-lg border border-gray-200 bg-white">
            <div className="text-xs text-gray-500 flex justify-between">
              <span>{formatDate(s.fecha)} · {s.hora}</span>
              <span className="font-mono">{s.code.slice(0, 6)}</span>
            </div>
            <div className="font-medium text-sm mt-1">{s.cliente}</div>
            <div className="text-xs text-gray-600 truncate">{s.origen} → {s.destino}</div>
            <div className="text-xs text-gray-500 mt-1">
              {s.vehicle ? `🚗 ${s.vehicle.placa}` : ''} {s.driver ? `· 👤 ${s.driver.fullName}` : ''}
            </div>
            <div className="flex gap-2 mt-2">
              {onAssign && (
                <button className="btn btn-primary !h-7 !text-xs" onClick={() => onAssign(s)}>
                  <Wand2 size={12} /> Asignar
                </button>
              )}
              {onStart && (
                <button className="btn btn-ghost !h-7 !text-xs" onClick={() => onStart(s)}>
                  Iniciar
                </button>
              )}
              {onComplete && (
                <button className="btn btn-ghost !h-7 !text-xs" onClick={() => onComplete(s)}>
                  Completar
                </button>
              )}
            </div>
          </div>
        ))}
        {services.length === 0 && <div className="text-center text-xs text-gray-400 py-6">Sin servicios.</div>}
      </div>
    </div>
  );
}

function AssignModal({ service, onClose, onAssigned }: { service: any; onClose: () => void; onAssigned: () => void }) {
  const { data: suggestion } = useSWR(`/services/${service.id}/suggest`, fetcher);
  const [vehicleId, setVehicleId] = useState<string>('');
  const [driverId, setDriverId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  async function go() {
    if (!vehicleId || !driverId) return;
    setSaving(true);
    try {
      await api(`/services/${service.id}/assign`, { method: 'POST', json: { vehicleId, driverId } });
      onAssigned();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Asignar servicio #${service.code.slice(0, 6)}`} size="lg">
      <div className="text-sm mb-4">
        <span className="text-gray-500">Cliente:</span> {service.cliente} ·{' '}
        <span className="text-gray-500">Ruta:</span> {service.origen} → {service.destino} ·{' '}
        <span className="text-gray-500">Pax:</span> {service.pasajeros}
      </div>

      {suggestion?.best && (
        <div className="card p-3 mb-4 bg-brand-50 border-brand-200">
          <div className="text-xs uppercase font-semibold text-brand-700">Sugerencia automática</div>
          <button
            className="btn btn-primary mt-2 !h-8 !text-xs"
            onClick={() => {
              setVehicleId(suggestion.best.vehicleId);
              setDriverId(suggestion.best.driverId);
            }}
          >
            Usar sugerencia
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600">Vehículo</label>
          <div className="mt-1 space-y-1 max-h-60 overflow-auto border rounded-lg p-2">
            {suggestion?.vehicles.map((v: any) => (
              <label key={v.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-gray-50 px-1 rounded">
                <input type="radio" checked={vehicleId === v.id} onChange={() => setVehicleId(v.id)} />
                <span className="flex-1">
                  {v.placa} — {v.marca} {v.linea} ({v.capacidadPasajeros} pax)
                </span>
                <span className={`badge ${statusBadge(v.estado)}`}>{v.estado}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Conductor</label>
          <div className="mt-1 space-y-1 max-h-60 overflow-auto border rounded-lg p-2">
            {suggestion?.drivers.map((d: any) => (
              <label key={d.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-gray-50 px-1 rounded">
                <input type="radio" checked={driverId === d.id} onChange={() => setDriverId(d.id)} />
                <span className="flex-1">{d.fullName}</span>
                {d.distanciaKmDesdeResidencia != null && (
                  <span className="text-xs text-gray-500">~{d.distanciaKmDesdeResidencia.toFixed(1)} km</span>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={go} disabled={saving || !vehicleId || !driverId}>
          {saving ? 'Asignando…' : 'Asignar'}
        </button>
      </div>
    </Modal>
  );
}
