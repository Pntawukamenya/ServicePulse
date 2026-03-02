import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { useAuthStore } from '../../store/authStore';
import { getServicesByAgency, getServiceLabelKey } from '../../config/services';
import type { AgencyCode } from '../../config/services';
import DistrictSectorSelect, { formatLocation } from '../../components/DistrictSectorSelect';
import AlertCard from '../../components/AlertCard';

interface AlertForm {
  serviceType: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  message: string;
  targetAudience: 'all' | 'location_based';
}

interface Notification {
  id: string;
  service_type: string;
  location: string | null;
  message: string;
  target_audience: string;
  delivery_count: number;
  total_recipients: number;
  created_at?: string;
  createdAt?: string;
}

export default function AgencyAlerts() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const agencyServices = getServicesByAgency((user?.agencyCode as AgencyCode) || 'REG');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<AlertForm>({
    defaultValues: {
      targetAudience: 'all',
      district: '',
      sector: '',
      cell: '',
      village: '',
    },
  });

  const targetAudience = watch('targetAudience');
  const district = watch('district');
  const sector = watch('sector');
  const cell = watch('cell');
  const village = watch('village');

  useEffect(() => {
    if (pathname !== '/agency/alerts') return;
    fetchNotifications();
  }, [pathname]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/agency');
      const role = user?.role || '';
      const isAgencyAdmin = ['agency_admin', 'super_admin', 'admin'].includes(role);
      // For now, all alerts are visible; priority is what matters most for non-admins.
      // If we ever track alert completion, we can filter here similar to reports.
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const onSubmit = async (data: AlertForm) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const location = data.targetAudience === 'location_based' && data.district && data.sector
        ? formatLocation(data.district, data.sector, data.cell, data.village)
        : undefined;
      await api.post('/notifications', {
        serviceType: data.serviceType,
        location,
        message: data.message,
        targetAudience: data.targetAudience,
      });
      setSuccess(t('agency.alertSuccess'));
      reset({ serviceType: '', district: '', sector: '', cell: '', village: '', message: '', targetAudience: 'all' });
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.error || t('agency.alertFailed'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{t('agency.createAlert')}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Send SMS alerts to citizens about service disruptions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('agency.recentAlerts')}</h2>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="card text-center py-12 px-6 border border-neutral-200 dark:border-neutral-700">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">{t('agency.noAlerts')}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Create your first alert to notify citizens</p>
              </div>
            ) : (
              <div className="space-y-4 animate-stagger">
                {notifications.slice(0, 5).map((notification) => (
                  <AlertCard
                    key={notification.id}
                    id={notification.id}
                    serviceType={notification.service_type}
                    displayLabel={getServiceLabelKey(notification.service_type) ? t(getServiceLabelKey(notification.service_type)!) : undefined}
                    message={notification.message}
                    targetAudience={notification.target_audience}
                    targetLabel={t('agency.target')}
                    targetValue={notification.target_audience === 'all' ? t('agency.all') : (notification.location || '—')}
                    deliveryCount={notification.delivery_count}
                    totalRecipients={notification.total_recipients}
                    deliveredLabel={t('agency.delivered')}
                    formatDate={formatDate}
                    created_at={notification.created_at}
                    createdAt={notification.createdAt}
                    priority_level={(notification as any).priority_level}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card self-start">
          <h2 className="text-xl font-semibold mb-4">{t('agency.newAlert')}</h2>

          {error && (
            <div className="mb-4 alert-error">{error}</div>
          )}

          {success && (
            <div className="mb-4 alert-success">{success}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium mb-1">
                {t('citizen.serviceType')} *
              </label>
              <select
                id="serviceType"
                {...register('serviceType', { required: t('agency.serviceTypeRequired') })}
                className="input select"
              >
                <option value="">{t('citizen.selectService')}</option>
                {agencyServices.map((s) => (
                  <option key={s.code} value={s.code}>
                    {t(s.labelKey)}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.serviceType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium mb-1">
                {t('agency.targetAudience')} *
              </label>
              <select
                id="targetAudience"
                {...register('targetAudience', { required: t('agency.targetAudienceRequired') })}
                className="input select"
              >
                <option value="all">{t('agency.allCitizens')}</option>
                <option value="location_based">{t('agency.locationBased')}</option>
              </select>
            </div>

            {targetAudience === 'location_based' && (
              <DistrictSectorSelect
                district={district}
                sector={sector}
                cell={cell}
                village={village}
                onDistrictChange={(v) => setValue('district', v)}
                onSectorChange={(v) => setValue('sector', v)}
                onCellChange={(v) => setValue('cell', v)}
                onVillageChange={(v) => setValue('village', v)}
                districtLabel={t('auth.district')}
                sectorLabel={t('auth.sector')}
                cellLabel={t('auth.cell')}
                villageLabel={t('auth.village')}
                districtRequired
                sectorRequired
                includeCellAndVillage
              />
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                {t('agency.message')} * (10-160)
              </label>
              <textarea
                id="message"
                rows={4}
                {...register('message', {
                  required: t('agency.messageRequired'),
                  minLength: { value: 10, message: t('agency.messageMinLength') },
                  maxLength: { value: 160, message: t('agency.messageMaxLength') },
                })}
                className="input py-4 text-center placeholder:text-center resize-none"
                placeholder={t('agency.placeholderMessage')}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? t('agency.sending') : t('agency.sendAlert')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
