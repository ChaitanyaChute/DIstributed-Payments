import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center select-none">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 text-slate-400 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-500 shadow-xs">
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
