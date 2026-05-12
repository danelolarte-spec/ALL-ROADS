'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { api, fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';
import { formatCurrency, formatDate } from '@/lib/utils';

const TYPES = ['PREVENTIVO', 'CORRECTIVO', 'CAMBIO_ACEITE', 'LLANTAS', 'FRENOS', 'OTRO'];

export default function MaintenancePage() {
  const { data, mutate } = useSWR<any[]>('/maintenance', fetcher);
  const { data: costs } = useSWR<any[]>('/maintenance/costs', fetcher);
  const { data: vehicles } = useSWR<any[]>('/vehicles', fetcher);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ type: 'PREVENTIVO', cost: 0, description: '' });
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      await api('/maintenance', {
        method: 'POST',
        json: {
          ...form,
          cost: Number(form.cost || 0),
          kilometraje: form.kilometraje ? Number(form.kilometraje) : undefined,
          nextKilometraje: form.nextKilometraje ? Number(form.nextKilometraje) : undefined,
        },
      });
      setOpen(false);
      setForm({ type: 'PREVENTIVO', cost: 0, description: '' });
      mutate();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageHeader
        title="Mantenimiento"
        subtitle="Preventivos, correctivos, costos y próximos servicios"
        actions={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Registrar mantenimiento
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {costs?.map((c) => (
          <div className="card p-4" key={c.vehicleId}>
            <div className="text-xs text-gray-500 uppercase">{c.placa}</div>
            <div className="text-xl font-bold mt-1">{formatCurrency(c.total)}</div>
            <div className="text-xs text-gray-500 mt-1">{c.count} servicios</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Vehículo</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Taller</th>
              <th>Costo</th>
              <th>Próximo</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((m) => (
              <tr key={m.id}>
                <td>{formatDate(m.performedAt)}</td>
                <td className="font-medium">{m.vehicle?.placa}</td>
                <td className="text-xs">{m.type}</td>
                <td>{m.description}</td>
                <td>{m.taller ?? '—'}</td>
                <td className="font-medium">{formatCurrency(m.cost)}</td>
                <td className="text-xs">
                  {m.nextDate ? formatDate(m.nextDate) : '—'}
                  {m.nextKilometraje ? ` / ${m.nextKilometraje} km` : ''}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-10">
                  Sin registros de mantenimiento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar mantenimiento" size="lg">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Vehículo *</span>
            <select
              className="select"
              value={form.vehicleId ?? ''}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {vehicles?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Tipo *</span>
            <select
              className="select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs gap-1 col-span-2">
            <span className="text-gray-600 font-medium">Descripción *</span>
            <input
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Taller</span>
            <input
              className="input"
              value={form.taller ?? ''}
              onChange={(e) => setForm({ ...form, taller: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Costo</span>
            <input
              type="number"
              className="input"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Kilometraje</span>
            <input
              type="number"
              className="input"
              value={form.kilometraje ?? ''}
              onChange={(e) => setForm({ ...form, kilometraje: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Próximo (fecha)</span>
            <input
              type="date"
              className="input"
              value={form.nextDate ?? ''}
              onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Próximo (km)</span>
            <input
              type="number"
              className="input"
              value={form.nextKilometraje ?? ''}
              onChange={(e) => setForm({ ...form, nextKilometraje: e.target.value })}
            />
          </label>
        </div>
        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={save}>
            Guardar
          </button>
        </div>
      </Modal>
    </>
  );
}
