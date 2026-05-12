'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Trash2 } from 'lucide-react';
import { api, fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';

const FIELD_TYPES = ['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'TIME', 'SELECT', 'ADDRESS', 'COORDS', 'FILE'];

export default function ContractsPage() {
  const { data, mutate } = useSWR<any[]>('/contracts', fetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: '', cliente: '', description: '', fields: [] });
  const [error, setError] = useState<string | null>(null);

  function addField() {
    setForm({
      ...form,
      fields: [
        ...form.fields,
        { key: `campo${form.fields.length + 1}`, label: 'Nuevo campo', type: 'TEXT', required: false },
      ],
    });
  }

  function updateField(i: number, patch: any) {
    const copy = [...form.fields];
    copy[i] = { ...copy[i], ...patch };
    setForm({ ...form, fields: copy });
  }

  function removeField(i: number) {
    setForm({ ...form, fields: form.fields.filter((_: any, idx: number) => idx !== i) });
  }

  async function save() {
    setError(null);
    try {
      const payload = {
        ...form,
        fields: form.fields.map((f: any, i: number) => ({
          ...f,
          order: i,
          options: f.options
            ? typeof f.options === 'string'
              ? f.options.split(',').map((s: string) => s.trim()).filter(Boolean)
              : f.options
            : undefined,
        })),
      };
      await api('/contracts', { method: 'POST', json: payload });
      setOpen(false);
      setForm({ name: '', cliente: '', description: '', fields: [] });
      mutate();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <PageHeader
        title="Contratos y formularios"
        subtitle="Cada cliente puede tener su propio formulario dinámico"
        actions={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuevo contrato
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {data?.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-500">{c.cliente}</div>
              </div>
              <span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>
                {c.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {c.description && <p className="text-sm text-gray-600 mt-2">{c.description}</p>}
            <div className="mt-3 text-xs text-gray-500 uppercase font-medium">Campos personalizados</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {c.fields.map((f: any) => (
                <span key={f.id} className="badge badge-blue">
                  {f.label} · {f.type}
                  {f.required ? ' *' : ''}
                </span>
              ))}
              {c.fields.length === 0 && <span className="text-xs text-gray-400">Sin campos</span>}
            </div>
            <div className="mt-3 text-xs text-gray-500">{c._count?.services ?? 0} servicios registrados</div>
          </div>
        ))}
        {data?.length === 0 && (
          <div className="card p-10 text-center text-gray-500">
            Aún no hay contratos. Crea el primero para empezar a registrar servicios.
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo contrato" size="xl">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Nombre *</span>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Cliente *</span>
            <input
              className="input"
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            />
          </label>
          <label className="flex flex-col text-xs gap-1 col-span-2">
            <span className="text-gray-600 font-medium">Descripción</span>
            <input
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Campos del formulario</div>
            <button className="btn btn-ghost" onClick={addField}>
              <Plus size={14} /> Agregar campo
            </button>
          </div>
          <div className="space-y-2">
            {form.fields.map((f: any, i: number) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="input col-span-3"
                  placeholder="Etiqueta"
                  value={f.label}
                  onChange={(e) => updateField(i, { label: e.target.value })}
                />
                <input
                  className="input col-span-2"
                  placeholder="Key (identificador)"
                  value={f.key}
                  onChange={(e) => updateField(i, { key: e.target.value })}
                />
                <select
                  className="select col-span-2"
                  value={f.type}
                  onChange={(e) => updateField(i, { type: e.target.value })}
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <input
                  className="input col-span-3"
                  placeholder="Opciones (coma-sep, sólo SELECT)"
                  value={typeof f.options === 'string' ? f.options : (f.options || []).join(',')}
                  onChange={(e) => updateField(i, { options: e.target.value })}
                  disabled={f.type !== 'SELECT'}
                />
                <label className="flex items-center gap-1 text-xs col-span-1">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => updateField(i, { required: e.target.checked })}
                  />
                  Req
                </label>
                <button className="btn btn-ghost col-span-1" onClick={() => removeField(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {form.fields.length === 0 && (
              <div className="text-xs text-gray-500 italic">Sin campos. Agrega al menos uno.</div>
            )}
          </div>
        </div>

        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={save}>
            Crear contrato
          </button>
        </div>
      </Modal>
    </>
  );
}
