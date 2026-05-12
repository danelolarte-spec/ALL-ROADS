'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { api, fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { KpiCard } from '@/components/kpi-card';
import { Modal } from '@/components/modal';
import { formatCurrency } from '@/lib/utils';

export default function FinancialPage() {
  const { data: summary } = useSWR<any>('/financial/summary', fetcher);
  const { data: products, mutate } = useSWR<any[]>('/financial/products', fetcher);
  const { data: contracts } = useSWR<any[]>('/contracts', fetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ code: '', name: '', unitPrice: 0, cost: 0 });

  async function save() {
    await api('/financial/products', { method: 'POST', json: { ...form, unitPrice: Number(form.unitPrice), cost: Number(form.cost) } });
    setOpen(false);
    setForm({ code: '', name: '', unitPrice: 0, cost: 0 });
    mutate();
  }

  return (
    <>
      <PageHeader
        title="Financiero / Producido"
        subtitle="Productos tarifarios + producido por vehículo, conductor y cliente"
        actions={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nuevo producto
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Ingresos" value={formatCurrency(summary?.totalValor ?? 0)} tone="positive" />
        <KpiCard label="Costos" value={formatCurrency(summary?.totalCosto ?? 0)} tone="warning" />
        <KpiCard label="Mantenimiento" value={formatCurrency(summary?.costoMantenimiento ?? 0)} />
        <KpiCard label="Utilidad operativa" value={formatCurrency(summary?.utilidadOperativa ?? 0)} tone="positive" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <BreakdownCard title="Producido por vehículo" rows={summary?.byVehicle ?? []} keyName="placa" />
        <BreakdownCard title="Producido por conductor" rows={summary?.byDriver ?? []} keyName="name" />
        <BreakdownCard title="Producido por cliente" rows={summary?.byCliente ?? []} keyName="cliente" />
        <div className="card p-5">
          <div className="font-semibold mb-3">Productos / tarifas</div>
          <table className="data">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs">{p.code}</td>
                  <td>{p.name}</td>
                  <td>{formatCurrency(p.unitPrice)}</td>
                  <td className="text-gray-500">{formatCurrency(p.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo producto / tarifa" size="lg">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Código *"><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          <Field label="Nombre *"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Precio unitario *"><input type="number" className="input" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></Field>
          <Field label="Costo"><input type="number" className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></Field>
          <Field label="Contrato (opcional)">
            <select className="select" value={form.contractId ?? ''} onChange={(e) => setForm({ ...form, contractId: e.target.value || undefined })}>
              <option value="">Todos</option>
              {contracts?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Guardar</button>
        </div>
      </Modal>
    </>
  );
}

function BreakdownCard({ title, rows, keyName }: { title: string; rows: any[]; keyName: string }) {
  return (
    <div className="card p-5">
      <div className="font-semibold mb-3">{title}</div>
      <table className="data">
        <thead>
          <tr>
            <th>{title.split(' por ')[1]}</th>
            <th>Servicios</th>
            <th>Ingresos</th>
            <th>Costos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="font-medium">{r[keyName]}</td>
              <td>{r.count}</td>
              <td>{formatCurrency(r.valor)}</td>
              <td className="text-gray-500">{formatCurrency(r.costo)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="text-center text-gray-500 py-6">Sin datos.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col text-xs gap-1"><span className="text-gray-600 font-medium">{label}</span>{children}</label>;
}
