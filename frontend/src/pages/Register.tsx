import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n/useTranslation';
import PasswordInput from '../components/PasswordInput';

type IdentifierType = 'email' | 'phone';

interface RegisterForm {
  identifier: string;
  identifierType: IdentifierType;
  password: string;
  confirmPassword: string;
  role: 'citizen' | 'agency_employee';
  agencyCode?: string;
  termsAccepted: boolean;
}

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      identifierType: 'email',
      termsAccepted: false,
    },
  });

  const identifierType = watch('identifierType');

  const onSubmit = async (data: RegisterForm) => {
    setError('');

    if (data.password !== data.confirmPassword) {
      setError(t('authErrors.passwordsNoMatch'));
      return;
    }

    if (!data.termsAccepted) {
      setError(t('authErrors.mustAcceptTerms'));
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        identifier: data.identifier.trim(),
        identifierType: data.identifierType,
        password: data.password,
        role: data.role,
        termsAccepted: data.termsAccepted,
      };
      if (data.role === 'agency_employee' && data.agencyCode) {
        payload.agencyCode = data.agencyCode;
      }

      const response = await api.post('/auth/register', payload);

      if (response.data.requiresOtp) {
        setNeedsOtp(true);
        setOtpIdentifier(data.identifier.trim());
        setOtpIdentifierType(data.identifierType);
      } else {
        // Agency employee - pending approval
        setError(response.data.message || t('auth.pendingApproval'));
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

  if (needsOtp) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-950/20 dark:to-transparent">
        <div className="w-full max-w-lg mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="auth-card">
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.verifyOtp')}</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('auth.otpSent')} {otpIdentifierType === 'email' ? t('auth.email') : t('auth.phoneNumber')}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-950/20 dark:to-transparent">
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
              <select id="role" {...register('role')} className="input py-2.5" aria-label={t('auth.accountType')}>
                <option value="citizen">{t('auth.citizen')}</option>
                <option value="agency_employee">{t('auth.agency')}</option>
              </select>
            </div>

            {watch('role') === 'agency_employee' && (
              <div>
                <select id="agencyCode" {...register('agencyCode')} className="input py-2.5" aria-label={t('auth.selectAgency')}>
                  <option value="">{t('auth.selectAgency')}</option>
                  <option value="REG">REG - {t('home.reg')}</option>
                  <option value="WASAC">WASAC - {t('home.wasac')}</option>
                  <option value="EMERGENCY">{t('home.emergency')}</option>
                </select>
              </div>
            )}

            <div>
              <input type="hidden" {...register('identifierType')} />
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setValue('identifierType', 'email')}
                  className={`flex-1 text-sm py-2 rounded-lg ${identifierType === 'email' ? 'btn btn-primary' : 'btn btn-outline'}`}
                >
                  {t('auth.email')}
                </button>
                <button
                  type="button"
                  onClick={() => setValue('identifierType', 'phone')}
                  className={`flex-1 text-sm py-2 rounded-lg ${identifierType === 'phone' ? 'btn btn-primary' : 'btn btn-outline'}`}
                >
                  {t('auth.phoneNumber')}
                </button>
              </div>
              <input
                type={identifierType === 'email' ? 'email' : 'tel'}
                {...register('identifier', { required: true })}
                className="input py-2.5"
                placeholder={identifierType === 'email' ? 'you@example.com' : '+250 788 123 456'}
                aria-label={identifierType === 'email' ? t('auth.email') : t('auth.phoneNumber')}
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t('common.required')}</p>
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
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t('auth.password')} {t('common.required')}</p>
              )}
            </div>

            <div>
              <PasswordInput
                id="confirmPassword"
                {...register('confirmPassword', { required: true })}
                placeholder={t('auth.confirmPassword')}
                aria-label={t('auth.confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t('common.required')}</p>
              )}
            </div>

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
              <p className="text-xs text-red-600 dark:text-red-400">{t('authErrors.mustAcceptTerms')}</p>
            )}

            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 rounded-xl text-base font-semibold mt-1">
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
