import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MemberLayout from '../../layouts/MemberLayout';
import { memberService } from '../../services/memberService';
import { formatDate } from '../../utils/formatters';

/* ── SVG İkonlar ─────────────────────────────────────────────────────────── */
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 3v18h18M7 16l4-4 4 4 4-6" />
  </svg>
);
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
  </svg>
);
const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
function normalizeRecordedBy(name) {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  if (normalized === 'gym admin' || normalized === 'gymadmin') return 'HA Salon';
  return name;
}

export default function MemberProgressPage() {
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await memberService.getProgress();
      setEntries(data || []);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...entries]
    .reverse()
    .map((e) => ({
      date:   new Date(e.createdAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
      weight: e.weight,
    }))
    .filter((e) => e.weight);

  const tableHeaders = [
    t('common.date'),
    t('memberProgress.weightKg'),
    t('memberProgress.heightCm'),
    t('memberProgress.bodyFat'),
    t('memberProgress.muscleMass'),
    t('memberProgress.rightArm'),
    t('memberProgress.leftArm'),
    t('memberProgress.shoulder'),
    t('memberProgress.chest'),
    t('memberProgress.waist'),
    t('memberProgress.recordedBy'),
    t('common.note'),
  ];

  return (
    <MemberLayout>
      <div className="w-full space-y-6">

        {/* ── Başlık ──────────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="block w-6 h-px bg-rose-600" />
              <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">
                {t('memberNav.progress')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{t('memberProgress.title')}</h1>
            <p className="text-neutral-500 text-sm mt-1">{t('memberProgress.subtitle')}</p>
          </div>
        </div>

        {/* ── Ağırlık grafiği ─────────────────────────────────────────────── */}
        {chartData.length > 0 && (
          <div className="bg-[#0d0d0d] border border-neutral-800/70">
            <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
              <span className="block w-4 h-px bg-rose-600" />
              <span className="text-neutral-600"><IconChart /></span>
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                {t('memberProgress.weightChart')}
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="date" tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#525252', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid #262626', borderRadius: 0 }}
                    labelStyle={{ color: '#a3a3a3', fontSize: 11 }}
                    itemStyle={{ color: '#e11d48', fontSize: 12 }}
                    cursor={{ stroke: '#262626' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={{ fill: '#e11d48', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#e11d48', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Kayıt tablosu ───────────────────────────────────────────────── */}
        <div className="bg-[#0d0d0d] border border-neutral-800/70 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800/70 flex items-center gap-3">
            <span className="block w-4 h-px bg-rose-600" />
            <span className="text-neutral-600"><IconTable /></span>
            <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
              {t('memberProgress.recentEntries')}
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-600 text-sm">{t('common.loading')}</div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-700">
                <IconActivity />
              </div>
              <p className="text-neutral-400 font-semibold">{t('memberProgress.noEntries')}</p>
            </div>
          ) : (
            <>
            <div className="divide-y divide-neutral-800/40 md:hidden">
              {entries.map((e) => (
                <div key={e.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-neutral-300 font-semibold">{formatDate(e.createdAt)}</p>
                    <p className="text-xs text-neutral-500">
                      {normalizeRecordedBy(e.recordedByName) || t('memberProgress.recordedByMember')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <StatItem label={t('memberProgress.weightKg')} value={e.weight} strong />
                    <StatItem label={t('memberProgress.heightCm')} value={e.heightCm} />
                    <StatItem label={t('memberProgress.bodyFat')} value={e.bodyFat} />
                    <StatItem label={t('memberProgress.muscleMass')} value={e.muscleMass} />
                    <StatItem label={t('memberProgress.rightArm')} value={e.rightArmCm} />
                    <StatItem label={t('memberProgress.leftArm')} value={e.leftArmCm} />
                    <StatItem label={t('memberProgress.shoulder')} value={e.shoulderCm} />
                    <StatItem label={t('memberProgress.chest')} value={e.chestCm} />
                    <StatItem label={t('memberProgress.waist')} value={e.waistCm} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{t('common.note')}</p>
                    <p className="text-xs text-neutral-300 break-words">{e.note || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-900/60 border-b border-neutral-800/70">
                    {tableHeaders.map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40">
                  {entries.map((e) => (
                    <tr key={e.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-neutral-400 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                      <td className="px-5 py-3.5 text-sm text-white font-bold">{e.weight ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.heightCm ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.bodyFat ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.muscleMass ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.rightArmCm ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.leftArmCm ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.shoulderCm ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.chestCm ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300">{e.waistCm ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-500 whitespace-nowrap">
                        {normalizeRecordedBy(e.recordedByName) || t('memberProgress.recordedByMember')}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-neutral-500 max-w-xs truncate">{e.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>

    </MemberLayout>
  );
}

function StatItem({ label, value, strong = false }) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800/70 p-2">
      <p className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</p>
      <p className={`mt-1 ${strong ? 'text-sm text-white font-bold' : 'text-sm text-neutral-200'}`}>{value ?? '—'}</p>
    </div>
  );
}
