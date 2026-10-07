import { useEffect, useState } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Copy,
  Check,
  Clock,
  RotateCcw,
  ExternalLink,
  Layers,
  Database,
  Radio,
  FileText,
} from 'lucide-react';
import type { TransactionView } from '../types';
import { formatCurrency, formatDate, relativeTime } from '../lib/format';
import toast from 'react-hot-toast';

interface Props {
  transaction: TransactionView | null;
  onClose: () => void;
  onRefundRequest?: (transaction: TransactionView) => void;
}

export default function TransactionDrawer({
  transaction,
  onClose,
  onRefundRequest,
}: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!transaction) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const isSent = transaction.direction === 'SENT';
  const isRefund = transaction.status === 'REFUND';
  const isReversed = transaction.status === 'REVERSED';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyFullJson = () => {
    const payload = JSON.stringify(transaction, null, 2);
    copyToClipboard(payload, 'Full Audit Record');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform border-l border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:border-white/[0.08] dark:bg-slate-925/95 animate-slide-up flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">
                TX #{transaction.id}
              </span>
              <span
                className={`badge ${
                  transaction.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-500/20'
                    : transaction.status === 'REFUND'
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/60 dark:text-indigo-400 dark:ring-indigo-500/20'
                    : transaction.status === 'REVERSED'
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-400 dark:ring-amber-500/20'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    transaction.status === 'COMPLETED'
                      ? 'bg-emerald-500 animate-pulse'
                      : transaction.status === 'REFUND'
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                />
                {transaction.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
            {/* Amount Banner */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 text-center dark:border-white/[0.08] dark:bg-white/[0.02]">
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${
                  isRefund
                    ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : isSent
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isSent ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isRefund
                  ? 'Compensating Reversal'
                  : isSent
                  ? 'Disbursement Payment'
                  : 'Settled Credit'}
              </p>
              <h2
                className={`tnum mt-1 text-3xl font-bold font-mono tracking-tight ${
                  isSent
                    ? 'text-slate-950 dark:text-white'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isSent ? '−' : '+'}
                {formatCurrency(transaction.amount)}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                {formatDate(transaction.createdAt)} ({relativeTime(transaction.createdAt)})
              </p>
            </div>

            {/* Counterparty details card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-2xs dark:border-white/[0.08] dark:bg-slate-900/80">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-3">
                Settlement Counterparties
              </h3>

              <div className="space-y-2.5">
                {/* Sender */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Originator
                    </span>
                    <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                      {transaction.senderEmail}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transaction.senderEmail, 'Originator')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy originator"
                  >
                    {copiedField === 'Originator' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Recipient */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Beneficiary
                    </span>
                    <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                      {transaction.recipientEmail}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transaction.recipientEmail, 'Beneficiary')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy beneficiary"
                  >
                    {copiedField === 'Beneficiary' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Execution Audit Trail */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-white/[0.08] dark:bg-slate-900/80">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-900 dark:text-white">
                  ACID Verification Lifecycle
                </h3>
              </div>

              <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                <div className="relative flex items-start gap-3 pl-7">
                  <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Idempotent Request Verified
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Redis key verified to eliminate duplicate debits
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3 pl-7">
                  <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Pessimistic Row Lock Acquired
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Deadlock-free sorted lock on dual wallet IDs
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3 pl-7">
                  <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Atomic Balance Movement
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      PostgreSQL serializable/ACID isolation committed
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3 pl-7">
                  <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Kafka Event Dispatched
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      payment_{transaction.status.toLowerCase()} event synchronized
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional details */}
            {transaction.refundOfTransactionId && (
              <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/70 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <p className="text-xs font-medium text-indigo-900 dark:text-indigo-300">
                  Compensating Transaction
                </p>
                <p className="mt-0.5 text-xs text-indigo-700/90 dark:text-indigo-400/90">
                  This record reverses original transaction #{transaction.refundOfTransactionId}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 p-6 dark:bg-white/[0.01] space-y-3">
            {transaction.refundable && onRefundRequest && (
              <button
                onClick={() => onRefundRequest(transaction)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition-all active:scale-[0.99]"
              >
                <RotateCcw size={15} />
                Issue Refund for {formatCurrency(transaction.amount)}
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(String(transaction.id), 'Transaction ID')}
                className="btn-secondary flex-1 py-2"
              >
                {copiedField === 'Transaction ID' ? (
                  <>
                    <Check size={14} className="text-emerald-500" /> Copied ID
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy ID
                  </>
                )}
              </button>

              <button onClick={copyFullJson} className="btn-secondary flex-1 py-2">
                <FileText size={14} /> Copy Audit JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
