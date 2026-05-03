import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { adminService } from '../../services/adminService';

export default function AdminPasswordToolsPage() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const form = useForm();

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getMembers({ page: 1, pageSize: 200 });
      setMembers(data?.items || []);
    } catch {
      toast.error(t('adminPasswordTools.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;

    return members.filter((m) => {
      const fullName = `${m.firstName || ''} ${m.lastName || ''}`.trim().toLowerCase();
      const email = (m.email || '').toLowerCase();
      const phone = (m.phoneNumber || '').toLowerCase();
      return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [members, search]);

  const onSubmit = async ({ memberId, newPassword, confirmPassword }) => {
    if (!memberId) {
      toast.error(t('adminPasswordTools.selectMemberError'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('adminPasswordTools.confirmMismatch'));
      return;
    }
    if (!confirm(t('adminPasswordTools.confirmReset'))) return;

    setSavingId(memberId);
    try {
      await adminService.resetMemberPassword(memberId, { newPassword });
      toast.success(t('adminPasswordTools.resetSuccess'));
      form.reset({ memberId: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error(t('adminPasswordTools.resetError'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminPasswordTools.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminPasswordTools.subtitle')}</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-300 text-sm">{t('adminPasswordTools.securityNote')}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPasswordTools.search')}</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPasswordTools.member')}</label>
              <select {...form.register('memberId', { required: true })} className={inputClass} disabled={loading}>
                <option value="">{t('adminPasswordTools.selectMember')}</option>
                {filteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {`${m.firstName || ''} ${m.lastName || ''}`.trim()} - {m.phoneNumber || '—'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPasswordTools.newPassword')}</label>
                <input
                  type="password"
                  {...form.register('newPassword', { required: true, minLength: 6 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminPasswordTools.confirmPassword')}</label>
                <input
                  type="password"
                  {...form.register('confirmPassword', { required: true, minLength: 6 })}
                  className={inputClass}
                />
              </div>
            </div>

            <Button type="submit" loading={savingId !== null}>
              {t('adminPasswordTools.resetButton')}
            </Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all';
