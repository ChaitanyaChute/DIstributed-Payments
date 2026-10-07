import { useEffect, useState } from 'react';
import { paymentApi } from '../api/client';
import type { DailySpent } from '../types';
import { formatCurrency } from '../lib/format';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  refreshKey?: number;
  compact?: boolean;
}

export default function DailyLimitBar({ refreshKey = 0, compact = false }: Props) {
  const [data, setData] = useState<DailySpent | null>(null);

  useEffect(() => {
    paymentApi.dailySpent().then(setData).catch(() => setData(null));
  }, [refreshKey]);

  if (!data) {
    return (
      <div className={compact ? 'h-2 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800' : 'card animate-pulse p-5'}>
        {!compact && <div className="h-16" />}
      </div>
    );
  }

  const spent = Number(data.spentToday);
  const limit = Number(data.dailyLimit);
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const danger = pct >= 90;
  const warn = pct >= 70 && pct < 90;

  const barColor = danger
    ? 'bg-rose-500 shadow-glow'
    : warn
    ? 'bg-amber-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-400';

  if (compact) {
    return (
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            <span className="tnum font-bold font-mono text-slate-900 dark:text-white">{formatCurrency(spent)}</span>
            <span className="text-slate-400"> / {formatCurrency(limit)}</span>
          </span>
          <span className={`tnum text-xs font-semibold font-mono ${danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {formatCurrency(data.remaining)} left
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full ${barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <p className="text-xs font-semibold text-slate-900 dark:text-white">Daily Spend Limiter</p>
        </div>
        <span className="tnum rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
          {pct.toFixed(0)}% used
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="tnum text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
          {formatCurrency(spent)}
        </p>
        <p className="tnum text-xs text-slate-400 font-mono">of {formatCurrency(limit)} cap</p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-mono">{formatCurrency(data.remaining)} available</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Redis Rail</span>
      </div>
    </div>
  );
}
