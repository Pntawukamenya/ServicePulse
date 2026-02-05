/**
 * Professional SVG icons for Home/Landing page
 * Clean, government-grade style - no emojis
 */

interface IconProps {
  className?: string;
  size?: number;
}

export function SmsIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="8" fill="currentColor" fillOpacity="0.08" />
      <path
        d="M14 16h20v2H14v-2zm0 4h14v2H14v-2zm0 4h18v2H14v-2z"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <path
        d="M12 14a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ReportIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="8" fill="currentColor" fillOpacity="0.08" />
      <path
        d="M16 28h16M16 32h12M16 24h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 18h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V20a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 12v6M24 12v6M28 12v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AgencyIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="8" fill="currentColor" fillOpacity="0.08" />
      <path
        d="M24 14l12 8v12H12V22l12-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 14v20M12 22h24M16 30h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ElectricityIcon({ className = '', size = 40 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="20" cy="20" r="18" fill="currentColor" fillOpacity="0.08" />
      <path
        d="M22 12l-8 10h6l-4 12 10-12h-6l4-10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function WaterIcon({ className = '', size = 40 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="20" cy="20" r="18" fill="currentColor" fillOpacity="0.08" />
      <path
        d="M20 10s8 10 8 14c0 4.4-3.6 8-8 8s-8-3.6-8-8c0-4 8-14 8-14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function EmergencyIcon({ className = '', size = 40 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="20" cy="20" r="18" fill="currentColor" fillOpacity="0.08" />
      <path
        d="M20 10v6M20 24v6M14 20h6M24 20h6M15.5 15.5l4 4M20.5 20.5l4 4M15.5 24.5l4-4M20.5 19.5l4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
