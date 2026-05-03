import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import AppLogo from '../components/brand/AppLogo';
import toast from 'react-hot-toast';

/* ── SVG Nav İkonları ────────────────────────────────────────────────────── */
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconCreditCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconShoppingBag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconTrendingDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
);
const IconMessageCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="7.5" cy="15.5" r="3.5" />
    <path d="M11 15.5h10M18 15.5v3M15 15.5v2" />
  </svg>
);
const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </svg>
);
const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="16" y1="11" x2="22" y2="11" />
  </svg>
);
const IconDayPass = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
    <path d="M7 3h2v4H7zM15 3h2v4h-2z" />
  </svg>
);

/** Geçici: Araçlar menüsünde WhatsApp gizli. Tekrar göstermek için `true` yapın ve aşağıdaki satırı `items` içine ekleyin. */
const SHOW_WHATSAPP_IN_ADMIN_NAV = false;

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const navGroups = [
    {
      label: t('adminNav.overview') || 'Overview',
      items: [
        { to: '/admin',          Icon: IconGrid,    label: t('adminNav.dashboard'), end: true },
      ],
    },
    {
      label: t('adminNav.management') || 'Management',
      items: [
        { to: '/admin/members',   Icon: IconUsers,        label: t('adminNav.members') },
        { to: '/admin/approvals', Icon: IconCheck,        label: t('adminNav.approvals') },
        { to: '/admin/sessions',  Icon: IconCalendar,     label: t('adminNav.sessions') },
      ],
    },
    {
      label: t('adminNav.finance') || 'Finance',
      items: [
        { to: '/admin/packages',  Icon: IconPackage,      label: t('adminNav.packages') },
        { to: '/admin/payments',  Icon: IconCreditCard,   label: t('adminNav.payments') },
        { to: '/admin/expenses',  Icon: IconTrendingDown, label: t('adminNav.expenses') },
        { to: '/admin/products',  Icon: IconShoppingBag,  label: t('adminNav.products') },
      ],
    },
    {
      label: t('adminNav.tools') || 'Tools',
      items: [
        { to: '/admin/reports',   Icon: IconBarChart,     label: t('adminNav.reports') },
        { to: '/admin/data-entry', Icon: IconUserPlus,    label: t('adminNav.dataEntry') },
        { to: '/admin/daily-visitors', Icon: IconDayPass, label: t('adminNav.dailyVisitors') },
        { to: '/admin/password-tools', Icon: IconKey,     label: t('adminNav.passwordTools') },
        ...(SHOW_WHATSAPP_IN_ADMIN_NAV
          ? [{ to: '/admin/whatsapp', Icon: IconMessageCircle, label: t('adminNav.whatsapp') }]
          : []),
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success(t('auth.logoutSuccess'));
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const displayName = isAdmin
    ? 'HA Salon'
    : `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.classList.remove('panel-enter');
    void el.offsetWidth;
    el.classList.add('panel-enter');
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#080808] lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden">

      {/* ── Sidebar: mobilde overlay; masaüstünde viewport’a sabit, tam yükseklik ─ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-neutral-800/70 bg-[#0d0d0d]
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-800/70 flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group min-w-0 flex-1 mr-2">
            <AppLogo className="h-7 w-7 flex-shrink-0" alt="" />
            <span className="text-white font-black text-base tracking-tight truncate">HA Salon Exclusive</span>
          </Link>
          {/* Admin rozeti */}
          <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-600/15 border border-rose-600/25 text-rose-500 text-[9px] font-bold uppercase tracking-widest">
            <IconShield /> Admin
          </span>
        </div>

        <div className="px-3 py-3 border-b border-neutral-800/70">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-200 bg-rose-600/20 border border-rose-500/50 hover:bg-rose-600/30 hover:text-white transition-all"
          >
            <IconLogout />
            {t('common.logout')}
          </button>
        </div>

        {/* Nav grupları — çok link olursa yalnız orta kısım kayar, üst logo + alt blok sabit */}
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 space-y-5 px-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-neutral-700 uppercase tracking-[0.2em] px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all relative
                      ${isActive
                        ? 'text-white bg-neutral-800/60'
                        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/40'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-600" />
                        )}
                        <span className={isActive ? 'text-rose-500' : 'text-neutral-700 group-hover:text-neutral-400 transition-colors'}>
                          <Icon />
                        </span>
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Alt bölüm */}
        <div className="border-t border-neutral-800/70 p-4 space-y-3 flex-shrink-0">
          <div className="px-1">
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3 px-2 py-1">
            <AppLogo className="h-7 w-7 flex-shrink-0" alt="HA Salon logo" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-200 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{t('adminNav.administrator')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobil overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Ana içerik (masaüstünde sabit sidebar genişliği kadar sol boşluk) ─ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-60">
        <header className="h-14 bg-[#0d0d0d] border-b border-neutral-800/70 flex items-center justify-between px-5 lg:hidden flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-neutral-400 hover:text-white transition-colors">
            <IconMenu />
          </button>
          <div className="flex items-center gap-2 min-w-0 max-w-[55%]">
            <AppLogo className="h-5 w-5 flex-shrink-0" alt="" />
            <span className="text-white font-bold text-sm tracking-tight truncate">HA Salon Exclusive</span>
          </div>
          <LanguageSwitcher compact />
        </header>

        <main ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-5 lg:p-7 panel-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
