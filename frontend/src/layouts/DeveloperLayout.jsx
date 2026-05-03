import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import AppLogo from '../components/brand/AppLogo';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import toast from 'react-hot-toast';

export default function DeveloperLayout({ children }) {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success(t('auth.logoutSuccess'));
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#080808]">
      <aside className="hidden lg:flex w-64 border-r border-neutral-800/70 bg-[#0d0d0d] flex-col">
        <div className="h-14 flex items-center px-5 border-b border-neutral-800/70">
          <Link to="/developer" className="flex items-center gap-2.5 min-w-0">
            <AppLogo className="h-7 w-7 flex-shrink-0" alt="" />
            <span className="text-white font-black text-base tracking-tight truncate">Developer Portal</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          <NavItem to="/developer" label="Audit Logs" end />
          <NavItem to="/developer/errors" label="Error Logs" />
          <NavItem to="/developer/members" label="Member Activity" />
        </nav>
        <div className="mt-auto p-4 border-t border-neutral-800/70 space-y-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            {t('common.logout')}
          </button>
        </div>
      </aside>
      <div className="flex-1 p-5 lg:p-7 panel-enter">
        {children}
      </div>
    </div>
  );
}

function NavItem({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block px-3 py-2 text-sm ${isActive ? 'bg-neutral-800/60 text-white' : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/30'}`
      }
    >
      {label}
    </NavLink>
  );
}
