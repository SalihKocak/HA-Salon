import { useTranslation } from 'react-i18next';

const variants = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  suspended: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/30',
  cancelled: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
  scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  noshow: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
  admin: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  member: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  sent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
};

// variant key'inden i18n key'i çıkar
const variantToI18nKey = {
  pending: 'status.pending',
  approved: 'status.approved',
  rejected: 'status.rejected',
  suspended: 'status.suspended',
  paid: 'status.paid',
  overdue: 'status.overdue',
  cancelled: 'status.cancelled',
  scheduled: 'status.scheduled',
  completed: 'status.completed',
  noshow: 'status.noshow',
  active: 'status.active',
  inactive: 'status.inactive',
  sent: 'status.sent',
  failed: 'status.failed',
};

export default function Badge({ children, variant = 'pending', className = '', autoTranslate = true }) {
  const { t } = useTranslation();

  // variant'ı normalize et (boşluk ve büyük harf temizle)
  const normalizedVariant = (variant || '').toLowerCase().replace(/\s/g, '');
  const style = variants[normalizedVariant] || 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30';

  // children verilmemişse veya autoTranslate açıksa variant'tan çeviri al
  let label = children;
  if (autoTranslate && !children && variantToI18nKey[normalizedVariant]) {
    label = t(variantToI18nKey[normalizedVariant]);
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {label}
    </span>
  );
}
