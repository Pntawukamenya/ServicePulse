import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useTranslation } from '../i18n/useTranslation';

interface ForgotForm {
  identifier: string;
}

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { identifier: data.identifier.trim() });
      setSent(true);
    } catch {
      setSent(true);
      // Always show success message for security (don't reveal if email exists)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-950/20 dark:to-transparent">
      <div className="w-full max-w-lg mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="auth-card">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.resetPasswordTitle')}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('auth.resetPasswordDesc')}</p>
          </div>

          {sent ? (
            <>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-primary-800 dark:text-primary-200 text-sm mb-4">
                {t('auth.resetLinkSent')}
              </div>
              <Link
                to="/login"
                className="block w-full text-center btn btn-primary py-3 rounded-xl font-semibold"
              >
                {t('auth.backToLogin')}
              </Link>
            </>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    id="identifier"
                    type="text"
                    {...register('identifier', { required: true })}
                    className="input py-2.5"
                    placeholder="you@example.com or +250 788 123 456"
                    aria-label={t('auth.emailOrPhone')}
                  />
                  {errors.identifier && (
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
