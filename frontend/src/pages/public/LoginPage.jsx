import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { ROLES, MEMBER_STATUS, FITNESS_GOALS, translateFitnessGoal } from '../../utils/constants';
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
const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M20 6L9 17l-5-5" />
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

/* ── Kayıt formu yardımcıları ────────────────────────────────────────────── */
function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
function iClass(error) {
  return `w-full px-4 py-2.5 bg-neutral-900 border text-neutral-100 placeholder:text-neutral-600 text-sm focus:outline-none focus:border-rose-600 transition-colors ${error ? 'border-red-500' : 'border-neutral-800'}`;
}

/* ══════════════════════════════════════════════════════════════════════════
   ANA BİLEŞEN
══════════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const { login, register: registerUser, isAuthenticated, user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Panel durumu: 'login' | 'register'
  const [panel, setPanel] = useState('login');
  const [panelVisible, setPanelVisible] = useState(false); // animasyon için

  // Login form
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginForm = useForm();

  // Register form
  const [regStep, setRegStep] = useState(0);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const regForm = useForm({ defaultValues: { gender: '', goal: '' } });
  const regPassword = regForm.watch('password');

  const stepFields = [
    ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'confirmPassword'],
    ['gender', 'birthDate', 'height', 'weight', 'targetWeight'],
    ['goal'],
  ];
  const steps = [t('register.step1Title'), t('register.step2Title'), t('register.step3Title')];

  // Zaten giriş yapılmışsa yönlendir
  useEffect(() => {
    if (isLoading || regSubmitting) return;
    if (isAuthenticated && user) {
      if (user.role === ROLES.ADMIN) navigate('/admin', { replace: true });
      else if (user.role === ROLES.DEVELOPER) navigate('/developer', { replace: true });
      else if (user.status === MEMBER_STATUS.PENDING) navigate('/pending', { replace: true });
      else if (user.status === MEMBER_STATUS.REJECTED) navigate('/rejected', { replace: true });
      else if (user.status === MEMBER_STATUS.SUSPENDED) navigate('/suspended', { replace: true });
      else navigate('/member', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, regSubmitting]);

  // Kayıt panelini aç
  const openRegister = () => {
    setPanel('register');
    setRegStep(0);
    regForm.reset({ gender: '', goal: '' });
    // Küçük gecikme ile animasyon tetikle
    requestAnimationFrame(() => setPanelVisible(true));
  };

  // Kayıt panelini kapat
  const closeRegister = () => {
    setPanelVisible(false);
    setTimeout(() => setPanel('login'), 350);
  };

  // Login submit
  const onLoginSubmit = async (data) => {
    setLoginSubmitting(true);
    try {
      const user = await login(data.identifier, data.password);
      toast.success(t('auth.loginSuccess', { name: user.firstName }));
      if (user.role === ROLES.ADMIN) navigate('/admin');
      else if (user.role === ROLES.DEVELOPER) navigate('/developer');
      else if (user.status === MEMBER_STATUS.PENDING) navigate('/pending');
      else if (user.status === MEMBER_STATUS.REJECTED) navigate('/rejected');
      else if (user.status === MEMBER_STATUS.SUSPENDED) navigate('/suspended');
      else navigate('/member');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'ACCOUNT_SUSPENDED') toast.error(t('auth.accountSuspended'));
      else toast.error(msg || t('auth.loginFailed'));
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Register submit
  const onRegSubmit = async (data) => {
    setRegSubmitting(true);
    try {
      await registerUser({
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
      });
      toast.success(t('register.submitSuccess'));
      navigate('/pending');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.registerFailed'));
    } finally {
      setRegSubmitting(false);
    }
  };

  const nextRegStep = async () => {
    const valid = await regForm.trigger(stepFields[regStep]);
    if (valid) setRegStep((s) => s + 1);
  };

  const features = [
    { Icon: IconDumbbell, label: t('memberNav.progress') },
    { Icon: IconCalendar,  label: t('memberNav.sessions') },
    { Icon: IconChart,     label: t('adminNav.reports') },
    { Icon: IconAward,     label: t('memberNav.membership') },
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
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/88 via-black/64 to-black/35" />
        <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-r from-transparent to-[#0a0a0a]" />

        <div className="relative z-20 flex flex-col justify-between h-full px-14 py-12">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <AppLogo className="h-7 w-7" alt="" />
            <span className="text-white font-semibold text-base tracking-tight">HA Salon Exclusive</span>
          </Link>

          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-8 h-px bg-rose-600" />
              <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                {t('auth.welcomeBack')}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-5">
              {t('auth.loginPanelTitle')}
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed mb-10">
              {t('auth.loginSubtitle')}
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

          <div className="flex items-center gap-3">
            <span className="block w-5 h-px bg-neutral-700" />
            <p className="text-neutral-600 text-xs">© {new Date().getFullYear()} HA Salon Exclusive</p>
          </div>
        </div>
      </div>

      {/* ── SAĞ PANEL — login formu ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

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

        {/* Login form alanı */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-6 h-px bg-rose-600" />
                <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                  {t('auth.signIn')}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {t('auth.loginFormTitle')}
              </h2>
            </div>

            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  {t('auth.loginIdentifier')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"><IconMail /></span>
                  <input
                    type="text"
                    autoComplete="username"
                    className={`w-full pl-10 pr-4 py-3 bg-neutral-900 border text-neutral-100 placeholder:text-neutral-600 text-sm focus:outline-none focus:border-rose-600 transition-colors ${loginForm.formState.errors.identifier ? 'border-red-500' : 'border-neutral-800'}`}
                    {...loginForm.register('identifier', {
                      required: t('auth.loginIdentifierRequired'),
                    })}
                  />
                </div>
                {loginForm.formState.errors.identifier && (
                  <p className="text-xs text-red-400 mt-1.5">{loginForm.formState.errors.identifier.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"><IconLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-14 py-3 bg-neutral-900 border text-neutral-100 placeholder:text-neutral-600 text-sm focus:outline-none focus:border-rose-600 transition-colors ${loginForm.formState.errors.password ? 'border-red-500' : 'border-neutral-800'}`}
                    {...loginForm.register('password', { required: t('auth.passwordRequired') })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 text-xs font-medium transition-colors">
                    {showPassword ? t('auth.hide') : t('auth.show')}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-400 mt-1.5">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loginSubmitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('common.loading')}</>
                  : <>{t('auth.signIn')}<IconArrowRight /></>
                }
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-800/60">
              <p className="text-neutral-500 text-sm text-center">
                {t('auth.noAccount')}{' '}
                {/* Buraya basınca register paneli açılır */}
                <button
                  onClick={openRegister}
                  className="text-rose-500 hover:text-rose-400 font-semibold transition-colors"
                >
                  {t('auth.registerHere')}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          KAYIT PANELİ — sağdan kayan overlay
      ══════════════════════════════════════════════════════════════════════ */}
      {panel === 'register' && (
        <>
          {/* Karartma overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            style={{
              opacity: panelVisible ? 1 : 0,
              transition: 'opacity 350ms ease',
            }}
            onClick={closeRegister}
          />

          {/* Panel — ekran ortasında modal */}
          <div
            className="fixed z-50 bg-[#0d0d0d] border border-neutral-800 flex flex-col shadow-2xl"
            style={{
              top: '50%',
              left: '50%',
              transform: panelVisible
                ? 'translate(-50%, -50%) scale(1)'
                : 'translate(-50%, -46%) scale(0.97)',
              opacity: panelVisible ? 1 : 0,
              transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease',
              width: 'min(520px, calc(100vw - 32px))',
              maxHeight: 'calc(100vh - 64px)',
            }}
          >
            {/* Panel üst bar */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="block w-5 h-px bg-rose-600" />
                <span className="text-rose-500 text-xs font-bold uppercase tracking-[0.2em]">
                  {t('register.title')}
                </span>
              </div>
              <button
                onClick={closeRegister}
                className="text-neutral-500 hover:text-white transition-colors p-1"
                aria-label="Kapat"
              >
                <IconX />
              </button>
            </div>

            {/* Step göstergesi */}
            <div className="px-8 pt-5 pb-4 flex-shrink-0">
              <div className="flex gap-1.5 mb-3">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-0.5 transition-all duration-300 ${idx <= regStep ? 'bg-rose-600' : 'bg-neutral-800'}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">{steps[regStep]}</p>
                <p className="text-neutral-500 text-xs">
                  {t('register.step', { current: regStep + 1, total: steps.length })}
                </p>
              </div>
            </div>

            {/* Form içeriği — scroll olabilir */}
            <div className="flex-1 overflow-y-auto px-8 pb-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">

                {/* Step 0: Hesap Bilgileri */}
                {regStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label={t('register.firstName')} error={regForm.formState.errors.firstName?.message}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"><IconUser /></span>
                        <input type="text"
                            {...regForm.register('firstName', { required: t('register.firstNameRequired') })}
                            className={`${iClass(regForm.formState.errors.firstName)} pl-9`} />
                        </div>
                      </FormField>
                      <FormField label={t('register.lastName')} error={regForm.formState.errors.lastName?.message}>
                        <input type="text"
                          {...regForm.register('lastName', { required: t('register.lastNameRequired') })}
                          className={iClass(regForm.formState.errors.lastName)} />
                      </FormField>
                    </div>
                    <FormField label={t('register.emailOptional')} error={regForm.formState.errors.email?.message}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"><IconMail /></span>
                        <input type="email"
                          {...regForm.register('email', {
                            validate: (value) => {
                              if (!value) return true;
                              return /\S+@\S+\.\S+/.test(value) || t('auth.emailInvalid');
                            },
                          })}
                          className={`${iClass(regForm.formState.errors.email)} pl-9`} />
                      </div>
                    </FormField>
                    <FormField label={t('register.phoneNumberRequired')} error={regForm.formState.errors.phoneNumber?.message}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"><IconPhone /></span>
                        <input type="tel"
                          {...regForm.register('phoneNumber', { required: t('register.phoneRequired') })}
                          className={`${iClass(regForm.formState.errors.phoneNumber)} pl-9`} />
                      </div>
                    </FormField>
                    <FormField label={t('auth.password')} error={regForm.formState.errors.password?.message}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"><IconLock /></span>
                        <input type="password"
                          {...regForm.register('password', {
                            required: t('auth.passwordRequired'),
                            minLength: { value: 8, message: t('auth.passwordMin') },
                          })}
                          className={`${iClass(regForm.formState.errors.password)} pl-9`} />
                      </div>
                    </FormField>
                    <FormField label={t('auth.confirmPassword')} error={regForm.formState.errors.confirmPassword?.message}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"><IconLock /></span>
                        <input type="password"
                          {...regForm.register('confirmPassword', {
                            required: t('auth.passwordRequired'),
                            validate: (v) => v === regPassword || t('auth.passwordsNotMatch'),
                          })}
                          className={`${iClass(regForm.formState.errors.confirmPassword)} pl-9`} />
                      </div>
                    </FormField>
                  </div>
                )}

                {/* Step 1: Fiziksel Bilgiler */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-neutral-500 text-xs">{t('register.notes')}</p>
                    <FormField label={t('register.gender')}>
                      <select {...regForm.register('gender')} className={iClass()}>
                        <option value="">{t('register.genderMale').replace('Erkek','').trim() || '—'}</option>
                        <option value="Male">{t('register.genderMale')}</option>
                        <option value="Female">{t('register.genderFemale')}</option>
                        <option value="Other">{t('register.genderOther')}</option>
                      </select>
                    </FormField>
                    <FormField label={t('register.birthDate')}>
                      <Controller
                        name="birthDate"
                        control={regForm.control}
                        render={({ field }) => (
                          <BirthDateSelects
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            selectClassName={iClass(!!regForm.formState.errors.birthDate)}
                          />
                        )}
                      />
                    </FormField>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField label={t('register.height')}>
                        <input type="number" {...regForm.register('height', { min: 0 })} className={iClass()} />
                      </FormField>
                      <FormField label={t('register.weight')}>
                        <input type="number" {...regForm.register('weight', { min: 0 })} className={iClass()} />
                      </FormField>
                      <FormField label={t('register.targetWeight')}>
                        <input type="number" {...regForm.register('targetWeight', { min: 0 })} className={iClass()} />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* Step 2: Fitness Hedefi */}
                {regStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-neutral-500 text-xs mb-2">{t('register.selectGoal')}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {FITNESS_GOALS.map((goal) => {
                        const selected = regForm.watch('goal') === goal;
                        return (
                          <label
                            key={goal}
                            className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all ${
                              selected
                                ? 'border-rose-600 bg-rose-600/10 text-rose-400'
                                : 'border-neutral-800 hover:border-neutral-600 text-neutral-400'
                            }`}
                          >
                            <input type="radio" value={goal} {...regForm.register('goal')} className="sr-only" />
                            <span className={`w-3.5 h-3.5 border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? 'border-rose-600 bg-rose-600' : 'border-neutral-600'}`}>
                              {selected && <IconCheck />}
                            </span>
                            <span className="text-sm font-medium">{translateFitnessGoal(t, goal)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Alt butonlar — sabit */}
            <div className="px-8 py-5 border-t border-neutral-800 flex-shrink-0 flex gap-3">
              {regStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setRegStep((s) => s - 1)}
                  className="flex-1 py-3 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-semibold uppercase tracking-wide transition-colors"
                >
                  {t('common.back')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeRegister}
                  className="flex-1 py-3 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-semibold uppercase tracking-wide transition-colors"
                >
                  {t('common.cancel')}
                </button>
              )}

              {regStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextRegStep}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  {t('common.next')} <IconArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={regForm.handleSubmit(onRegSubmit)}
                  disabled={regSubmitting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  {regSubmitting
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('common.loading')}</>
                    : <>{t('register.title')} <IconArrowRight /></>
                  }
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
