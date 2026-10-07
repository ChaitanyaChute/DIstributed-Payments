import { Wallet, ShieldCheck } from 'lucide-react';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-8.5 w-8.5';
  const text = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';

  return (
    <div className="flex items-center gap-2.5 group select-none">
      <div
        className={`${dims} relative flex items-center justify-center rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-[0_2px_8px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] border border-slate-800/90 dark:border-white/[0.12] transition-all duration-200 group-hover:border-brand-500/50 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.25)]`}
      >
        {/* Bespoke Geometric Rail & Vault Symbol */}
        <svg
          viewBox="0 0 24 24"
          className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-4.5 h-4.5'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V6.5C20 7.32843 19.3284 8 18.5 8H5.5C4.67157 8 4 7.32843 4 6.5V6.5Z"
            fill="currentColor"
            className="text-white"
          />
          <path
            d="M4 12C4 11.1716 4.67157 10.5 5.5 10.5H14.5C15.3284 10.5 16 11.1716 16 12V12C16 12.8284 15.3284 13.5 14.5 13.5H5.5C4.67157 13.5 4 12.8284 4 12V12Z"
            fill="currentColor"
            className="text-slate-300"
          />
          <path
            d="M4 17.5C4 16.6716 4.67157 16 5.5 16H11C11.8284 16 12.5 16.6716 12.5 17.5V17.5C12.5 18.3284 11.8284 19 11 19H5.5C4.67157 19 4 18.3284 4 17.5V17.5Z"
            fill="#10B981"
          />
          <circle cx="17.5" cy="15.5" r="2.5" fill="#10B981" />
        </svg>

        {/* Live operational micro-dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
        </span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${text} font-bold tracking-tight text-slate-950 dark:text-white leading-none font-sans`}>
            Pay<span className="text-emerald-600 dark:text-emerald-400">Rail</span>
          </span>
          <span className="rounded-[4px] border border-slate-200 bg-slate-100/80 px-1 py-0.2 text-[9px] font-mono font-semibold tracking-wider text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-300">
            PRO
          </span>
        </div>
        {size === 'lg' && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Institutional Rail
          </span>
        )}
      </div>
    </div>
  );
}
