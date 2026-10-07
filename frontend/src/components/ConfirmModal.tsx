import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Spinner from './Spinner';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancel();
    }
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-fade-in"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="card w-full max-w-md animate-scale-in p-6 dark:border-white/[0.08] dark:bg-slate-925/95 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                destructive
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <AlertTriangle size={18} />
            </div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-40"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button onClick={onCancel} disabled={loading} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.99] disabled:opacity-60'
                : 'btn-primary'
            }
          >
            {loading ? <Spinner size={16} /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
