import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { getServicesByAgency, type AgencyCode } from '../../config/services';
import DistrictSectorSelect, { formatLocation } from '../../components/DistrictSectorSelect';

const AGENCIES: { code: AgencyCode; labelKey: string }[] = [
  { code: 'REG', labelKey: 'home.reg' },
  { code: 'WASAC', labelKey: 'home.wasac' },
  { code: 'EMERGENCY', labelKey: 'home.emergency' },
];

interface ReportForm {
  agency: AgencyCode | '';
  serviceType: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  description: string;
}

export default function CitizenReport() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportForm>({
    defaultValues: { agency: '', district: '', sector: '', cell: '', village: '' },
    mode: 'onBlur',
  });

  const selectedAgency = watch('agency');
  const district = watch('district');
  const sector = watch('sector');
  const cell = watch('cell');
  const village = watch('village');
  const agencyServices = selectedAgency ? getServicesByAgency(selectedAgency) : [];

  const onSubmit = async (data: ReportForm) => {
    setError('');
    if (!data.district || !data.sector) {
      setError(t('auth.districtSectorRequired'));
      return;
    }
    setLoading(true);

    try {
      const { agency: _, district: d, sector: s, cell: c, village: v, ...rest } = data;
      const location = formatLocation(d, s, c, v);
      await api.post('/reports', { ...rest, location });
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
              className="input select"
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
              className="input select"
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
            districtError={errors.district?.message}
            sectorError={errors.sector?.message}
          />

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
