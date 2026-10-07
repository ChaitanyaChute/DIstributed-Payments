import { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Search,
  Download,
  Activity,
  Layers,
  Database,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionApi, extractErrorMessage } from '../api/client';
import type { PageResponse, TransactionView } from '../types';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import TransactionDrawer from '../components/TransactionDrawer';
import { formatCurrency, formatDate, relativeTime } from '../lib/format';

export default function AdminTransactions() {
  const [page, setPage] = useState(0);
  const [size] = useState(50);
  const [data, setData] = useState<PageResponse<TransactionView> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionView | null>(null);

  const fetchRecords = (silent = false) => {
    if (!silent) setLoading(true);
    transactionApi
      .adminAll(page, size)
      .then((r) => setData(r))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchRecords();
  }, [page, size]);

  const filtered = useMemo(() => {
    if (!data?.content) return [];
    if (!searchQuery.trim()) return data.content;
    const q = searchQuery.toLowerCase().trim();
    return data.content.filter(
      (t) =>
        String(t.id).includes(q) ||
        t.senderEmail.toLowerCase().includes(q) ||
        t.recipientEmail.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  const totalVolume = useMemo(() => {
    if (!data?.content) return 0;
    return data.content.reduce((sum, t) => sum + Number(t.amount), 0);
  }, [data]);

  const exportCSV = () => {
    if (!filtered || filtered.length === 0) {
      toast.error('No transactions available to export');
      return;
    }
    const headers = ['ID,Sender,Recipient,Amount,Status,Date'];
    const rows = filtered.map((t) =>
      [
        t.id,
        `"${t.senderEmail}"`,
        `"${t.recipientEmail}"`,
        t.amount,
        t.status,
        `"${t.createdAt}"`,
      ].join(','),
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payrail-admin-ledger-p${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Admin ledger exported to CSV');
  };

  return (
    <>
      <TransactionDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              System Master Ledger
            </h1>
            <span className="badge bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <ShieldCheck size={11} strokeWidth={2.2} />
              Root Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Global ledger telemetry across all wallets, PostgreSQL transactions, and Kafka events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-secondary py-2 text-xs">
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchRecords(true);
            }}
            disabled={refreshing}
            className="btn-secondary py-2 text-xs"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Admin KPI telemetry strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Active Settled Volume</span>
            <Activity size={14} className="text-emerald-500" />
          </div>
          <p className="tnum mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(totalVolume)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Across {data?.content.length ?? 0} loaded entries</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Global System Transactions</span>
            <Database size={14} className="text-emerald-500" />
          </div>
          <p className="tnum mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {data?.totalElements ?? '—'}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Persisted in ACID PostgreSQL</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Concurrency Guarantee</span>
            <Layers size={14} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-lg font-bold font-mono text-slate-900 dark:text-white">
            Zero Lost Updates
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Pessimistic row locking active</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Search header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] p-4.5 bg-slate-50/40 dark:bg-white/[0.01]">
          <div className="relative min-w-[300px]">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filter by ID, sender, recipient, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 py-1.5 text-xs rounded-xl"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filtered.length} entries
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={24} className="text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions recorded" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Originator</th>
                  <th className="px-6 py-3.5">Beneficiary</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTx(t)}
                    className="group cursor-pointer text-sm transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      TX-{String(t.id).padStart(6, '0')}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {t.senderEmail}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {t.recipientEmail}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-500/20'
                            : t.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-500/20'
                            : t.status === 'REVERSED'
                            ? 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-600/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-500/20'
                            : t.status === 'REFUND'
                            ? 'bg-indigo-500/10 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/60 dark:text-indigo-400'
                            : 'bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/60 dark:text-rose-400'
                        }`}
                      >
                        {t.status}
                      </span>
                      {t.refundOfTransactionId && (
                        <p className="mt-1 text-[10px] font-mono font-semibold text-slate-400">
                          Reverses #{t.refundOfTransactionId}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="tnum px-6 py-4 text-right font-bold font-mono text-slate-900 dark:text-white">
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.06] px-6 py-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={data.first}
              className="btn-secondary text-xs"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              className="btn-secondary text-xs"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
