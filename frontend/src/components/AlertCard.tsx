import { ServiceIconBadge } from './ServiceIcon';

interface AlertCardProps {
  id?: string;
  serviceType: string;
  /** Translated or display label */
  displayLabel?: string;
  message: string;
  targetAudience?: string;
  targetLabel: string;
  targetValue: string;
  deliveryCount: number;
  totalRecipients: number;
  deliveredLabel: string;
  formatDate: (d?: string) => string;
  created_at?: string;
  createdAt?: string;
}

export default function AlertCard({
  serviceType,
  displayLabel,
  message,
  targetLabel,
  targetValue,
  deliveryCount,
  totalRecipients,
  deliveredLabel,
  formatDate,
  created_at,
  createdAt,
}: AlertCardProps) {
  const dateStr = created_at ?? createdAt;
  const progress = totalRecipients > 0 ? Math.round((deliveryCount / totalRecipients) * 100) : 0;

  return (
    <div className="card overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="flex gap-4">
        <ServiceIconBadge serviceCode={serviceType} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {displayLabel ?? serviceType}
            </h3>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
              {formatDate(dateStr)}
            </span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 mb-4 line-clamp-3">{message}</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {targetLabel}: {targetValue}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500 dark:bg-primary-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                  {deliveredLabel}: {deliveryCount}/{totalRecipients}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
