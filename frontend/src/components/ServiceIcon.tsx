/**
 * Minimal service icons for REG, WASAC, EMERGENCY
 */
import { getAgencyFromServiceCode } from '../config/services';

type ServiceAccent = 'reg' | 'wasac' | 'emergency' | 'neutral';

function getServiceAccent(serviceCode: string): ServiceAccent {
  const agency = getAgencyFromServiceCode(serviceCode);
  if (agency === 'REG') return 'reg';
  if (agency === 'WASAC') return 'wasac';
  if (agency === 'EMERGENCY') return 'emergency';
  return 'neutral';
}

/** Minimal icon: neutral background, simple outline icons */
export function ServiceIconBadge({ serviceCode, size = 'md', className = '' }: { serviceCode: string; size?: 'sm' | 'md'; className?: string }) {
  const accent = getServiceAccent(serviceCode);
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';
  const iconBg = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';

  const iconProps = { className: iconSize, fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.5, viewBox: '0 0 24 24' };
  const icons: Record<ServiceAccent, JSX.Element> = {
    reg: (
      <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    wasac: (
      <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" /></svg>
    ),
    emergency: (
      <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    ),
    neutral: (
      <svg {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
  };

  return (
    <div className={`${sizeClass} rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${className}`}>
      {icons[accent]}
    </div>
  );
}
