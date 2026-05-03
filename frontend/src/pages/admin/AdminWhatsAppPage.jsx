import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../layouts/AdminLayout';
import { whatsappService } from '../../services/adminService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/formatters';

export default function AdminWhatsAppPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const settingsForm = useForm();
  const templateForm = useForm();

  const load = async () => {
    try {
      const [s, tpls, l] = await Promise.all([
        whatsappService.getSettings(),
        whatsappService.getTemplates(),
        whatsappService.getLogs({ page: 1, pageSize: 20 }),
      ]);
      setSettings(s);
      setTemplates(tpls || []);
      setLogs(l || []);

      if (s) {
        settingsForm.reset({
          phoneNumber: s.phoneNumber || '',
          apiBaseUrl: s.apiBaseUrl || '',
          accessToken: '',
          isEnabled: s.isEnabled,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSaveSettings = async (data) => {
    setSaving(true);
    try {
      await whatsappService.updateSettings({
        phoneNumber: data.phoneNumber || null,
        apiBaseUrl: data.apiBaseUrl || null,
        accessToken: data.accessToken || null,
        isEnabled: data.isEnabled,
      });
      toast.success(t('adminWhatsApp.settingsSaved'));
      load();
    } catch {
      toast.error(t('adminWhatsApp.settingsError'));
    } finally {
      setSaving(false);
    }
  };

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    templateForm.reset({ name: '', type: 'Welcome', content: '', isActive: true });
    setShowTemplateModal(true);
  };

  const openEditTemplate = (tpl) => {
    setEditingTemplate(tpl);
    templateForm.reset({ name: tpl.name, type: tpl.type, content: tpl.content, isActive: tpl.isActive });
    setShowTemplateModal(true);
  };

  const onSaveTemplate = async (data) => {
    setSavingTemplate(true);
    try {
      if (editingTemplate) {
        await whatsappService.updateTemplate(editingTemplate.id, data);
        toast.success(t('adminWhatsApp.templateUpdated'));
      } else {
        await whatsappService.createTemplate(data);
        toast.success(t('adminWhatsApp.templateCreated'));
      }
      setShowTemplateModal(false);
      load();
    } catch {
      toast.error(t('adminWhatsApp.templateError'));
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm(t('adminWhatsApp.deleteTemplateConfirm'))) return;
    try {
      await whatsappService.deleteTemplate(id);
      toast.success(t('adminWhatsApp.templateDeleted'));
      load();
    } catch {
      toast.error(t('adminWhatsApp.templateDeleteError'));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminWhatsApp.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminWhatsApp.subtitle')}</p>
        </div>

        {/* Status Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">{t('adminWhatsApp.notActive')}</p>
            <p className="text-amber-400/70 text-xs mt-1">{t('adminWhatsApp.notActiveDesc')}</p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-neutral-200 font-semibold mb-5">{t('adminWhatsApp.apiSettings')}</h3>
          <form onSubmit={settingsForm.handleSubmit(onSaveSettings)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminWhatsApp.phoneNumber')}</label>
                <input type="text" {...settingsForm.register('phoneNumber')} placeholder="+90 555 000 0000"
                  className={iClass()} />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">{t('adminWhatsApp.apiBaseUrl')}</label>
                <input type="url" {...settingsForm.register('apiBaseUrl')} placeholder="https://api.whatsapp-provider.com"
                  className={iClass()} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminWhatsApp.accessToken')}</label>
              <input type="password" {...settingsForm.register('accessToken')} placeholder={t('adminWhatsApp.accessTokenPlaceholder')}
                className={iClass()} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="waEnabled" {...settingsForm.register('isEnabled')} className="w-4 h-4 accent-rose-600" />
              <label htmlFor="waEnabled" className="text-sm text-neutral-300">{t('adminWhatsApp.enableIntegration')}</label>
            </div>
            <Button type="submit" loading={saving}>{t('adminWhatsApp.saveSettings')}</Button>
          </form>
        </div>

        {/* Templates */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-neutral-200 font-semibold">{t('adminWhatsApp.messageTemplates')}</h3>
            <Button size="sm" onClick={openCreateTemplate}>+ {t('adminWhatsApp.newTemplate')}</Button>
          </div>

          {templates.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-6">{t('adminWhatsApp.noTemplates')}</p>
          ) : (
            <div className="space-y-3">
              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-neutral-900 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-neutral-200 font-medium text-sm">{tpl.name}</span>
                      <Badge variant={tpl.isActive ? 'active' : 'inactive'} className="text-xs">{tpl.type}</Badge>
                    </div>
                    <p className="text-neutral-400 text-xs leading-relaxed truncate">{tpl.content}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openEditTemplate(tpl)}>{t('table.edit')}</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteTemplate(tpl.id)}>{t('table.delete')}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Logs */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-neutral-200 font-semibold mb-5">{t('adminWhatsApp.messageLogs')}</h3>
          {logs.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-6">{t('adminWhatsApp.noLogs')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-900">
                    {[
                      t('adminWhatsApp.logPhone'),
                      t('adminWhatsApp.logTemplate'),
                      t('adminMembers.status'),
                      t('adminWhatsApp.logSentAt'),
                      t('adminWhatsApp.logError'),
                    ].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-neutral-800/30">
                      <td className="px-3 py-2.5 text-sm text-neutral-300">{l.phoneNumber}</td>
                      <td className="px-3 py-2.5 text-sm text-neutral-400">{l.templateName || '—'}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={l.status === 'Sent' ? 'sent' : 'failed'}>
                          {l.status === 'Sent' ? t('status.sent') : t('status.failed')}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-neutral-400">{l.sentAt ? formatDateTime(l.sentAt) : '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-red-400 max-w-xs truncate">{l.errorMessage || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title={editingTemplate ? t('adminWhatsApp.editTemplate') : t('adminWhatsApp.newTemplate')}>
        <form onSubmit={templateForm.handleSubmit(onSaveTemplate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminWhatsApp.templateName')} *</label>
              <input type="text" {...templateForm.register('name', { required: true })} className={iClass()} placeholder={t('adminWhatsApp.templateNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">{t('adminWhatsApp.templateType')} *</label>
              <select {...templateForm.register('type', { required: true })} className={iClass()}>
                <option value="Welcome">Welcome</option>
                <option value="Approval">Approval</option>
                <option value="Reminder">Reminder</option>
                <option value="Expiry">Expiry</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">{t('adminWhatsApp.templateContent')} *</label>
            <textarea {...templateForm.register('content', { required: true })} rows={4} className={`${iClass()} resize-none`}
              placeholder="Hi {{name}}, welcome to HA Salon Exclusive! ..." />
            <p className="text-xs text-neutral-500 mt-1">{t('adminWhatsApp.templateHint')}</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="tplActive" {...templateForm.register('isActive')} className="w-4 h-4 accent-rose-600" />
            <label htmlFor="tplActive" className="text-sm text-neutral-300">{t('adminPackages.activeLabel')}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowTemplateModal(false)} className="flex-1">{t('common.cancel')}</Button>
            <Button type="submit" loading={savingTemplate} className="flex-1">{editingTemplate ? t('common.update') : t('common.create')}</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

function iClass() {
  return 'w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all';
}
