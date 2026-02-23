import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { getServicesByAgency, type AgencyCode } from '../../config/services';
import DistrictSectorSelect, { formatLocation } from '../../components/DistrictSectorSelect';
import { uploadToCloudinaryWithMeta, isCloudinaryConfigured } from '../../lib/cloudinary';

const AGENCIES: { code: AgencyCode; labelKey: string }[] = [
  { code: 'REG', labelKey: 'home.reg' },
  { code: 'WASAC', labelKey: 'home.wasac' },
  { code: 'EMERGENCY', labelKey: 'home.emergency' },
];

const MAX_ATTACHMENTS = 5;
const MAX_FILE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface ReportForm {
  agency: AgencyCode | '';
  serviceType: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical' | '';
  address: string;
}

interface AttachmentMeta {
  url: string;
  public_id?: string;
  filename: string;
  mime_type: string;
  size: number;
}

export default function CitizenReport() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportForm>({
    defaultValues: { agency: '', district: '', sector: '', cell: '', village: '', priority: 'medium', address: '' },
    mode: 'onBlur',
  });

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setError('');
      },
      () => setError('Could not get your location. You can still submit without it.')
    );
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !isCloudinaryConfigured()) return;
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setError(`Maximum ${MAX_ATTACHMENTS} photos allowed.`);
      return;
    }
    setUploading(true);
    setError('');
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          setError(`File ${file.name} is too large. Max ${MAX_FILE_MB}MB.`);
          continue;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`File ${file.name} is not a supported image type.`);
          continue;
        }
        const result = await uploadToCloudinaryWithMeta(file);
        setAttachments((prev) => [...prev, { url: result.url, public_id: result.public_id, filename: file.name, mime_type: file.type, size: file.size }]);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
      const { agency: _, district: d, sector: s, cell: c, village: v, priority, address, ...rest } = data;
      const location = formatLocation(d, s, c, v);
      const payload: Record<string, unknown> = { ...rest, location, sector: s || undefined, cell: c || undefined };
      if (priority && priority !== 'medium') payload.priority = priority;
      if (address?.trim()) payload.address = address.trim();
      if (latitude != null && longitude != null) {
        payload.latitude = latitude;
        payload.longitude = longitude;
      }
      if (attachments.length > 0) payload.attachments = attachments;
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
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              {t('citizen.priority')} ({t('citizen.priorityOptional')})
            </label>
            <select id="priority" {...register('priority')} className="input select">
              <option value="medium">{t('citizen.priorityMedium')}</option>
              <option value="low">{t('citizen.priorityLow')}</option>
              <option value="high">{t('citizen.priorityHigh')}</option>
              <option value="critical">{t('citizen.priorityCritical')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              {t('citizen.address')}
            </label>
            <input id="address" type="text" {...register('address')} className="input" placeholder="" />
          </div>

          <div>
            <p className="block text-sm font-medium mb-1">Location (GPS)</p>
            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" onClick={useMyLocation} className="btn btn-outline text-sm">
                {t('citizen.useMyLocation')}
              </button>
              {latitude != null && longitude != null && (
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
              )}
            </div>
          </div>

          {isCloudinaryConfigured() && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('citizen.attachments')}</label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{t('citizen.attachmentsHint')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <div key={i} className="relative group">
                    <img src={a.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
                    <button type="button" onClick={() => removeAttachment(i)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove">×</button>
                  </div>
                ))}
                {attachments.length < MAX_ATTACHMENTS && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 hover:border-primary-500 hover:text-primary-500 transition-colors">
                    {uploading ? '...' : '+'}
                  </button>
                )}
              </div>
            </div>
          )}

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
              disabled={loading || uploading}
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
