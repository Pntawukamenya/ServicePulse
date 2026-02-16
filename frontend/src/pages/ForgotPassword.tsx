import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useTranslation } from '../i18n/useTranslation';
import PasswordInput from '../components/PasswordInput';

interface Step1Form {
  identifier: string;
}

interface Step2Form {
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const step1Form = useForm<Step1Form>();
  const step2Form = useForm<Step2Form>();

  const onRequestCode = async (data: Step1Form) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: data.identifier.trim(),
      });
      setIdentifier(data.identifier.trim());
      setIdentifierType(response.data.identifierType || (data.identifier.includes('@') ? 'email' : 'phone'));
      setStep('reset');
    } catch {
      setError(t('authErrors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: Step2Form) => {
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        identifier,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const targetLabel = identifierType === 'email'
    ? t('auth.email').toLowerCase()
    : t('auth.phoneNumber').toLowerCase();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/30 via-neutral-50 to-neutral-50 dark:from-primary-950/20 dark:via-neutral-950 dark:to-neutral-950">
      <div className="w-full max-w-lg mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="auth-card">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'request' && t('auth.resetPasswordTitle')}
              {step === 'reset' && t('auth.setNewPassword')}
              {step === 'done' && t('auth.resetPassword')}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {step === 'request' && t('auth.resetPasswordDesc')}
              {step === 'reset' && t('auth.resetCodeSent').replace('{target}', targetLabel)}
              {step === 'done' && t('auth.resetPasswordSuccess')}
            </p>
          </div>

          {step === 'request' && (
            <>
              {error && (
                <div className="mb-4 alert-error">{error}</div>
              )}

              <form onSubmit={step1Form.handleSubmit(onRequestCode)} className="space-y-4">
                <div>
                  <input
                    id="identifier"
                    type="text"
                    {...step1Form.register('identifier', { required: true })}
                    className="input py-2.5"
                    placeholder="you@example.com or +250 788 123 456"
                    aria-label={t('auth.emailOrPhone')}
                  />
                  {step1Form.formState.errors.identifier && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t('common.required')}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-3 rounded-xl text-base font-semibold"
                >
                  {loading ? t('common.loading') : t('auth.sendResetLink')}
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              {error && (
                <div className="mb-4 alert-error">{error}</div>
              )}

              <form onSubmit={step2Form.handleSubmit(onResetPassword)} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium mb-1">
                    {t('auth.resetCode')}
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="input py-2.5 text-center tracking-widest font-mono text-lg"
                    {...step2Form.register('otp', {
                      required: t('common.required'),
                      minLength: { value: 6, message: t('auth.enterResetCode') },
                      maxLength: { value: 6, message: t('auth.enterResetCode') },
                      pattern: { value: /^\d{6}$/, message: t('auth.enterResetCode') },
                    })}
                  />
                  {step2Form.formState.errors.otp && (
                    <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                      {step2Form.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                    {t('auth.newPassword')}
                  </label>
                  <PasswordInput
                    id="newPassword"
                    {...step2Form.register('newPassword', {
                      required: t('auth.newPasswordRequired'),
                      minLength: { value: 6, message: t('auth.passwordMinLength') },
                    })}
                    placeholder={t('auth.newPassword')}
                    autoComplete="new-password"
                  />
                  {step2Form.formState.errors.newPassword && (
                    <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                      {step2Form.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-1">
                    {t('auth.confirmNewPassword')}
                  </label>
                  <PasswordInput
                    id="confirmNewPassword"
                    {...step2Form.register('confirmNewPassword', {
                      required: t('auth.confirmPasswordRequired'),
                      validate: (value) =>
                        value === step2Form.watch('newPassword') || t('auth.passwordsNoMatch'),
                    })}
                    placeholder={t('auth.confirmNewPassword')}
                    autoComplete="new-password"
                  />
                  {step2Form.formState.errors.confirmNewPassword && (
                    <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                      {step2Form.formState.errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-3 rounded-xl text-base font-semibold"
                >
                  {loading ? t('common.loading') : t('auth.resetPassword')}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setStep('request')}
                className="mt-4 w-full text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                ← Use different email or phone
              </button>
            </>
          )}

          {step === 'done' && (
            <Link
              to="/login"
              className="block w-full text-center btn btn-primary py-3 rounded-xl font-semibold"
            >
              {t('auth.backToLogin')}
            </Link>
          )}

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              ← {t('auth.backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
