'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { api, fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';
import { formatDate, statusBadge } from '@/lib/utils';

export default function DriversPage() {
  const { data, mutate } = useSWR<any[]>('/drivers', fetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    fullName: '',
    documento: '',
    licencia: '',
    categoriaLicencia: 'C1',
    licenciaVence: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api('/drivers', {
        method: 'POST',
        json: { ...form, residenciaLat: form.residenciaLat ? Number(form.residenciaLat) : undefined, residenciaLng: form.residenciaLng ? Number(form.residenciaLng) : undefined },
      });
      setOpen(false);
      setForm({ fullName: '', documento: '', licencia: '', categoriaLicencia: 'C1', licenciaVence: '' });
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
        title="Conductores"
        subtitle="Equipo, licencias y residencia georreferenciada"
        actions={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuevo conductor
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="data">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Licencia</th>
              <th>Cat.</th>
              <th>Vence</th>
              <th>Teléfono</th>
              <th>Vehículo asignado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((d) => (
              <tr key={d.id}>
                <td className="font-medium">{d.fullName}</td>
                <td>{d.documento}</td>
                <td>{d.licencia}</td>
                <td>{d.categoriaLicencia}</td>
                <td>{formatDate(d.licenciaVence)}</td>
                <td>{d.telefono ?? '—'}</td>
                <td className="text-xs">{d.assignments?.[0]?.vehicle?.placa ?? '—'}</td>
                <td>
                  <span className={`badge ${statusBadge(d.estado)}`}>{d.estado}</span>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-10">
                  No hay conductores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo conductor" size="lg">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre completo *">
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Documento *">
            <input className="input" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </Field>
          <Field label="Licencia *">
            <input className="input" value={form.licencia} onChange={(e) => setForm({ ...form, licencia: e.target.value })} />
          </Field>
          <Field label="Categoría *">
            <select
              className="select"
              value={form.categoriaLicencia}
              onChange={(e) => setForm({ ...form, categoriaLicencia: e.target.value })}
            >
              {['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Licencia vence *">
            <input
              type="date"
              className="input"
              value={form.licenciaVence}
              onChange={(e) => setForm({ ...form, licenciaVence: e.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <input
              className="input"
              value={form.telefono ?? ''}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </Field>
          <Field label="Dirección residencia">
            <input
              className="input"
              value={form.direccion ?? ''}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
          </Field>
          <Field label="Contacto emergencia">
            <input
              className="input"
              value={form.contactoEmergencia ?? ''}
              onChange={(e) => setForm({ ...form, contactoEmergencia: e.target.value })}
            />
          </Field>
          <Field label="Lat residencia">
            <input
              className="input"
              value={form.residenciaLat ?? ''}
              onChange={(e) => setForm({ ...form, residenciaLat: e.target.value })}
            />
          </Field>
          <Field label="Lng residencia">
            <input
              className="input"
              value={form.residenciaLng ?? ''}
              onChange={(e) => setForm({ ...form, residenciaLng: e.target.value })}
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
