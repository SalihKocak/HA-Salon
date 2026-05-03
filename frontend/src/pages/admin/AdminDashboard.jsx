import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconCoin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconTrendingDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconShoppingBag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconCreditCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

/* ── Stat kartı ──────────────────────────────────────────────────────────── */
function StatCard({ icon, title, value, subtitle, accentColor }) {
  return (
    <div className="bg-[#0d0d0d] p-6 flex flex-col gap-4 min-h-[120px]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest leading-tight">{title}</p>
        <span className={accentColor}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        {subtitle && <p className="text-neutral-600 text-xs mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Hızlı eylem ─────────────────────────────────────────────────────────── */
function QuickAction({ to, icon, label, desc }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 px-5 py-4 bg-[#0d0d0d] hover:bg-neutral-800/30 transition-all border-b border-neutral-800/40 last:border-b-0"
    >
      <span className="text-neutral-600 group-hover:text-rose-500 transition-colors flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">{label}</p>
        {desc && <p className="text-xs text-neutral-600 mt-0.5">{desc}</p>}
      </div>
      <span className="text-neutral-700 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all flex-shrink-0">
        <IconArrow />
      </span>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    adminService
      .getDashboard()
      .then((data) => {
        setStats(data);
        setErrorMessage('');
      })
      .catch((error) => {
        const apiMessage = error?.response?.data?.message;
        setErrorMessage(apiMessage || 'Dashboard verisi yuklenemedi.');
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: <IconUsers />,        title: t('adminDashboard.totalMembers'),     value: stats.totalMembers,                          accentColor: 'text-blue-500' },
    { icon: <IconClock />,        title: t('adminDashboard.pendingApprovals'), value: stats.pendingApprovals,                      accentColor: 'text-amber-500', subtitle: t('adminDashboard.awaitingReview') },
    { icon: <IconCheck />,        title: t('adminDashboard.activeMembers'),    value: stats.activeMemberships,                     accentColor: 'text-emerald-500' },
    { icon: <IconX />,            title: t('adminDashboard.expiredMembers'),   value: stats.expiredMemberships,                    accentColor: 'text-neutral-600' },
    { icon: <IconCoin />,         title: t('adminDashboard.monthlyRevenue'),   value: formatCurrency(stats.totalPaymentsThisMonth),accentColor: 'text-emerald-500', subtitle: t('adminDashboard.thisMonth') },
    { icon: <IconTrendingDown />, title: t('adminExpenses.title'),             value: formatCurrency(stats.totalExpensesThisMonth),accentColor: 'text-rose-500',    subtitle: t('adminDashboard.thisMonth') },
    { icon: <IconAlert />,        title: t('adminPayments.title'),             value: stats.paymentsDueCount,                     accentColor: 'text-amber-500' },
    { icon: <IconShoppingBag />,  title: t('adminNav.products'),              value: stats.totalProducts,                         accentColor: 'text-violet-500' },
  ] : [];

  const quickActions = [
    { to: '/admin/approvals', icon: <IconCheck />,      label: t('adminNav.approvals'), desc: t('adminDashboard.awaitingReview') },
    { to: '/admin/members',   icon: <IconUsers />,      label: t('adminNav.members') },
    { to: '/admin/payments',  icon: <IconCreditCard />, label: t('adminNav.payments') },
    { to: '/admin/packages',  icon: <IconPackage />,    label: t('adminNav.packages') },
  ];

  const net = stats ? stats.totalPaymentsThisMonth - stats.totalExpensesThisMonth : 0;

  return (
    <AdminLayout>
      <div className="w-full space-y-6">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-6 h-px bg-rose-600" />
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
              {t('adminNav.dashboard')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('adminDashboard.title')}</h1>
          <p className="text-neutral-500 text-sm mt-1">{t('adminDashboard.subtitle')}</p>
        </div>

        {/* ── 8 stat kart ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-800/50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[120px] bg-[#0d0d0d] animate-pulse" />
            ))}
          </div>
        ) : errorMessage ? (
          <div className="bg-[#0d0d0d] border border-red-900/40 px-6 py-5 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-800/50">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>
        )}

        {/* ── Alt iki kolon ───────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-neutral-800/40">

            {/* Gelir özeti — 2/5 */}
            <div className="bg-[#0d0d0d] lg:col-span-2">
              <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
                <span className="block w-4 h-px bg-rose-600" />
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  {t('adminDashboard.monthlyRevenue')}
                </h3>
              </div>
              <div className="p-6 space-y-1">
                {/* Gelir */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-800/50">
                  <span className="text-sm text-neutral-500">{t('adminDashboard.monthlyRevenue')}</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{formatCurrency(stats.totalPaymentsThisMonth)}</span>
                </div>
                {/* Gider */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-800/50">
                  <span className="text-sm text-neutral-500">{t('adminExpenses.title')}</span>
                  <span className="text-rose-400 font-bold tabular-nums">{formatCurrency(stats.totalExpensesThisMonth)}</span>
                </div>
                {/* Net */}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Net</span>
                  <span className={`text-2xl font-black tabular-nums ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(net)}
                  </span>
                </div>
              </div>
            </div>

            {/* Hızlı eylemler — 3/5 */}
            <div className="bg-[#0d0d0d] lg:col-span-3">
              <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
                <span className="block w-4 h-px bg-rose-600" />
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  {t('memberDashboard.quickActions')}
                </h3>
              </div>
              <div>
                {quickActions.map((a) => (
                  <QuickAction key={a.to} {...a} />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}
