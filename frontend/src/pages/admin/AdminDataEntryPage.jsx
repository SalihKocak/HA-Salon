import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { adminService, packageService, sessionService } from '../../services/adminService';

const BUSINESS_HOURS = {
  weekday: { startHour: 6, endHour: 21 },
  saturday: { startHour: 6, endHour: 14 },
};

function buildTimeRanges(startHour, endHour, intervalMinutes) {
  const ranges = [];
  let current = startHour * 60;
  const end = endHour * 60;
  while (current < end) {
    const next = Math.min(current + intervalMinutes, end);
    const startLabel = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`;
    const endLabel = `${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`;
    ranges.push({ start: startLabel, label: `${startLabel}-${endLabel}` });
    current = next;
  }
  return ranges;
}

export default function AdminDataEntryPage() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [creatingMember, setCreatingMember] = useState(false);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotForm, setSlotForm] = useState({ startHour: 8, endHour: 20, intervalMinutes: 120 });
  const [selectedPlanSlots, setSelectedPlanSlots] = useState([]);

  const memberForm = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      packageId: '',
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const list = await packageService.getAll(true);
        setPackages(list || []);
      } catch {
        // Paketler yüklenemese bile üye kaydı paket seçimsiz devam eder.
        setPackages([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const settings = await sessionService.getAttendanceSlots();
        setSlotForm({
          startHour: settings.startHour,
          endHour: settings.endHour,
          intervalMinutes: settings.intervalMinutes,
        });
      } catch {
        toast.error(t('adminDataEntry.slotLoadError'));
      }
    })();
  }, [t]);

  const weekdayRanges = useMemo(
    () => buildTimeRanges(BUSINESS_HOURS.weekday.startHour, BUSINESS_HOURS.weekday.endHour, Number(slotForm.intervalMinutes) || 120),
    [slotForm.intervalMinutes]
  );
  const saturdayRanges = useMemo(
    () => buildTimeRanges(BUSINESS_HOURS.saturday.startHour, BUSINESS_HOURS.saturday.endHour, Number(slotForm.intervalMinutes) || 120),
    [slotForm.intervalMinutes]
  );
  const daySections = useMemo(() => ([
    { dayOfWeek: 1, label: t('common.monday') || 'Pazartesi', ranges: weekdayRanges },
    { dayOfWeek: 2, label: t('common.tuesday') || 'Salı', ranges: weekdayRanges },
    { dayOfWeek: 3, label: t('common.wednesday') || 'Çarşamba', ranges: weekdayRanges },
    { dayOfWeek: 4, label: t('common.thursday') || 'Perşembe', ranges: weekdayRanges },
    { dayOfWeek: 5, label: t('common.friday') || 'Cuma', ranges: weekdayRanges },
    { dayOfWeek: 6, label: t('common.saturday') || 'Cumartesi', ranges: saturdayRanges },
  ]), [t, weekdayRanges, saturdayRanges]);

  const togglePlanSlot = (dayOfWeek, sessionTime) => {
    const key = `${dayOfWeek}|${sessionTime}`;
    setSelectedPlanSlots((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const resolveRangeLabel = (dayOfWeek, start) => {
    const section = daySections.find((s) => s.dayOfWeek === dayOfWeek);
    const range = section?.ranges.find((r) => r.start === start);
    return range?.label || start;
  };

  const onCreateMember = async (data) => {
    setCreatingMember(true);
    try {
      if (selectedPlanSlots.length === 0) {
        const confirmed = window.confirm(
          t('adminDataEntry.confirmNoSessionPlan')
          || 'Yeni uye icin seans durumu girmediniz. Kayit etmek istediginize emin misiniz?'
        );
        if (!confirmed) return;
      }

      const weeklySessions = selectedPlanSlots.map((slot) => {
        const [dayOfWeekRaw, sessionStart] = slot.split('|');
        const dayOfWeek = Number(dayOfWeekRaw);
        return { dayOfWeek, sessionTime: resolveRangeLabel(dayOfWeek, sessionStart) };
      });

      await adminService.createMember({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email?.trim() ? data.email.trim() : null,
        phoneNumber: data.phoneNumber,
        password: data.password,
        packageId: data.packageId || null,
        weeklySessions,
      });
      toast.success(t('adminDataEntry.memberCreateSuccess'));
      memberForm.reset();
      setSelectedPlanSlots([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || t('adminDataEntry.memberCreateError'));
    } finally {
      setCreatingMember(false);
    }
  };

  const saveSlotSettings = async () => {
    setSlotSaving(true);
    try {
      const updated = await sessionService.updateAttendanceSlots({
        startHour: Number(slotForm.startHour),
        endHour: Number(slotForm.endHour),
        intervalMinutes: Number(slotForm.intervalMinutes),
      });
      setSlotForm((f) => ({ ...f, intervalMinutes: updated.intervalMinutes }));
      toast.success(t('adminDataEntry.slotSaveSuccess'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('adminDataEntry.slotSaveError'));
    } finally {
      setSlotSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminDataEntry.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminDataEntry.subtitle')}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-neutral-100 font-semibold mb-4">{t('adminDataEntry.memberFormTitle')}</h3>
          <form onSubmit={memberForm.handleSubmit(onCreateMember)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t('memberProfile.firstName')} register={memberForm.register('firstName', { required: true })} />
              <Input label={t('memberProfile.lastName')} register={memberForm.register('lastName', { required: true })} />
              <Input label={t('memberProfile.phone')} register={memberForm.register('phoneNumber', { required: true })} />
              <Input label={t('memberProfile.email')} register={memberForm.register('email')} type="email" />
              <Input label={t('adminDataEntry.password')} register={memberForm.register('password', { required: true, minLength: 8 })} type="password" />
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminMembers.package')}</label>
                <select {...memberForm.register('packageId')} className={inputClass}>
                  <option value="">—</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border border-neutral-800/80 rounded-xl p-4 space-y-4 bg-neutral-900/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-200">{t('adminDataEntry.weeklyPlanTitle') || 'Haftalık otomatik seans planı'}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t('adminDataEntry.weeklyPlanHint') || 'Çalışma saatlerine göre saat aralıklarını seçin. Pazar kapalıdır.'}</p>
                </div>
                <div className="flex items-end gap-2">
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">{t('adminSessions.slotInterval')}</label>
                    <input
                      type="number"
                      min={15}
                      max={240}
                      step={5}
                      value={slotForm.intervalMinutes}
                      onChange={(e) => setSlotForm((f) => ({ ...f, intervalMinutes: e.target.value }))}
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={saveSlotSettings}
                    disabled={slotSaving}
                    className="h-[34px] px-3.5 rounded-lg bg-rose-600 text-white text-xs font-semibold tracking-wide hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors"
                  >
                    {slotSaving ? t('common.loading') : (t('common.save') || 'Kaydet')}
                  </button>
                </div>
              </div>

              {daySections.map((section) => (
                <div key={section.dayOfWeek} className="space-y-2">
                  <label className="block text-sm text-neutral-400">{section.label}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {section.ranges.map((range) => (
                      <label key={`${section.dayOfWeek}-${range.start}`} className="flex items-center gap-2 text-sm text-neutral-200 border border-neutral-800 rounded-lg px-3 py-2 hover:border-neutral-600">
                        <input
                          type="checkbox"
                          checked={selectedPlanSlots.includes(`${section.dayOfWeek}|${range.start}`)}
                          onChange={() => togglePlanSlot(section.dayOfWeek, range.start)}
                        />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-500">
                {t('adminDataEntry.sundayClosed') || 'Pazar: Kapalı'}
              </div>
            </div>
            <Button type="submit" loading={creatingMember}>{t('adminDataEntry.createMemberButton')}</Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

function Input({ label, register, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      {register ? (
        <input type={type} {...register} className={inputClass} />
      ) : (
        <input type={type} value={value} onChange={onChange} className={inputClass} />
      )}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all';
