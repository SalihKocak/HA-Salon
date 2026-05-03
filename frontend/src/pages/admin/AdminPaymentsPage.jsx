import { useState, useEffect, useCallback, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { paymentService, packageService, adminService } from '../../services/adminService';
import Table, { Pagination } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS, translatePaymentMethod } from '../../utils/constants';

export default function AdminPaymentsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Paid');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [pendingData, setPendingData] = useState({ items: [], totalCount: 0 });
  const [pendingLoading, setPendingLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await paymentService.getAll({ status: statusFilter || 'Paid', page, pageSize: 20 });
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const loadPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      const result = await paymentService.getAll({ status: 'Pending', page: 1, pageSize: 100 });
      setPendingData(result);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending, data.totalCount]);

  useEffect(() => {
    adminService.getMembers({ status: 'Approved', pageSize: 200 }).then(r => setMembers(r.items || []));
    packageService.getAll(true).then(setPackages);
  }, []);

  const openCreate = () => {
    setEditPayment(null);
    reset({ memberId: '', packageId: '', amount: '', paymentMethod: 'Cash', dueDate: new Date().toISOString().split('T')[0], note: '' });
    setShowModal(true);
  };

  const openEdit = (payment) => {
    setEditPayment(payment);
    reset({ paymentMethod: payment.paymentMethod, status: payment.status, note: payment.note || '' });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editPayment) {
        await paymentService.update(editPayment.id, {
          paymentMethod: data.paymentMethod,
          status: data.status,
          paidAt: data.status === 'Paid' ? new Date().toISOString() : null,
          note: data.note || null,
        });
        toast.success(t('adminPayments.updated'));
      } else {
        await paymentService.create({
          memberId: data.memberId,
          packageId: data.packageId || null,
          amount: Number(data.amount),
          paymentMethod: data.paymentMethod,
          dueDate: new Date(data.dueDate).toISOString(),
          note: data.note || null,
        });
        toast.success(t('adminPayments.created'));
      }
      setShowModal(false);
      load();
      loadPending();
    } catch {
      toast.error(t('adminPayments.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const dailyBadge = (r) => (r.isDailyPass ? (
    <span className="inline-flex items-center rounded-md border border-amber-500/45 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
      {t('adminPayments.dailyPassBadge')}
    </span>
  ) : null);

  const columns = [
    { key: 'member', header: t('adminMembers.fullName'), render: (r) => (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-neutral-200 font-medium">{r.memberName}</span>
        {dailyBadge(r)}
      </div>
    ) },
    { key: 'package', header: t('adminMembers.package'), render: (r) => <span className="text-neutral-400">{r.packageName || '—'}</span> },
    { key: 'amount', header: t('adminPayments.amount'), render: (r) => <span className="text-emerald-400 font-semibold">{formatCurrency(r.amount)}</span> },
    { key: 'paymentMethod', header: t('adminPayments.method'), render: (r) => <span className="text-neutral-300">{translatePaymentMethod(t, r.paymentMethod)}</span> },
    { key: 'status', header: t('adminMembers.status'), render: (r) => (
      <Badge variant={r.status.toLowerCase()}>
        {t(`status.${r.status.toLowerCase()}`)}
      </Badge>
    )},
    { key: 'dueDate', header: t('adminPayments.dueDate'), render: (r) => <span className="text-neutral-400">{formatDate(r.dueDate)}</span> },
    { key: 'paidAt', header: t('adminPayments.paidAt'), render: (r) => <span className="text-neutral-400">{r.paidAt ? formatDate(r.paidAt) : '—'}</span> },
    { key: 'actions', header: '', render: (r) => (
      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>{t('table.edit')}</Button>
    )},
  ];

  const pendingColumns = [
    { key: 'member', header: t('adminMembers.fullName'), render: (r) => (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-neutral-200 font-medium">{r.memberName}</span>
        {dailyBadge(r)}
      </div>
    ) },
    { key: 'package', header: t('adminMembers.package'), render: (r) => <span className="text-neutral-400">{r.packageName || '—'}</span> },
    { key: 'amount', header: t('adminPayments.amount'), render: (r) => <span className="text-amber-400 font-semibold">{formatCurrency(r.amount)}</span> },
    { key: 'dueDate', header: t('adminPayments.dueDate'), render: (r) => <span className="text-neutral-400">{formatDate(r.dueDate)}</span> },
    { key: 'actions', header: '', render: (r) => (
      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>{t('table.edit')}</Button>
    )},
  ];

  return (
    <AdminLayout>
      <Fragment>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{t('adminPayments.title')}</h1>
            <p className="text-neutral-400 mt-1">{t('adminPayments.subtitle')}</p>
          </div>
          <Button onClick={openCreate}>+ {t('adminPayments.newPayment')}</Button>
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-600 text-sm"
          >
            <option value="Paid">{t('status.paid')}</option>
            <option value="Overdue">{t('status.overdue')}</option>
            <option value="Cancelled">{t('status.cancelled')}</option>
          </select>
        </div>

        {loading ? (
          <div className="h-64 bg-neutral-800 rounded-xl animate-pulse" />
        ) : (
          <>
            <Table columns={columns} data={data.items} />
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}

        <div className="border-t border-neutral-800 pt-8 mt-8 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-white">{t('adminPayments.pendingSection')}</h2>
            <p className="text-neutral-500 text-sm mt-1">{t('adminPayments.pendingSectionHint')}</p>
          </div>
          {pendingLoading ? (
            <div className="h-32 bg-neutral-800 rounded-xl animate-pulse" />
          ) : (
            <Table columns={pendingColumns} data={pendingData.items || []} />
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editPayment ? t('adminPayments.editPayment') : t('adminPayments.newPayment')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editPayment && (
            <>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminMembers.fullName')} *</label>
                <select {...register('memberId', { required: t('common.required') })} className={iClass(errors.memberId)}>
                  <option value="">{t('adminPayments.selectMember')}</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.packageOptional')}</label>
                <select {...register('packageId')} className={iClass()}>
                  <option value="">{t('adminPayments.noPackage')}</option>
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.amount')} (₺) *</label>
                  <input type="number" step="0.01" {...register('amount', { required: t('common.required'), min: 0.01 })} className={iClass(errors.amount)} />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.dueDate')} *</label>
                  <input type="date" {...register('dueDate', { required: t('common.required') })} className={iClass(errors.dueDate)} />
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.method')}</label>
              <select {...register('paymentMethod')} className={iClass()}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{translatePaymentMethod(t, m)}</option>
                ))}
              </select>
            </div>
            {editPayment && (
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminMembers.status')}</label>
                <select {...register('status')} className={iClass()}>
                  <option value="Pending">{t('status.pending')}</option>
                  <option value="Paid">{t('status.paid')}</option>
                  <option value="Overdue">{t('status.overdue')}</option>
                  <option value="Cancelled">{t('status.cancelled')}</option>
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.note')}</label>
            <input type="text" {...register('note')} placeholder={t('adminPayments.notePlaceholder')} className={iClass()} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t('common.cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{editPayment ? t('common.update') : t('common.create')}</Button>
          </div>
        </form>
      </Modal>
      </Fragment>
    </AdminLayout>
  );
}

function iClass(error) {
  return `w-full px-4 py-2.5 rounded-xl bg-neutral-900 border text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-neutral-700'}`;
}
