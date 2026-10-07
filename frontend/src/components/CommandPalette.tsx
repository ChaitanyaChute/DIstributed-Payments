import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Send,
  History,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  Copy,
  Check,
  ArrowRight,
  X,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: typeof Search;
  category: 'Navigation' | 'Actions' | 'Account';
  action: () => void;
  badge?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { email, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const copyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopiedId(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
      onClose();
    }
  };

  const items: CommandItem[] = [
    {
      id: 'nav-dash',
      title: 'Dashboard',
      subtitle: 'Overview of wallet balance and activity',
      icon: LayoutDashboard,
      category: 'Navigation',
      action: () => {
        navigate('/dashboard');
        onClose();
      },
    },
    {
      id: 'nav-transfer',
      title: 'Send Money',
      subtitle: 'Transfer funds to another PayRail account',
      icon: Send,
      category: 'Navigation',
      action: () => {
        navigate('/transfer');
        onClose();
      },
      badge: 'Quick Send',
    },
    {
      id: 'nav-history',
      title: 'Transaction History',
      subtitle: 'Audit trail of all sent and received transfers',
      icon: History,
      category: 'Navigation',
      action: () => {
        navigate('/history');
        onClose();
      },
    },
    ...(role === 'ADMIN'
      ? [
          {
            id: 'nav-admin',
            title: 'Admin Master Ledger',
            subtitle: 'System-wide view of all transactions',
            icon: ShieldCheck,
            category: 'Navigation' as const,
            action: () => {
              navigate('/admin');
              onClose();
            },
            badge: 'Admin Only',
          },
        ]
      : []),
    {
      id: 'action-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: `Currently in ${theme} mode`,
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Actions',
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'action-copy-email',
      title: 'Copy Account Email',
      subtitle: email ?? 'No active session',
      icon: copiedId ? Check : Copy,
      category: 'Actions',
      action: copyEmail,
    },
    {
      id: 'action-logout',
      title: 'Sign Out',
      subtitle: 'Safely end current session',
      icon: LogOut,
      category: 'Account',
      action: () => {
        logout();
        navigate('/login');
        onClose();
      },
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-[12vh] backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft dark:border-white/[0.08] dark:bg-slate-925/95 backdrop-blur-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="relative flex items-center border-b border-slate-100 dark:border-white/[0.06] px-4 py-3.5">
          <Search size={18} className="text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 dark:text-slate-100 focus:outline-none"
            placeholder="Type a command, search pages, or jump to..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close command palette"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching commands found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold tracking-wide transition-all duration-100 ${
                      isSelected
                        ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                        : 'text-slate-700 hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-950'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${isSelected ? 'text-white dark:text-slate-950' : 'text-slate-900 dark:text-white'}`}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p
                            className={`text-[11px] truncate ${
                              isSelected ? 'text-white/80 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isSelected
                              ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-950'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight
                        size={14}
                        className={`transition-transform ${
                          isSelected ? 'translate-x-0.5 text-white dark:text-slate-950' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-slate-900/60 px-4 py-2.5 text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono shadow-xs dark:border-slate-800 dark:bg-slate-850">↑</kbd>{' '}
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono shadow-xs dark:border-slate-800 dark:bg-slate-850">↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono shadow-xs dark:border-slate-800 dark:bg-slate-850">↵</kbd>{' '}
              Select
            </span>
          </div>
          <span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono shadow-xs dark:border-slate-800 dark:bg-slate-850">ESC</kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
