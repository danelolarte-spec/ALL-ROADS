'use client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Plus, Sparkles } from 'lucide-react';
import { api, fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { Modal } from '@/components/modal';
import { formatCurrency, formatDate, statusBadge } from '@/lib/utils';

export default function ServicesPage() {
  const { data, mutate } = useSWR<any[]>('/services', fetcher);
  const { data: contracts } = useSWR<any[]>('/contracts', fetcher);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Servicios"
        subtitle="Creación manual con formulario dinámico por contrato"
        actions={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuevo servicio
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="data">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Origen → Destino</th>
              <th>Pax</th>
              <th>Vehículo</th>
              <th>Conductor</th>
              <th>Estado</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-xs">{s.code.slice(0, 8)}</td>
                <td>
                  {formatDate(s.fecha)} {s.hora && <span className="text-xs text-gray-500">{s.hora}</span>}
                </td>
                <td>{s.cliente}</td>
                <td className="text-xs max-w-[260px] truncate">
                  {s.origen} → {s.destino}
                </td>
                <td>{s.pasajeros}</td>
                <td>{s.vehicle?.placa ?? '—'}</td>
                <td className="text-xs">{s.driver?.fullName ?? '—'}</td>
                <td>
                  <span className={`badge ${statusBadge(s.status)}`}>{s.status.replace('_', ' ')}</span>
                </td>
                <td className="font-medium">{formatCurrency(s.valorTotal)}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-10">
                  Aún no hay servicios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <NewServiceModal contracts={contracts || []} onClose={() => setOpen(false)} onCreated={() => mutate()} />
      )}
    </>
  );
}

function NewServiceModal({
  contracts,
  onClose,
  onCreated,
}: {
  contracts: any[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [contractId, setContractId] = useState(contracts[0]?.id ?? '');
  const contract = useMemo(() => contracts.find((c) => c.id === contractId), [contracts, contractId]);
  const { data: products } = useSWR<any[]>(contractId ? `/financial/products?contractId=${contractId}` : null, fetcher);
  const [form, setForm] = useState<any>({
    cliente: '',
    fecha: new Date().toISOString().slice(0, 10),
    hora: '08:00',
    pasajeros: 1,
    origen: '',
    destino: '',
    tipoVehiculo: 'Sedán',
    dynamicData: {},
    items: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Init cliente al cambiar contrato
  function onChangeContract(id: string) {
    setContractId(id);
    const c = contracts.find((x) => x.id === id);
    setForm((prev: any) => ({ ...prev, cliente: c?.cliente ?? prev.cliente, dynamicData: {} }));
  }

  function setDynamic(key: string, value: any) {
    setForm({ ...form, dynamicData: { ...form.dynamicData, [key]: value } });
  }

  function toggleProduct(p: any) {
    const exists = form.items.find((i: any) => i.productId === p.id);
    if (exists) {
      setForm({ ...form, items: form.items.filter((i: any) => i.productId !== p.id) });
    } else {
      setForm({
        ...form,
        items: [...form.items, { productId: p.id, quantity: 1, unitPrice: p.unitPrice, cost: p.cost }],
      });
    }
  }

  async function save() {
    setError(null);
    try {
      await api('/services', {
        method: 'POST',
        json: { contractId, ...form },
      });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!contracts.length) {
    return (
      <Modal open onClose={onClose} title="Nuevo servicio">
        <p className="text-sm text-gray-600">
          Primero crea un contrato en el módulo de contratos para poder registrar servicios.
        </p>
      </Modal>
    );
  }

  const total = form.items.reduce((acc: number, it: any) => acc + (it.unitPrice ?? 0) * (it.quantity ?? 1), 0);

  return (
    <Modal open onClose={onClose} title="Nuevo servicio" size="xl">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="flex flex-col text-xs gap-1 col-span-2">
          <span className="text-gray-600 font-medium">Contrato *</span>
          <select className="select" value={contractId} onChange={(e) => onChangeContract(e.target.value)}>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.cliente}
              </option>
            ))}
          </select>
        </label>
        <Field label="Cliente *">
          <input className="input" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
        </Field>
        <Field label="Tipo vehículo">
          <select
            className="select"
            value={form.tipoVehiculo}
            onChange={(e) => setForm({ ...form, tipoVehiculo: e.target.value })}
          >
            {['Sedán', 'SUV', 'Van', 'Bus', 'Camión'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Fecha *">
          <input type="date" className="input" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        </Field>
        <Field label="Hora">
          <input type="time" className="input" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
        </Field>
        <Field label="Pasajeros">
          <input
            type="number"
            className="input"
            value={form.pasajeros}
            onChange={(e) => setForm({ ...form, pasajeros: Number(e.target.value) })}
          />
        </Field>
        <Field label="Origen *">
          <input className="input" value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} />
        </Field>
        <Field label="Destino *">
          <input className="input" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} />
        </Field>
        <Field label="Parada 1">
          <input className="input" value={form.parada1 ?? ''} onChange={(e) => setForm({ ...form, parada1: e.target.value })} />
        </Field>
        <Field label="Parada 2">
          <input className="input" value={form.parada2 ?? ''} onChange={(e) => setForm({ ...form, parada2: e.target.value })} />
        </Field>
        <Field label="Parada 3">
          <input className="input" value={form.parada3 ?? ''} onChange={(e) => setForm({ ...form, parada3: e.target.value })} />
        </Field>
        <Field label="Observaciones">
          <input className="input" value={form.observaciones ?? ''} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </Field>
      </div>

      {/* Campos dinámicos por contrato */}
      {contract && contract.fields.length > 0 && (
        <div className="border-t pt-4 mt-2">
          <div className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center gap-1">
            <Sparkles size={12} /> Campos del contrato
          </div>
          <div className="grid grid-cols-2 gap-3">
            {contract.fields.map((f: any) => (
              <Field key={f.id} label={`${f.label}${f.required ? ' *' : ''}`}>
                <DynamicInput field={f} value={form.dynamicData[f.key]} onChange={(v: any) => setDynamic(f.key, v)} />
              </Field>
            ))}
          </div>
        </div>
      )}

      {/* Productos / tarifas */}
      {products && products.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="text-xs font-semibold uppercase text-gray-500 mb-2">Tarifas / productos</div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {products.map((p) => {
              const selected = form.items.find((i: any) => i.productId === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p)}
                  className={`text-left p-3 rounded-lg border ${selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
                >
                  <div className="text-xs text-gray-500">{p.code}</div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs">{formatCurrency(p.unitPrice)}</div>
                </button>
              );
            })}
          </div>
          <div className="text-right text-sm font-semibold mt-3">Total: {formatCurrency(total)}</div>
        </div>
      )}

      {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={save}>
          Crear servicio
        </button>
      </div>
    </Modal>
  );
}

function DynamicInput({ field, value, onChange }: { field: any; value: any; onChange: (v: any) => void }) {
  const options = field.options ? JSON.parse(field.options) : [];
  switch (field.type) {
    case 'NUMBER':
      return <input type="number" className="input" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} />;
    case 'DATE':
      return <input type="date" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'TIME':
      return <input type="time" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'SELECT':
      return (
        <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {options.map((o: string) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    case 'TEXTAREA':
      return <textarea className="textarea" rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col text-xs gap-1">
      <span className="text-gray-600 font-medium">{label}</span>
      {children}
    </label>
  );
}
