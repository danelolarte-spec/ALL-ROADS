'use client';
import { useState } from 'react';
import { Map, Navigation } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/page-header';

export default function RoutesPage() {
  const [points, setPoints] = useState<any[]>([
    { address: '', lat: '', lng: '' },
    { address: '', lat: '', lng: '' },
  ]);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  function addPoint() {
    setPoints([...points, { address: '', lat: '', lng: '' }]);
  }
  function updatePoint(i: number, patch: any) {
    const copy = [...points];
    copy[i] = { ...copy[i], ...patch };
    setPoints(copy);
  }

  async function calculate() {
    setLoading(true);
    try {
      const payload = {
        points: points.map((p) => ({
          address: p.address,
          lat: p.lat ? Number(p.lat) : undefined,
          lng: p.lng ? Number(p.lng) : undefined,
        })),
      };
      const res = await api('/routes/calculate', { method: 'POST', json: payload });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  const hasKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <>
      <PageHeader
        title="Rutas y georreferenciación"
        subtitle="Cálculo automático con Google Maps + soporte de ruta manual"
      />

      {!hasKey && (
        <div className="card p-4 mb-4 bg-amber-50 border-amber-200 text-sm">
          <strong>Modo aproximación.</strong> Define <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> y{' '}
          <code>GOOGLE_MAPS_API_KEY</code> para habilitar Google Directions.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="font-semibold mb-3 flex items-center gap-2">
            <Navigation size={16} /> Puntos de ruta
          </div>
          <div className="space-y-2">
            {points.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  className="input col-span-6"
                  placeholder={i === 0 ? 'Origen' : i === points.length - 1 ? 'Destino' : `Parada ${i}`}
                  value={p.address}
                  onChange={(e) => updatePoint(i, { address: e.target.value })}
                />
                <input
                  className="input col-span-3"
                  placeholder="Lat"
                  value={p.lat}
                  onChange={(e) => updatePoint(i, { lat: e.target.value })}
                />
                <input
                  className="input col-span-3"
                  placeholder="Lng"
                  value={p.lng}
                  onChange={(e) => updatePoint(i, { lng: e.target.value })}
                />
              </div>
            ))}
            <button className="btn btn-ghost mt-2" onClick={addPoint}>
              + Agregar parada
            </button>
          </div>

          <button className="btn btn-primary mt-4 w-full" onClick={calculate} disabled={loading}>
            <Map size={16} /> {loading ? 'Calculando…' : 'Calcular ruta óptima'}
          </button>
        </div>

        <div className="card p-5">
          <div className="font-semibold mb-3">Resultado</div>
          {result ? (
            <div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-brand-50">
                  <div className="text-xs uppercase text-brand-700">Distancia</div>
                  <div className="font-bold text-lg">{result.distanceKm} km</div>
                </div>
                <div className="p-3 rounded-lg bg-brand-50">
                  <div className="text-xs uppercase text-brand-700">Duración</div>
                  <div className="font-bold text-lg">{result.durationMin} min</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="text-xs uppercase text-gray-500">Fuente</div>
                  <div className="font-medium text-sm">{result.provider}</div>
                </div>
              </div>
              <div className="mt-4 aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                {hasKey
                  ? 'Mapa interactivo (integrar @react-google-maps/api).'
                  : 'Mapa disponible al configurar API Key.'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Aún no se ha calculado ninguna ruta.</div>
          )}
        </div>
      </div>
    </>
  );
}
