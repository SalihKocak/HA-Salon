import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import MemberLayout from '../../layouts/MemberLayout';
import { memberService } from '../../services/memberService';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/formatters';
import { FITNESS_GOALS, translateFitnessGoal } from '../../utils/constants';
import BirthDateSelects from '../../components/ui/BirthDateSelects';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBody = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 3a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    <path d="M13 8l-3 3 3 3M5 11h8M10 16l-3 3 3 3" />
  </svg>
);
const IconNote = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

/* ── Yardımcılar ─────────────────────────────────────────────────────────── */
function SectionHeader({ icon, label }) {
  return (
    <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
      <span className="block w-4 h-px bg-rose-600" />
      <span className="text-neutral-500 flex-shrink-0">{icon}</span>
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{label}</h3>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function fieldClass(error) {
  return `w-full px-4 py-2.5 bg-neutral-900/60 border text-neutral-100 placeholder:text-neutral-600 text-sm focus:outline-none focus:border-rose-600 transition-colors ${error ? 'border-red-500' : 'border-neutral-800'}`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-px animate-pulse bg-neutral-800/50">
      <div className="h-32 bg-[#0d0d0d]" />
      <div className="h-64 bg-[#0d0d0d]" />
      <div className="h-48 bg-[#0d0d0d]" />
    </div>
  );
}

export default function MemberProfilePage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverProfile, setServerProfile] = useState(null);
  const [plannedSchedule, setPlannedSchedule] = useState([]);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

  useEffect(() => {
    Promise.all([memberService.getProfile(), memberService.getSessions()])
      .then(([data, sessions]) => {
        setServerProfile(data);
        reset({
          firstName:    data.firstName,
          lastName:     data.lastName,
          phoneNumber:  data.phoneNumber,
          gender:       data.gender || '',
          birthDate:    data.birthDate ? data.birthDate.split('T')[0] : '',
          height:       data.height || '',
          weight:       data.weight || '',
          targetWeight: data.targetWeight || '',
          goal:         data.goal || '',
          notes:        data.notes || '',
        });

        const dayNames = [
          t('common.sunday') || 'Pazar',
          t('common.monday') || 'Pazartesi',
          t('common.tuesday') || 'Salı',
          t('common.wednesday') || 'Çarşamba',
          t('common.thursday') || 'Perşembe',
          t('common.friday') || 'Cuma',
          t('common.saturday') || 'Cumartesi',
        ];
        const map = new Map();
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const endOfRange = new Date(today);
        endOfRange.setUTCDate(today.getUTCDate() + 6);
        (sessions || [])
          .filter((s) => {
            if (!s || s.status !== 'Scheduled' || s.isAttendanceCheckIn) return false;
            const sessionDate = new Date(s.sessionDate);
            const sessionDay = new Date(Date.UTC(
              sessionDate.getUTCFullYear(),
              sessionDate.getUTCMonth(),
              sessionDate.getUTCDate(),
            ));
            return sessionDay >= today && sessionDay <= endOfRange;
          })
          .forEach((s) => {
            const sessionDate = new Date(s.sessionDate);
            const dayIndex = sessionDate.getUTCDay();
            const day = dayNames[dayIndex] || dayNames[0];
            const sessionDay = new Date(Date.UTC(
              sessionDate.getUTCFullYear(),
              sessionDate.getUTCMonth(),
              sessionDate.getUTCDate(),
            ));
            const dateKey = sessionDay.toISOString().split('T')[0];
            const current = map.get(dateKey) || { day, date: sessionDay, times: new Set() };
            current.times.add(s.sessionTime);
            map.set(dateKey, current);
          });
        const grouped = Array.from(map.values())
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map((item) => ({
            day: item.day,
            dateText: item.date.toLocaleDateString('tr-TR'),
            times: Array.from(item.times).sort((a, b) => a.localeCompare(b)),
          }));
        setPlannedSchedule(grouped);
      })
      .finally(() => setLoading(false));
  }, [reset, t]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await memberService.updateProfile({
        firstName:    data.firstName,
        lastName:     data.lastName,
        phoneNumber:  data.phoneNumber,
        gender:       data.gender || null,
        birthDate:    data.birthDate || null,
        height:       data.height       ? Number(data.height)       : null,
        weight:       data.weight       ? Number(data.weight)       : null,
        targetWeight: data.targetWeight ? Number(data.targetWeight) : null,
        goal:         data.goal  || null,
        notes:        data.notes || null,
      });
      toast.success(t('memberProfile.updateSuccess'));
      const fresh = await memberService.getProfile();
      setServerProfile(fresh);
    } catch (err) {
      toast.error(err.response?.data?.message || t('memberProfile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <MemberLayout>
      <div className="w-full space-y-6">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-6 h-px bg-rose-600" />
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
              {t('memberNav.profile')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('memberProfile.title')}</h1>
          <p className="text-neutral-500 text-sm mt-1">{t('memberProfile.subtitle')}</p>
        </div>

        {/* ── Avatar kartı ────────────────────────────────────────────────── */}
        <div className="bg-[#0d0d0d] border border-neutral-800/70 p-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-rose-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-white truncate">{user?.firstName} {user?.lastName}</h2>
            <p className="text-neutral-500 text-sm truncate">{user?.email}</p>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        {loading ? <LoadingSkeleton /> : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-px bg-neutral-800/40">

            {/* Kişisel bilgiler */}
            <div className="bg-[#0d0d0d]">
              <SectionHeader icon={<IconUser />} label={t('memberProfile.personalInfo')} />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label={t('memberProfile.firstName')} error={errors.firstName?.message}>
                  <input
                    type="text"
                    {...register('firstName', { required: t('common.required') })}
                    className={fieldClass(errors.firstName)}
                  />
                </Field>
                <Field label={t('memberProfile.lastName')} error={errors.lastName?.message}>
                  <input
                    type="text"
                    {...register('lastName', { required: t('common.required') })}
                    className={fieldClass(errors.lastName)}
                  />
                </Field>
                <Field label={t('memberProfile.phone')}>
                  <input type="tel" {...register('phoneNumber')} className={fieldClass()} />
                </Field>
                <Field label={`${t('memberProfile.email')} (read-only)`}>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`${fieldClass()} opacity-40 cursor-not-allowed`}
                  />
                </Field>
              </div>
            </div>

            {/* Fiziksel veriler */}
            <div className="bg-[#0d0d0d]">
              <SectionHeader icon={<IconBody />} label={t('memberProfile.physicalData')} />
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
                <Field label={t('memberProfile.gender')}>
                  <select {...register('gender')} className={fieldClass()}>
                    <option value="">—</option>
                    <option value="Male">{t('register.genderMale')}</option>
                    <option value="Female">{t('register.genderFemale')}</option>
                    <option value="Other">{t('register.genderOther')}</option>
                  </select>
                </Field>
                <div className="col-span-2 sm:col-span-3">
                  <Field label={t('memberProfile.birthDate')}>
                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field }) => (
                        <BirthDateSelects
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          selectClassName={fieldClass(!!errors.birthDate)}
                          showHint={false}
                        />
                      )}
                    />
                  </Field>
                </div>
                <Field label={t('memberProfile.height')}>
                  <input type="number" placeholder="175" {...register('height', { min: 0 })} className={fieldClass()} />
                </Field>
                <Field label={t('memberProfile.weight')}>
                  <input type="number" placeholder="75" {...register('weight', { min: 0 })} className={fieldClass()} />
                </Field>
                <Field label={t('memberProfile.targetWeight')}>
                  <input type="number" placeholder="70" {...register('targetWeight', { min: 0 })} className={fieldClass()} />
                </Field>
                <Field label={t('memberProfile.goal')}>
                  <select {...register('goal')} className={fieldClass()}>
                    <option value="">—</option>
                    {FITNESS_GOALS.map((g) => (
                      <option key={g} value={g}>{translateFitnessGoal(t, g)}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {(serverProfile?.recommendedDailyCalories != null
              || serverProfile?.measurementBodyFat != null
              || serverProfile?.measurementMuscleMass != null
              || serverProfile?.measurementChestCm != null
              || serverProfile?.measurementWaistCm != null
              || serverProfile?.measurementHipCm != null) && (
              <div className="bg-[#0d0d0d]">
                <SectionHeader icon={<IconBody />} label={t('memberProfile.gymMeasurements')} />
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm">
                  {serverProfile?.recommendedDailyCalories != null && (
                    <div>
                      <p className="text-xs text-neutral-500">{t('memberProfile.recommendedCalories')}</p>
                      <p className="text-neutral-100 font-semibold mt-1">{Math.round(serverProfile.recommendedDailyCalories)}</p>
                    </div>
                  )}
                  {serverProfile?.measurementBodyFat != null && (
                    <div>
                      <p className="text-xs text-neutral-500">{t('memberProgress.bodyFat')}</p>
                      <p className="text-neutral-100 font-semibold mt-1">{serverProfile.measurementBodyFat}</p>
                    </div>
                  )}
                  {serverProfile?.measurementMuscleMass != null && (
                    <div>
                      <p className="text-xs text-neutral-500">{t('memberProgress.muscleMass')}</p>
                      <p className="text-neutral-100 font-semibold mt-1">{serverProfile.measurementMuscleMass}</p>
                    </div>
                  )}
                  {serverProfile?.measurementChestCm != null && (
                    <div>
                      <p className="text-xs text-neutral-500">{t('memberProgress.chest')}</p>
                      <p className="text-neutral-100 font-semibold mt-1">{serverProfile.measurementChestCm}</p>
                    </div>
                  )}
                  {serverProfile?.measurementWaistCm != null && (
                    <div>
                      <p className="text-xs text-neutral-500">{t('memberProgress.waist')}</p>
                      <p className="text-neutral-100 font-semibold mt-1">{serverProfile.measurementWaistCm}</p>
                    </div>
                  )}
                  {serverProfile?.measurementHipCm != null && (
                    <div>
                      <p className="text-xs text-neutral-500">{t('memberProgress.hip')}</p>
                      <p className="text-neutral-100 font-semibold mt-1">{serverProfile.measurementHipCm}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-[#0d0d0d]">
              <SectionHeader icon={<IconNote />} label={t('memberProfile.plannedSessions')} />
              <div className="p-6">
                {plannedSchedule.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t('memberProfile.noPlannedSessions')}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-rose-600/40 bg-rose-600/10 px-4 py-2">
                      <p className="text-xs text-rose-200/80">
                        {(t('memberProfile.nearestSessionDay') || 'En yakın gün')}: <span className="font-semibold text-rose-100">{plannedSchedule[0].day}</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plannedSchedule.map((item) => (
                        <div key={`${item.day}-${item.times.join('|')}`} className="border border-neutral-800 rounded-lg px-4 py-3">
                          <p className="text-sm font-semibold text-neutral-200">{item.day}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{item.dateText}</p>
                          <p className="text-xs text-neutral-400 mt-1">{item.times.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-[#0d0d0d]">
              <SectionHeader icon={<IconNote />} label={t('memberProfile.notes')} />
              <div className="p-6">
                <textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="..."
                  className={`${fieldClass()} resize-none w-full`}
                />
              </div>
            </div>

            {/* Kaydet butonu */}
            <div className="bg-[#0d0d0d] px-6 py-5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold uppercase tracking-wide transition-colors"
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <IconSave />
                }
                {t('memberProfile.saveChanges')}
              </button>
            </div>

          </form>
        )}
      </div>
    </MemberLayout>
  );
}
