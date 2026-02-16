import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n/useTranslation';
import PasswordInput from '../components/PasswordInput';

const REMEMBERED_IDENTIFIER_KEY = 'remembered_identifier';
const LEGACY_CREDENTIALS_KEY = 'remembered_credentials'; // removed for security

function getRememberedIdentifier(): string | null {
  // Migrate/cleanup: remove old credentials storage that contained passwords
  try {
    localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
  } catch {
    /* ignore */
  }
  try {
    const s = localStorage.getItem(REMEMBERED_IDENTIFIER_KEY);
    return s && s.length > 0 ? s : null;
  } catch {
    localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
    return null;
  }
}

function saveRememberedIdentifier(identifier: string): void {
  localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier.trim());
}

function clearRememberedIdentifier(): void {
  localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
}

interface LoginForm {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rememberedIdentifier = getRememberedIdentifier();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: {
      identifier: rememberedIdentifier ?? '',
      password: '',
      rememberMe: !!rememberedIdentifier,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        identifier: data.identifier.trim(),
        password: data.password,
      });
      const user = response.data.user;
      setAuth(user, response.data.token);
      if (data.rememberMe) {
        saveRememberedIdentifier(data.identifier);
      } else {
        clearRememberedIdentifier();
      }
      if (user.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else {
        navigate('/agency/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('authErrors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center bg-gradient-to-b from-primary-50/30 via-neutral-50 to-neutral-50 dark:from-primary-950/20 dark:via-neutral-950 dark:to-neutral-950">
      <div className="w-full max-w-lg mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="auth-card">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('auth.login')}</h1>
          </div>

          {error && (
            <div className="mb-4 alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                id="identifier"
                type="text"
                {...register('identifier', { required: true })}
                className="input py-2.5"
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
                {...register('password', { required: true })}
                placeholder={t('auth.password')}
                aria-label={t('auth.password')}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    aria-label={t('auth.rememberMe')}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('auth.rememberMe')}</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-error-600 dark:text-error-400">{t('auth.password')} {t('common.required')}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 rounded-xl text-base font-semibold mt-1">
              {loading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              {t('nav.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
