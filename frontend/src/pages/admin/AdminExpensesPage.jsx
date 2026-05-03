import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { expenseService } from '../../services/adminService';
import Table, { Pagination } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

export default function AdminExpensesPage() {
  const { t } = useTranslation();
  const expenseCategoryLabel = (value) => {
    if (!value) return '—';
    const key = value.toLowerCase();
    const translated = t(`adminExpenses.categories.${key}`);
    return translated === `adminExpenses.categories.${key}` ? value : translated;
  };
  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const result = await expenseService.getAll({ page, pageSize: 20 });
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', category: '', amount: '', expenseDate: new Date().toISOString().split('T')[0], note: '' });
    setShowModal(true);
  };

  const openEdit = (e) => {
    setEditing(e);
    reset({ title: e.title, category: e.category || '', amount: e.amount, expenseDate: e.expenseDate.split('T')[0], note: e.note || '' });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        title: data.title,
        category: data.category || null,
        amount: Number(data.amount),
        expenseDate: new Date(data.expenseDate).toISOString(),
        note: data.note || null,
      };
      if (editing) {
        await expenseService.update(editing.id, payload);
        toast.success(t('adminExpenses.updated'));
      } else {
        await expenseService.create(payload);
        toast.success(t('adminExpenses.added'));
      }
      setShowModal(false);
      load();
    } catch {
      toast.error(t('adminExpenses.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('adminExpenses.deleteConfirm'))) return;
    try {
      await expenseService.delete(id);
      toast.success(t('adminExpenses.deleted'));
      load();
    } catch {
      toast.error(t('adminExpenses.deleteError'));
    }
  };

  const totalAmount = data.items.reduce((sum, e) => sum + e.amount, 0);

  const columns = [
    { key: 'title', header: t('adminExpenses.expenseTitle'), render: (r) => <span className="text-neutral-200 font-medium">{r.title}</span> },
    { key: 'category', header: t('adminProducts.category'), render: (r) => <span className="text-neutral-400">{expenseCategoryLabel(r.category)}</span> },
    { key: 'amount', header: t('adminPayments.amount'), render: (r) => <span className="text-rose-400 font-semibold">{formatCurrency(r.amount)}</span> },
    { key: 'expenseDate', header: t('adminExpenses.date'), render: (r) => <span className="text-neutral-400">{formatDate(r.expenseDate)}</span> },
    { key: 'note', header: t('adminPayments.note'), render: (r) => <span className="text-neutral-500 text-xs truncate max-w-xs">{r.note || '—'}</span> },
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>{t('table.edit')}</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>{t('table.delete')}</Button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{t('adminExpenses.title')}</h1>
            <p className="text-neutral-400 mt-1">{t('adminExpenses.subtitle')}</p>
          </div>
          <Button onClick={openCreate}>+ {t('adminExpenses.newExpense')}</Button>
        </div>

        {data.items.length > 0 && (
          <div className="bg-[#1a1a1a] border border-rose-600/20 rounded-xl p-4 inline-flex gap-3 items-center">
            <span className="text-neutral-400 text-sm">{t('adminExpenses.totalOnPage')}</span>
            <span className="text-rose-400 font-black text-lg">{formatCurrency(totalAmount)}</span>
          </div>
        )}

        {loading ? <div className="h-64 bg-neutral-800 rounded-xl animate-pulse" /> : (
          <>
            <Table columns={columns} data={data.items} />
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('adminExpenses.editExpense') : t('adminExpenses.newExpense')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminExpenses.expenseTitle')} *</label>
            <input type="text" {...register('title', { required: t('common.required') })} className={iClass(errors.title)} placeholder={t('adminExpenses.titlePlaceholder')} />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.category')}</label>
              <select {...register('category')} className={iClass()}>
                <option value="">{t('adminExpenses.selectCategory')}</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {expenseCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.amount')} (₺) *</label>
              <input type="number" step="0.01" {...register('amount', { required: t('common.required'), min: 0.01 })} className={iClass(errors.amount)} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminExpenses.date')} *</label>
            <input type="date" {...register('expenseDate', { required: t('common.required') })} className={iClass(errors.expenseDate)} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.note')}</label>
            <textarea {...register('note')} rows={2} className={`${iClass()} resize-none`} placeholder={t('adminPayments.notePlaceholder')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t('common.cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? t('common.update') : t('adminExpenses.add')}</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

function iClass(error) {
  return `w-full px-4 py-2.5 rounded-xl bg-neutral-900 border text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-neutral-700'}`;
}
