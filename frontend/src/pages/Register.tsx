import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n/useTranslation';
import PasswordInput from '../components/PasswordInput';
import DistrictSectorSelect from '../components/DistrictSectorSelect';

type IdentifierType = 'email' | 'phone';

interface RegisterForm {
  identifier: string;
  password: string;
  role: 'citizen' | 'agency_employee';
  agencyCode?: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  termsAccepted: boolean;
}

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpIdentifierType, setOtpIdentifierType] = useState<IdentifierType>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: {
      role: 'citizen',
      district: '',
      sector: '',
      cell: '',
      village: '',
      termsAccepted: false,
    },
  });

  const district = watch('district');
  const sector = watch('sector');
  const cell = watch('cell');
  const village = watch('village');

  const onSubmit = async (data: RegisterForm) => {
    setError('');

    if (!data.termsAccepted) {
      setError(t('authErrors.mustAcceptTerms'));
      return;
    }

    if (data.role === 'citizen' && (!data.district || !data.sector)) {
      setError(t('auth.districtSectorRequired'));
      return;
    }

    setLoading(true);

    try {
      const identifierType: IdentifierType = data.identifier.includes('@') ? 'email' : 'phone';
      const payload: Record<string, unknown> = {
        identifier: data.identifier.trim(),
        identifierType,
        password: data.password,
        role: data.role,
        termsAccepted: data.termsAccepted,
      };
      if (data.role === 'agency_employee' && data.agencyCode) {
        payload.agencyCode = data.agencyCode;
      }
      if (data.role === 'citizen' && data.district && data.sector) {
        payload.district = data.district;
        payload.sector = data.sector;
        if (data.cell) payload.cell = data.cell;
        if (data.village) payload.village = data.village;
      }

      const response = await api.post('/auth/register', payload);

      if (response.data.requiresOtp) {
        setNeedsOtp(true);
        setOtpIdentifier(data.identifier.trim());
        setOtpIdentifierType(identifierType);
      } else {
        setShowPendingApproval(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('authErrors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) return;
    setError('');
    setOtpLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        identifier: otpIdentifier,
        identifierType: otpIdentifierType,
        otp: otpCode,
      });
      setAuth(response.data.user, response.data.token);
      navigate('/citizen/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired code');
    } finally {
      setOtpLoading(false);
    }
  };

  if (showPendingApproval) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/30 via-neutral-50 to-neutral-50 dark:from-primary-950/20 dark:via-neutral-950 dark:to-neutral-950">
        <div className="w-full max-w-lg mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="auth-card">
            <div className="flex gap-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center" aria-hidden>
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('auth.pendingApprovalTitle')}</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{t('auth.pendingApprovalBody')}</p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{t('auth.pendingApprovalNext')}</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800 transition-colors">
                {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (needsOtp) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/30 via-neutral-50 to-neutral-50 dark:from-primary-950/20 dark:via-neutral-950 dark:to-neutral-950">
        <div className="w-full max-w-lg mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="auth-card">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.verifyOtp')}</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('auth.otpSent')} {otpIdentifierType === 'email' ? t('auth.email') : t('auth.phoneNumber')}
            </p>

            {error && (
              <div className="mb-4 alert-error">{error}</div>
            )}

            <form onSubmit={onVerifyOtp} className="space-y-4">
              <div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="input py-2.5 text-center text-lg tracking-widest"
                  placeholder="000000"
                  aria-label={t('auth.otpCode')}
                />
              </div>
              <button type="submit" disabled={otpLoading || otpCode.length !== 6} className="w-full btn btn-primary py-3 rounded-xl font-semibold">
                {otpLoading ? t('common.loading') : t('auth.verify')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/30 via-neutral-50 to-neutral-50 dark:from-primary-950/20 dark:via-neutral-950 dark:to-neutral-950">
      <div className="w-full max-w-lg mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="auth-card">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.register')}</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <select id="role" {...register('role')} className="select-location" aria-label={t('auth.accountType')}>
                <option value="citizen">{t('auth.citizen')}</option>
                <option value="agency_employee">{t('auth.agency')}</option>
              </select>
            </div>

            {watch('role') === 'agency_employee' && (
              <div>
                <select id="agencyCode" {...register('agencyCode')} className="select-location" aria-label={t('auth.selectAgency')}>
                  <option value="">{t('auth.selectAgency')}</option>
                  <option value="REG">{t('home.reg')}</option>
                  <option value="WASAC">{t('home.wasac')}</option>
                  <option value="EMERGENCY">{t('home.emergency')}</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.emailOrPhone')}
              </label>
              <input
                id="identifier"
                type="text"
                inputMode="text"
                autoComplete="username"
                {...register('identifier', { required: true })}
                className="input w-full"
                placeholder={t('auth.emailOrPhone')}
                aria-label={t('auth.emailOrPhone')}
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-error-600 dark:text-error-400">{t('common.required')}</p>
              )}
            </div>

            <div>
              <PasswordInput
                id="password"
                {...register('password', { required: true, minLength: 6 })}
                placeholder={t('auth.password')}
                aria-label={t('auth.password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-error-600 dark:text-error-400">{t('auth.password')} {t('common.required')}</p>
              )}
            </div>

            {watch('role') === 'citizen' && (
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
            )}

            <div className="flex items-start gap-3">
              <input
                id="termsAccepted"
                type="checkbox"
                {...register('termsAccepted', { required: true })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="termsAccepted" className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                {t('auth.termsAcceptPrefix')}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">{t('common.terms')}</Link>
                {t('auth.termsAcceptSuffix')}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">{t('common.privacy')}</Link>
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-xs text-error-600 dark:text-error-400">{t('authErrors.mustAcceptTerms')}</p>
            )}

            <button type="submit" disabled={loading} className="w-full btn btn-primary rounded-xl text-base font-semibold mt-1">
              {loading ? t('auth.creatingAccount') : t('auth.register')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
