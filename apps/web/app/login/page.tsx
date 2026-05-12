'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, setStoredUser } from '@/lib/api';
import { Truck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@allroads.co');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        json: { email, password },
      });
      setToken(res.accessToken);
      setStoredUser(res.user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Truck size={24} />
          </div>
          <div>
            <div className="font-bold text-2xl tracking-tight">ALL ROADS</div>
            <div className="text-xs text-gray-500">Logística empresarial</div>
          </div>
        </div>

        <div className="card p-8">
          <h1 className="text-lg font-semibold mb-1">Inicia sesión</h1>
          <p className="text-sm text-gray-500 mb-6">Bienvenido al centro de operaciones</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Contraseña</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500 border-t pt-4">
            <div className="font-medium mb-1">Credenciales demo:</div>
            <div>admin@allroads.co / Admin123!</div>
            <div>operaciones@allroads.co / Operaciones123!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
