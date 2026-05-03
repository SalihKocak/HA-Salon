import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MemberLayout from '../../layouts/MemberLayout';
import { memberService } from '../../services/memberService';
import { formatDate, getMembershipDaysLeft } from '../../utils/formatters';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconBadge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);
const IconDumbbell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M6.5 6.5h11M6.5 17.5h11M4 9v6M20 9v6M2 10.5v3M22 10.5v3" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

/* ── Stat kutusu ─────────────────────────────────────────────────────────── */
function StatBox({ icon, label, value, accent }) {
  return (
    <div className="bg-[#0d0d0d] p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest">{label}</p>
        <span className={accent ? 'text-rose-500' : 'text-neutral-600'}>{icon}</span>
      </div>
      <p className={`text-2xl font-black leading-none ${accent ? 'text-rose-500' : 'text-white'}`}>{value}</p>
    </div>
  );
}

export default function MemberMembershipPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    memberService.getProfile().then(setProfile).finally(() => setLoading(false));
  }, []);

  const daysLeft        = profile?.membershipEndDate ? getMembershipDaysLeft(profile.membershipEndDate) : null;
  const isExpired       = daysLeft !== null && daysLeft === 0;
  const isExpiringSoon  = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  /* İlerleme yüzdesi */
  const progress = (() => {
    if (!profile?.membershipStartDate || !profile?.membershipEndDate) return 0;
    const start = new Date(profile.membershipStartDate).getTime();
    const end   = new Date(profile.membershipEndDate).getTime();
    return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
  })();

  /* Durum rengi */
  const statusColor = isExpired ? 'red' : isExpiringSoon ? 'amber' : 'rose';
  const colorMap = {
    rose:  { border: 'border-l-rose-600',  text: 'text-rose-500',  bg: 'bg-rose-500/8',  alertBorder: 'border-rose-500/20' },
    amber: { border: 'border-l-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/8', alertBorder: 'border-amber-500/20' },
    red:   { border: 'border-l-red-500',   text: 'text-red-400',   bg: 'bg-red-500/8',   alertBorder: 'border-red-500/20' },
  };
  const c = colorMap[statusColor];

  return (
    <MemberLayout>
      <div className="w-full space-y-6">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-6 h-px bg-rose-600" />
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
              {t('memberNav.membership')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t('memberMembership.title')}</h1>
          <p className="text-neutral-500 text-sm mt-1">{t('memberMembership.subtitle')}</p>
        </div>

        {/* ── İçerik ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-px animate-pulse bg-neutral-800/40">
            <div className="h-40 bg-[#0d0d0d]" />
            <div className="h-28 bg-[#0d0d0d]" />
            <div className="h-24 bg-[#0d0d0d]" />
          </div>
        ) : profile?.activePackageName ? (
          <div className="space-y-px bg-neutral-800/40">

            {/* Üyelik ana kartı */}
            <div className={`bg-[#0d0d0d] border-l-2 ${c.border} border border-neutral-800/70 p-7`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-2">
                    {t('memberMembership.currentPlan')}
                  </p>
                  <h2 className="text-2xl font-black text-white">{profile.activePackageName}</h2>
                </div>
                {/* Durum badge */}
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${
                  isExpired
                    ? 'text-red-400 border-red-500/30 bg-red-500/8'
                    : isExpiringSoon
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/8'
                    : 'text-rose-400 border-rose-500/30 bg-rose-500/8'
                }`}>
                  {isExpired ? t('common.cancelled') : isExpiringSoon ? t('common.pending') : t('common.approved')}
                </span>
              </div>
            </div>

            {/* 3 stat kutusu */}
            <div className="grid grid-cols-3 gap-px bg-neutral-800/40">
              <StatBox
                icon={<IconCalendar />}
                label={t('memberMembership.startDate')}
                value={formatDate(profile.membershipStartDate)}
              />
              <StatBox
                icon={<IconCalendar />}
                label={t('memberMembership.endDate')}
                value={formatDate(profile.membershipEndDate)}
              />
              <StatBox
                icon={<IconClock />}
                label={t('memberMembership.daysLeft')}
                value={daysLeft ?? '—'}
                accent={true}
              />
            </div>

            {/* Uyarı */}
            {(isExpired || isExpiringSoon) && (
              <div className={`bg-[#0d0d0d] border border-neutral-800/70 border-l-2 ${c.border}`}>
                <div className={`flex items-center gap-3 px-7 py-4 ${c.bg}`}>
                  <span className={`flex-shrink-0 ${c.text}`}><IconAlert /></span>
                  <p className={`text-sm font-medium ${c.text}`}>
                    {isExpired
                      ? t('memberMembership.expired')
                      : t('memberMembership.expiringSoon', { days: daysLeft })}
                  </p>
                </div>
              </div>
            )}

            {/* İlerleme çubuğu */}
            {!isExpired && profile.membershipStartDate && profile.membershipEndDate && (
              <div className="bg-[#0d0d0d] border border-neutral-800/70">
                <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
                  <span className="block w-4 h-px bg-rose-600" />
                  <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                    {t('memberMembership.title')}
                  </h3>
                </div>
                <div className="p-6">
                  {/* Çubuk */}
                  <div className="h-2 bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2.5 text-xs text-neutral-600">
                    <span>{formatDate(profile.membershipStartDate)}</span>
                    <span className="font-bold text-neutral-400">{Math.round(progress)}%</span>
                    <span>{formatDate(profile.membershipEndDate)}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Üyelik yok */
          <div className="bg-[#0d0d0d] border border-neutral-800/70 border-dashed py-16 text-center">
            <div className="w-16 h-16 border border-neutral-700 flex items-center justify-center mx-auto mb-5 text-neutral-600">
              <IconDumbbell />
            </div>
            <p className="text-neutral-200 font-bold text-lg">{t('memberMembership.noMembership')}</p>
            <p className="text-neutral-600 text-sm mt-2 max-w-xs mx-auto">
              {t('memberMembership.noMembershipSub')}
            </p>
            <a
              href="https://wa.me/905385575859"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 mt-8 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold uppercase tracking-wide transition-colors"
            >
              <IconWhatsApp />
              {t('home.whatsappUs')}
            </a>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
