import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService, packageService, sessionService } from '../../services/adminService';
import Table, { Pagination } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { formatDate, getMembershipDaysLeft } from '../../utils/formatters';
import { translateFitnessGoal } from '../../utils/constants';
import toast from 'react-hot-toast';

const MEMBER_TABS = ['Approved', 'Suspended', 'Rejected'];
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

function extractSessionStart(sessionTime) {
  if (!sessionTime) return '';
  return String(sessionTime).split('-')[0]?.trim() || '';
}

function fieldClass() {
  return 'w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600';
}

function normalizeRecordedBy(name) {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  if (normalized === 'gym admin' || normalized === 'gymadmin') return 'HA Salon';
  return name;
}

function sortByNearestDate(a, b) {
  const now = Date.now();
  const aDiff = Math.abs(new Date(a.sessionDate).getTime() - now);
  const bDiff = Math.abs(new Date(b.sessionDate).getTime() - now);
  if (aDiff !== bDiff) return aDiff - bDiff;
  return new Date(a.sessionDate) - new Date(b.sessionDate);
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <h4 className="text-neutral-300 font-semibold mb-3">{title}</h4>
      {children}
    </div>
  );
}

export default function AdminMembersPage() {
  const { t } = useTranslation();
  const [memberTab, setMemberTab] = useState('Approved');
  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailMember, setDetailMember] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [progressEntries, setProgressEntries] = useState([]);
  const [plannedSchedule, setPlannedSchedule] = useState([]);
  const [memberSessionRows, setMemberSessionRows] = useState([]);
  const [packages, setPackages] = useState([]);
  const [assignForm, setAssignForm] = useState({ packageId: '', startDate: new Date().toISOString().split('T')[0] });
  const [assigning, setAssigning] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [packageMember, setPackageMember] = useState(null);
  const [sessionPlanMember, setSessionPlanMember] = useState(null);
  const [sessionPlanSaving, setSessionPlanSaving] = useState(false);
  const [sessionPlanLoading, setSessionPlanLoading] = useState(false);
  const [hasExistingSessionPlan, setHasExistingSessionPlan] = useState(false);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotForm, setSlotForm] = useState({ intervalMinutes: 120 });
  const [selectedPlanSlots, setSelectedPlanSlots] = useState([]);

  const progressForm = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getMembers({ search, status: memberTab, page, pageSize: 20 });
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [search, memberTab, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { packageService.getAll(true).then(setPackages); }, []);
  useEffect(() => {
    (async () => {
      try {
        const settings = await sessionService.getAttendanceSlots();
        setSlotForm({ intervalMinutes: settings.intervalMinutes });
      } catch {
        setSlotForm({ intervalMinutes: 120 });
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedMember) {
      setDetailMember(null);
      setProgressEntries([]);
      setPlannedSchedule([]);
      setMemberSessionRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const [m, prog, sessionResult, allSessionsResult] = await Promise.all([
          adminService.getMember(selectedMember.id),
          adminService.getMemberProgress(selectedMember.id).catch(() => []),
          sessionService.getAll({ memberId: selectedMember.id, status: 'Scheduled', page: 1, pageSize: 250 }).catch(() => ({ items: [] })),
          sessionService.getAll({ memberId: selectedMember.id, page: 1, pageSize: 500 }).catch(() => ({ items: [] })),
        ]);
        if (!cancelled) {
          setDetailMember(m);
          setProgressEntries(Array.isArray(prog) ? prog : []);
          const dayNames = [
            t('common.sunday') || 'Pazar',
            t('common.monday') || 'Pazartesi',
            t('common.tuesday') || 'Salı',
            t('common.wednesday') || 'Çarşamba',
            t('common.thursday') || 'Perşembe',
            t('common.friday') || 'Cuma',
            t('common.saturday') || 'Cumartesi',
          ];
          const groupedMap = new Map();
          (sessionResult?.items || [])
            .filter((s) => s?.status === 'Scheduled' && !s?.isAttendanceCheckIn)
            .forEach((s) => {
              const dayIndex = new Date(s.sessionDate).getUTCDay();
              const day = dayNames[dayIndex] || dayNames[0];
              const current = groupedMap.get(day) || new Set();
              current.add(s.sessionTime);
              groupedMap.set(day, current);
            });
          const grouped = Array.from(groupedMap.entries()).map(([day, times]) => ({
            day,
            times: Array.from(times).sort((a, b) => a.localeCompare(b)),
          }));
          setPlannedSchedule(grouped);
          setMemberSessionRows(Array.isArray(allSessionsResult?.items) ? allSessionsResult.items : []);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedMember?.id]);

  const closeModal = () => {
    setSelectedMember(null);
    setDetailMember(null);
    progressForm.reset();
  };

  const openAssignPackage = (member) => {
    setPackageMember(member);
    setAssignForm({
      packageId: '',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const closeAssignPackage = () => {
    setPackageMember(null);
  };

  const openSessionPlan = async (member) => {
    setSessionPlanMember(member);
    setSelectedPlanSlots([]);
    setHasExistingSessionPlan(false);
    setSessionPlanLoading(true);
    try {
      const sessionResult = await sessionService.getAll({
        memberId: member.id,
        status: 'Scheduled',
        page: 1,
        pageSize: 250,
      });
      const slotSet = new Set();
      (sessionResult?.items || [])
        .filter((s) => s?.status === 'Scheduled' && !s?.isAttendanceCheckIn)
        .forEach((s) => {
          const dayOfWeek = new Date(s.sessionDate).getUTCDay();
          const start = extractSessionStart(s.sessionTime);
          if (start) slotSet.add(`${dayOfWeek}|${start}`);
        });
      const existing = Array.from(slotSet);
      setSelectedPlanSlots(existing);
      setHasExistingSessionPlan(existing.length > 0);
    } catch {
      setSelectedPlanSlots([]);
      setHasExistingSessionPlan(false);
    } finally {
      setSessionPlanLoading(false);
    }
  };

  const closeSessionPlan = () => {
    setSessionPlanMember(null);
    setSelectedPlanSlots([]);
    setHasExistingSessionPlan(false);
    setSessionPlanLoading(false);
  };

  const handleAssignPackage = async () => {
    const member = packageMember || detailMember;
    if (!member) return;
    if (!assignForm.packageId) return toast.error(t('adminMembers.selectPackage'));
    setAssigning(true);
    try {
      await adminService.assignPackage(member.id, {
        packageId: assignForm.packageId,
        startDate: new Date(assignForm.startDate).toISOString(),
      });
      toast.success(t('adminMembers.assignSuccess'));
      closeAssignPackage();
      load();
    } catch {
      toast.error(t('adminMembers.assignError'));
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignSessionPlan = async () => {
    if (!sessionPlanMember) return;
    setSessionPlanSaving(true);
    try {
      const weeklySessions = selectedPlanSlots.map((slot) => {
        const [dayOfWeekRaw, sessionStart] = slot.split('|');
        const dayOfWeek = Number(dayOfWeekRaw);
        return { dayOfWeek, sessionTime: resolveRangeLabel(dayOfWeek, sessionStart) };
      });
      await adminService.assignSessionPlan(sessionPlanMember.id, { weeklySessions });
      toast.success(t('adminMembers.sessionPlanAssigned') || 'Seans planı kaydedildi.');
      closeSessionPlan();
      load();
    } catch {
      toast.error(t('adminMembers.actionError'));
    } finally {
      setSessionPlanSaving(false);
    }
  };

  const handleSaveSlotInterval = async () => {
    setSlotSaving(true);
    try {
      const interval = Number(slotForm.intervalMinutes) || 120;
      const updated = await sessionService.updateAttendanceSlots({
        startHour: 6,
        endHour: 21,
        intervalMinutes: interval,
      });
      setSlotForm({ intervalMinutes: updated.intervalMinutes });
      toast.success(t('adminDataEntry.slotSaveSuccess'));
      setSelectedPlanSlots([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || t('adminDataEntry.slotSaveError'));
    } finally {
      setSlotSaving(false);
    }
  };

  const handleAddProgress = async (form) => {
    if (!detailMember) return;
    setSavingProgress(true);
    try {
      await adminService.addMemberProgress(detailMember.id, {
        weight: form.weight ? Number(form.weight) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        bodyFat: form.bodyFat ? Number(form.bodyFat) : null,
        muscleMass: form.muscleMass ? Number(form.muscleMass) : null,
        rightArmCm: form.rightArmCm ? Number(form.rightArmCm) : null,
        leftArmCm: form.leftArmCm ? Number(form.leftArmCm) : null,
        shoulderCm: form.shoulderCm ? Number(form.shoulderCm) : null,
        chestCm: form.chestCm ? Number(form.chestCm) : null,
        waistCm: form.waistCm ? Number(form.waistCm) : null,
        hipCm: form.hipCm ? Number(form.hipCm) : null,
        note: form.note || null,
      });
      toast.success(t('adminMembers.progressAdded'));
      progressForm.reset();
      const prog = await adminService.getMemberProgress(detailMember.id);
      setProgressEntries(prog || []);
    } catch {
      toast.error(t('adminMembers.progressError'));
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSuspend = async (member) => {
    if (!member || !confirm(t('adminMembers.suspendConfirm'))) return;
    setActionLoadingId(`suspend-${member.id}`);
    try {
      await adminService.suspendMember(member.id);
      toast.success(t('adminMembers.suspended'));
      if (selectedMember?.id === member.id) closeModal();
      load();
    } catch {
      toast.error(t('adminMembers.actionError'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActivate = async (member) => {
    if (!member || !confirm(t('adminMembers.activateConfirm'))) return;
    setActionLoadingId(`activate-${member.id}`);
    try {
      await adminService.activateMember(member.id);
      toast.success(t('adminMembers.activated'));
      if (selectedMember?.id === member.id) closeModal();
      load();
    } catch {
      toast.error(t('adminMembers.actionError'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (member) => {
    if (!member || !confirm(t('adminMembers.deleteConfirm'))) return;
    setActionLoadingId(`delete-${member.id}`);
    try {
      await adminService.deleteMember(member.id);
      toast.success(t('adminMembers.deleted'));
      if (selectedMember?.id === member.id) closeModal();
      load();
    } catch {
      toast.error(t('adminMembers.actionError'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    { key: 'name', header: t('adminMembers.fullName'), render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {row.firstName?.[0]}{row.lastName?.[0]}
        </div>
        <div>
          <p className="font-medium text-neutral-200">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-neutral-500">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'phoneNumber', header: t('adminMembers.phone'), render: (row) => <span className="text-neutral-400">{row.phoneNumber}</span> },
    { key: 'status', header: t('adminMembers.status'), render: (row) => (
      <Badge variant={row.status.toLowerCase()}>
        {t(`status.${row.status.toLowerCase()}`)}
      </Badge>
    )},
    { key: 'membership', header: t('adminMembers.package'), render: (row) => row.activePackageName ? (
      <div>
        <p className="text-neutral-300 text-sm font-medium">{row.activePackageName}</p>
        <p className="text-neutral-500 text-xs">
          {row.membershipEndDate ? `${getMembershipDaysLeft(row.membershipEndDate)} ${t('memberMembership.daysLeft').toLowerCase()}` : ''}
        </p>
      </div>
    ) : <span className="text-neutral-600">—</span> },
    { key: 'createdAt', header: t('adminMembers.joinDate'), render: (row) => <span className="text-neutral-400">{formatDate(row.createdAt)}</span> },
    { key: 'actions', header: '', render: (row) => (
      <div className="flex flex-wrap justify-end gap-2 pr-2">
        {row.status !== 'Suspended' && (
          <>
            <Button size="sm" variant="secondary" onClick={() => setSelectedMember(row)}>{t('table.details')}</Button>
            <Button size="sm" variant="primary" onClick={() => openAssignPackage(row)}>{t('adminMembers.assignPackage')}</Button>
            <Button size="sm" variant="secondary" onClick={() => openSessionPlan(row)}>
              {t('adminMembers.sessionPlanButton') || 'Seans Planı'}
            </Button>
          </>
        )}
        {row.status === 'Approved' && (
          <button
            type="button"
            onClick={() => handleSuspend(row)}
            disabled={actionLoadingId === `suspend-${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 disabled:opacity-60"
            title={t('adminMembers.suspend')}
          >
            !
          </button>
        )}
        {row.status === 'Suspended' && (
          <button
            type="button"
            onClick={() => handleActivate(row)}
            disabled={actionLoadingId === `activate-${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/60 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60"
            title={t('adminMembers.activate')}
          >
            ✓
          </button>
        )}
        <button
          type="button"
          onClick={() => handleDelete(row)}
          disabled={actionLoadingId === `delete-${row.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-600/60 bg-rose-600/15 text-rose-300 hover:bg-rose-600/25 disabled:opacity-60"
          title={t('adminMembers.deleteMember')}
        >
          X
        </button>
      </div>
    )},
  ];

  const dm = detailMember;
  const weekdayRanges = buildTimeRanges(BUSINESS_HOURS.weekday.startHour, BUSINESS_HOURS.weekday.endHour, Number(slotForm.intervalMinutes) || 120);
  const saturdayRanges = buildTimeRanges(BUSINESS_HOURS.saturday.startHour, BUSINESS_HOURS.saturday.endHour, Number(slotForm.intervalMinutes) || 120);
  const daySections = [
    { dayOfWeek: 1, label: t('common.monday') || 'Pazartesi', ranges: weekdayRanges },
    { dayOfWeek: 2, label: t('common.tuesday') || 'Salı', ranges: weekdayRanges },
    { dayOfWeek: 3, label: t('common.wednesday') || 'Çarşamba', ranges: weekdayRanges },
    { dayOfWeek: 4, label: t('common.thursday') || 'Perşembe', ranges: weekdayRanges },
    { dayOfWeek: 5, label: t('common.friday') || 'Cuma', ranges: weekdayRanges },
    { dayOfWeek: 6, label: t('common.saturday') || 'Cumartesi', ranges: saturdayRanges },
  ];
  const resolveRangeLabel = (dayOfWeek, start) => {
    const section = daySections.find((s) => s.dayOfWeek === dayOfWeek);
    const range = section?.ranges.find((r) => r.start === start);
    return range?.label || start;
  };
  const memberInfoRows = dm ? [
    [t('adminMembers.fullName'), `${dm.firstName} ${dm.lastName}`],
    [t('adminMembers.email'), dm.email || '—'],
    [t('adminMembers.phone'), dm.phoneNumber],
    [t('adminMembers.status'), t(`status.${dm.status?.toLowerCase()}`) || dm.status],
    [t('adminMembers.package'), dm.activePackageName || '—'],
    [t('memberMembership.startDate'), dm.membershipStartDate ? formatDate(dm.membershipStartDate) : '—'],
    [t('memberMembership.endDate'), dm.membershipEndDate ? formatDate(dm.membershipEndDate) : '—'],
    [t('adminMembers.joinDate'), dm.createdAt ? formatDate(dm.createdAt) : '—'],
    [t('adminApprovals.goal'), translateFitnessGoal(t, dm.goal)],
    [t('memberDashboard.weight'), dm.weight != null ? `${dm.weight} kg` : '—'],
    [t('memberDashboard.targetWeight'), dm.targetWeight != null ? `${dm.targetWeight} kg` : '—'],
    [t('memberDashboard.height'), dm.height != null ? `${dm.height} cm` : '—'],
    [t('adminMembers.recommendedCalories'), dm.recommendedDailyCalories != null ? `${Math.round(dm.recommendedDailyCalories)} kcal` : '—'],
  ] : [];
  const plannedSessionRows = memberSessionRows
    .filter((s) => s?.status === 'Scheduled' && !s?.isAttendanceCheckIn)
    .sort(sortByNearestDate);
  const attendedSessionRows = memberSessionRows
    .filter((s) => s?.isAttendanceCheckIn)
    .sort(sortByNearestDate);
  const todayDateKey = new Date().toISOString().split('T')[0];
  const upcomingPlannedSessionRows = plannedSessionRows.filter(
    (s) => new Date(s.sessionDate).toISOString().split('T')[0] >= todayDateKey,
  );
  const missedSessionRows = plannedSessionRows.filter(
    (s) => new Date(s.sessionDate).toISOString().split('T')[0] < todayDateKey,
  );
  const plannedDayCount = new Set(
    plannedSessionRows.map((s) => new Date(s.sessionDate).toISOString().split('T')[0]),
  ).size;
  const attendedDayCount = new Set(
    attendedSessionRows.map((s) => new Date(s.sessionDate).toISOString().split('T')[0]),
  ).size;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminMembers.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminMembers.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
          {MEMBER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setMemberTab(tab); setPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                memberTab === tab
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {t(`adminMembers.tab${tab}`)}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={t('adminMembers.searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <p className="text-neutral-400 text-sm mb-3">{data.totalCount} {t('adminMembers.title').toLowerCase()}</p>
          {loading ? (
            <div className="h-64 bg-neutral-800 rounded-xl animate-pulse" />
          ) : (
            <>
              <Table columns={columns} data={data.items} />
              <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      {selectedMember && (
        <Modal isOpen={!!selectedMember} onClose={closeModal} title={t('adminMembers.memberDetails')} size="xl">
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {detailLoading || !dm ? (
              <div className="h-40 flex items-center justify-center text-neutral-500 text-sm">{t('common.loading')}</div>
            ) : (
              <>
                <SectionCard title={t('adminMembers.memberDetails')}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {memberInfoRows.map(([k, v]) => (
                      <div key={k}>
                        <p className="text-xs text-neutral-500">{k}</p>
                        <p className="text-neutral-200 text-sm font-medium mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title={t('memberProfile.plannedSessions') || 'Planlanan Seanslar'}>
                  {plannedSchedule.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      {t('memberProfile.noPlannedSessions') || 'Planlanan seans bulunamadı.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plannedSchedule.map((item) => (
                        <div key={item.day} className="border border-neutral-800 rounded-lg px-4 py-3">
                          <p className="text-sm font-semibold text-neutral-200">{item.day}</p>
                          <p className="text-xs text-neutral-400 mt-1">{item.times.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title={t('adminMembers.progressTitle')}>
                  <form onSubmit={progressForm.handleSubmit(handleAddProgress)} className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.weightKg')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('weight')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.heightCm')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('heightCm')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.bodyFat')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('bodyFat')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.muscleMass')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('muscleMass')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.rightArm')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('rightArmCm')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.leftArm')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('leftArmCm')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.shoulder')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('shoulderCm')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.chest')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('chestCm')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.waist')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('waistCm')} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1 block">{t('memberProgress.hip')}</label>
                      <input type="number" step="0.1" className={fieldClass()} {...progressForm.register('hipCm')} />
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <label className="text-xs text-neutral-400 mb-1 block">{t('common.note')}</label>
                      <input type="text" className={fieldClass()} {...progressForm.register('note')} />
                    </div>
                    <div>
                      <Button type="submit" size="sm" loading={savingProgress}>{t('adminMembers.addProgress')}</Button>
                    </div>
                  </form>
                  <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-900/80 text-left text-[10px] uppercase text-neutral-500">
                          <th className="px-3 py-2">{t('common.date')}</th>
                          <th className="px-3 py-2">{t('memberProgress.weightKg')}</th>
                          <th className="px-3 py-2">{t('memberProgress.heightCm')}</th>
                          <th className="px-3 py-2">{t('memberProgress.rightArm')}</th>
                          <th className="px-3 py-2">{t('memberProgress.leftArm')}</th>
                          <th className="px-3 py-2">{t('memberProgress.shoulder')}</th>
                          <th className="px-3 py-2">{t('memberProgress.recordedBy')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {progressEntries.length === 0 ? (
                          <tr><td colSpan={7} className="px-3 py-4 text-neutral-500 text-center">{t('memberProgress.noEntries')}</td></tr>
                        ) : progressEntries.map((e) => (
                          <tr key={e.id} className="text-neutral-300">
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                            <td className="px-3 py-2">{e.weight ?? '—'}</td>
                            <td className="px-3 py-2">{e.heightCm ?? '—'}</td>
                            <td className="px-3 py-2">{e.rightArmCm ?? '—'}</td>
                            <td className="px-3 py-2">{e.leftArmCm ?? '—'}</td>
                            <td className="px-3 py-2">{e.shoulderCm ?? '—'}</td>
                            <td className="px-3 py-2 text-neutral-500">
                              {normalizeRecordedBy(e.recordedByName) || t('memberProgress.recordedByMember')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>

                <SectionCard title={t('adminMembers.sessionPlanButton') || 'Seans Durumu (Kişi Bazlı)'}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                      <p className="text-xs text-neutral-500">Planlanan gun sayisi</p>
                      <p className="text-2xl font-bold text-rose-300 mt-1">{plannedDayCount}</p>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                      <p className="text-xs text-neutral-500">Gelinen gun sayisi</p>
                      <p className="text-2xl font-bold text-emerald-300 mt-1">{attendedDayCount}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Planlanan Seanslar</h5>
                      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-900/80 text-left text-[10px] uppercase text-neutral-500">
                              <th className="px-3 py-2">{t('common.date')}</th>
                              <th className="px-3 py-2">Seans Saati</th>
                              <th className="px-3 py-2">Durum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            {upcomingPlannedSessionRows.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-3 py-4 text-neutral-500 text-center">{t('table.noData')}</td>
                              </tr>
                            ) : upcomingPlannedSessionRows.map((s) => (
                              <tr key={s.id} className="text-neutral-300">
                                <td className="px-3 py-2 whitespace-nowrap">{formatDate(s.sessionDate)}</td>
                                <td className="px-3 py-2">{s.sessionTime || '—'}</td>
                                <td className="px-3 py-2 text-rose-300">Planlandi</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Gelinen Seanslar</h5>
                      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-900/80 text-left text-[10px] uppercase text-neutral-500">
                              <th className="px-3 py-2">{t('common.date')}</th>
                              <th className="px-3 py-2">Seans Saati</th>
                              <th className="px-3 py-2">Durum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            {attendedSessionRows.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-3 py-4 text-neutral-500 text-center">{t('table.noData')}</td>
                              </tr>
                            ) : attendedSessionRows.map((s) => (
                              <tr key={s.id} className="text-neutral-300">
                                <td className="px-3 py-2 whitespace-nowrap">{formatDate(s.sessionDate)}</td>
                                <td className="px-3 py-2">{s.sessionTime || '—'}</td>
                                <td className="px-3 py-2 text-emerald-300">Geldi</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Gelinmeyen Seanslar</h5>
                      <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-900/80 text-left text-[10px] uppercase text-neutral-500">
                              <th className="px-3 py-2">{t('common.date')}</th>
                              <th className="px-3 py-2">Seans Saati</th>
                              <th className="px-3 py-2">Durum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            {missedSessionRows.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-3 py-4 text-neutral-500 text-center">{t('table.noData')}</td>
                              </tr>
                            ) : missedSessionRows.map((s) => (
                              <tr key={s.id} className="text-neutral-300">
                                <td className="px-3 py-2 whitespace-nowrap">{formatDate(s.sessionDate)}</td>
                                <td className="px-3 py-2">{s.sessionTime || '—'}</td>
                                <td className="px-3 py-2 text-rose-400">Gelmedi</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </SectionCard>

              </>
            )}
          </div>
        </Modal>
      )}

      {packageMember && (
        <Modal
          isOpen={!!packageMember}
          onClose={closeAssignPackage}
          title={`${t('adminMembers.assignPackage')} - ${packageMember.firstName} ${packageMember.lastName}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block">{t('adminMembers.selectPackage')}</label>
                <select
                  value={assignForm.packageId}
                  onChange={(e) => setAssignForm((f) => ({ ...f, packageId: e.target.value }))}
                  className={fieldClass()}
                >
                  <option value="">—</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationInDays} {t('adminPackages.days')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block">{t('adminMembers.startDate')}</label>
                <input
                  type="date"
                  value={assignForm.startDate}
                  onChange={(e) => setAssignForm((f) => ({ ...f, startDate: e.target.value }))}
                  className={fieldClass()}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeAssignPackage}>{t('common.cancel')}</Button>
              <Button loading={assigning} onClick={handleAssignPackage}>{t('adminMembers.assign')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {sessionPlanMember && (
        <Modal
          isOpen={!!sessionPlanMember}
          onClose={closeSessionPlan}
          title={`${t('adminMembers.sessionPlanButton') || 'Seans Planı'} - ${sessionPlanMember.firstName} ${sessionPlanMember.lastName}`}
        >
          <div className="space-y-4">
            {sessionPlanLoading && (
              <div className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-500">
                {t('common.loading')}
              </div>
            )}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <p className="text-sm text-neutral-300">
                {t('adminDataEntry.weeklyPlanHint') || 'Çalışma saatlerine göre saat aralıklarını seçin. Pazar kapalıdır.'}
              </p>
              <div className="mt-2 flex items-end gap-2">
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
                  onClick={handleSaveSlotInterval}
                  disabled={slotSaving}
                  className="h-[34px] px-3.5 rounded-lg bg-rose-600 text-white text-xs font-semibold tracking-wide hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors"
                >
                  {slotSaving ? t('common.loading') : (t('common.save') || 'Kaydet')}
                </button>
              </div>
            </div>

            <div className="max-h-[52vh] overflow-y-auto pr-1 space-y-3">
              {daySections.map((section) => (
                <div key={section.dayOfWeek} className="rounded-xl border border-neutral-800 bg-neutral-900/20 p-3 space-y-2">
                  <label className="block text-sm font-semibold text-neutral-300">{section.label}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {section.ranges.map((range) => {
                      const key = `${section.dayOfWeek}|${range.start}`;
                      const selected = selectedPlanSlots.includes(key);
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border transition-colors cursor-pointer ${
                            selected
                              ? 'border-rose-600/70 bg-rose-600/10 text-rose-100'
                              : 'border-neutral-800 text-neutral-200 hover:border-neutral-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => setSelectedPlanSlots((prev) => (
                              prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                            ))}
                          />
                          <span>{range.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-500">
              {t('adminDataEntry.sundayClosed') || 'Pazar: Kapalı'}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeSessionPlan}>{t('common.cancel')}</Button>
              <Button loading={sessionPlanSaving} onClick={handleAssignSessionPlan}>
                {hasExistingSessionPlan ? (t('common.update') || 'Güncelle') : t('common.save')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
