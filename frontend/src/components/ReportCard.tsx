import { ServiceIconBadge } from './ServiceIcon';

type Status = 'received' | 'in_progress' | 'resolved';

interface ReportCardProps {
  id: string;
  serviceType: string;
  /** Compact landscape layout for grid (3 per row) */
  compact?: boolean;
  /** Translated or display label for the service type */
  displayLabel?: string;
  location: string;
  description: string;
  status: Status;
  created_at?: string;
  updated_at?: string;
  reporter?: { full_name: string; phone_number?: string; email?: string };
  statusLabel: (s: string) => string;
  statusBadge: (s: string) => string;
  formatDate: (d?: string) => string;
  /** Agency view: show action buttons */
  onMarkInProgress?: () => void;
  onMarkResolved?: () => void;
  showActions?: boolean;
  reportIdPrefix?: string;
  submittedLabel?: string;
  updatedLabel?: string;
  reportedByLabel?: string;
  markInProgressLabel?: string;
  markResolvedLabel?: string;
}

function getReportId(id: string, prefix = 'SP') {
  return `#${prefix}-${id.slice(0, 8).toUpperCase()}`;
}

export default function ReportCard({
  id,
  serviceType,
  compact = false,
  displayLabel,
  location,
  description,
  status,
  created_at,
  updated_at,
  reporter,
  statusLabel,
  statusBadge,
  formatDate,
  onMarkInProgress,
  onMarkResolved,
  showActions,
  reportIdPrefix = 'SP',
  submittedLabel = 'Submitted',
  updatedLabel = 'Updated',
  reportedByLabel = 'Reported by',
  markInProgressLabel = 'Mark in progress',
  markResolvedLabel = 'Mark resolved',
}: ReportCardProps) {
  const LocationIcon = () => (
    <svg className="w-3.5 h-3.5 shrink-0 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  if (compact) {
    return (
      <div className="card overflow-hidden transition-shadow duration-200 hover:shadow-md p-4">
        <div className="flex gap-3">
          <ServiceIconBadge serviceCode={serviceType} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                {displayLabel ?? serviceType}
              </h3>
              <span className={`${statusBadge(status)} shrink-0 text-[11px] px-2 py-0.5`}>{statusLabel(status)}</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1">
              <LocationIcon />
              {location}
            </p>
            {reporter && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {reporter.full_name}
              </p>
            )}
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1.5 line-clamp-2">{description}</p>
            <div className={`mt-4 flex items-center justify-between gap-3 flex-wrap ${showActions ? 'pt-3 border-t border-neutral-100 dark:border-neutral-800' : ''}`}>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">{formatDate(created_at)}</span>
              {showActions && (
                <div className="flex gap-2 flex-wrap">
                  {status !== 'in_progress' && onMarkInProgress && (
                    <button onClick={(e) => { e.stopPropagation(); onMarkInProgress(); }} className="btn btn-outline text-xs px-3 py-2 h-9 min-w-0">
                      {markInProgressLabel}
                    </button>
                  )}
                  {status !== 'resolved' && onMarkResolved && (
                    <button onClick={(e) => { e.stopPropagation(); onMarkResolved(); }} className="btn btn-primary text-xs px-3 py-2 h-9 min-w-0">
                      {markResolvedLabel}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="flex gap-4">
        <ServiceIconBadge serviceCode={serviceType} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">{getReportId(id, reportIdPrefix)}</span>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mt-0.5">
                {displayLabel ?? serviceType}
              </h3>
            </div>
            <span className={`${statusBadge(status)} shrink-0`}>{statusLabel(status)}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
            <LocationIcon />
            {location}
          </p>
          {reporter && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {reportedByLabel} {reporter.full_name}
              {reporter.phone_number && ` (${reporter.phone_number})`}
            </p>
          )}
          <p className="text-neutral-700 dark:text-neutral-300 mb-4 line-clamp-3">{description}</p>
          <div className={`flex flex-wrap items-center justify-between gap-4 ${showActions ? 'pt-4 border-t border-neutral-100 dark:border-neutral-800' : ''}`}>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
              <span>{submittedLabel}: {formatDate(created_at)}</span>
              {updated_at && updated_at !== created_at && (
                <span>{updatedLabel}: {formatDate(updated_at)}</span>
              )}
            </div>
            {showActions && (
              <div className="flex gap-3">
                {status !== 'in_progress' && onMarkInProgress && (
                  <button onClick={onMarkInProgress} className="btn btn-outline text-sm">
                    {markInProgressLabel}
                  </button>
                )}
                {status !== 'resolved' && onMarkResolved && (
                  <button onClick={onMarkResolved} className="btn btn-primary text-sm">
                    {markResolvedLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
