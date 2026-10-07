import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  History,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  Command,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initialsFromEmail } from '../lib/format';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transfer', label: 'Send Money', icon: Send, badge: 'Instant' },
  { to: '/history', label: 'Transactions', icon: History },
];

export default function Layout() {
  const { email, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
      isActive
        ? 'bg-slate-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] dark:bg-white dark:text-slate-950 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50/60 dark:bg-slate-950 transition-colors duration-200">
      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200/80 bg-white/95 backdrop-blur-2xl transition-all duration-200 dark:border-white/[0.07] dark:bg-slate-925/95 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Brand header */}
          <div className="flex items-center justify-between px-6 py-5.5 border-b border-slate-100 dark:border-white/[0.06]">
            <Logo size="md" />
            <div className="flex items-center gap-1.5">
              <ThemeToggle size="sm" />
              <button
                className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Search Button in Sidebar */}
          <div className="px-5 pt-4 pb-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2 text-xs font-medium text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100/80 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05]"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-slate-400 dark:text-slate-500" />
                Quick command...
              </span>
              <kbd className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs dark:border-white/[0.1] dark:bg-slate-850 dark:text-slate-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navigation group */}
          <div className="px-6 pt-3 pb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Treasury & Rails
            </p>
          </div>

          <nav className="flex-1 space-y-1 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={navLinkClass}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={16}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className={isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-700'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {role === 'ADMIN' && (
              <>
                <div className="px-2 pb-1.5 pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    Governance
                  </p>
                </div>
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={navLinkClass}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <ShieldCheck
                          size={16}
                          strokeWidth={isActive ? 2.2 : 1.8}
                          className={isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}
                        />
                        <span>Master Ledger</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300'
                        }`}
                      >
                        ROOT
                      </span>
                    </>
                  )}
                </NavLink>
              </>
            )}
          </nav>

          {/* Infrastructure status card */}
          <div className="mx-4 mb-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Settlement Core
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Pessimistic concurrency lock • Kafka event stream online
            </p>
          </div>

          {/* User profile & sign out */}
          <div className="border-t border-slate-100 p-4 dark:border-white/[0.06]">
            <div className="flex items-center justify-between rounded-xl p-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 text-xs font-bold text-white shadow-2xs border border-white/10 dark:border-white/15">
                  {email ? initialsFromEmail(email) : '??'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {email}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {role} • Authenticated
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <LogOut size={13} strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-xl dark:border-white/[0.07] dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>

            {/* Desktop Command Palette trigger */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/70 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05] transition-all"
              >
                <Search size={14} className="text-slate-400" />
                <span>Search ledgers, commands, or send money...</span>
                <kbd className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                  Ctrl+K
                </kbd>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Send Action */}
            <button
              onClick={() => navigate('/transfer')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all active:scale-[0.98]"
            >
              <Send size={12} strokeWidth={2.2} />
              Quick Transfer
            </button>

            <div className="hidden sm:block">
              <ThemeToggle size="sm" />
            </div>

            {/* User pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.02]">
              <div className="h-5.5 w-5.5 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                {email ? initialsFromEmail(email) : 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                {email ? email.split('@')[0] : 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 animate-fade-in px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
