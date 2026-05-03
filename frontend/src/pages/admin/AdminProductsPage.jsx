import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService, productService } from '../../services/adminService';
import Table, { Pagination } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS, PRODUCT_CATEGORIES, translatePaymentMethod } from '../../utils/constants';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const productCategoryLabel = (value) => {
    if (!value) return '—';
    const key = value.toLowerCase();
    const translated = t(`adminProducts.categories.${key}`);
    return translated === `adminProducts.categories.${key}` ? value : translated;
  };
  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [salesData, setSalesData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesPage, setSalesPage] = useState(1);
  const [saleSaving, setSaleSaving] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [saleUpdating, setSaleUpdating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const {
    register: registerSale,
    handleSubmit: handleSubmitSale,
    reset: resetSale,
    getValues: getSaleValues,
    watch: watchSale,
    formState: { errors: saleErrors },
  } = useForm({
    defaultValues: {
      memberId: '',
      productId: '',
      quantity: 1,
      unitPrice: '',
      paymentMethod: 'Cash',
      note: '',
    },
  });
  const {
    register: registerEditSale,
    handleSubmit: handleSubmitEditSale,
    reset: resetEditSale,
    watch: watchEditSale,
    setValue: setEditSaleValue,
    formState: { errors: editSaleErrors },
  } = useForm({
    defaultValues: {
      memberId: '',
      productId: '',
      quantity: 1,
      unitPrice: '',
      paymentMethod: 'Cash',
      isPaid: true,
      paidAmount: '',
      note: '',
    },
  });

  const load = async () => {
    setLoading(true);
    try {
      const result = await productService.getAll({ page, pageSize: 20 });
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const loadMembers = async () => {
    let current = 1;
    let totalPages = 1;
    let allMembers = [];
    do {
      // eslint-disable-next-line no-await-in-loop
      const res = await adminService.getMembers({ status: 'Approved', page: current, pageSize: 200 });
      allMembers = allMembers.concat(res.items || []);
      totalPages = res.totalPages || 1;
      current += 1;
    } while (current <= totalPages);
    setMembers(allMembers);
  };

  const loadSales = async () => {
    setSalesLoading(true);
    try {
      const result = await productService.getSales({ page: salesPage, pageSize: 10 });
      setSalesData(result);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    loadSales();
  }, [salesPage]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', category: '', price: '', stockQuantity: 0, isActive: true });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    reset({ name: p.name, category: p.category || '', price: p.price, stockQuantity: p.stockQuantity, isActive: p.isActive });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        category: data.category || null,
        price: Number(data.price),
        stockQuantity: Number(data.stockQuantity),
        isActive: data.isActive === true || data.isActive === 'true',
      };
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success(t('adminProducts.updated'));
      } else {
        await productService.create(payload);
        toast.success(t('adminProducts.created'));
      }
      setShowModal(false);
      load();
    } catch {
      toast.error(t('adminProducts.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('adminProducts.deleteConfirm'))) return;
    try {
      await productService.delete(id);
      toast.success(t('adminProducts.deleted'));
      load();
    } catch {
      toast.error(t('adminProducts.deleteError'));
    }
  };

  const selectedProductId = watchSale('productId');
  const saleQuantity = Number(watchSale('quantity') || 0);
  const saleUnitPrice = Number(watchSale('unitPrice') || 0);
  const saleTotalAmount = saleQuantity > 0 && saleUnitPrice > 0 ? saleQuantity * saleUnitPrice : 0;

  useEffect(() => {
    if (!selectedProductId) return;
    const selectedProduct = data.items.find((x) => x.id === selectedProductId);
    if (!selectedProduct) return;
    const current = getSaleValues();
    resetSale({
      ...current,
      unitPrice: selectedProduct.price,
    });
  }, [selectedProductId, data.items, resetSale, getSaleValues]);

  const onSubmitSale = async (formData) => {
    setSaleSaving(true);
    try {
      const quantity = Number(formData.quantity);
      const unitPrice = Number(formData.unitPrice);
      const totalAmount = quantity * unitPrice;

      await productService.createSale({
        memberId: formData.memberId,
        productId: formData.productId,
        quantity,
        unitPrice,
        paymentMethod: formData.paymentMethod,
        isPaid: true,
        paidAmount: totalAmount,
        note: formData.note || null,
      });

      toast.success(t('adminProducts.saleCreated'));
      resetSale({
        memberId: '',
        productId: '',
        quantity: 1,
        unitPrice: '',
        paymentMethod: 'Cash',
        note: '',
      });
      load();
      loadSales();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('adminProducts.saleSaveError'));
    } finally {
      setSaleSaving(false);
    }
  };

  const openSaleEdit = (sale) => {
    setEditingSale(sale);
    resetEditSale({
      memberId: sale.memberId || '',
      productId: sale.productId || '',
      quantity: sale.quantity || 1,
      unitPrice: sale.unitPrice || '',
      paymentMethod: sale.paymentMethod || 'Cash',
      isPaid: Boolean(sale.isPaid),
      paidAmount: sale.paidAmount ?? (Number(sale.quantity || 0) * Number(sale.unitPrice || 0)),
      note: sale.note || '',
    });
    setSaleModalOpen(true);
  };

  const onSubmitEditSale = async (formData) => {
    if (!editingSale?.id) return;
    setSaleUpdating(true);
    try {
      const quantity = Number(formData.quantity);
      const unitPrice = Number(formData.unitPrice);
      const totalAmount = quantity * unitPrice;
      const isPaid = Boolean(formData.isPaid);
      const paidAmount = Number(formData.paidAmount ?? totalAmount);

      await productService.updateSale(editingSale.id, {
        memberId: formData.memberId,
        productId: formData.productId,
        quantity,
        unitPrice,
        paymentMethod: formData.paymentMethod,
        isPaid,
        paidAmount: isPaid ? paidAmount : 0,
        note: formData.note || null,
      });

      toast.success(t('common.updated'));
      setSaleModalOpen(false);
      setEditingSale(null);
      load();
      loadSales();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('adminProducts.saleSaveError'));
    } finally {
      setSaleUpdating(false);
    }
  };

  const handleDeleteSale = async (id) => {
    if (!id || !confirm(t('adminProducts.deleteConfirm'))) return;
    try {
      await productService.deleteSale(id);
      toast.success(t('common.deleted'));
      load();
      loadSales();
    } catch (e) {
      toast.error(e?.response?.data?.message || t('adminProducts.deleteError'));
    }
  };

  const editSaleQuantity = Number(watchEditSale('quantity') || 0);
  const editSaleUnitPrice = Number(watchEditSale('unitPrice') || 0);
  const editSaleTotal = editSaleQuantity > 0 && editSaleUnitPrice > 0 ? editSaleQuantity * editSaleUnitPrice : 0;
  const editSaleIsPaid = Boolean(watchEditSale('isPaid'));

  useEffect(() => {
    if (!saleModalOpen || !editSaleIsPaid) return;
    setEditSaleValue('paidAmount', Number(editSaleTotal.toFixed(2)), { shouldValidate: true });
  }, [saleModalOpen, editSaleIsPaid, editSaleTotal, setEditSaleValue]);

  const columns = [
    { key: 'name', header: t('adminProducts.product'), render: (r) => <span className="text-neutral-200 font-medium">{r.name}</span> },
    { key: 'category', header: t('adminProducts.category'), render: (r) => <span className="text-neutral-400">{productCategoryLabel(r.category)}</span> },
    { key: 'price', header: t('adminPackages.price'), render: (r) => <span className="text-emerald-400 font-semibold">{formatCurrency(r.price)}</span> },
    { key: 'stockQuantity', header: t('adminProducts.stock'), render: (r) => (
      <span className={r.stockQuantity === 0 ? 'text-red-400' : 'text-neutral-300'}>{r.stockQuantity}</span>
    )},
    { key: 'isActive', header: t('adminMembers.status'), render: (r) => (
      <Badge variant={r.isActive ? 'active' : 'inactive'}>
        {r.isActive ? t('status.active') : t('status.inactive')}
      </Badge>
    )},
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
            <h1 className="text-2xl font-black text-white">{t('adminProducts.title')}</h1>
            <p className="text-neutral-400 mt-1">{t('adminProducts.subtitle')}</p>
          </div>
          <Button onClick={openCreate}>+ {t('adminProducts.newProduct')}</Button>
        </div>

        {loading ? <div className="h-64 bg-neutral-800 rounded-xl animate-pulse" /> : (
          <>
            <Table columns={columns} data={data.items} />
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}

        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-5">
          <h2 className="text-xl font-bold text-white">{t('adminProducts.salesTitle')}</h2>
          <p className="text-sm text-neutral-400 mt-1 mb-4">{t('adminProducts.salesSubtitle')}</p>

          <form onSubmit={handleSubmitSale(onSubmitSale)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleMember')} *</label>
              <select {...registerSale('memberId', { required: t('common.required') })} className={iClass(saleErrors.memberId)}>
                <option value="">{t('adminProducts.selectMember')}</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
              {saleErrors.memberId && <p className="text-xs text-red-400 mt-1">{saleErrors.memberId.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleProduct')} *</label>
              <select {...registerSale('productId', { required: t('common.required') })} className={iClass(saleErrors.productId)}>
                <option value="">{t('adminProducts.selectProduct')}</option>
                {data.items.filter((p) => p.isActive).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({t('adminProducts.stock')}: {p.stockQuantity})</option>
                ))}
              </select>
              {saleErrors.productId && <p className="text-xs text-red-400 mt-1">{saleErrors.productId.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleQuantity')} *</label>
              <input type="number" {...registerSale('quantity', { required: t('common.required'), min: 1 })} className={iClass(saleErrors.quantity)} />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleUnitPrice')} (₺) *</label>
              <input type="number" step="0.01" {...registerSale('unitPrice', { required: t('common.required'), min: 0.01 })} className={iClass(saleErrors.unitPrice)} />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.method')} *</label>
              <select {...registerSale('paymentMethod', { required: t('common.required') })} className={iClass(saleErrors.paymentMethod)}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{translatePaymentMethod(t, method)}</option>
                ))}
              </select>
              {saleErrors.paymentMethod && <p className="text-xs text-red-400 mt-1">{saleErrors.paymentMethod.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('common.total')} (₺)</label>
              <input
                type="number"
                step="0.01"
                value={saleTotalAmount || ''}
                disabled
                className={iClass()}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleNote')}</label>
              <input type="text" {...registerSale('note')} className={iClass()} />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit" loading={saleSaving}>{t('adminProducts.createSale')}</Button>
            </div>
          </form>

          <div className="mt-6">
            {salesLoading ? <div className="h-40 bg-neutral-800 rounded-xl animate-pulse" /> : (
              <>
                <Table
                  columns={[
                    { key: 'memberName', header: t('adminProducts.saleMember'), render: (r) => <span className="text-neutral-200">{r.memberName}</span> },
                    { key: 'productName', header: t('adminProducts.saleProduct'), render: (r) => <span className="text-neutral-300">{r.productName}</span> },
                    { key: 'quantity', header: t('adminProducts.saleQuantity') },
                    { key: 'totalAmount', header: t('common.total'), render: (r) => formatCurrency(r.totalAmount) },
                    { key: 'paidAmount', header: t('adminProducts.salePaidAmount'), render: (r) => formatCurrency(r.paidAmount) },
                    { key: 'paymentMethod', header: t('adminPayments.method'), render: (r) => <span className="text-neutral-300">{translatePaymentMethod(t, r.paymentMethod)}</span> },
                    {
                      key: 'isPaid',
                      header: t('adminProducts.saleIsPaid'),
                      render: (r) => <Badge variant={r.isPaid ? 'active' : 'pending'}>{r.isPaid ? t('common.yes') : t('common.no')}</Badge>,
                    },
                    {
                      key: 'actions',
                      header: '',
                      render: (r) => (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openSaleEdit(r)}>{t('table.edit')}</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteSale(r.id)}>{t('table.delete')}</Button>
                        </div>
                      ),
                    },
                  ]}
                  data={salesData.items}
                />
                <Pagination page={salesPage} totalPages={salesData.totalPages} onPageChange={setSalesPage} />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('adminProducts.editProduct') : t('adminProducts.newProduct')}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.name')} *</label>
            <input type="text" {...register('name', { required: t('common.required') })} className={iClass(errors.name)} placeholder={t('adminProducts.namePlaceholder')} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.category')}</label>
            <select {...register('category')} className={iClass()}>
              <option value="">{t('adminProducts.selectCategory')}</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {productCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPackages.priceLabel')} (₺) *</label>
              <input type="number" step="0.01" {...register('price', { required: t('common.required'), min: 0 })} className={iClass(errors.price)} />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.stockQuantity')}</label>
              <input type="number" {...register('stockQuantity', { min: 0 })} className={iClass()} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="productActive" {...register('isActive')} className="w-4 h-4 rounded accent-rose-600" />
            <label htmlFor="productActive" className="text-sm text-neutral-300">{t('adminPackages.activeLabel')}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">{t('common.cancel')}</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? t('common.update') : t('common.create')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={saleModalOpen} onClose={() => setSaleModalOpen(false)} title={t('table.edit')} size="lg">
        <form onSubmit={handleSubmitEditSale(onSubmitEditSale)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleMember')} *</label>
            <select {...registerEditSale('memberId', { required: t('common.required') })} className={iClass(editSaleErrors.memberId)}>
              <option value="">{t('adminProducts.selectMember')}</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleProduct')} *</label>
            <select {...registerEditSale('productId', { required: t('common.required') })} className={iClass(editSaleErrors.productId)}>
              <option value="">{t('adminProducts.selectProduct')}</option>
              {data.items.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({t('adminProducts.stock')}: {p.stockQuantity})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleQuantity')} *</label>
            <input type="number" {...registerEditSale('quantity', { required: t('common.required'), min: 1 })} className={iClass(editSaleErrors.quantity)} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleUnitPrice')} (₺) *</label>
            <input type="number" step="0.01" {...registerEditSale('unitPrice', { required: t('common.required'), min: 0.01 })} className={iClass(editSaleErrors.unitPrice)} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPayments.method')} *</label>
            <select {...registerEditSale('paymentMethod', { required: t('common.required') })} className={iClass(editSaleErrors.paymentMethod)}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>{translatePaymentMethod(t, method)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.salePaidAmount')} (₺)</label>
            <input
              type="number"
              step="0.01"
              {...registerEditSale('paidAmount', { min: 0 })}
              className={iClass(editSaleErrors.paidAmount)}
              disabled={!editSaleIsPaid}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Otomatik toplam: {formatCurrency(editSaleTotal || 0)}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" {...registerEditSale('isPaid')} className="w-4 h-4 rounded accent-rose-600" />
              {t('adminProducts.saleIsPaid')}
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminProducts.saleNote')}</label>
            <input type="text" {...registerEditSale('note')} className={iClass()} />
          </div>
          <div className="md:col-span-2 flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setSaleModalOpen(false)} className="flex-1">{t('common.cancel')}</Button>
            <Button type="submit" loading={saleUpdating} className="flex-1">{t('common.update')}</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

function iClass(error) {
  return `w-full px-4 py-2.5 rounded-xl bg-neutral-900 border text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all ${error ? 'border-red-500' : 'border-neutral-700'}`;
}
