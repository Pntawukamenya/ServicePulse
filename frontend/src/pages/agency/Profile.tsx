import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';
import ProfileAvatar from '../../components/ProfileAvatar';

interface ProfileForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
}

export default function AgencyProfile() {
  const { t } = useTranslation();
  const { user, setAuth, isAdmin } = useAuthStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm<ProfileForm>({
    defaultValues: { avatarUrl: '' },
  });

  const showProfilePicture = !isAdmin();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
      reset({
        fullName: response.data.full_name || '',
        email: response.data.email || '',
        phoneNumber: response.data.phone_number || '',
        avatarUrl: response.data.avatar_url || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload: Record<string, any> = {
        full_name: data.fullName || null,
        email: data.email || null,
        phone_number: data.phoneNumber || null,
      };
      if (showProfilePicture) {
        payload.avatar_url = data.avatarUrl || null;
      }

      const response = await api.put('/auth/profile', payload);
      setSuccess(t('agency.profileUpdated'));

      if (user) {
        const token = useAuthStore.getState().token;
        if (token) {
          const displayName = response.data.full_name || response.data.email || response.data.phone_number;
          setAuth({ ...user, fullName: displayName, email: response.data.email, phoneNumber: response.data.phone_number }, token);
        }
      }
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.updateProfileFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('agency.profileSettings')}</h1>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t('agency.profileHint')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {showProfilePicture && (
            <ProfileAvatar
              avatarUrl={watch('avatarUrl') || ''}
              onAvatarUrlChange={(url) => setValue('avatarUrl', url)}
              fullName={watch('fullName') || profile?.full_name}
              disabled={loading}
            />
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              {t('auth.fullName')}
            </label>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              className="input"
              placeholder={t('citizen.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
              {t('auth.phoneNumber')}
            </label>
            <input
              id="phoneNumber"
              type="tel"
              {...register('phoneNumber')}
              className="input"
              placeholder="+250 788 123 456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? t('common.saving') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
