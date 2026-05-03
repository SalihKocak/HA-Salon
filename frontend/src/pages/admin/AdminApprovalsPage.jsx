import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { adminService } from '../../services/adminService';
import Button from '../../components/ui/Button';
import { formatDate } from '../../utils/formatters';
import { translateFitnessGoal } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function AdminApprovalsPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { t } = useTranslation();

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPendingMembers();
      setMembers(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await adminService.approveMember(id);
      toast.success(t('adminApprovals.approved'));
      load();
    } catch {
      toast.error(t('common.error'));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm(t('adminApprovals.rejectConfirm'))) return;
    setActionId(id);
    try {
      await adminService.rejectMember(id);
      toast.success(t('adminApprovals.rejected'));
      load();
    } catch {
      toast.error(t('common.error'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminApprovals.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminApprovals.subtitle')}</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-neutral-800 rounded-xl animate-pulse" />)}
          </div>
        ) : members.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-12 text-center">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-neutral-300 font-bold text-lg">{t('adminApprovals.noApplications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-neutral-400 text-sm">{members.length} {t('adminApprovals.title').toLowerCase()}</p>
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-[#1a1a1a] border border-amber-600/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400 font-black text-lg flex-shrink-0">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-neutral-100 font-bold">{member.firstName} {member.lastName}</p>
                    <p className="text-neutral-400 text-sm">{member.email}</p>
                    <p className="text-neutral-500 text-sm">{member.phoneNumber}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {member.goal && (
                        <span className="text-xs bg-neutral-800 text-neutral-400 rounded-lg px-2 py-1">
                          {t('adminApprovals.goal')} {translateFitnessGoal(t, member.goal)}
                        </span>
                      )}
                      {member.weight && (
                        <span className="text-xs bg-neutral-800 text-neutral-400 rounded-lg px-2 py-1">
                          {member.weight} kg
                        </span>
                      )}
                      <span className="text-xs text-neutral-500">{t('adminApprovals.applied')} {formatDate(member.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(member.id)}
                    loading={actionId === member.id}
                    disabled={actionId === member.id}
                  >
                    {t('adminApprovals.reject')}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(member.id)}
                    loading={actionId === member.id}
                    disabled={actionId === member.id}
                  >
                    {t('adminApprovals.approve')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
