import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MemberLayout from '../../layouts/MemberLayout';
import { memberService } from '../../services/memberService';
import Badge from '../../components/ui/Badge';
import useAuthStore from '../../store/authStore';
import { formatDate, getMembershipDaysLeft } from '../../utils/formatters';
import { translateFitnessGoal } from '../../utils/constants';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconBadge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 3v18h18M7 16l4-4 4 4 4-6" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconCalculator = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0" />
  </svg>
);
const IconDumbbell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6.5 6.5h11M6.5 17.5h11M4 9v6M20 9v6M2 10.5v3M22 10.5v3" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ── StatCard bileşeni ───────────────────────────────────────────────────── */
function StatCard({ icon, title, value, subtitle, accent = false }) {
  return (
    <div className="bg-[#0d0d0d] p-6 flex flex-col gap-5 min-h-[130px]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest leading-tight">{title}</p>
        <span className={`flex-shrink-0 ${accent ? 'text-rose-500' : 'text-neutral-600'}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-3xl font-black text-white leading-none">{value}</p>
        {subtitle && <p className="text-neutral-600 text-xs mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Hızlı eylem butonu ──────────────────────────────────────────────────── */
function QuickAction({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 px-6 py-5 bg-[#0d0d0d] hover:bg-neutral-800/30 transition-all border-b border-neutral-800/50 last:border-b-0 sm:border-b-0"
    >
      <span className="text-neutral-600 group-hover:text-rose-500 transition-colors flex-shrink-0">
        {icon}
      </span>
      <span className="text-neutral-400 text-sm font-medium group-hover:text-white transition-colors flex-1">
        {label}
      </span>
      <span className="text-neutral-700 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all flex-shrink-0">
        <IconArrow />
      </span>
    </Link>
  );
}

/* ── Ana bileşen ─────────────────────────────────────────────────────────── */
export default function MemberDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberService.getProfile().then(setProfile).finally(() => setLoading(false));
  }, []);

  const daysLeft = profile?.membershipEndDate ? getMembershipDaysLeft(profile.membershipEndDate) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7;

  const quickActions = [
    { icon: <IconChart />,      label: t('memberDashboard.logProgress'),  to: '/member/progress' },
    { icon: <IconCalendar />,   label: t('memberDashboard.viewSessions'), to: '/member/sessions' },
    { icon: <IconCalculator />, label: t('memberDashboard.calorieCalc'),  to: '/member/calculator' },
    { icon: <IconUser />,       label: t('memberDashboard.editProfile'),  to: '/member/profile' },
  ];

  return (
    <MemberLayout>
      <div className="space-y-8 w-full">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="block w-6 h-px bg-rose-600" />
              <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
                {t('memberNav.dashboard')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t('memberDashboard.welcome', { name: user?.firstName })}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">{t('memberDashboard.subtitle')}</p>
          </div>
        </div>

        {/* ── İstatistik kartları ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-800/50">
          <StatCard
            icon={<IconCalendar />}
            title={t('memberDashboard.daysLeft')}
            value={loading ? '…' : (daysLeft !== null ? daysLeft : '—')}
            subtitle={t('memberDashboard.daysLeftSub')}
            accent={true}
          />
          <StatCard
            icon={<IconBadge />}
            title={t('memberDashboard.package')}
            value={loading ? '…' : (profile?.activePackageName || '—')}
            subtitle={t('memberDashboard.packageSub')}
          />
          <StatCard
            icon={<IconShield />}
            title={t('memberDashboard.status')}
            value={<Badge variant={user?.status?.toLowerCase()} autoTranslate />}
            subtitle={t('memberDashboard.statusSub')}
          />
          <StatCard
            icon={<IconClock />}
            title={t('memberDashboard.memberSince')}
            value={formatDate(user?.createdAt || new Date())}
            subtitle={t('memberDashboard.memberSinceSub')}
          />
        </div>

        {/* ── Üyelik kartı ────────────────────────────────────────────────── */}
        {!loading && (
          profile?.activePackageName ? (
            <div className="bg-[#0d0d0d] overflow-hidden border-l-2 border-l-rose-600 border border-neutral-800/70">
              <div className="p-7 flex items-center justify-between flex-wrap gap-6">
                {/* Sol: bilgiler */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                    {t('memberDashboard.activeMembership')}
                  </p>
                  <h3 className="text-2xl font-black text-white truncate">{profile.activePackageName}</h3>
                  <div className="flex items-center gap-8 mt-4">
                    <div>
                      <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{t('memberDashboard.start')}</p>
                      <p className="text-sm text-neutral-200 font-semibold mt-1">{formatDate(profile.membershipStartDate)}</p>
                    </div>
                    <div className="w-px h-10 bg-neutral-800" />
                    <div>
                      <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{t('memberDashboard.end')}</p>
                      <p className="text-sm text-neutral-200 font-semibold mt-1">{formatDate(profile.membershipEndDate)}</p>
                    </div>
                  </div>
                </div>
                {/* Sağ: kalan gün */}
                <div className="flex flex-col items-end">
                  <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-1">
                    {t('memberDashboard.daysRemaining')}
                  </p>
                  <p className={`text-6xl font-black tabular-nums leading-none ${isExpiringSoon ? 'text-red-400' : 'text-rose-500'}`}>
                    {daysLeft !== null ? daysLeft : '—'}
                  </p>
                </div>
              </div>
              {isExpiringSoon && (
                <div className="border-t border-neutral-800/70 flex items-center gap-3 px-7 py-3 bg-red-500/5">
                  <span className="text-red-500 flex-shrink-0"><IconAlert /></span>
                  <p className="text-red-400 text-sm font-medium">{t('memberDashboard.expiringSoon')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-neutral-800/70 border-dashed py-14 text-center">
              <div className="w-12 h-12 border border-neutral-700 flex items-center justify-center mx-auto mb-4 text-neutral-600">
                <IconDumbbell />
              </div>
              <p className="text-neutral-200 font-semibold">{t('memberDashboard.noMembership')}</p>
              <p className="text-neutral-600 text-sm mt-1">{t('memberDashboard.noMembershipSub')}</p>
            </div>
          )
        )}

        {/* ── Alt iki kolon ───────────────────────────────────────────────── */}
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-neutral-800/50">

            {/* Kişisel bilgiler — 2/5 */}
            <div className="bg-[#0d0d0d] lg:col-span-2">
              <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
                <span className="block w-4 h-px bg-rose-600" />
                <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  {t('memberDashboard.personalDetails')}
                </h4>
              </div>
              <dl className="p-6 space-y-4">
                {[
                  [t('memberDashboard.goal'),         translateFitnessGoal(t, profile.goal)],
                  [t('memberDashboard.weight'),        profile.weight             ? `${profile.weight} kg` : '—'],
                  [t('memberDashboard.targetWeight'),  profile.targetWeight       ? `${profile.targetWeight} kg` : '—'],
                  [t('memberDashboard.height'),        profile.height             ? `${profile.height} cm` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt className="text-sm text-neutral-600">{k}</dt>
                    <dd className="text-sm text-neutral-200 font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Hızlı eylemler — 3/5 */}
            <div className="bg-[#0d0d0d] lg:col-span-3">
              <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
                <span className="block w-4 h-px bg-rose-600" />
                <h4 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  {t('memberDashboard.quickActions')}
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800/50">
                {quickActions.map((a) => (
                  <QuickAction key={a.to} {...a} />
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </MemberLayout>
  );
}
