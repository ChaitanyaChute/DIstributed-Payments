import { useEffect, useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  Search,
  Download,
  Filter as FilterIcon,
  Copy,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi, transactionApi, extractErrorMessage } from '../api/client';
import type { PageResponse, TransactionView } from '../types';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import TransactionDrawer from '../components/TransactionDrawer';
import { formatCurrency, formatDate, relativeTime } from '../lib/format';

type FilterType = 'ALL' | 'SENT' | 'RECEIVED' | 'REFUND';

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function History() {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<PageResponse<TransactionView> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refundTarget, setRefundTarget] = useState<TransactionView | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [selectedTx, setSelectedTx] = useState<TransactionView | null>(null);

  const fetchTransactions = (silent = false) => {
    if (!silent) setLoading(true);
    transactionApi
      .history(page, size)
      .then((r) => setData(r))
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, size, reloadCounter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const filtered = useMemo(() => {
    if (!data?.content) return [];
    return data.content.filter((t) => {
      // Type filter
      if (filter === 'SENT' && t.direction !== 'SENT') return false;
      if (filter === 'RECEIVED' && t.direction !== 'RECEIVED') return false;
      if (filter === 'REFUND' && t.status !== 'REFUND') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = String(t.id).includes(q);
        const matchesSender = t.senderEmail.toLowerCase().includes(q);
        const matchesRecipient = t.recipientEmail.toLowerCase().includes(q);
        const matchesAmount = String(t.amount).includes(q);
        return matchesId || matchesSender || matchesRecipient || matchesAmount;
      }

      return true;
    });
  }, [data, filter, searchQuery]);

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
      setReloadCounter((n) => n + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setRefundLoading(false);
    }
  };

  const exportCSV = () => {
    if (!filtered || filtered.length === 0) {
      toast.error('No transactions available to export');
      return;
    }
    const headers = ['ID,Sender,Recipient,Amount,Direction,Status,Date'];
    const rows = filtered.map((t) =>
      [
        t.id,
        `"${t.senderEmail}"`,
        `"${t.recipientEmail}"`,
        t.amount,
        t.direction || '',
        t.status,
        `"${t.createdAt}"`,
      ].join(','),
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payrail-transactions-page-${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported to CSV');
  };

  return (
    <>
      <TransactionDrawer
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onRefundRequest={(tx) => setRefundTarget(tx)}
      />

      <ConfirmModal
        open={Boolean(refundTarget)}
        title="Confirm Refund"
        message={`Are you sure you want to refund ${
          refundTarget ? formatCurrency(refundTarget.amount) : ''
        } back to ${refundTarget?.senderEmail}? This action immediately reverts wallet balances.`}
        confirmLabel="Issue Refund"
        destructive
        loading={refundLoading}
        onConfirm={onConfirmRefund}
        onCancel={() => !refundLoading && setRefundTarget(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Transaction Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Complete chronological record of all incoming and outgoing payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="btn-secondary py-2 text-xs"
            title="Export filtered records to CSV"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary py-2 text-xs"
            title="Reload records"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] p-4.5 bg-slate-50/40 dark:bg-white/[0.01]">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'SENT', 'RECEIVED', 'REFUND'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  filter === f
                    ? 'bg-slate-950 text-white shadow-xs dark:bg-white dark:text-slate-950'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100/80 dark:bg-white/[0.03] dark:border-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.07]'
                }`}
              >
                {f === 'ALL'
                  ? 'All Transactions'
                  : f === 'SENT'
                  ? 'Disbursements'
                  : f === 'RECEIVED'
                  ? 'Settlements'
                  : 'Refunds'}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by ID, email, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 py-1.5 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size={24} className="text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={searchQuery ? 'No matching transactions' : 'No transactions found'}
            description={
              searchQuery
                ? 'Try broadening your search query or reset filter pills.'
                : "You haven't made or received any transfers under this category yet."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-white/[0.01]">
                  <th className="px-6 py-3.5">Reference & Type</th>
                  <th className="px-6 py-3.5">Counterparty</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Settled At</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filtered.map((t) => {
                  const isSent = t.direction === 'SENT';
                  const isRefund = t.status === 'REFUND';
                  const isReversed = t.status === 'REVERSED';
                  const counterparty = isSent ? t.recipientEmail : t.senderEmail;
                  const initials = counterparty ? counterparty.slice(0, 2).toUpperCase() : 'TX';

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTx(t)}
                      className="group cursor-pointer hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Icon + ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-[11px] font-bold border ${
                              isRefund
                                ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : isSent
                                ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isSent ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              TX-{String(t.id).padStart(6, '0')}
                            </span>
                            <p className="text-[11px] text-slate-400">
                              {isRefund ? 'Compensating Refund' : isSent ? 'Outflow Debit' : 'Inflow Credit'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Counterparty */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.06] text-[10px] font-mono text-slate-600 dark:text-slate-300 font-semibold">
                            {initials}
                          </span>
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {counterparty}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] uppercase font-semibold text-slate-400">
                          {isSent ? 'Beneficiary' : 'Originator'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`badge ${
                            t.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-500/20'
                              : t.status === 'REFUND'
                              ? 'bg-indigo-500/10 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/60 dark:text-indigo-400 dark:ring-indigo-500/20'
                              : t.status === 'REVERSED'
                              ? 'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-500/20'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              t.status === 'COMPLETED'
                                ? 'bg-emerald-500'
                                : t.status === 'REFUND'
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {t.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(t.createdAt)}
                        <p className="text-[10px] text-slate-400 font-mono">{relativeTime(t.createdAt)}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <p
                          className={`tnum font-bold font-mono text-sm ${
                            isSent
                              ? 'text-slate-900 dark:text-white'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isSent ? '−' : '+'}
                          {formatCurrency(t.amount)}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {t.refundable ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRefundTarget(t);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition active:scale-[0.98]"
                          >
                            <RotateCcw size={11} />
                            Refund
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-semibold transition">
                            Inspect →
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
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
              Page {data.number + 1} of {data.totalPages} · {data.totalElements} Total
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
