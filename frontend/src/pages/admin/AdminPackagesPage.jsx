import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { packageService } from '../../services/adminService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';

export default function AdminPackagesPage() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const data = await packageService.getAll();
      setPackages(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingPackage(null);
    reset({ name: '', description: '', durationInDays: 30, price: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (pkg) => {
    setEditingPackage(pkg);
    reset({
      name: pkg.name,
      description: pkg.description || '',
      durationInDays: pkg.durationInDays,
      price: pkg.price,
      isActive: pkg.isActive,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        durationInDays: Number(data.durationInDays),
        price: Number(data.price),
        isActive: data.isActive === true || data.isActive === 'true',
      };

      if (editingPackage) {
        await packageService.update(editingPackage.id, payload);
        toast.success(t('adminPackages.updated'));
      } else {
        await packageService.create(payload);
        toast.success(t('adminPackages.created'));
      }
      setShowModal(false);
      load();
    } catch {
      toast.error(t('adminPackages.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('adminPackages.deleteConfirm'))) return;
    try {
      await packageService.delete(id);
      toast.success(t('adminPackages.deleted'));
      load();
    } catch {
      toast.error(t('adminPackages.deleteError'));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{t('adminPackages.title')}</h1>
            <p className="text-neutral-400 mt-1">{t('adminPackages.subtitle')}</p>
          </div>
          <Button onClick={openCreate}>+ {t('adminPackages.newPackage')}</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-neutral-800 rounded-xl animate-pulse" />)}
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-neutral-800 border-dashed rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-neutral-400 font-medium">{t('adminPackages.noPackages')}</p>
            <Button className="mt-4" onClick={openCreate}>{t('adminPackages.createFirst')}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-neutral-100 font-bold text-lg">{pkg.name}</h3>
                  <Badge variant={pkg.isActive ? 'active' : 'inactive'}>
                    {pkg.isActive ? t('status.active') : t('status.inactive')}
                  </Badge>
                </div>
                {pkg.description && (
                  <p className="text-neutral-400 text-sm mb-3">{pkg.description}</p>
                )}
                <div className="flex gap-4 mt-auto">
                  <div>
                    <p className="text-neutral-500 text-xs">{t('adminPackages.duration')}</p>
                    <p className="text-neutral-200 font-semibold">{pkg.durationInDays} {t('adminPackages.days')}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs">{t('adminPackages.price')}</p>
                    <p className="text-rose-400 font-black text-xl">{formatCurrency(pkg.price)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-800">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(pkg)} className="flex-1">{t('table.edit')}</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(pkg.id)}>{t('table.delete')}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPackage ? t('adminPackages.editPackage') : t('adminPackages.newPackage')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPackages.packageName')} *</label>
            <input type="text" placeholder={t('adminPackages.packageNamePlaceholder')}
              {...register('name', { required: t('adminPackages.nameRequired') })}
              className={iClass(errors.name)} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPackages.description')}</label>
            <textarea rows={2} placeholder={t('adminPackages.descriptionPlaceholder')}
              {...register('description')}
              className={`${iClass()} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPackages.durationLabel')} *</label>
              <input type="number" {...register('durationInDays', { required: t('common.required'), min: 1 })}
                className={iClass(errors.durationInDays)} />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPackages.priceLabel')} *</label>
              <input type="number" step="0.01" {...register('price', { required: t('common.required'), min: 0.01 })}
                className={iClass(errors.price)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" {...register('isActive')}
              className="w-4 h-4 rounded accent-rose-600" />
            <label htmlFor="isActive" className="text-sm text-neutral-300">{t('adminPackages.activeLabel')}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t('common.cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {editingPackage ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

function iClass(error) {
  return `w-full px-4 py-2.5 rounded-xl bg-neutral-900 border text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-neutral-700'}`;
}
