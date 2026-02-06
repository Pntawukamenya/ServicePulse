import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { useAuthStore } from '../../store/authStore';
import { getServicesByAgency, getServiceLabelKey } from '../../config/services';
import type { AgencyCode } from '../../config/services';
import LocationInput from '@/components/LocationInput';

interface AlertForm {
  serviceType: string;
  location?: string;
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
  created_at: string;
}

export default function AgencyAlerts() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const agencyServices = getServicesByAgency((user?.agencyCode as AgencyCode) || 'REG');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlertForm>({
    defaultValues: {
      targetAudience: 'all',
    },
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/agency');
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
      await api.post('/notifications', {
        serviceType: data.serviceType,
        location: data.targetAudience === 'location_based' ? data.location : undefined,
        message: data.message,
        targetAudience: data.targetAudience,
      });
      setSuccess(t('agency.alertSuccess'));
      reset();
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.error || t('agency.alertFailed'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('agency.createAlert')}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{t('agency.newAlert')}</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium mb-1">
                {t('citizen.serviceType')} *
              </label>
              <select
                id="serviceType"
                {...register('serviceType', { required: t('agency.serviceTypeRequired') })}
                className="input"
              >
                <option value="">{t('citizen.selectService')}</option>
                {agencyServices.map((s) => (
                  <option key={s.code} value={s.code}>
                    {t(s.labelKey)}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.serviceType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium mb-1">
                {t('agency.targetAudience')} *
              </label>
              <select
                id="targetAudience"
                {...register('targetAudience', { required: t('agency.targetAudienceRequired') })}
                className="input"
              >
                <option value="all">{t('agency.allCitizens')}</option>
                <option value="location_based">{t('agency.locationBased')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                {t('citizen.location')} ({t('agency.locationBased').toLowerCase()})
              </label>
              <LocationInput
                id="location"
                {...register('location')}
                placeholder={t('agency.placeholderLocation')}
              />
            </div>

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
                className="input"
                placeholder={t('agency.placeholderMessage')}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
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

        <div>
          <h2 className="text-xl font-semibold mb-4">{t('agency.recentAlerts')}</h2>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">{t('agency.noAlerts')}</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{getServiceLabelKey(notification.service_type) ? t(getServiceLabelKey(notification.service_type)!) : notification.service_type}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{notification.message}</p>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{t('agency.target')}: {notification.target_audience === 'all' ? t('agency.all') : notification.location}</span>
                    <span>
                      {t('agency.delivered')}: {notification.delivery_count}/{notification.total_recipients}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
