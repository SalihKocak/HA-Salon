import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';

export default function SuspendedPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⏸</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-3">{t('suspended.title')}</h1>
        <p className="text-neutral-300 text-lg mb-2">
          {t('suspended.greeting', { name: user?.firstName })}
        </p>
        <p className="text-neutral-400 leading-relaxed mb-8">
          {t('suspended.message')}
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="https://wa.me/905385575859"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>💬</span> {t('suspended.contactUs')}
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl transition-all border border-neutral-700"
          >
            {t('suspended.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
