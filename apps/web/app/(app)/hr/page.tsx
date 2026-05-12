'use client';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { formatDate } from '@/lib/utils';

export default function HrPage() {
  const { data } = useSWR<{ licencias: any[]; documentos: any[] }>('/hr/alerts', fetcher);

  return (
    <>
      <PageHeader title="Gestión humana" subtitle="Expedientes digitales y alertas de personal" />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 font-semibold">Licencias por vencer</div>
          <table className="data">
            <thead>
              <tr>
                <th>Conductor</th>
                <th>Categoría</th>
                <th>Vence</th>
                <th>Días</th>
              </tr>
            </thead>
            <tbody>
              {data?.licencias.map((l) => (
                <tr key={l.id}>
                  <td className="font-medium">{l.fullName}</td>
                  <td>{l.categoriaLicencia}</td>
                  <td>{formatDate(l.licenciaVence)}</td>
                  <td>
                    <span
                      className={`badge ${l.days < 0 ? 'badge-red' : l.days <= 30 ? 'badge-yellow' : 'badge-green'}`}
                    >
                      {l.days < 0 ? `${-l.days}d vencida` : `${l.days}d`}
                    </span>
                  </td>
                </tr>
              ))}
              {data?.licencias.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-8">
                    Sin licencias por vencer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 font-semibold">Documentos por vencer</div>
          <table className="data">
            <thead>
              <tr>
                <th>Conductor</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Vence</th>
              </tr>
            </thead>
            <tbody>
              {data?.documentos.map((d) => (
                <tr key={d.id}>
                  <td className="font-medium">{d.driver?.fullName ?? '—'}</td>
                  <td className="text-xs">{d.type}</td>
                  <td>{d.name}</td>
                  <td>
                    <span
                      className={`badge ${d.days < 0 ? 'badge-red' : d.days <= 30 ? 'badge-yellow' : 'badge-green'}`}
                    >
                      {formatDate(d.expiresAt)}
                    </span>
                  </td>
                </tr>
              ))}
              {data?.documentos.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-8">
                    Sin documentos por vencer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
