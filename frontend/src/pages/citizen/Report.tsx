import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { getServicesByAgency, type AgencyCode } from '../../config/services';
import LocationInput from '@/components/LocationInput';

const AGENCIES: { code: AgencyCode; labelKey: string }[] = [
  { code: 'REG', labelKey: 'home.reg' },
  { code: 'WASAC', labelKey: 'home.wasac' },
  { code: 'EMERGENCY', labelKey: 'home.emergency' },
];

interface ReportForm {
  agency: AgencyCode | '';
  serviceType: string;
  location: string;
  sector?: string;
  cell?: string;
  description: string;
}

export default function CitizenReport() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportForm>({
    defaultValues: { agency: '' },
  });

  const selectedAgency = watch('agency');
  const agencyServices = selectedAgency ? getServicesByAgency(selectedAgency) : [];

  const onSubmit = async (data: ReportForm) => {
    setError('');
    setLoading(true);

    try {
      const { agency: _, ...payload } = data;
      await api.post('/reports', payload);
      navigate('/citizen/reports');
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.submitReportFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('citizen.report')}</h1>

      <div className="card">
        {error && (
          <div className="mb-4 alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="agency" className="block text-sm font-medium mb-1">
              {t('citizen.agency')} *
            </label>
            <select
              id="agency"
              {...register('agency', {
                required: t('citizen.agencyRequired'),
                onChange: () => setValue('serviceType', ''),
              })}
              className="input"
            >
              <option value="">{t('citizen.selectAgency')}</option>
              {AGENCIES.map((a) => (
                <option key={a.code} value={a.code}>{t(a.labelKey)}</option>
              ))}
            </select>
            {errors.agency && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.agency.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium mb-1">
              {t('citizen.serviceType')} *
            </label>
            <select
              id="serviceType"
              {...register('serviceType', { required: t('citizen.serviceTypeRequired') })}
              className="input"
              disabled={!selectedAgency}
            >
              <option value="">{t('citizen.selectService')}</option>
              {agencyServices.map((s) => (
                <option key={s.code} value={s.code}>{t(s.labelKey)}</option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.serviceType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              {t('citizen.location')} *
            </label>
            <LocationInput
                id="location"
                {...register('location', { required: t('citizen.locationRequired') })}
                placeholder={t('citizen.placeholderLocation')}
              />
            {errors.location && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.location.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sector" className="block text-sm font-medium mb-1">
                {t('citizen.sector')}
              </label>
              <input
                id="sector"
                type="text"
                {...register('sector')}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="cell" className="block text-sm font-medium mb-1">
                {t('citizen.cell')}
              </label>
              <input
                id="cell"
                type="text"
                {...register('cell')}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              {t('citizen.description')} *
            </label>
            <textarea
              id="description"
              rows={5}
              {...register('description', { required: t('citizen.descriptionRequired'), minLength: { value: 10, message: t('citizen.descriptionMinLength') } })}
              className="input"
              placeholder={t('citizen.placeholderDescription')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.description.message}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? t('citizen.submitting') : t('common.submit')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
