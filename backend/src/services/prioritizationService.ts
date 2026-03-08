/**
 * Prioritization algorithm applied per agency.
 * Each agency (REG, WASAC, EMERGENCY) gets its own sorted list so agencies are independent.
 *
 * Priority is based on:
 * 1. Service type urgency (within that agency: e.g. REG safety > REG billing)
 * 2. Status (unresolved first: received > in_progress > escalated > resolved)
 * 3. Description keywords (generic + agency-specific: REG=power/transformer, WASAC=water/pipe, EMERGENCY=fire/crime)
 * 4. Recency (newer reports within 24–48h get a boost)
 * 5. Location hotspot (only reports from same agency at same location)
 */

export type PriorityLevel = 'high' | 'medium' | 'low';

/** Service-type urgency weight (higher = more urgent). Emergency services first, then REG, then WASAC. */
const SERVICE_URGENCY_WEIGHT: Record<string, number> = {
  EMERGENCY: 100,
  EMERGENCY_POLICE: 100,
  EMERGENCY_CRIME: 98,
  EMERGENCY_FIRE: 99,
  EMERGENCY_AMBULANCE: 99,
  EMERGENCY_DISASTER: 100,
  EMERGENCY_RIB: 97,
  REG: 60,
  REG_POWER_OUTAGE: 70,
  REG_SAFETY_HAZARD: 75,
  REG_TRANSFORMER_FAULT: 65,
  REG_METER_ISSUE: 50,
  REG_LOAD_SHEDDING: 55,
  REG_CONNECTION: 45,
  REG_BILLING: 40,
  WASAC: 50,
  WASAC_PIPE_BURST: 65,
  WASAC_WATER_QUALITY: 60,
  WASAC_LOW_PRESSURE: 55,
  WASAC_SEWAGE: 60,
  WASAC_WATER_SUPPLY: 55,
  WASAC_CONNECTION: 45,
  WASAC_BILLING: 40,
};

/** Status priority: unresolved first so admins tackle pending work. Escalated kept high for admin attention. */
const STATUS_WEIGHT: Record<string, number> = {
  received: 30,
  submitted: 30,
  under_review: 28,
  assigned: 25,
  in_progress: 20,
  escalated: 28,
  resolved: 0,
  rejected: 0,
};

/** Generic urgency keywords (all agencies). */
const URGENCY_KEYWORDS: { pattern: RegExp; boost: number }[] = [
  { pattern: /\b(emergency|urgent|critical|asap|immediately)\b/i, boost: 25 },
  { pattern: /\b(fire|danger|safety|risk|hazard)\b/i, boost: 20 },
  { pattern: /\b(crime|theft|break-in|police)\b/i, boost: 18 },
  { pattern: /\b(ambulance|injury|accident|hospital)\b/i, boost: 20 },
];

/** REG (electricity): agency-specific keywords so REG list is independent and relevant. */
const REG_URGENCY_KEYWORDS: { pattern: RegExp; boost: number }[] = [
  { pattern: /\b(outage|no power|no electricity|blackout|power cut)\b/i, boost: 18 },
  { pattern: /\b(transformer|spark|sparking|electrocution|wire)\b/i, boost: 15 },
  { pattern: /\b(load shedding|blackout)\b/i, boost: 12 },
  { pattern: /\b(meter|billing)\b/i, boost: 5 },
];

/** WASAC (water): agency-specific keywords so WASAC list is independent and relevant. */
const WASAC_URGENCY_KEYWORDS: { pattern: RegExp; boost: number }[] = [
  { pattern: /\b(no water|water cut|burst|flood|leak|pipe)\b/i, boost: 18 },
  { pattern: /\b(sewage|contamination|dirty water|health)\b/i, boost: 15 },
  { pattern: /\b(low pressure|no pressure|dry)\b/i, boost: 12 },
  { pattern: /\b(connection|billing)\b/i, boost: 5 },
];

/** EMERGENCY: agency-specific keywords so emergency list is independent and relevant. */
const EMERGENCY_URGENCY_KEYWORDS: { pattern: RegExp; boost: number }[] = [
  { pattern: /\b(fire|burning|smoke)\b/i, boost: 20 },
  { pattern: /\b(crime|theft|break-in|robbery|police)\b/i, boost: 18 },
  { pattern: /\b(ambulance|injury|accident|hospital|medical)\b/i, boost: 20 },
  { pattern: /\b(disaster|flood|landslide|emergency)\b/i, boost: 22 },
  { pattern: /\b(fraud|rib|investigation)\b/i, boost: 15 },
];

const DEFAULT_SERVICE_WEIGHT = 40;
const RECENCY_HOURS_URGENT = 24;
const RECENCY_HOURS_NORMAL = 48;
const RECENCY_BOOST_URGENT = 10;
const RECENCY_BOOST_NORMAL = 5;
const HOTSPOT_BOOST_PER_EXTRA = 2; // per additional report at same location

export interface ReportWithPriority {
  [key: string]: any;
  priority_score: number;
  priority_level: PriorityLevel;
}

export interface NotificationWithPriority {
  [key: string]: any;
  priority_score: number;
  priority_level: PriorityLevel;
}

function getServiceWeight(serviceType: string): number {
  const normalized = (serviceType || '').trim().toUpperCase();
  if (SERVICE_URGENCY_WEIGHT[normalized] !== undefined) {
    return SERVICE_URGENCY_WEIGHT[normalized];
  }
  if (normalized.startsWith('EMERGENCY')) return 90;
  if (normalized.startsWith('REG')) return 55;
  if (normalized.startsWith('WASAC')) return 45;
  return DEFAULT_SERVICE_WEIGHT;
}

function getStatusWeight(status: string): number {
  return STATUS_WEIGHT[status] ?? 0;
}

/** Apply generic + agency-specific keyword boosts so each agency's prioritization is independent and relevant. */
function getDescriptionBoost(description: string, serviceType?: string): number {
  if (!description || typeof description !== 'string') return 0;
  let total = 0;
  const norm = (serviceType || '').trim().toUpperCase();
  for (const { pattern, boost } of URGENCY_KEYWORDS) {
    if (pattern.test(description)) total += boost;
  }
  const agencyKeywords =
    norm.startsWith('REG') ? REG_URGENCY_KEYWORDS
    : norm.startsWith('WASAC') ? WASAC_URGENCY_KEYWORDS
    : norm.startsWith('EMERGENCY') ? EMERGENCY_URGENCY_KEYWORDS
    : [];
  for (const { pattern, boost } of agencyKeywords) {
    if (pattern.test(description)) total += boost;
  }
  return Math.min(total, 35);
}

function getRecencyBoost(createdAt: Date | string | undefined): number {
  if (!createdAt) return 0;
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  if (hoursAgo <= RECENCY_HOURS_URGENT) return RECENCY_BOOST_URGENT;
  if (hoursAgo <= RECENCY_HOURS_NORMAL) return RECENCY_BOOST_NORMAL;
  return 0;
}

function scoreToLevel(score: number): PriorityLevel {
  if (score >= 120) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
}

/**
 * Compute priority score for a single report.
 * Higher score = show first.
 */
export function computeReportPriority(
  report: {
    service_type?: string;
    status?: string;
    description?: string;
    created_at?: string;
    createdAt?: Date | string;
    location?: string;
  },
  locationCountMap?: Record<string, number>
): { score: number; level: PriorityLevel } {
  const serviceWeight = getServiceWeight(report.service_type || '');
  const statusWeight = getStatusWeight(report.status || '');
  const descBoost = getDescriptionBoost(report.description || '', report.service_type);
  const created = report.created_at || (report as any).createdAt;
  const recencyBoost = getRecencyBoost(created);

  let hotspotBoost = 0;
  const loc = (report.location || '').trim();
  if (loc && locationCountMap && locationCountMap[loc] > 1) {
    hotspotBoost = Math.min((locationCountMap[loc] - 1) * HOTSPOT_BOOST_PER_EXTRA, 15);
  }

  const score = serviceWeight + statusWeight + descBoost + recencyBoost + hotspotBoost;
  const level = scoreToLevel(score);

  return { score, level };
}

/**
 * Compute priority score for a notification (alert).
 * Based on service type and recency.
 */
export function computeNotificationPriority(notification: {
  service_type?: string;
  created_at?: string;
  createdAt?: Date | string;
}): { score: number; level: PriorityLevel } {
  const serviceWeight = getServiceWeight(notification.service_type || '');
  const created = notification.created_at || (notification as any).createdAt;
  const recencyBoost = getRecencyBoost(created);
  const score = serviceWeight + recencyBoost;
  const level = scoreToLevel(score);
  return { score, level };
}

/**
 * Sort and annotate reports by priority (highest first).
 */
export function prioritizeReports<T extends Record<string, any>>(
  reports: T[],
  options?: { locationCountMap?: Record<string, number> }
): (T & ReportWithPriority)[] {
  const locationCountMap = options?.locationCountMap ?? buildLocationCountMap(reports);

  const withPriority = reports.map((r) => {
    const { score, level } = computeReportPriority(
      {
        service_type: r.service_type,
        status: r.status,
        description: r.description,
        created_at: r.created_at,
        createdAt: r.createdAt,
        location: r.location,
      },
      locationCountMap
    );
    return { ...r, priority_score: score, priority_level: level };
  });

  withPriority.sort((a, b) => {
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return withPriority;
}

/**
 * Sort and annotate notifications by priority (highest first).
 */
export function prioritizeNotifications<T extends Record<string, any>>(notifications: T[]): (T & NotificationWithPriority)[] {
  const withPriority = notifications.map((n) => {
    const { score, level } = computeNotificationPriority({
      service_type: n.service_type,
      created_at: n.created_at,
      createdAt: n.createdAt,
    });
    return { ...n, priority_score: score, priority_level: level };
  });

  withPriority.sort((a, b) => {
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return withPriority;
}

function buildLocationCountMap(reports: { location?: string }[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of reports) {
    const loc = (r.location || 'Unknown').trim() || 'Unknown';
    map[loc] = (map[loc] || 0) + 1;
  }
  return map;
}
