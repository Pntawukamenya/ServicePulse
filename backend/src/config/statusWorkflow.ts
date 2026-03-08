/**
 * Report status workflow: Claim-based.
 * Submitted → (claim) → In Progress → Resolved | Escalated. Only agency_admin can resolve escalated.
 */

export const REPORT_STATUSES = [
  'submitted',
  'under_review',
  'assigned',
  'in_progress',
  'escalated',
  'resolved',
  'rejected',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** Legacy status 'received' is treated as 'submitted' for workflow. */
export const LEGACY_STATUS_MAP: Record<string, ReportStatus> = {
  received: 'submitted',
};

export function normalizeStatus(status: string): ReportStatus {
  const normalized = LEGACY_STATUS_MAP[status] || status;
  if (REPORT_STATUSES.includes(normalized as ReportStatus)) {
    return normalized as ReportStatus;
  }
  return 'submitted';
}

/** Allowed transitions: claim sets in_progress + assigned_to; in_progress → resolved | escalated; escalated → resolved (admin only). */
export const ALLOWED_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  submitted: ['in_progress', 'resolved', 'rejected'],
  under_review: ['in_progress', 'resolved', 'rejected'],
  assigned: ['in_progress', 'resolved', 'rejected'],
  in_progress: ['resolved', 'escalated', 'rejected'],
  escalated: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
};

export function getAllowedNextStatuses(current: string): ReportStatus[] {
  const normalized = normalizeStatus(current);
  return ALLOWED_TRANSITIONS[normalized] || [];
}

export function isValidTransition(from: string, to: string): boolean {
  const fromNorm = normalizeStatus(from);
  const toNorm = normalizeStatus(to);
  const allowed = ALLOWED_TRANSITIONS[fromNorm];
  return Array.isArray(allowed) && allowed.includes(toNorm);
}
