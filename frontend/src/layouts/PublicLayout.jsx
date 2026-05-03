import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { ROLES, MEMBER_STATUS } from '../utils/constants';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import AppLogo from '../components/brand/AppLogo';

export default function PublicLayout({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** Ana sayfada hash ile açılışta (ör. /#gallery) ilgili bölüme kaydır */
  useEffect(() => {
    const id = location.hash.replace(/^#/, '');
    if (!id || location.pathname !== '/') return undefined;
    const run = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const t = window.setTimeout(run, 80);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash]);

  const getDashboardLink = () => {
    if (!isAuthenticated) return null;
    if (user?.role === ROLES.ADMIN) return '/admin';
    if (user?.status === MEMBER_STATUS.PENDING) return '/pending';
    return '/member';
  };

  const dashboardLink = getDashboardLink();

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: id });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav
        className={`relative md:sticky md:top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-xl border-b border-neutral-800/60 shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <AppLogo className="h-7 w-7" alt="" />
              <span className="text-white font-semibold text-base tracking-tight">HA Salon Exclusive</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <NavBtn onClick={() => scrollTo('about')}>{t('nav.about')}</NavBtn>
              <NavBtn onClick={() => scrollTo('gallery')}>{t('nav.gallery')}</NavBtn>
              <NavBtn onClick={() => scrollTo('how')}>{t('nav.howItWorks')}</NavBtn>
              <NavBtn onClick={() => scrollTo('contact')}>{t('nav.contact')}</NavBtn>
            </div>

            {/* Sağ taraf */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher compact />

              {isAuthenticated ? (
                <Link
                  to={dashboardLink}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold tracking-wide uppercase transition-colors"
                >
                  {t('common.dashboard')}
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-neutral-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold tracking-wide uppercase transition-colors"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobil hamburger */}
              <button
                className="md:hidden flex flex-col gap-1.5 p-1.5"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <span className={`w-5 h-0.5 bg-neutral-300 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-5 h-0.5 bg-neutral-300 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-5 h-0.5 bg-neutral-300 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobil menü */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ${
            menuOpen ? 'max-h-96' : 'max-h-0'
          } bg-black border-t border-neutral-800/60`}
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            <MobileNavBtn onClick={() => scrollTo('about')}>{t('nav.about')}</MobileNavBtn>
            <MobileNavBtn onClick={() => scrollTo('gallery')}>{t('nav.gallery')}</MobileNavBtn>
            <MobileNavBtn onClick={() => scrollTo('how')}>{t('nav.howItWorks')}</MobileNavBtn>
            <MobileNavBtn onClick={() => scrollTo('contact')}>{t('nav.contact')}</MobileNavBtn>
            <div className="border-t border-neutral-800 my-3" />
            <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-neutral-400 hover:text-white text-sm transition-colors">
              {t('nav.login')}
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wide text-center transition-colors">
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20">
          {/* Üst satır */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-14 border-b border-neutral-800/60">
            {/* Marka */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <AppLogo className="h-8 w-8" alt="" />
                <span className="text-white font-bold text-lg tracking-tight">HA Salon Exclusive</span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">{t('footer.tagline')}</p>
            </div>

            {/* Hızlı bağlantılar */}
            <div>
              <h4 className="text-neutral-200 text-xs font-semibold uppercase tracking-widest mb-4">
                {t('footer.quickLinks')}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => scrollTo('about')} className="text-neutral-500 hover:text-white text-sm transition-colors">
                    {t('nav.about')}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('gallery')} className="text-neutral-500 hover:text-white text-sm transition-colors">
                    {t('nav.gallery')}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('how')} className="text-neutral-500 hover:text-white text-sm transition-colors">
                    {t('nav.howItWorks')}
                  </button>
                </li>
                <li>
                  <Link to="/login" className="text-neutral-500 hover:text-white text-sm transition-colors">
                    {t('nav.login')}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-neutral-500 hover:text-white text-sm transition-colors">
                    {t('nav.register')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <h4 className="text-neutral-200 text-xs font-semibold uppercase tracking-widest mb-4">
                {t('footer.contact')}
              </h4>
              <p className="text-neutral-500 text-sm">+90 538 557 58 59</p>
            </div>
          </div>

          {/* Alt satır */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
            <p className="text-neutral-600 text-xs">{t('footer.rights')}</p>
            <div className="flex items-center gap-2">
              <AppLogo className="h-4 w-4" alt="" />
              <span className="text-neutral-600 text-xs">HA Salon Exclusive</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="text-neutral-400 hover:text-white text-sm font-medium transition-colors"
    >
      {children}
    </button>
  );
}

function MobileNavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors text-left"
    >
      {children}
    </button>
  );
}
