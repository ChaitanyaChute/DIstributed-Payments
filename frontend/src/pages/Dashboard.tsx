import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  History as HistoryIcon,
  Receipt,
  Copy,
  Check,
  Shield,
  Zap,
  TrendingUp,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { transactionApi, walletApi, paymentApi, extractErrorMessage } from '../api/client';
import type { TransactionView, WalletBalance } from '../types';
import { formatCurrency, relativeTime } from '../lib/format';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import DailyLimitBar from '../components/DailyLimitBar';
import CashFlowChart from '../components/CashFlowChart';
import TransactionDrawer from '../components/TransactionDrawer';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Dashboard() {
  const { email } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [recent, setRecent] = useState<TransactionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionView | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [refundTarget, setRefundTarget] = useState<TransactionView | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [w, h] = await Promise.all([walletApi.balance(), transactionApi.history(0, 10)]);
      setWallet(w);
      setRecent(h.content);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const copyWalletId = () => {
    if (wallet) {
      navigator.clipboard.writeText(String(wallet.walletId));
      setCopiedWallet(true);
      toast.success('Wallet ID copied to clipboard');
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const onConfirmRefund = async () => {
    if (!refundTarget) return;
    setRefundLoading(true);
    try {
      const res = await paymentApi.refund(refundTarget.id, newIdempotencyKey());
      toast.success(
        res.replayed
          ? `Replayed earlier refund of ${formatCurrency(res.amount)}`
          : `Refunded ${formatCurrency(res.amount)} to ${res.originalSenderEmail}`,
      );
      setRefundTarget(null);
      setSelectedTx(null);
      fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setRefundLoading(false);
    }
  };

  const sentTotal = recent
    .filter((t) => t.direction === 'SENT')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const receivedTotal = recent
    .filter((t) => t.direction === 'RECEIVED' || t.status === 'REFUND')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <>
      {/* Transaction Inspector Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onRefundRequest={(tx) => setRefundTarget(tx)}
      />

      {/* Refund Confirmation Modal */}
      <ConfirmModal
        open={Boolean(refundTarget)}
        title="Confirm refund"
        message={`Are you sure you want to refund ${
          refundTarget ? formatCurrency(refundTarget.amount) : ''
        } back to ${refundTarget?.senderEmail}? This will debit your wallet immediately.`}
        confirmLabel="Refund transfer"
        destructive
        loading={refundLoading}
        onConfirm={onConfirmRefund}
        onCancel={() => !refundLoading && setRefundTarget(null)}
      />

      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Treasury Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Rails
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Account: <span className="font-mono text-slate-700 dark:text-slate-300">{email}</span> • Real-time ACID settlement ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn-secondary py-2 text-xs"
            title="Refresh balance and transactions"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Synchronizing...' : 'Sync Data'}
          </button>
          <Link to="/transfer" className="btn-primary py-2 text-xs">
            <Send size={13} strokeWidth={2.2} />
            Send Money
          </Link>
        </div>
      </div>

      {/* Top Hero Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Luxury Obsidian FinTech Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 sm:p-8 text-white shadow-[0_20px_45px_-15px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.15)] lg:col-span-2 border border-slate-800/80 dark:border-white/[0.1]">
          {/* Subtle Specular Horizon Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
            aria-hidden
          />

          {/* Micro Grid Overlay */}
          <div className="absolute inset-0 bg-dot-grid-dark opacity-40 pointer-events-none" />

          <div className="relative flex flex-col justify-between h-full z-10">
            <div>
              {/* Card Top Strip: Issuer + EMV Chip + NFC Waves */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  {/* EMV Microchip Icon */}
                  <div className="relative flex h-8 w-11 items-center justify-center rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-100 p-1 shadow-inner border border-amber-500/40">
                    <div className="h-full w-full rounded-[2px] border border-amber-600/40 grid grid-cols-2 gap-0.5 opacity-80">
                      <div className="border-r border-b border-amber-700/30" />
                      <div className="border-b border-amber-700/30" />
                      <div className="border-r border-amber-700/30" />
                      <div />
                    </div>
                  </div>

                  {/* Contactless waves */}
                  <svg className="w-5 h-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                    <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                    <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                  </svg>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 font-semibold">
                    PayRail Commercial
                  </span>
                  <button
                    onClick={() => setHideBalance((prev) => !prev)}
                    className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/[0.08] transition"
                    title={hideBalance ? 'Show balance' : 'Hide balance'}
                  >
                    {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Main Balance Display */}
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/90 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Liquid Available Balance
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-3">
                  {loading ? (
                    <Spinner size={32} className="text-white" />
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="tnum text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans">
                        {wallet
                          ? hideBalance
                            ? '••••••••'
                            : formatCurrency(wallet.balance)
                          : '—'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Number & Metadata */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="font-mono text-xs tracking-widest text-white/70 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1">
                    PR-{wallet?.walletId ? String(wallet.walletId).padStart(4, '0') : '0001'} •••• •••• 9421
                  </div>

                  {wallet && (
                    <button
                      onClick={copyWalletId}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300 hover:bg-white/[0.1] transition active:scale-[0.98]"
                    >
                      {copiedWallet ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="text-white/60" />
                          <span>Copy Wallet #{wallet.walletId}</span>
                        </>
                      )}
                    </button>
                  )}

                  <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-300">
                    <Zap size={10} /> Instant Rail
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-8 pt-5 border-t border-white/[0.08] flex flex-wrap gap-2.5">
              <Link
                to="/transfer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-slate-100 transition active:scale-[0.98]"
              >
                <Send size={13} strokeWidth={2.2} />
                Transfer Funds
              </Link>
              <Link
                to="/history"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/[0.14] transition active:scale-[0.98]"
              >
                <HistoryIcon size={13} strokeWidth={2} />
                Audit Ledger
              </Link>
            </div>
          </div>
        </div>

        {/* Daily limit & Stats side card */}
        <div className="space-y-4">
          <DailyLimitBar />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <StatCard
              label="Recent Settled Inflow"
              value={receivedTotal}
              tone="positive"
              icon={ArrowDownLeft}
              subtext="Deposits & refunds"
            />
            <StatCard
              label="Recent Settled Outflow"
              value={sentTotal}
              tone="negative"
              icon={ArrowUpRight}
              subtext="Transfers issued"
            />
          </div>
        </div>
      </div>

      {/* Cash Flow Interactive Chart */}
      <div className="mt-8">
        <CashFlowChart transactions={recent} />
      </div>

      {/* Recent Activity List */}
      <div className="mt-8 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-6 py-4.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent Ledger Activity
              </h2>
              <span className="rounded-full bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                {recent.length} Settled
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Live cryptographic stream — select any record for complete ACID audit lifecycle
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition"
          >
            <span>Complete Ledger</span>
            <span aria-hidden>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={24} className="text-slate-400" />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No ledger events yet"
            description="Transfers will appear here instantly once you send or receive funds."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {recent.map((t) => {
              const isRefund = t.status === 'REFUND';
              const isReversed = t.status === 'REVERSED';
              const sent = t.direction === 'SENT';
              const counterparty = sent ? t.recipientEmail : t.senderEmail;
              const initials = counterparty ? counterparty.slice(0, 2).toUpperCase() : 'TX';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTx(t)}
                  className="flex items-center gap-4 px-6 py-4 transition-all duration-150 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] cursor-pointer group"
                >
                  {/* Counterparty avatar bubble with direction indicator */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold transition-transform group-hover:scale-105 border ${
                        isRefund
                          ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : sent
                          ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {initials}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white shadow-xs ${
                        sent ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    >
                      {sent ? <ArrowUpRight size={10} strokeWidth={2.5} /> : <ArrowDownLeft size={10} strokeWidth={2.5} />}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {isRefund ? 'Refund to ' : sent ? 'Transfer to ' : 'Deposit from '}
                        <span className="font-mono text-xs font-normal text-slate-600 dark:text-slate-300">
                          {counterparty}
                        </span>
                      </p>
                      {isReversed && (
                        <span className="badge bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          Reversed
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>{relativeTime(t.createdAt)}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">TX-{String(t.id).padStart(6, '0')}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`tnum text-sm sm:text-base font-bold font-mono ${
                        sent
                          ? 'text-slate-900 dark:text-white'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {sent ? '−' : '+'}
                      {formatCurrency(t.amount)}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      Inspect Audit →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
  subtext,
}: {
  label: string;
  value: number;
  tone: 'positive' | 'negative';
  icon: typeof ArrowDownLeft;
  subtext: string;
}) {
  return (
    <div className="card p-4.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
            tone === 'positive'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}
        >
          <Icon size={14} strokeWidth={2.2} />
        </div>
      </div>
      <p className="tnum mt-2 text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
        {formatCurrency(value)}
      </p>
      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{subtext}</p>
    </div>
  );
}
