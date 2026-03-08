import { useTranslation } from '../i18n/useTranslation';

type PriorityLevel = 'high' | 'medium' | 'low';

interface PriorityPillProps {
  level?: PriorityLevel;
  className?: string;
}

const baseClasses =
  'inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0';

const PRIORITY_KEYS: Record<PriorityLevel, string> = {
  high: 'citizen.priorityCritical',   // Urgent
  medium: 'citizen.priorityMedium',   // Standard
  low: 'citizen.priorityLow',         // Routine
};

export function PriorityPill({ level, className = '' }: PriorityPillProps) {
  const { t } = useTranslation();
  if (!level) return null;

  if (level === 'high') {
    return (
      <span
        className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 ${className}`}
        title={t(PRIORITY_KEYS.high)}
      >
        {t(PRIORITY_KEYS.high)}
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span
        className={`${baseClasses} bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 ${className}`}
        title={t(PRIORITY_KEYS.medium)}
      >
        {t(PRIORITY_KEYS.medium)}
      </span>
    );
  }

  return (
    <span
      className={`${baseClasses} bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 ${className}`}
      title={t(PRIORITY_KEYS.low)}
    >
      {t(PRIORITY_KEYS.low)}
    </span>
  );
}

