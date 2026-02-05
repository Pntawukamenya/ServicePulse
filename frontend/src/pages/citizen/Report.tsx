import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';

interface ReportForm {
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
  const { register, handleSubmit, formState: { errors } } = useForm<ReportForm>();

  const onSubmit = async (data: ReportForm) => {
    setError('');
    setLoading(true);

    try {
      await api.post('/reports', data);
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
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium mb-1">
              {t('citizen.serviceType')} *
            </label>
            <select
              id="serviceType"
              {...register('serviceType', { required: t('citizen.serviceTypeRequired') })}
              className="input"
            >
              <option value="">{t('citizen.selectService')}</option>
              <option value="REG">{t('home.reg')}</option>
              <option value="WASAC">{t('home.wasac')}</option>
              <option value="EMERGENCY">{t('home.emergency')}</option>
            </select>
            {errors.serviceType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.serviceType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              {t('citizen.location')} *
            </label>
            <input
              id="location"
              type="text"
              {...register('location', { required: t('citizen.locationRequired') })}
              className="input"
              placeholder={t('citizen.placeholderLocation')}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
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
