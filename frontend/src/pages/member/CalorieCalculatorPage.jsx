import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import MemberLayout from '../../layouts/MemberLayout';
import useAuthStore from '../../store/authStore';
import { memberService } from '../../services/memberService';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconCalculator = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0" />
  </svg>
);
const IconResult = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 3v18h18M7 16l4-4 4 4 4-6" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/* ── Form yardımcıları ───────────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}
function iClass(error) {
  return `w-full px-4 py-2.5 bg-neutral-900/60 border text-neutral-100 placeholder:text-neutral-600 text-sm focus:outline-none focus:border-rose-600 transition-colors ${error ? 'border-red-500' : 'border-neutral-800'}`;
}

/* ── Sonuç kutusu ────────────────────────────────────────────────────────── */
function ResultBox({ label, value, unit, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-3 p-5 text-left transition-colors ${
        selected
          ? 'bg-rose-600/10 border border-rose-600/35'
          : 'bg-neutral-900/40 border border-neutral-800/70 hover:border-neutral-700'
      }`}
    >
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-black leading-none tabular-nums ${selected ? 'text-rose-400' : 'text-white'}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-neutral-600 text-xs">{unit}</p>
    </button>
  );
}

/* ── Makro çubuğu ────────────────────────────────────────────────────────── */
function MacroBar({ label, value, unit, pct, colorClass, bgClass }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className={`font-semibold ${colorClass}`}>{label}</span>
        <span className="text-neutral-300 font-bold tabular-nums">
          {value}{unit} <span className="text-neutral-600 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-neutral-800 overflow-hidden">
        <div className={`h-full ${bgClass} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CalorieCalculatorPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Kullanıcıya özel localStorage anahtarı
  const storageKey = user?.id ? `calorie_result_${user.id}` : 'calorie_result';
  const formKey    = user?.id ? `calorie_form_${user.id}`   : 'calorie_form';

  // Sayfa açılınca kayıtlı sonucu ve form değerlerini yükle
  const savedResult = (() => {
    try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; }
  })();
  const savedForm = (() => {
    try { return JSON.parse(localStorage.getItem(formKey)); } catch { return null; }
  })();

  const [result, setResult] = useState(savedResult);
  const [lastCalcAt, setLastCalcAt] = useState(
    savedResult ? localStorage.getItem(`${storageKey}_date`) : null
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('tdee');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: savedForm || {},
  });

  const activityFactors = [
    { label: t('calorieCalc.sedentary'),   value: 1.2   },
    { label: t('calorieCalc.light'),        value: 1.375 },
    { label: t('calorieCalc.moderate'),     value: 1.55  },
    { label: t('calorieCalc.active'),       value: 1.725 },
    { label: t('calorieCalc.extraActive'),  value: 1.9   },
  ];

  const calculate = (data) => {
    const w = Number(data.weight);
    const h = Number(data.height);
    const a = Number(data.age);
    const activity = Number(data.activityLevel);

    const bmr = data.gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const tdee = Math.round(bmr * activity);

    const newResult = {
      bmr:     Math.round(bmr),
      tdee,
      lose:    tdee - 500,
      gain:    tdee + 500,
      protein: Math.round((tdee * 0.3) / 4),
      carbs:   Math.round((tdee * 0.4) / 4),
      fat:     Math.round((tdee * 0.3) / 9),
    };

    const now = new Date().toLocaleString();

    // localStorage'a kaydet
    localStorage.setItem(storageKey, JSON.stringify(newResult));
    localStorage.setItem(`${storageKey}_date`, now);
    localStorage.setItem(formKey, JSON.stringify(data));

    setResult(newResult);
    setLastCalcAt(now);
    setSelectedGoal('tdee');
  };

  const selectedCalories = result
    ? (selectedGoal === 'lose' ? result.lose : selectedGoal === 'gain' ? result.gain : result.tdee)
    : null;

  const saveSelectedToProfile = async () => {
    if (!selectedCalories) return;
    setSavingProfile(true);
    try {
      await memberService.updateProfile({ recommendedDailyCalories: selectedCalories });
      toast.success(t('calorieCalc.saveToProfileSuccess'));
    } catch {
      toast.error(t('calorieCalc.saveToProfileError'));
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <MemberLayout>
      <div className="w-full space-y-6">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-6 h-px bg-rose-600" />
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
              {t('memberNav.calorieCalc')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('calorieCalc.title')}</h1>
          <p className="text-neutral-500 text-sm mt-1">{t('calorieCalc.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-px bg-neutral-800/40">

          {/* ── Form (sol / üst) ──────────────────────────────────────────── */}
          <div className="bg-[#0d0d0d] xl:col-span-2">
            <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
              <span className="block w-4 h-px bg-rose-600" />
              <span className="text-neutral-600"><IconCalculator /></span>
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                {t('calorieCalc.title')}
              </h3>
            </div>
            <form onSubmit={handleSubmit(calculate)} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label={`${t('calorieCalc.weight')} (kg)`} error={errors.weight?.message}>
                  <input type="number" placeholder="75"
                    {...register('weight', { required: t('common.required'), min: { value: 20, message: 'Min 20' } })}
                    className={iClass(errors.weight)} />
                </Field>
                <Field label={`${t('calorieCalc.height')} (cm)`} error={errors.height?.message}>
                  <input type="number" placeholder="175"
                    {...register('height', { required: t('common.required'), min: { value: 100, message: 'Min 100' } })}
                    className={iClass(errors.height)} />
                </Field>
                <Field label={t('calorieCalc.age')} error={errors.age?.message}>
                  <input type="number" placeholder="28"
                    {...register('age', { required: t('common.required'), min: { value: 10, message: 'Min 10' } })}
                    className={iClass(errors.age)} />
                </Field>
                <Field label={t('calorieCalc.gender')} error={errors.gender?.message}>
                  <select {...register('gender', { required: t('common.required') })} className={iClass(errors.gender)}>
                    <option value="">—</option>
                    <option value="male">{t('calorieCalc.male')}</option>
                    <option value="female">{t('calorieCalc.female')}</option>
                  </select>
                </Field>
              </div>

              <Field label={t('calorieCalc.activityLevel')} error={errors.activityLevel?.message}>
                <select {...register('activityLevel', { required: t('common.required') })} className={iClass(errors.activityLevel)}>
                  <option value="">—</option>
                  {activityFactors.map(af => (
                    <option key={af.value} value={af.value}>{af.label}</option>
                  ))}
                </select>
              </Field>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <IconZap />
                {t('calorieCalc.calculate')}
              </button>
            </form>
          </div>

          {/* ── Sonuçlar (sağ / alt) ──────────────────────────────────────── */}
          <div className="bg-[#0d0d0d] xl:col-span-3 flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3 flex-wrap">
              <span className="block w-4 h-px bg-rose-600 flex-shrink-0" />
              <span className="text-neutral-600 flex-shrink-0"><IconResult /></span>
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex-1">
                {t('calorieCalc.yourTDEE')}
              </h3>
              {lastCalcAt && (
                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-[10px] text-neutral-600">
                    {t('calorieCalc.lastCalc') || 'Last calc'}: {lastCalcAt}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(storageKey);
                      localStorage.removeItem(`${storageKey}_date`);
                      setResult(null);
                      setLastCalcAt(null);
                    }}
                    className="text-[10px] text-neutral-600 hover:text-red-400 transition-colors font-semibold uppercase tracking-wider"
                  >
                    {t('common.clear') || 'Clear'}
                  </button>
                </div>
              )}
            </div>

            {result ? (
              <div className="p-6 space-y-6 flex-1">

                {/* BMR satırı */}
                <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">BMR</p>
                    <p className="text-neutral-400 text-xs">{t('calorieCalc.subtitle')}</p>
                  </div>
                  <p className="text-2xl font-black text-neutral-300 tabular-nums">{result.bmr.toLocaleString()}</p>
                </div>

                {/* 3 hedef kutusu */}
                <div className="grid grid-cols-3 gap-px bg-neutral-800/40">
                  <ResultBox
                    label={t('calorieCalc.weightLoss')}
                    value={result.lose}
                    unit={t('calorieCalc.caloriesPerDay')}
                    selected={selectedGoal === 'lose'}
                    onClick={() => setSelectedGoal('lose')}
                  />
                  <ResultBox
                    label={t('calorieCalc.maintenance')}
                    value={result.tdee}
                    unit={t('calorieCalc.caloriesPerDay')}
                    selected={selectedGoal === 'tdee'}
                    onClick={() => setSelectedGoal('tdee')}
                  />
                  <ResultBox
                    label={t('calorieCalc.muscleGain')}
                    value={result.gain}
                    unit={t('calorieCalc.caloriesPerDay')}
                    selected={selectedGoal === 'gain'}
                    onClick={() => setSelectedGoal('gain')}
                  />
                </div>

                {/* Makrolar */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Macros</p>
                  <MacroBar label="Protein" value={result.protein} unit="g" pct={30}
                    colorClass="text-rose-400" bgClass="bg-rose-600" />
                  <MacroBar label="Carbs"   value={result.carbs}   unit="g" pct={40}
                    colorClass="text-amber-400" bgClass="bg-amber-500" />
                  <MacroBar label="Fat"     value={result.fat}     unit="g" pct={30}
                    colorClass="text-blue-400"  bgClass="bg-blue-500" />
                </div>

                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={saveSelectedToProfile}
                  className="w-full py-2.5 text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 transition-colors disabled:opacity-50"
                >
                  {savingProfile ? t('common.loading') : t('calorieCalc.saveToProfile')}
                </button>

                {/* Bilgi notu */}
                <div className="flex items-start gap-3 bg-neutral-900/40 border border-neutral-800/60 px-4 py-3">
                  <span className="text-neutral-500 mt-0.5"><IconInfo /></span>
                  <p className="text-neutral-500 text-xs leading-relaxed">{t('calorieCalc.disclaimer')}</p>
                </div>
              </div>
            ) : (
              /* Boş durum */
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 border border-neutral-800 flex items-center justify-center mb-4 text-neutral-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <p className="text-neutral-400 font-semibold text-sm">{t('calorieCalc.fillForm')}</p>
                <p className="text-neutral-600 text-xs mt-1">{t('calorieCalc.fillFormSub')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
