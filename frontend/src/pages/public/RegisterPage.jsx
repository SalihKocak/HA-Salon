import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { FITNESS_GOALS, ROLES, MEMBER_STATUS, translateFitnessGoal } from '../../utils/constants';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import BirthDateSelects from '../../components/ui/BirthDateSelects';
import AppLogo from '../../components/brand/AppLogo';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.68 3.4 2 2 0 0 1 3.65 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.69 6.69l.99-.99a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconDumbbell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6.5 6.5h11M6.5 17.5h11M4 9v6M20 9v6M2 10.5v3M22 10.5v3" />
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 3v18h18M7 16l4-4 4 4 4-6" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ── Form Yardımcıları ───────────────────────────────────────────────────── */
function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}
function iClass(error) {
  return `w-full pl-10 pr-4 py-2.5 bg-neutral-900/60 border text-neutral-100 placeholder:text-neutral-600 text-sm focus:outline-none focus:border-rose-600 transition-colors ${error ? 'border-red-500' : 'border-neutral-800'}`;
}
function iClassPlain(error) {
  return `w-full pl-4 pr-4 py-2.5 bg-neutral-900/60 border text-neutral-100 placeholder:text-neutral-600 text-sm focus:outline-none focus:border-rose-600 transition-colors ${error ? 'border-red-500' : 'border-neutral-800'}`;
}
function IconInput({ icon, children }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">{icon}</span>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const { register: registerUser, login, isAuthenticated, user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Kayıt formu state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login modal state
  const [loginModal, setLoginModal] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const loginForm = useForm();

  useEffect(() => {
    if (isLoading || isSubmitting) return;
    if (isAuthenticated && user) {
      if (user.role === ROLES.ADMIN) { navigate('/admin', { replace: true }); return; }
      if (user.status === MEMBER_STATUS.PENDING) { navigate('/pending', { replace: true }); return; }
      if (user.status === MEMBER_STATUS.REJECTED) { navigate('/rejected', { replace: true }); return; }
      if (user.status === MEMBER_STATUS.SUSPENDED) { navigate('/suspended', { replace: true }); return; }
      navigate('/member', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, isSubmitting]);

  const steps = [t('register.step1Title'), t('register.step2Title'), t('register.step3Title')];

  const { register, handleSubmit, watch, control, formState: { errors }, trigger } = useForm({
    defaultValues: { gender: '', goal: '' }
  });

  const password = watch('password');

  const stepFields = [
    ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'confirmPassword'],
    ['gender', 'birthDate', 'height', 'weight', 'targetWeight'],
    ['goal'],
  ];

  const nextStep = async () => {
    const valid = await trigger(stepFields[currentStep]);
    if (valid) setCurrentStep((s) => s + 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email?.trim() ? data.email.trim() : null,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
        gender: data.gender || null,
        birthDate: data.birthDate || null,
        height: data.height ? Number(data.height) : null,
        weight: data.weight ? Number(data.weight) : null,
        targetWeight: data.targetWeight ? Number(data.targetWeight) : null,
        goal: data.goal || null,
      };
      await registerUser(payload);
      toast.success(t('register.submitSuccess'));
      navigate('/pending');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.registerFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login modal aç/kapat
  const openLogin = () => {
    setLoginModal(true);
    loginForm.reset();
    setShowLoginPw(false);
    requestAnimationFrame(() => setLoginVisible(true));
  };
  const closeLogin = () => {
    setLoginVisible(false);
    setTimeout(() => setLoginModal(false), 350);
  };

  // Login submit
  const onLoginSubmit = async (data) => {
    setLoginSubmitting(true);
    try {
      const u = await login(data.identifier, data.password);
      toast.success(t('auth.loginSuccess', { name: u.firstName }));
      if (u.role === ROLES.ADMIN) navigate('/admin');
      else if (u.status === MEMBER_STATUS.PENDING) navigate('/pending');
      else if (u.status === MEMBER_STATUS.REJECTED) navigate('/rejected');
      else if (u.status === MEMBER_STATUS.SUSPENDED) navigate('/suspended');
      else navigate('/member');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'ACCOUNT_SUSPENDED') toast.error(t('auth.accountSuspended'));
      else toast.error(msg || t('auth.loginFailed'));
    } finally {
      setLoginSubmitting(false);
    }
  };

  const features = [
    { Icon: IconDumbbell, label: t('auth.feature1') },
    { Icon: IconChart,    label: t('auth.feature2') },
    { Icon: IconCalendar, label: t('auth.feature3') },
    { Icon: IconAward,    label: t('auth.feature4') },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex overflow-hidden">

      {/* ── SOL PANEL — HA_HOMEPAGE (merkez daha yakın, hafif animasyon) ──── */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <img
            src="/HA_HOMEPAGE.png"
            alt=""
            className="auth-home-bg__image h-full min-h-full w-full min-w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </div>
        {/* Karartma gradient — sağa doğru eriyen geçiş */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/88 via-black/64 to-black/35" />
        {/* Sağ kenarda form paneline eriyen geçiş şeridi */}
        <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-r from-transparent to-[#0a0a0a]" />

        {/* Sol panel içerik */}
        <div className="relative z-20 flex flex-col justify-between h-full px-14 py-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <AppLogo className="h-7 w-7" alt="" />
            <span className="text-white font-semibold text-base tracking-tight">HA Salon Exclusive</span>
          </Link>

          {/* Merkez metin */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-8 h-px bg-rose-600" />
              <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                {t('auth.newMember')}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-5">
              {t('auth.registerPanelTitle')}
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed mb-10">
              {t('auth.registerSubtitle')}
            </p>
            <ul className="space-y-3">
              {features.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-neutral-300 text-sm">
                  <span className="flex-shrink-0 w-7 h-7 border border-neutral-700 flex items-center justify-center text-rose-500">
                    <Icon />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Alt copyright */}
          <div className="flex items-center gap-3">
            <span className="block w-5 h-px bg-neutral-700" />
            <p className="text-neutral-600 text-xs">© {new Date().getFullYear()} HA Salon Exclusive</p>
          </div>
        </div>
      </div>

      {/* ── SAĞ PANEL — kayıt formu ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">

        {/* Üst bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-800/50 flex-shrink-0">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <AppLogo className="h-6 w-6" alt="" />
            <span className="text-white font-semibold text-sm tracking-tight">HA Salon Exclusive</span>
          </Link>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <LanguageSwitcher compact />
            <Link to="/" className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors">
              ← {t('nav.home')}
            </Link>
          </div>
        </div>

        {/* Form merkezi */}
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-[400px]">

            {/* Başlık */}
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                {t('register.title')}
              </h2>
              <p className="text-neutral-500 text-sm">{t('register.subtitle')}</p>
            </div>

            {/* Adım çubuğu */}
            <div className="flex items-start gap-2 mb-8">
              {steps.map((step, idx) => (
                <div key={step} className="flex-1">
                  <div className={`h-0.5 w-full transition-all duration-300 ${
                    idx <= currentStep ? 'bg-rose-600' : 'bg-neutral-800'
                  }`} />
                  <span className={`block mt-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    idx === currentStep ? 'text-rose-500' : idx < currentStep ? 'text-neutral-500' : 'text-neutral-700'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">

              {/* ── Adım 0: Hesap Bilgileri ─────────────────────────────── */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={t('register.firstName')} error={errors.firstName?.message}>
                      <IconInput icon={<IconUser />}>
                        <input
                          type="text" placeholder={t('register.firstNamePlaceholder')}
                          {...register('firstName', { required: t('register.firstNameRequired') })}
                          className={iClass(errors.firstName)}
                        />
                      </IconInput>
                    </FormField>
                    <FormField label={t('register.lastName')} error={errors.lastName?.message}>
                      <IconInput icon={<IconUser />}>
                        <input
                          type="text" placeholder={t('register.lastNamePlaceholder')}
                          {...register('lastName', { required: t('register.lastNameRequired') })}
                          className={iClass(errors.lastName)}
                        />
                      </IconInput>
                    </FormField>
                  </div>

                  <FormField label={t('register.emailOptional')} error={errors.email?.message}>
                    <IconInput icon={<IconMail />}>
                      <input
                        type="email"
                        {...register('email', {
                          validate: (value) => {
                            if (!value) return true;
                            return /\S+@\S+\.\S+/.test(value) || t('auth.emailInvalid');
                          },
                        })}
                        className={iClass(errors.email)}
                      />
                    </IconInput>
                  </FormField>

                  <FormField label={t('register.phoneNumberRequired')} error={errors.phoneNumber?.message}>
                    <IconInput icon={<IconPhone />}>
                      <input
                        type="tel"
                        {...register('phoneNumber', { required: t('register.phoneRequired') })}
                        className={iClass(errors.phoneNumber)}
                      />
                    </IconInput>
                  </FormField>

                  <FormField label={t('auth.password')} error={errors.password?.message}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                        <IconLock />
                      </span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        {...register('password', {
                          required: t('auth.passwordRequired'),
                          minLength: { value: 8, message: t('auth.passwordMin') },
                        })}
                        className={`${iClass(errors.password)} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        {showPw ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </FormField>

                  <FormField label={t('auth.confirmPassword')} error={errors.confirmPassword?.message}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                        <IconLock />
                      </span>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        {...register('confirmPassword', {
                          required: t('auth.passwordRequired'),
                          validate: (val) => val === password || t('auth.passwordsNotMatch'),
                        })}
                        className={`${iClass(errors.confirmPassword)} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        {showConfirm ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </FormField>
                </div>
              )}

              {/* ── Adım 1: Kişisel Bilgiler ────────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-neutral-500 text-xs border-l-2 border-neutral-700 pl-3 py-0.5">
                    {t('register.notes')}
                  </p>

                  <FormField label={t('register.gender')}>
                    <select {...register('gender')} className={iClassPlain()}>
                      <option value="">{t('register.genderOther')}</option>
                      <option value="Male">{t('register.genderMale')}</option>
                      <option value="Female">{t('register.genderFemale')}</option>
                      <option value="Other">{t('register.genderOther')}</option>
                    </select>
                  </FormField>

                  <FormField label={t('register.birthDate')}>
                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field }) => (
                        <BirthDateSelects
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          selectClassName={iClassPlain(!!errors.birthDate)}
                        />
                      )}
                    />
                  </FormField>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField label={t('register.height')}>
                      <input type="number" {...register('height', { min: 0 })} className={iClassPlain()} />
                    </FormField>
                    <FormField label={t('register.weight')}>
                      <input type="number" {...register('weight', { min: 0 })} className={iClassPlain()} />
                    </FormField>
                    <FormField label={t('register.targetWeight')}>
                      <input type="number" {...register('targetWeight', { min: 0 })} className={iClassPlain()} />
                    </FormField>
                  </div>
                </div>
              )}

              {/* ── Adım 2: Fitness Hedefleri ───────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-neutral-500 text-xs border-l-2 border-neutral-700 pl-3 py-0.5">
                    {t('register.selectGoal')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {FITNESS_GOALS.map((goal) => {
                      const selected = watch('goal') === goal;
                      return (
                        <label
                          key={goal}
                          className={`flex items-center gap-3 px-3 py-3 border cursor-pointer transition-all ${
                            selected
                              ? 'border-rose-600 bg-rose-600/10 text-rose-400'
                              : 'border-neutral-800 hover:border-neutral-600 text-neutral-400'
                          }`}
                        >
                          <input type="radio" value={goal} {...register('goal')} className="sr-only" />
                          <div className={`w-3.5 h-3.5 border-2 flex-shrink-0 transition-colors ${
                            selected ? 'border-rose-600 bg-rose-600' : 'border-neutral-600'
                          }`} />
                          <span className="text-sm font-medium leading-tight">{translateFitnessGoal(t, goal)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Navigasyon Butonları ─────────────────────────────────── */}
              <div className="flex gap-3 pt-2">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="px-5 py-2.5 bg-transparent border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-sm font-semibold transition-colors"
                  >
                    {t('common.back')}
                  </button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold tracking-wide transition-colors"
                  >
                    {t('common.next')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {t('register.title')}
                  </button>
                )}
              </div>
            </form>

            {/* Alt link */}
            <p className="text-center text-neutral-600 text-sm mt-8">
              {t('auth.hasAccount')}{' '}
              <button
                type="button"
                onClick={openLogin}
                className="text-rose-500 hover:text-rose-400 font-semibold transition-colors"
              >
                {t('auth.loginHere')}
              </button>
            </p>

          </div>
        </div>
      </div>

      {/* ── LOGIN MODAL ──────────────────────────────────────────────────────── */}
      {loginModal && (
        <>
          {/* Karartma overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            style={{
              opacity: loginVisible ? 1 : 0,
              transition: 'opacity 350ms ease',
            }}
            onClick={closeLogin}
          />

          {/* Modal kutusu */}
          <div
            className="fixed z-50 bg-[#0d0d0d] border border-neutral-800 flex flex-col shadow-2xl"
            style={{
              top: '50%',
              left: '50%',
              transform: loginVisible
                ? 'translate(-50%, -50%) scale(1)'
                : 'translate(-50%, -46%) scale(0.97)',
              opacity: loginVisible ? 1 : 0,
              transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease',
              width: 'min(440px, calc(100vw - 32px))',
            }}
          >
            {/* Üst bar */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="block w-5 h-px bg-rose-600" />
                <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                  {t('auth.loginFormTitle')}
                </span>
              </div>
              <button
                onClick={closeLogin}
                className="text-neutral-500 hover:text-white transition-colors p-1"
              >
                <IconX />
              </button>
            </div>

            {/* Form */}
            <div className="px-8 py-7">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">

                <FormField label={t('auth.loginIdentifier')} error={loginForm.formState.errors.identifier?.message}>
                  <IconInput icon={<IconMail />}>
                    <input
                      type="text"
                      {...loginForm.register('identifier', {
                        required: t('auth.loginIdentifierRequired'),
                      })}
                      className={iClass(loginForm.formState.errors.identifier)}
                    />
                  </IconInput>
                </FormField>

                <FormField label={t('auth.password')} error={loginForm.formState.errors.password?.message}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                      <IconLock />
                    </span>
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      {...loginForm.register('password', { required: t('auth.passwordRequired') })}
                      className={`${iClass(loginForm.formState.errors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showLoginPw ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </FormField>

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loginSubmitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>{t('auth.login')}</span><IconArrowRight /></>
                  }
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
