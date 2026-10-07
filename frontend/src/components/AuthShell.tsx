import type { ReactNode } from 'react';
import { ShieldCheck, Zap, Layers, Lock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

interface Props {
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({ children, footer }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-50/60 dark:bg-slate-950 transition-colors duration-200">
      {/* Left side: Enterprise FinTech Showcase (Desktop only) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white border-r border-slate-800/80 dark:border-white/[0.08]">
        {/* Subtle radial ambient lighting */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden
        />

        {/* Micro Grid */}
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center gap-3">
          <Logo size="lg" />
        </div>

        {/* Centerpiece showcase */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-6 font-mono">
            <Zap size={13} className="text-emerald-400" />
            High-Throughput Settlement Rail
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight font-sans">
            Institutional financial infrastructure built for zero variance.
          </h2>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed font-medium">
            Atomic peer-to-peer transfers backed by strict database ACID guarantees, idempotency token validation, and Kafka event synchronization.
          </p>

          {/* Interactive telemetry mock card */}
          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5.5 backdrop-blur-2xl shadow-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-glow-emerald" />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Live Clearing Telemetry
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5">
                100% ACID
              </span>
            </div>

            <div className="mt-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <Lock size={12} className="text-emerald-400" />
                  Pessimistic Concurrency
                </span>
                <span className="text-emerald-400 font-mono font-semibold">Ordered Lock (0 Deadlocks)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <Layers size={12} className="text-emerald-400" />
                  Idempotent Token Cache
                </span>
                <span className="text-slate-300 font-mono font-semibold">Redis Window • UUID v4</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  Distributed Event Stream
                </span>
                <span className="text-slate-300 font-mono font-semibold">Kafka payment_completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer badges */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] pt-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-6 text-[11px]">
            <span>&lt; 25ms Latency</span>
            <span>Zero Decimal Drift</span>
            <span>Sub-second Clearing</span>
          </div>
        </div>
      </div>

      {/* Right side: Form container */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        {/* Top-right theme toggle */}
        <div className="absolute right-6 top-6 sm:right-10 sm:top-10">
          <ThemeToggle size="sm" />
        </div>

        <div className="mx-auto w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>

          <div className="card p-8 sm:p-9">{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
}
