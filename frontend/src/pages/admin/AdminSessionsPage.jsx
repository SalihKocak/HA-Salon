import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { sessionService } from '../../services/adminService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';

function localDateInputValue(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function localTimeHHmm(d = new Date()) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function apiErrorMessage(err, fallback) {
  const m = err?.response?.data?.message;
  return typeof m === 'string' && m.trim() ? m : fallback;
}

/** API bazen PascalCase döndürebilir; ayrıca busy için undefined===undefined tuzağını önlemek için id'leri netleştiririz. */
function normalizeDailyBoard(apiData) {
  if (!apiData) return null;
  const rows = apiData.members ?? apiData.Members ?? [];
  return {
    date: apiData.date ?? apiData.Date ?? '',
    members: rows.map((row) => ({
      memberId: String(row.memberId ?? row.MemberId ?? '').trim(),
      fullName: row.fullName ?? row.FullName ?? '—',
      attended: Boolean(row.attended ?? row.Attended),
      attendanceSessionId: row.attendanceSessionId ?? row.AttendanceSessionId ?? null,
      plannedTime: row.plannedTime ?? row.PlannedTime ?? null,
      arrivalTime: row.arrivalTime ?? row.ArrivalTime ?? null,
    })),
  };
}

export default function AdminSessionsPage() {
  const { t } = useTranslation();
  const [boardDate, setBoardDate] = useState(() => localDateInputValue());
  const [dailyBoard, setDailyBoard] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyActionId, setDailyActionId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFrom, setHistoryFrom] = useState(() => localDateInputValue(addDays(new Date(), -6)));
  const [historyTo, setHistoryTo] = useState(() => localDateInputValue());
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);

  const loadDailyBoard = useCallback(async () => {
    setDailyLoading(true);
    try {
      const data = await sessionService.getDailyBoard(boardDate);
      setDailyBoard(normalizeDailyBoard(data));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('adminSessions.dailyError')));
      setDailyBoard(null);
    } finally {
      setDailyLoading(false);
    }
  }, [boardDate, t]);

  useEffect(() => { loadDailyBoard(); }, [loadDailyBoard]);

  const handleMarkPresent = async (memberId) => {
    if (!memberId) {
      toast.error(t('adminSessions.dailyError'));
      return;
    }
    setDailyActionId(memberId);
    try {
      await sessionService.markAttendance({
        memberId,
        calendarDate: boardDate,
        sessionTime: localTimeHHmm(),
      });
      toast.success(t('adminSessions.dailyMarked'));
      await loadDailyBoard();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('adminSessions.dailyError')));
    } finally {
      setDailyActionId(null);
    }
  };

  const handleUnmarkAttendance = async (sessionId) => {
    if (!sessionId || !confirm(t('adminSessions.unmarkConfirm'))) return;
    setDailyActionId(sessionId);
    try {
      await sessionService.delete(sessionId);
      toast.success(t('adminSessions.dailyUnmarked'));
      await loadDailyBoard();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('adminSessions.dailyError')));
    } finally {
      setDailyActionId(null);
    }
  };

  const plannedMembers = useMemo(
    () => (dailyBoard?.members || []).filter((m) => !m.attended),
    [dailyBoard],
  );
  const attendedMembers = useMemo(
    () => (dailyBoard?.members || []).filter((m) => m.attended),
    [dailyBoard],
  );

  const loadRangeBoard = async () => {
    if (!historyFrom || !historyTo) {
      toast.error('Tarih araligi seciniz');
      return;
    }
    if (historyFrom > historyTo) {
      toast.error('Baslangic tarihi bitis tarihinden buyuk olamaz');
      return;
    }
    setHistoryLoading(true);
    try {
      const start = new Date(`${historyFrom}T00:00:00`);
      const end = new Date(`${historyTo}T00:00:00`);
      const calls = [];
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const dateValue = localDateInputValue(d);
        calls.push(
          sessionService.getDailyBoard(dateValue).then((data) => ({
            date: dateValue,
            data: normalizeDailyBoard(data),
          })),
        );
      }
      const responses = await Promise.all(calls);
      const rows = responses.flatMap((dayRes) => (
        (dayRes.data?.members || []).map((member, idx) => ({
          id: `${dayRes.date}-${member.memberId || idx}`,
          date: dayRes.date,
          fullName: member.fullName,
          attended: member.attended,
          time: member.arrivalTime || member.plannedTime || '—',
        }))
      ));
      setHistoryRows(rows);
    } catch (err) {
      toast.error(apiErrorMessage(err, t('adminSessions.dailyError')));
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (historyOpen) loadRangeBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyOpen]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminSessions.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminSessions.subtitle')}</p>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setHistoryOpen(true)}>
            Listeyi Goruntule
          </Button>
        </div>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex flex-wrap items-end gap-4 justify-between gap-y-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white tracking-tight">{t('adminSessions.dailyTitle')}</h2>
              <p className="text-sm text-neutral-500 mt-1 max-w-2xl">{t('adminSessions.dailySubtitle')}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <label className="text-xs text-neutral-500 font-medium">{t('adminSessions.dailyDateLabel')}</label>
              <input
                type="date"
                value={boardDate}
                onChange={(e) => setBoardDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-neutral-600">{t('adminSessions.todayHint')} - {formatDate(`${boardDate}T12:00:00.000Z`)}</p>

          {dailyLoading ? (
            <div className="h-40 bg-neutral-800 rounded-lg animate-pulse" />
          ) : (
            <>
              <p className="text-sm text-rose-400 font-semibold">
                {`${attendedMembers.length} üye geldi, ${plannedMembers.length} üye gelecek`}
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-neutral-200 tracking-wide uppercase">O gun gelecekler</h3>
                  <div className="overflow-x-auto border border-neutral-800 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-neutral-950/80 text-neutral-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-bold">{t('adminSessions.member')}</th>
                          <th className="px-4 py-3 font-bold">{t('adminSessions.colPresent')}</th>
                          <th className="px-4 py-3 font-bold">{t('adminSessions.colArrival')}</th>
                          <th className="px-4 py-3 font-bold w-48" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {plannedMembers.length === 0 ? (
                          <tr className="bg-neutral-900/30">
                            <td colSpan={4} className="px-4 py-4 text-neutral-500">{t('table.noData')}</td>
                          </tr>
                        ) : plannedMembers.map((row, idx) => {
                          const busy = Boolean(dailyActionId)
                            && (dailyActionId === row.memberId || dailyActionId === row.attendanceSessionId);
                          return (
                            <tr key={row.memberId || `planned-member-${idx}`} className="bg-neutral-900/30 hover:bg-neutral-800/30">
                              <td className="px-4 py-3 text-neutral-200 font-medium">{row.fullName}</td>
                              <td className="px-4 py-3">
                                <span className="text-neutral-500">{t('adminSessions.presentNo')}</span>
                              </td>
                              <td className="px-4 py-3 text-neutral-300 font-mono tabular-nums">
                                {row.plannedTime || row.arrivalTime || '—'}
                              </td>
                              <td className="px-4 py-3 text-right relative z-10">
                                <Button
                                  type="button"
                                  size="sm"
                                  loading={busy}
                                  disabled={busy}
                                  onClick={() => handleMarkPresent(row.memberId)}
                                >
                                  {t('adminSessions.markPresent')}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-emerald-300 tracking-wide uppercase">Geldi Isaretlenenler</h3>
                  <div className="overflow-x-auto border border-neutral-800 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-neutral-950/80 text-neutral-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-bold">{t('adminSessions.member')}</th>
                          <th className="px-4 py-3 font-bold">{t('adminSessions.colPresent')}</th>
                          <th className="px-4 py-3 font-bold">{t('adminSessions.colArrival')}</th>
                          <th className="px-4 py-3 font-bold w-48" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {attendedMembers.length === 0 ? (
                          <tr className="bg-neutral-900/30">
                            <td colSpan={4} className="px-4 py-4 text-neutral-500">{t('table.noData')}</td>
                          </tr>
                        ) : attendedMembers.map((row, idx) => {
                          const busy = Boolean(dailyActionId)
                            && (dailyActionId === row.memberId || dailyActionId === row.attendanceSessionId);
                          return (
                            <tr key={row.memberId || `attended-member-${idx}`} className="bg-neutral-900/30 hover:bg-neutral-800/30">
                              <td className="px-4 py-3 text-neutral-200 font-medium">{row.fullName}</td>
                              <td className="px-4 py-3">
                                <span className="text-emerald-400 font-medium">{t('adminSessions.presentYes')}</span>
                              </td>
                              <td className="px-4 py-3 text-neutral-300 font-mono tabular-nums">
                                {row.arrivalTime || row.plannedTime || '—'}
                              </td>
                              <td className="px-4 py-3 text-right relative z-10">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  loading={busy}
                                  disabled={busy}
                                  onClick={() => handleUnmarkAttendance(row.attendanceSessionId)}
                                >
                                  {t('adminSessions.unmarkPresent')}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

      </div>

      <Modal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} title="Tarih Araligina Gore Yoklama Listesi" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Baslangic Tarihi</label>
              <input
                type="date"
                value={historyFrom}
                onChange={(e) => setHistoryFrom(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Bitis Tarihi</label>
              <input
                type="date"
                value={historyTo}
                onChange={(e) => setHistoryTo(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 text-sm"
              />
            </div>
            <div className="md:justify-self-end">
              <Button onClick={loadRangeBoard} loading={historyLoading}>Listeyi Getir</Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-950/80 text-neutral-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-bold">Tarih</th>
                  <th className="px-4 py-3 font-bold">{t('adminSessions.member')}</th>
                  <th className="px-4 py-3 font-bold">{t('adminSessions.colArrival')}</th>
                  <th className="px-4 py-3 font-bold">Geldi Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {historyLoading ? (
                  <tr className="bg-neutral-900/30">
                    <td colSpan={4} className="px-4 py-4 text-neutral-400">Yukleniyor...</td>
                  </tr>
                ) : historyRows.length === 0 ? (
                  <tr className="bg-neutral-900/30">
                    <td colSpan={4} className="px-4 py-4 text-neutral-500">{t('table.noData')}</td>
                  </tr>
                ) : historyRows.map((row) => (
                  <tr key={row.id} className="bg-neutral-900/30 hover:bg-neutral-800/30">
                    <td className="px-4 py-3 text-neutral-300">{formatDate(`${row.date}T12:00:00.000Z`)}</td>
                    <td className="px-4 py-3 text-neutral-200 font-medium">{row.fullName}</td>
                    <td className="px-4 py-3 text-neutral-300 font-mono tabular-nums">{row.time}</td>
                    <td className="px-4 py-3">
                      <span className={row.attended ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {row.attended ? 'Geldi' : 'Gelmedi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
