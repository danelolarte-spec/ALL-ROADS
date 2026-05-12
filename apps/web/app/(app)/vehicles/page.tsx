'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { api, fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';
import { formatDate, statusBadge } from '@/lib/utils';

export default function VehiclesPage() {
  const { data, mutate } = useSWR<any[]>('/vehicles', fetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    placa: '',
    tipo: 'Sedán',
    marca: '',
    modelo: new Date().getFullYear(),
    capacidadPasajeros: 4,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api('/vehicles', { method: 'POST', json: { ...form, modelo: Number(form.modelo) } });
      setOpen(false);
      setForm({ placa: '', tipo: 'Sedán', marca: '', modelo: new Date().getFullYear(), capacidadPasajeros: 4 });
      mutate();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Vehículos"
        subtitle="Flota, vencimientos y mantenimiento"
        actions={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuevo vehículo
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="data">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Marca / Línea</th>
              <th>Modelo</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>SOAT</th>
              <th>Tecnomec.</th>
              <th>Conductor asignado</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((v) => (
              <tr key={v.id}>
                <td className="font-medium">{v.placa}</td>
                <td>{v.tipo}</td>
                <td>
                  {v.marca}
                  {v.linea ? ` ${v.linea}` : ''}
                </td>
                <td>{v.modelo}</td>
                <td>{v.capacidadPasajeros} pax</td>
                <td>
                  <span className={`badge ${statusBadge(v.estado)}`}>{v.estado.replace('_', ' ')}</span>
                </td>
                <td>{formatDate(v.soatVence)}</td>
                <td>{formatDate(v.tecnomecanicaVence)}</td>
                <td className="text-xs text-gray-600">
                  {v.assignments?.[0]?.driver?.fullName ?? '—'}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-10">
                  No hay vehículos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo vehículo" size="lg">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Placa *">
            <input className="input" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} />
          </Field>
          <Field label="Número interno">
            <input
              className="input"
              value={form.numeroInterno ?? ''}
              onChange={(e) => setForm({ ...form, numeroInterno: e.target.value })}
            />
          </Field>
          <Field label="Tipo *">
            <select
              className="select"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {['Sedán', 'SUV', 'Van', 'Bus', 'Camión', 'Microbús'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Marca *">
            <input className="input" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
          </Field>
          <Field label="Línea">
            <input
              className="input"
              value={form.linea ?? ''}
              onChange={(e) => setForm({ ...form, linea: e.target.value })}
            />
          </Field>
          <Field label="Modelo *">
            <input
              type="number"
              className="input"
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
            />
          </Field>
          <Field label="Capacidad pasajeros">
            <input
              type="number"
              className="input"
              value={form.capacidadPasajeros}
              onChange={(e) => setForm({ ...form, capacidadPasajeros: Number(e.target.value) })}
            />
          </Field>
          <Field label="Capacidad carga (ton)">
            <input
              type="number"
              step="0.1"
              className="input"
              value={form.capacidadCarga ?? 0}
              onChange={(e) => setForm({ ...form, capacidadCarga: Number(e.target.value) })}
            />
          </Field>
          <Field label="Kilometraje">
            <input
              type="number"
              className="input"
              value={form.kilometraje ?? 0}
              onChange={(e) => setForm({ ...form, kilometraje: Number(e.target.value) })}
            />
          </Field>
          <Field label="Empresa afiliadora">
            <input
              className="input"
              value={form.empresaAfiliadora ?? ''}
              onChange={(e) => setForm({ ...form, empresaAfiliadora: e.target.value })}
            />
          </Field>
          <Field label="SOAT vence">
            <input
              type="date"
              className="input"
              value={form.soatVence ?? ''}
              onChange={(e) => setForm({ ...form, soatVence: e.target.value })}
            />
          </Field>
          <Field label="Tecnomecánica vence">
            <input
              type="date"
              className="input"
              value={form.tecnomecanicaVence ?? ''}
              onChange={(e) => setForm({ ...form, tecnomecanicaVence: e.target.value })}
            />
          </Field>
          <Field label="Tarjeta operación vence">
            <input
              type="date"
              className="input"
              value={form.tarjetaOperVence ?? ''}
              onChange={(e) => setForm({ ...form, tarjetaOperVence: e.target.value })}
            />
          </Field>
        </div>
        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </Modal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col text-xs gap-1">
      <span className="text-gray-600 font-medium">{label}</span>
      {children}
    </label>
  );
}
