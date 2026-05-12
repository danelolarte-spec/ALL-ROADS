import { ReactNode } from 'react';

export function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
}) {
  const toneColors = {
    default: 'text-gray-900',
    positive: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-rose-600',
  } as const;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
          <div className={`mt-2 text-2xl font-bold ${toneColors[tone]}`}>{value}</div>
          {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
