import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useTranslation } from '../i18n/useTranslation';
import PasswordInput from './PasswordInput';

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

export default function ChangePasswordForm({ onSuccess, disabled }: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      setSuccess(t('auth.passwordChanged'));
      reset({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="alert-error">{error}</div>
      )}

      {success && (
        <div className="alert-success">{success}</div>
      )}

      <div>
        <label htmlFor="oldPassword" className="block text-sm font-medium mb-1">
          {t('auth.currentPassword')}
        </label>
        <PasswordInput
          id="oldPassword"
          {...register('oldPassword', { required: t('auth.currentPasswordRequired') })}
          placeholder={t('auth.currentPassword')}
          aria-label={t('auth.currentPassword')}
          autoComplete="current-password"
        />
        {errors.oldPassword && (
          <p className="mt-1 text-xs text-error-600 dark:text-error-400">{errors.oldPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
          {t('auth.newPassword')}
        </label>
        <PasswordInput
          id="newPassword"
          {...register('newPassword', {
            required: t('auth.newPasswordRequired'),
            minLength: { value: 6, message: t('auth.passwordMinLength') },
          })}
          placeholder={t('auth.newPassword')}
          aria-label={t('auth.newPassword')}
          autoComplete="new-password"
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-error-600 dark:text-error-400">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-1">
          {t('auth.confirmNewPassword')}
        </label>
        <PasswordInput
          id="confirmNewPassword"
          {...register('confirmNewPassword', {
            required: t('auth.confirmPasswordRequired'),
            validate: (value) => value === newPassword || t('auth.passwordsNoMatch'),
          })}
          placeholder={t('auth.confirmNewPassword')}
          aria-label={t('auth.confirmNewPassword')}
          autoComplete="new-password"
        />
        {errors.confirmNewPassword && (
          <p className="mt-1 text-xs text-error-600 dark:text-error-400">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || disabled}
        className="btn btn-primary"
      >
        {loading ? t('common.saving') : t('auth.changePassword')}
      </button>
    </form>
  );
}
