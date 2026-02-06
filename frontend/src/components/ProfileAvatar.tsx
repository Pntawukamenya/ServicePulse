import { useRef, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary';

interface ProfileAvatarProps {
  avatarUrl: string | null;
  onAvatarUrlChange: (url: string) => void;
  fullName?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE_MB = 5;

export default function ProfileAvatar({ avatarUrl, onAvatarUrlChange, fullName, disabled }: ProfileAvatarProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const handleUploadClick = () => {
    if (disabled || uploading || !isCloudinaryConfigured()) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError('');

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      setUploadError(t('common.uploadInvalidType'));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(t('common.uploadTooLarge'));
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onAvatarUrlChange(url);
    } catch (err: any) {
      setUploadError(err.message || t('common.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const configured = isCloudinaryConfigured();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
      <div className="flex-shrink-0">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/40 ring-2 ring-primary-200 dark:ring-primary-700 group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={t('common.profilePicture')}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 ${avatarUrl ? 'hidden' : ''}`}
          >
            {initials}
          </div>
        </div>
      </div>
      <div className="flex-1 w-full sm:w-auto">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('common.profilePicture')}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
        {configured ? (
          <>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.uploading')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {t('common.upload')}
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('common.profilePictureHint')}</p>
          </>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">{t('common.cloudinaryNotConfigured')}</p>
        )}
        {uploadError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        )}
      </div>
    </div>
  );
}
