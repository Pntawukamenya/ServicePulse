/**
 * Report status workflow: enforceable lifecycle and allowed transitions.
 * Submitted → Under Review → Assigned → In Progress → Resolved | Rejected
 */

export const REPORT_STATUSES = [
  'submitted',
  'under_review',
  'assigned',
  'in_progress',
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

/** Allowed transitions: from -> to[]. Legacy: submitted may go directly to in_progress or resolved for backward compat. */
export const ALLOWED_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  submitted: ['under_review', 'rejected', 'in_progress', 'resolved'],
  under_review: ['assigned', 'in_progress', 'rejected'],
  assigned: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
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
