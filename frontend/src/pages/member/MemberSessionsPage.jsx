import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MemberLayout from '../../layouts/MemberLayout';
import { memberService } from '../../services/memberService';
import { formatDate } from '../../utils/formatters';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);
const IconNote = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="12" y1="14" x2="3" y2="14" /><line x1="12" y1="18" x2="3" y2="18" />
  </svg>
);

/* ── Durum badge ─────────────────────────────────────────────────────────── */
function StatusPill({ status, label }) {
  const map = {
    scheduled: 'text-blue-400 border-blue-500/30 bg-blue-500/8',
    completed: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8',
    cancelled: 'text-red-400 border-red-500/30 bg-red-500/8',
    noshow:    'text-amber-400 border-amber-500/30 bg-amber-500/8',
    pending:   'text-amber-400 border-amber-500/30 bg-amber-500/8',
  };
  const cls = map[status?.toLowerCase()] || 'text-neutral-400 border-neutral-600/30 bg-neutral-500/8';
  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

export default function MemberSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    memberService.getSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfRange = new Date(today);
  endOfRange.setUTCDate(today.getUTCDate() + 6);
  const getSessionDayUtc = (sessionDate) => {
    const d = new Date(sessionDate);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  };
  const getSessionStart = (sessionTime) => String(sessionTime || '').split('-')[0]?.trim() || '';
  const upcomingSessions = sessions
    .filter((session) => {
      const day = getSessionDayUtc(session.sessionDate);
      return day >= today && day <= endOfRange;
    })
    .reduce((acc, session) => {
      const day = getSessionDayUtc(session.sessionDate).toISOString().slice(0, 10);
      const slot = String(session.sessionTime || '').trim();
      const key = `${day}|${slot}`;
      const existing = acc.get(key);
      if (!existing) {
        acc.set(key, session);
        return acc;
      }

      const existingCompleted = existing.isAttendanceCheckIn || String(existing.status || '').toLowerCase() === 'completed';
      const currentCompleted = session.isAttendanceCheckIn || String(session.status || '').toLowerCase() === 'completed';

      if (!existingCompleted && currentCompleted) {
        acc.set(key, session);
      }
      return acc;
    }, new Map())
    .values();
  const normalizedUpcomingSessions = Array.from(upcomingSessions)
    .sort((a, b) => {
      const dayDiff = getSessionDayUtc(a.sessionDate).getTime() - getSessionDayUtc(b.sessionDate).getTime();
      if (dayDiff !== 0) return dayDiff;
      return getSessionStart(a.sessionTime).localeCompare(getSessionStart(b.sessionTime));
    });

  return (
    <MemberLayout>
      <div className="w-full space-y-6">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-6 h-px bg-rose-600" />
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
              {t('memberNav.sessions')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('memberSessions.title')}</h1>
          <p className="text-neutral-500 text-sm mt-1">{t('memberSessions.subtitle')}</p>
        </div>

        {/* ── İçerik ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-px bg-neutral-800/40">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-[#0d0d0d] animate-pulse" />
            ))}
          </div>
        ) : normalizedUpcomingSessions.length === 0 ? (
          <div className="bg-[#0d0d0d] border border-neutral-800/70 border-dashed py-16 text-center">
            <div className="w-16 h-16 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-700">
              <IconCalendar />
            </div>
            <p className="text-neutral-300 font-bold text-base">{t('memberSessions.noSessions')}</p>
          </div>
        ) : (
          <div className="bg-[#0d0d0d] border border-neutral-800/70 overflow-hidden">
            {/* Tablo başlığı */}
            <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
              <span className="block w-4 h-px bg-rose-600" />
              <span className="text-neutral-600"><IconList /></span>
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                {t('memberSessions.title')}
              </h3>
              <span className="ml-auto text-xs text-neutral-600 font-medium">{normalizedUpcomingSessions.length} {t('common.total') || 'total'}</span>
            </div>

            {/* Seans listesi */}
            <div className="divide-y divide-neutral-800/40">
              {normalizedUpcomingSessions.map((session) => {
                const date   = new Date(session.sessionDate);
                const day    = date.getDate();
                const month  = date.toLocaleString(i18n.language, { month: 'short' }).toUpperCase();
                const weekday = date.toLocaleDateString(i18n.language, { weekday: 'short' });
                const status = session.status?.toLowerCase();
                const statusLabel = t(`common.${status}`) || session.status;
                const attendanceTimeLabel = session.isAttendanceCheckIn
                  ? t('memberSessions.arrivedRange', { range: session.sessionTime })
                  : session.sessionTime;

                return (
                  <div key={session.id} className="flex items-center gap-5 px-6 py-4 hover:bg-neutral-800/20 transition-colors">

                    {/* Tarih kutusu */}
                    <div className="w-14 flex-shrink-0 flex flex-col items-center justify-center border border-neutral-800 py-2 bg-neutral-900/40 px-1">
                      <span className="text-rose-500 font-black text-lg leading-none">{day}</span>
                      <span className="text-neutral-600 text-[9px] font-bold tracking-widest mt-0.5">{month}</span>
                      <span className="text-neutral-500 text-[9px] font-semibold mt-1 text-center leading-tight">{weekday}</span>
                    </div>

                    {/* Bilgiler */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        {session.isAttendanceCheckIn && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-rose-600/40 text-rose-400 bg-rose-600/10">
                            {t('memberSessions.attendanceCheckIn')}
                          </span>
                        )}
                        {/* Saat */}
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-200">
                          <span className="text-neutral-600"><IconClock /></span>
                          {attendanceTimeLabel}
                        </span>
                        {/* Eğitmen */}
                        {session.trainerName && (
                          <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                            <span className="text-neutral-700"><IconUser /></span>
                            {session.trainerName}
                          </span>
                        )}
                      </div>
                      {/* Not */}
                      {session.note && (
                        <p className="flex items-center gap-1.5 text-xs text-neutral-600 mt-1.5 truncate">
                          <span className="flex-shrink-0"><IconNote /></span>
                          {session.note}
                        </p>
                      )}
                    </div>

                    {/* Durum */}
                    <StatusPill status={status} label={statusLabel} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
