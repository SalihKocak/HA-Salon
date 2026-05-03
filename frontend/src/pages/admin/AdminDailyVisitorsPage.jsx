import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import { paymentService } from '../../services/adminService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PAYMENT_METHODS, translatePaymentMethod } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const PRESET_AMOUNTS = [50, 100, 150, 200, 250, 300];

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all';

function iClass(error) {
  return `${inputClass} ${error ? 'border-red-500' : ''}`;
}

function DailyPassChip({ label }) {
  return (
    <span className="inline-flex items-center rounded-md border border-amber-500/45 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
      {label}
    </span>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function AdminDailyVisitorsPage() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      amount: '',
      paymentMethod: 'Cash',
      note: '',
    },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const today = new Date();
      today.setUTCHours(12, 0, 0, 0);
      await paymentService.create({
        isDailyPass: true,
        dailyVisitorFirstName: data.firstName.trim(),
        dailyVisitorLastName: data.lastName.trim(),
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod || 'Cash',
        dueDate: today.toISOString(),
        note: data.note?.trim() || null,
      });
      toast.success(t('adminDailyVisitors.saveSuccess'));
      reset({
        firstName: '',
        lastName: '',
        amount: '',
        paymentMethod: 'Cash',
        note: '',
      });
    } catch {
      toast.error(t('adminDailyVisitors.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminDailyVisitors.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminDailyVisitors.subtitle')}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-neutral-100 font-semibold mb-4">{t('adminDailyVisitors.formTitle')}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={`${t('adminDailyVisitors.firstName')} *`} error={errors.firstName?.message}>
                <input
                  type="text"
                  autoComplete="given-name"
                  className={iClass(errors.firstName)}
                  {...register('firstName', { required: t('common.required') })}
                />
              </Field>
              <Field label={`${t('adminDailyVisitors.lastName')} *`} error={errors.lastName?.message}>
                <input
                  type="text"
                  autoComplete="family-name"
                  className={iClass(errors.lastName)}
                  {...register('lastName', { required: t('common.required') })}
                />
              </Field>
              <Field label={`${t('adminDailyVisitors.amount')} (₺) *`} error={errors.amount?.message}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0.01}
                  className={`${iClass(errors.amount)} tabular-nums`}
                  {...register('amount', { required: t('common.required'), min: 0.01 })}
                />
              </Field>
              <Field label={t('adminPayments.method')}>
                <select {...register('paymentMethod')} className={iClass()}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{translatePaymentMethod(t, m)}</option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.note')}</label>
                <input
                  type="text"
                  className={iClass()}
                  {...register('note')}
                  placeholder={t('adminPayments.notePlaceholder')}
                />
              </div>
            </div>

            <div className="border border-neutral-800/80 rounded-xl p-4 space-y-4 bg-neutral-900/20">
              <div>
                <p className="text-sm font-semibold text-neutral-200">{t('adminDailyVisitors.quickAmounts')}</p>
                <p className="text-xs text-neutral-500 mt-1">{t('adminDailyVisitors.quickAmountsHint')}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {PRESET_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('amount', String(v), { shouldValidate: true, shouldDirty: true })}
                    className="flex items-center justify-center px-3 py-2 rounded-lg border border-neutral-800 text-sm text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800/40 transition-colors"
                  >
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" loading={saving}>{t('adminDailyVisitors.submit')}</Button>
          </form>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-5 py-5 space-y-4">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{t('adminDailyVisitors.footerTitle')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <DailyPassChip label={t('adminPayments.dailyPassBadge')} />
            <Badge variant="paid" />
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-3xl">{t('adminDailyVisitors.hint')}</p>
          <Link
            to="/admin/payments"
            className="inline-flex text-sm font-medium text-rose-500 hover:text-rose-400 transition-colors"
          >
            {t('adminDailyVisitors.viewPayments')} →
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
