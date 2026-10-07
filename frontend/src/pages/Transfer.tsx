import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Send,
  RefreshCw,
  AtSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  FileText,
  Lock,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi, walletApi, extractErrorMessage } from '../api/client';
import { formatCurrency, formatDate } from '../lib/format';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import DailyLimitBar from '../components/DailyLimitBar';
import type { WalletBalance, TransferResponse } from '../types';

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

export default function Transfer() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey());
  const [submitting, setSubmitting] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResponse | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    walletApi.balance().then(setWallet).catch(() => {});
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  const currentBalance = wallet ? Number(wallet.balance) : 0;
  const balanceRemaining = Math.max(0, currentBalance - numericAmount);

  const handleNextToReview = (e: FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !recipient.includes('@')) {
      toast.error('Please enter a valid recipient email address');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Enter a valid amount greater than zero');
      return;
    }
    if (wallet && numericAmount > currentBalance) {
      toast.error('Amount exceeds your available balance');
      return;
    }
    setStep(2);
  };

  const handleExecuteTransfer = async () => {
    setSubmitting(true);
    try {
      const res = await paymentApi.transfer(
        { recipientEmail: recipient.trim(), amount: numericAmount },
        idempotencyKey,
      );
      setTransferResult(res);
      setStep(3);
      toast.success(
        res.replayed
          ? `Replayed earlier transfer of ${formatCurrency(res.amount)}`
          : `Sent ${formatCurrency(res.amount)} to ${res.recipientEmail}`,
      );
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRecipient('');
    setAmount('');
    setIdempotencyKey(newIdempotencyKey());
    setTransferResult(null);
    setStep(1);
    walletApi.balance().then(setWallet).catch(() => {});
  };

  const copyReceiptId = () => {
    if (transferResult) {
      navigator.clipboard.writeText(String(transferResult.transactionId));
      setCopiedId(true);
      toast.success('Transaction ID copied');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <>
      <PageHeader
        title="Send Money"
        subtitle="Instant, idempotent payment processing between PayRail wallets."
      />

      {/* Step Progress Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                step >= 1
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              1
            </div>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Transfer Intent
            </span>
          </div>

          <div
            className={`h-0.5 flex-1 mx-3 transition-colors ${
              step >= 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/[0.08]'
            }`}
          />

          <div className="flex flex-col items-center">
            <div
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                step >= 2
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              2
            </div>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Verification
            </span>
          </div>

          <div
            className={`h-0.5 flex-1 mx-3 transition-colors ${
              step === 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/[0.08]'
            }`}
          />

          <div className="flex flex-col items-center">
            <div
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                step === 3
                  ? 'bg-emerald-500 text-white shadow-glow-emerald'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
              }`}
            >
              3
            </div>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Settlement Slip
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main interactive area */}
        <div className="lg:col-span-2">
          {/* STEP 1: Enter Recipient & Amount */}
          {step === 1 && (
            <div className="card p-7 sm:p-8 animate-fade-in space-y-6">
              {/* Available balance strip */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/[0.06] dark:bg-white/[0.02] p-4.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Liquid Vault Balance</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">Available</span>
                  </div>
                  <p className="tnum mt-1 text-2xl font-bold font-mono tracking-tight text-slate-950 dark:text-white">
                    {wallet ? formatCurrency(wallet.balance) : '—'}
                  </p>
                  {numericAmount > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Estimated remainder:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCurrency(balanceRemaining)}</span>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/[0.06] dark:bg-white/[0.02] p-4.5">
                  <DailyLimitBar compact />
                </div>
              </div>

              <form onSubmit={handleNextToReview} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label !mb-0" htmlFor="recipient">
                      Recipient PayRail Account
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">UUID/Email Validated</span>
                  </div>
                  <div className="relative">
                    <AtSign
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="recipient"
                      type="email"
                      required
                      className="input pl-10"
                      placeholder="e.g. partner@payrail.dev"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="amount">
                    Transfer Principal (INR)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 font-mono">
                      ₹
                    </span>
                    <input
                      id="amount"
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      className="input no-spin tnum pl-10 text-2xl font-bold font-mono tracking-tight"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  {/* Quick-select chips */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Select:</span>
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(String(amt))}
                        className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold font-mono text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.08] transition active:scale-[0.98]"
                      >
                        +₹{amt}
                      </button>
                    ))}
                    {wallet && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(wallet.balance))}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition active:scale-[0.98]"
                      >
                        Max Balance
                      </button>
                    )}
                  </div>
                </div>

                {/* Idempotency key */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label !mb-0" htmlFor="idem">
                      Idempotency Key
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      Double-Charge Shield
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="idem"
                      readOnly
                      className="input flex-1 cursor-not-allowed bg-white/70 dark:bg-white/[0.02] font-mono text-xs text-slate-500 shadow-none"
                      value={idempotencyKey}
                    />
                    <button
                      type="button"
                      onClick={() => setIdempotencyKey(newIdempotencyKey())}
                      className="btn-secondary px-3"
                      title="Regenerate token"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Unique execution token stored in Redis cache. Network retries will safely replay without duplicate charges.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary min-w-[170px]">
                    Authorize & Review <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Review & Security Verification */}
          {step === 2 && (
            <div className="card p-7 sm:p-8 animate-fade-in space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Review & Authorize Settlement
                  </h2>
                  <span className="badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Dual Lock Ready
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Please verify recipient and settlement breakdown before pessimistic locks are acquired.
                </p>
              </div>

              {/* Breakdown Slip */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Beneficiary Account</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{recipient}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Transfer Principal</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tnum">
                    {formatCurrency(numericAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Network Processing Fee</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹0.00 (Zero Fee)
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Settlement Speed</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Atomic &lt; 25ms
                  </span>
                </div>

                <div className="border-t border-slate-200/80 dark:border-white/[0.08] pt-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-950 dark:text-white text-base">Total Disbursement</span>
                    <p className="text-[11px] text-slate-400">Debited from wallet balance</p>
                  </div>
                  <span className="text-2xl font-bold font-mono text-slate-950 dark:text-white tnum">
                    {formatCurrency(numericAmount)}
                  </span>
                </div>
              </div>

              {/* Security guarantees banner */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20 flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-950 dark:text-emerald-200">
                    Ordered Pessimistic Locking
                  </p>
                  <p className="mt-0.5 text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
                    Database row locks are acquired in sorted ascending order of wallet ID, completely preventing deadlock vulnerabilities and ensuring strict ACID consistency.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  Back to edit
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  disabled={submitting}
                  className="btn-accent min-w-[180px]"
                >
                  {submitting ? (
                    <Spinner size={16} />
                  ) : (
                    <>
                      <Lock size={14} />
                      Authorize & Settle
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Voucher & Digital Payment Receipt */}
          {step === 3 && transferResult && (
            <div className="card p-8 sm:p-10 animate-scale-in text-center relative overflow-hidden">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow-emerald">
                <CheckCircle2 size={30} />
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                Payment Settled & Cleared
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {transferResult.replayed
                  ? 'Replayed response (Idempotent cache key replay detected)'
                  : 'Funds have moved atomically to the beneficiary account.'}
              </p>

              {/* Digital Voucher */}
              <div className="my-8 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 text-left dark:border-white/[0.08] dark:bg-white/[0.02] space-y-4 max-w-md mx-auto shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
                  <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Transaction Voucher</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
                    TX-{String(transferResult.transactionId).padStart(6, '0')}
                    <button
                      onClick={copyReceiptId}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {copiedId ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Settled Amount</span>
                  <span className="text-xl font-bold font-mono text-slate-950 dark:text-white tnum">
                    {formatCurrency(transferResult.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Beneficiary</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {transferResult.recipientEmail}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Timestamp</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {formatDate(transferResult.completedAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">New Vault Balance</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tnum">
                    {formatCurrency(transferResult.senderNewBalance)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={resetForm} className="btn-secondary">
                  <RotateCcw size={14} /> Send Another Transfer
                </button>
                <Link to="/history" className="btn-primary">
                  <FileText size={14} /> View in Audit Ledger
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Security / Info sidebar */}
        <aside className="card p-6 h-fit space-y-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Settlement Guarantees
            </h3>
          </div>

          <ul className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>
                <strong className="text-slate-950 dark:text-white">Atomic Settlement:</strong> Debit and credit occur within a single ACID transaction. Any transient error guarantees zero partial ledger modification.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>
                <strong className="text-slate-950 dark:text-white">Idempotency Validation:</strong> Unique Redis token tracking ensures repeated retries never charge accounts twice.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>
                <strong className="text-slate-950 dark:text-white">Deadlock Prevention:</strong> Locks are always requested in sorted ascending order of wallet ID.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>
                <strong className="text-slate-950 dark:text-white">Event Stream:</strong> On commit, a Kafka message is published to synchronize downstream ledger nodes.
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </>
  );
}
