type PriorityLevel = 'high' | 'medium' | 'low';

interface PriorityPillProps {
  level?: PriorityLevel;
  className?: string;
}

const baseClasses =
  'inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0';

export function PriorityPill({ level, className = '' }: PriorityPillProps) {
  if (!level) return null;

  if (level === 'high') {
    return (
      <span
        className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 ${className}`}
        title="High priority"
      >
        Urgent
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span
        className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 ${className}`}
        title="Medium priority"
      >
        Priority
      </span>
    );
  }

  return (
    <span
      className={`${baseClasses} bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 ${className}`}
      title="Low priority"
    >
      Low
    </span>
  );
}

