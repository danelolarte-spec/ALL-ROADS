'use client';
import { useState, useRef } from 'react';
import useSWR from 'swr';
import { FileSpreadsheet, Download, Upload } from 'lucide-react';
import { api, fetcher, getToken } from '@/lib/api';
import { PageHeader } from '@/components/page-header';

export default function ExcelPage() {
  const { data: contracts } = useSWR<any[]>('/contracts', fetcher);
  const [contractId, setContractId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function downloadTemplate() {
    if (!contractId) return;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/excel/template/${contractId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plantilla-${contractId}.xlsx`;
    a.click();
  }

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onPreview() {
    if (!fileRef.current?.files?.[0] || !contractId) return;
    setLoading(true);
    setImportResult(null);
    try {
      const base64 = await readFile(fileRef.current.files[0]);
      const res = await api('/excel/preview', { method: 'POST', json: { contractId, base64 } });
      setPreview(res);
    } finally {
      setLoading(false);
    }
  }

  async function onImport() {
    if (!fileRef.current?.files?.[0] || !contractId) return;
    setLoading(true);
    try {
      const base64 = await readFile(fileRef.current.files[0]);
      const res = await api('/excel/import', { method: 'POST', json: { contractId, base64 } });
      setImportResult(res);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Carga masiva desde Excel" subtitle="Plantilla dinámica por contrato + validación + import" />

      <div className="card p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 items-end">
          <label className="flex flex-col text-xs gap-1">
            <span className="text-gray-600 font-medium">Contrato</span>
            <select className="select" value={contractId} onChange={(e) => setContractId(e.target.value)}>
              <option value="">Selecciona…</option>
              {contracts?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.cliente}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-ghost" onClick={downloadTemplate} disabled={!contractId}>
            <Download size={16} /> Descargar plantilla
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="text-brand-600" />
          <div className="font-semibold">Subir Excel</div>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="input" />
        <div className="flex gap-2 mt-3">
          <button className="btn btn-ghost" onClick={onPreview} disabled={loading || !contractId}>
            <Upload size={16} /> Previsualizar
          </button>
          <button className="btn btn-primary" onClick={onImport} disabled={loading || !contractId}>
            Importar
          </button>
        </div>
      </div>

      {preview && (
        <div className="card p-5 mt-4">
          <div className="text-sm mb-3">
            <span className="badge badge-green mr-1">{preview.validCount} válidas</span>
            <span className="badge badge-red mr-1">{preview.errorCount} con errores</span>
            <span className="badge badge-gray">{preview.total} filas totales</span>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Cliente</th>
                  <th>Origen → Destino</th>
                  <th>Errores</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r: any, i: number) => (
                  <tr key={i}>
                    <td>#{r.row}</td>
                    <td>{r.data.cliente ?? '—'}</td>
                    <td className="text-xs">{r.data.origen} → {r.data.destino}</td>
                    <td className="text-xs">
                      {r.errors.length === 0 ? (
                        <span className="badge badge-green">OK</span>
                      ) : (
                        <span className="text-red-600">{r.errors.join(', ')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {importResult && (
        <div className="card p-5 mt-4">
          <div className="text-sm">
            <span className="badge badge-green">{importResult.created} creados</span>
            {importResult.errors.length > 0 && (
              <span className="badge badge-red ml-2">{importResult.errors.length} fallidos</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
