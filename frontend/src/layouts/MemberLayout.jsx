import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import AppLogo from '../components/brand/AppLogo';
import toast from 'react-hot-toast';

/* ── SVG Nav İkonları ────────────────────────────────────────────────────── */
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBadge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <path d="M3 3v18h18M7 16l4-4 4 4 4-6" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconCalculator = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.04a2 2 0 0 1-2.83 2.83l-.04-.04a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.06a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04a1.7 1.7 0 0 0 .34-1.88 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.06a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04a1.7 1.7 0 0 0 1.88.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.06a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04a1.7 1.7 0 0 0-.34 1.88v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.06a1.7 1.7 0 0 0-1.55 1z" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

export default function MemberLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const navItems = [
    { to: '/member',            Icon: IconGrid,       label: t('memberNav.dashboard'),   end: true },
    { to: '/member/profile',    Icon: IconUser,       label: t('memberNav.profile') },
    { to: '/member/membership', Icon: IconBadge,      label: t('memberNav.membership') },
    { to: '/member/progress',   Icon: IconChart,      label: t('memberNav.progress') },
    { to: '/member/sessions',   Icon: IconCalendar,   label: t('memberNav.sessions') },
    { to: '/member/calculator', Icon: IconCalculator, label: t('memberNav.calorieCalc') },
    { to: '/member/account-settings', Icon: IconSettings, label: t('memberNav.accountSettings') },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success(t('auth.logoutSuccess'));
    navigate('/login');
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.classList.remove('panel-enter');
    void el.offsetWidth;
    el.classList.add('panel-enter');
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#080808] lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden">

      {/* ── Sidebar: mobilde overlay; masaüstünde viewport’a sabit ───────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-neutral-800/70 bg-[#0d0d0d]
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-neutral-800/70 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group min-w-0">
            <AppLogo className="h-7 w-7 flex-shrink-0" alt="" />
            <span className="text-white font-black text-base tracking-tight truncate">HA Salon Exclusive</span>
          </Link>
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

        {/* Nav bölüm etiketi */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
            {t('memberNav.member')}
          </span>
        </div>

        {/* Nav linkleri — çok satır olursa yalnız bu bölüm kayar */}
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 space-y-0.5">
          {navItems.map(({ to, Icon, label, end }) => (
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
                  {/* Aktif sol kenar çizgisi */}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-600" />
                  )}
                  <span className={isActive ? 'text-rose-500' : 'text-neutral-600 group-hover:text-neutral-400 transition-colors'}>
                    <Icon />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Alt bölüm */}
        <div className="border-t border-neutral-800/70 p-4 space-y-3 flex-shrink-0">
          {/* Dil seçici */}
          <div className="px-1">
            <LanguageSwitcher />
          </div>

          {/* Kullanıcı bilgisi */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-7 h-7 bg-rose-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-200 truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{t('memberNav.member')}</p>
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

      {/* ── Ana içerik (masaüstünde sidebar genişliği kadar sol boşluk) ──────── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-60">

        {/* Mobil header */}
        <header className="h-14 bg-[#0d0d0d] border-b border-neutral-800/70 flex items-center justify-between px-5 lg:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <IconMenu />
          </button>
          <div className="flex items-center gap-2 min-w-0 max-w-[55%]">
            <AppLogo className="h-5 w-5 flex-shrink-0" alt="" />
            <span className="text-white font-bold text-sm tracking-tight truncate">HA Salon Exclusive</span>
          </div>
          <LanguageSwitcher compact />
        </header>

        <main ref={contentRef} className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-7 panel-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
