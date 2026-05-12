import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateTime(d: string | Date | null | undefined) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString('es-CO');
}

export function statusBadge(status: string) {
  const map: Record<string, string> = {
    DISPONIBLE: 'badge-green',
    EN_SERVICIO: 'badge-blue',
    MANTENIMIENTO: 'badge-yellow',
    FUERA_DE_SERVICIO: 'badge-red',
    ACTIVO: 'badge-green',
    INACTIVO: 'badge-gray',
    SUSPENDIDO: 'badge-red',
    VACACIONES: 'badge-yellow',
    PENDIENTE: 'badge-yellow',
    ASIGNADO: 'badge-blue',
    EN_EJECUCION: 'badge-blue',
    COMPLETADO: 'badge-green',
    CANCELADO: 'badge-red',
  };
  return map[status] || 'badge-gray';
}
