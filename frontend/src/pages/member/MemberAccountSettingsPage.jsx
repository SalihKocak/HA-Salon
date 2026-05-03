import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import MemberLayout from '../../layouts/MemberLayout';
import { memberService } from '../../services/memberService';
import useAuthStore from '../../store/authStore';

export default function MemberAccountSettingsPage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    memberService.getProfile().then((profile) => {
      reset({
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    });
  }, [reset]);

  const onSubmit = async (data) => {
    if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
      toast.error(t('memberAccountSettings.passwordMismatch'));
      return;
    }

    if (data.newPassword && !data.currentPassword) {
      toast.error(t('memberAccountSettings.currentPasswordRequired'));
      return;
    }

    try {
      await memberService.updateAccountSettings({
        phoneNumber: data.phoneNumber,
        email: data.email?.trim() ? data.email.trim() : null,
        currentPassword: data.currentPassword?.trim() ? data.currentPassword : null,
        newPassword: data.newPassword?.trim() ? data.newPassword : null,
      });

      updateUser({
        phoneNumber: data.phoneNumber,
        email: data.email?.trim() ? data.email.trim() : null,
      });

      reset({
        phoneNumber: data.phoneNumber,
        email: data.email?.trim() ? data.email.trim() : '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });

      toast.success(t('memberAccountSettings.updateSuccess'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('memberAccountSettings.updateError'));
    }
  };

  return (
    <MemberLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-6 h-px bg-rose-600" />
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
              {t('memberNav.accountSettings')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('memberAccountSettings.title')}</h1>
          <p className="text-neutral-500 text-sm mt-1">{t('memberAccountSettings.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#0d0d0d] border border-neutral-800/70 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t('memberAccountSettings.phoneNumber')}>
              <input type="tel" {...register('phoneNumber', { required: true })} className={inputClass} />
            </Field>
            <Field label={t('memberAccountSettings.email')}>
              <input type="email" {...register('email')} className={inputClass} />
            </Field>
          </div>

          <div className="h-px bg-neutral-800/70" />

          <p className="text-xs text-neutral-400">{t('memberAccountSettings.passwordHint')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label={t('memberAccountSettings.currentPassword')}>
              <input type="password" {...register('currentPassword')} className={inputClass} />
            </Field>
            <Field label={t('memberAccountSettings.newPassword')}>
              <input type="password" {...register('newPassword')} className={inputClass} />
            </Field>
            <Field label={t('memberAccountSettings.confirmPassword')}>
              <input type="password" {...register('confirmNewPassword')} className={inputClass} />
            </Field>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold uppercase tracking-wide transition-colors"
            >
              {t('memberAccountSettings.saveButton')}
            </button>
          </div>
        </form>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-300 text-sm">
            {t('memberAccountSettings.securityNote')} {user?.phoneNumber || ''}
          </p>
        </div>
      </div>
    </MemberLayout>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 bg-neutral-900/60 border border-neutral-800 text-neutral-100 text-sm focus:outline-none focus:border-rose-600 transition-colors';
