import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/authService';
import { MEMBER_STATUS, ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function PendingPage() {
  const { user, logout, isLoading, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  // Kullanıcı onaylandıysa otomatik yönlendir
  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.role === ROLES.ADMIN) { navigate('/admin', { replace: true }); return; }
    if (user.status === MEMBER_STATUS.APPROVED) { navigate('/member', { replace: true }); return; }
    if (user.status === MEMBER_STATUS.REJECTED) { navigate('/rejected', { replace: true }); return; }
    if (user.status === MEMBER_STATUS.SUSPENDED) { navigate('/suspended', { replace: true }); return; }
  }, [user, isLoading, navigate]);

  // Admin onayladı mı kontrol et
  const checkApproval = async () => {
    setChecking(true);
    try {
      const freshUser = await authService.getMe();
      updateUser(freshUser);
      if (freshUser.status === MEMBER_STATUS.APPROVED) {
        toast.success(t('pending.nowApproved'));
        navigate('/member', { replace: true });
      } else {
        toast(t('pending.stillPending'), { icon: '⏳' });
      }
    } catch {
      toast.error(t('pending.checkError'));
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⏳</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-3">{t('pending.title')}</h1>
        <p className="text-neutral-300 text-lg mb-2">
          {t('pending.greeting', { name: user?.firstName })}
        </p>
        <p className="text-neutral-400 leading-relaxed mb-8">
          {t('pending.message')}
        </p>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
          <p className="text-amber-400 text-sm font-medium">
            {t('pending.approvalTime')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={checkApproval}
            disabled={checking}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {checking
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('pending.checking')}</>
              : `🔄 ${t('pending.checkStatus')}`}
          </button>
          <a
            href="https://wa.me/905385575859"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>💬</span> {t('pending.contactWhatsApp')}
          </a>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl transition-all border border-neutral-700"
          >
            {t('pending.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
