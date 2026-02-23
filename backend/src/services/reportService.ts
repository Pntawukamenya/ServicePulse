import Report from '../models/Report';
import User from '../models/User';
import { getAgencyCode } from './agencyService';
import { prioritizeReports } from './prioritizationService';
import { isValidTransition, normalizeStatus, getAllowedNextStatuses } from '../config/statusWorkflow';
import { createUserNotification } from './userNotificationService';

export interface CreateReportData {
  userId: string;
  serviceType: string;
  location: string;
  description: string;
  sector?: string;
  cell?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  latitude?: number;
  longitude?: number;
  address?: string;
  attachments?: Array<{ url: string; public_id?: string; filename?: string; mime_type?: string; size?: number }>;
}

export interface UpdateReportStatusData {
  reportId: string;
  status: string;
  agencyId: string;
  updatedByUserId: string;
  updatedByRole: string;
  comment?: string;
}

function mapReport(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  const statusNorm = obj.status === 'received' ? 'submitted' : obj.status;
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    user_id: obj.user_id?.toString() || obj.user_id,
    created_at: obj.createdAt ?? obj.created_at,
    updated_at: obj.updatedAt ?? obj.updated_at,
    status: statusNorm,
    status_history: (obj.status_history || []).map((h: any) => ({
      status: h.status === 'received' ? 'submitted' : h.status,
      timestamp: h.timestamp,
      updated_by: h.updated_by?.toString() || h.updated_by,
      updated_by_role: h.updated_by_role,
      comment: h.comment,
    })),
    assigned_to: obj.assigned_to?.toString() || obj.assigned_to,
  };
}

export async function createReport(data: CreateReportData) {
  const {
    userId,
    serviceType,
    location,
    description,
    sector,
    cell,
    priority,
    latitude,
    longitude,
    address,
    attachments,
  } = data;

  const status = 'submitted';
  const statusHistory = [{ status, timestamp: new Date(), comment: 'Report submitted' }];

  const doc: Record<string, unknown> = {
    user_id: userId,
    service_type: serviceType,
    location,
    sector: sector || null,
    cell: cell || null,
    description,
    status,
    status_history: statusHistory,
    priority: priority || 'medium',
    attachments: attachments && attachments.length ? attachments : [],
  };
  if (latitude != null && longitude != null) {
    doc.latitude = latitude;
    doc.longitude = longitude;
    doc.location_geo = { type: 'Point', coordinates: [longitude, latitude] };
  }
  if (address != null) doc.address = address;

  const report = await Report.create(doc);
  return mapReport(report);
}

export async function getReportsByUser(userId: string) {
  const reports = await Report.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .lean();

  return reports.map((r) => {
    const statusNorm = (r as any).status === 'received' ? 'submitted' : (r as any).status;
    return {
      ...r,
      id: (r as any)._id.toString(),
      user_id: (r as any).user_id?.toString(),
      status: statusNorm,
      status_history: ((r as any).status_history || []).map((h: any) => ({
        status: h.status === 'received' ? 'submitted' : h.status,
        timestamp: h.timestamp,
        updated_by: h.updated_by?.toString(),
        updated_by_role: h.updated_by_role,
        comment: h.comment,
      })),
      created_at: (r as any).createdAt ?? (r as any).created_at,
      updated_at: (r as any).updatedAt ?? (r as any).updated_at,
    };
  });
}

export async function getReportsByAgency(agencyId: string, filters?: { serviceType?: string; location?: string; status?: string }) {
  const agencyCode = await getAgencyCode(agencyId);
  if (!agencyCode) {
    throw new Error('Invalid agency');
  }

  const query: Record<string, any> = {
    $or: [
      { service_type: agencyCode },
      { service_type: new RegExp(`^${agencyCode}_`, 'i') },
    ],
  };
  if (agencyCode === 'EMERGENCY') {
    query.$or = [
      ...(Array.isArray(query.$or) ? query.$or : [query.$or]),
      { priority: 'critical' },
    ];
  }

  if (filters?.location) {
    query.location = new RegExp(filters.location, 'i');
  }
  if (filters?.serviceType) {
    query.service_type = filters.serviceType;
  }
  if (filters?.status) {
    query.status = filters.status;
  }

  const reports = await Report.find(query)
    .populate('user_id', 'full_name phone_number email')
    .sort({ createdAt: -1 })
    .lean();

  const mapped = reports.map((r) => {
    const u = (r as any).user_id;
    const users = u
      ? { full_name: u.full_name, phone_number: u.phone_number, email: u.email }
      : { full_name: null, phone_number: null, email: null };
    return {
      ...r,
      id: (r as any)._id.toString(),
      user_id: u?._id?.toString() || (r as any).user_id?.toString(),
      users,
      created_at: (r as any).createdAt ?? (r as any).created_at,
      updated_at: (r as any).updatedAt ?? (r as any).updated_at,
    };
  });

  return prioritizeReports(mapped);
}

/** Get a single report by ID. Citizen: own reports only. Agency: reports for their service types. */
export async function getReportById(
  reportId: string,
  opts: { userId?: string; userRole?: string; userAgencyId?: string }
) {
  const report = await Report.findById(reportId).lean();
  if (!report) {
    throw new Error('Report not found');
  }

  const role = opts.userRole || '';

  if (role === 'citizen') {
    if (!opts.userId || (report as any).user_id?.toString() !== opts.userId) {
      throw new Error('Report not found');
    }
    const statusNorm = (report as any).status === 'received' ? 'submitted' : (report as any).status;
    return {
      ...report,
      id: (report as any)._id.toString(),
      user_id: (report as any).user_id?.toString(),
      status: statusNorm,
      allowed_next_statuses: getAllowedNextStatuses(statusNorm),
      status_history: ((report as any).status_history || []).map((h: any) => ({
        status: h.status === 'received' ? 'submitted' : h.status,
        timestamp: h.timestamp,
        updated_by: h.updated_by?.toString(),
        updated_by_role: h.updated_by_role,
        comment: h.comment,
      })),
      created_at: (report as any).createdAt ?? (report as any).created_at,
      updated_at: (report as any).updatedAt ?? (report as any).updated_at,
    };
  }

  if (['agency_admin', 'super_admin', 'agency', 'admin'].includes(role)) {
    if (role !== 'super_admin' && opts.userAgencyId) {
      const agencyCode = await getAgencyCode(opts.userAgencyId);
      const serviceType = (report as any).service_type || '';
      const belongsToAgency = agencyCode && (serviceType === agencyCode || serviceType.startsWith(agencyCode + '_'));
      if (!belongsToAgency) {
        throw new Error('Report not found');
      }
    }
    const populated = await Report.findById(reportId)
      .populate('user_id', 'full_name phone_number email')
      .lean();
    const u = (populated as any)?.user_id;
    const raw = (populated || report) as any;
    const statusNorm = raw.status === 'received' ? 'submitted' : raw.status;
    return {
      ...raw,
      id: raw._id.toString(),
      user_id: u?._id?.toString() || raw.user_id?.toString(),
      status: statusNorm,
      allowed_next_statuses: getAllowedNextStatuses(statusNorm),
      status_history: (raw.status_history || []).map((h: any) => ({
        status: h.status === 'received' ? 'submitted' : h.status,
        timestamp: h.timestamp,
        updated_by: h.updated_by?.toString(),
        updated_by_role: h.updated_by_role,
        comment: h.comment,
      })),
      users: u
        ? { full_name: u.full_name, phone_number: u.phone_number, email: u.email }
        : { full_name: null, phone_number: null, email: null },
      created_at: raw.createdAt ?? raw.created_at,
      updated_at: raw.updatedAt ?? raw.updated_at,
    };
  }

  throw new Error('Report not found');
}

export async function updateReportStatus(data: UpdateReportStatusData) {
  const { reportId, status, updatedByUserId, updatedByRole, comment } = data;

  const report = await Report.findById(reportId).lean();
  if (!report) {
    throw new Error('Report not found');
  }

  const currentStatus = (report as any).status === 'received' ? 'submitted' : (report as any).status;
  const newStatus = normalizeStatus(status);

  if (!isValidTransition(currentStatus, newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  const now = new Date();
  const historyEntry = {
    status: newStatus,
    timestamp: now,
    updated_by: updatedByUserId,
    updated_by_role: updatedByRole,
    comment: comment || undefined,
  };

  const update: Record<string, unknown> = {
    status: newStatus,
    $push: { status_history: historyEntry },
  };
  if (newStatus === 'resolved') {
    update.resolved_at = now;
  }

  const updated = await Report.findByIdAndUpdate(
    reportId,
    update,
    { new: true }
  ).lean();

  if (!updated) {
    throw new Error(`Failed to update report: ${reportId}`);
  }

  const reportOwnerId = (report as any).user_id?.toString();
  if (reportOwnerId && reportOwnerId !== updatedByUserId) {
    const messages: Record<string, string> = {
      resolved: 'Your report has been resolved.',
      rejected: 'Your report has been rejected.',
      under_review: 'Your report is under review.',
      assigned: 'Your report has been assigned to a team member.',
      in_progress: 'Your report is now in progress.',
    };
    const message = messages[newStatus] || `Report status updated to ${newStatus}.`;
    const notifType = newStatus === 'resolved' ? 'resolution' : newStatus === 'rejected' ? 'rejection' : 'status_update';
    await createUserNotification({
      userId: reportOwnerId,
      message,
      relatedReportId: reportId,
      type: notifType,
    }).catch(() => {});
  }

  const statusNorm = (updated as any).status === 'received' ? 'submitted' : (updated as any).status;
  return {
    ...updated,
    id: (updated as any)._id.toString(),
    user_id: (updated as any).user_id?.toString(),
    status: statusNorm,
    status_history: ((updated as any).status_history || []).map((h: any) => ({
      status: h.status === 'received' ? 'submitted' : h.status,
      timestamp: h.timestamp,
      updated_by: h.updated_by?.toString(),
      updated_by_role: h.updated_by_role,
      comment: h.comment,
    })),
    created_at: (updated as any).createdAt ?? (updated as any).created_at,
    updated_at: (updated as any).updatedAt ?? (updated as any).updated_at,
  };
}

export async function deleteReport(reportId: string, userId: string, userRole: string, userAgencyId?: string): Promise<void> {
  const report = await Report.findById(reportId).lean();
  if (!report) {
    throw new Error('Report not found');
  }
  if (userRole === 'citizen') {
    if (report.user_id?.toString() !== userId) {
      throw new Error('You can only delete your own reports');
    }
  } else if (['agency_admin', 'super_admin', 'agency', 'admin'].includes(userRole)) {
    if (userRole !== 'super_admin' && userAgencyId) {
      const agencyCode = await getAgencyCode(userAgencyId);
      const reportService = (report as any).service_type || '';
      const belongsToAgency = agencyCode && (reportService === agencyCode || reportService.startsWith(agencyCode + '_'));
      if (!belongsToAgency) {
        throw new Error('You can only delete reports for your agency');
      }
    }
  } else {
    throw new Error('Insufficient permissions to delete reports');
  }
  await Report.findByIdAndDelete(reportId);
}

export async function getReportClusters(agencyId: string) {
  const agencyCode = await getAgencyCode(agencyId);
  if (!agencyCode) {
    throw new Error('Invalid agency');
  }

  const reports = await Report.find({
    $or: [
      { service_type: agencyCode },
      { service_type: new RegExp(`^${agencyCode}_`, 'i') },
    ],
  })
    .select('location sector cell service_type')
    .lean();

  const clusters: Record<string, number> = {};
  reports.forEach((r) => {
    const key = (r as any).location || 'Unknown';
    clusters[key] = (clusters[key] || 0) + 1;
  });

  return Object.entries(clusters)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}

/** Location-based: find reports near a point (for map/nearby). Uses geospatial index. */
export async function getReportsNearby(
  lng: number,
  lat: number,
  maxDistanceKm: number,
  opts?: { agencyCode?: string | null; limit?: number }
) {
  const limit = Math.min(opts?.limit ?? 50, 100);
  const geoMatch = {
    location_geo: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistanceKm * 1000,
      },
    },
  };
  const query: Record<string, unknown> = opts?.agencyCode
    ? { $and: [geoMatch, { $or: [{ service_type: opts.agencyCode }, { service_type: new RegExp(`^${opts.agencyCode}_`, 'i') }] }] }
    : geoMatch;

  const reports = await Report.find(query)
    .populate('user_id', 'full_name phone_number email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return reports.map((r) => {
    const u = (r as any).user_id;
    const statusNorm = (r as any).status === 'received' ? 'submitted' : (r as any).status;
    return {
      ...r,
      id: (r as any)._id.toString(),
      user_id: u?._id?.toString() || (r as any).user_id?.toString(),
      status: statusNorm,
      users: u ? { full_name: u.full_name, phone_number: u.phone_number, email: u.email } : null,
      created_at: (r as any).createdAt ?? (r as any).created_at,
      updated_at: (r as any).updatedAt ?? (r as any).updated_at,
    };
  });
}

/** Super admin: get all reports across all agencies */
export async function getAllReports(filters?: { serviceType?: string; location?: string; status?: string }) {
  const query: Record<string, any> = {};
  if (filters?.location) query.location = new RegExp(filters.location, 'i');
  if (filters?.serviceType) query.service_type = filters.serviceType;
  if (filters?.status) query.status = filters.status;

  const reports = await Report.find(query)
    .populate('user_id', 'full_name phone_number email')
    .sort({ createdAt: -1 })
    .lean();

  const mapped = reports.map((r) => {
    const u = (r as any).user_id;
    return {
      ...r,
      id: (r as any)._id.toString(),
      user_id: u?._id?.toString() || (r as any).user_id?.toString(),
      users: u ? { full_name: u.full_name, phone_number: u.phone_number, email: u.email } : { full_name: null, phone_number: null, email: null },
      created_at: (r as any).createdAt ?? (r as any).created_at,
      updated_at: (r as any).updatedAt ?? (r as any).updated_at,
    };
  });

  return prioritizeReports(mapped);
}

/** Super admin: get clusters across all agencies */
export async function getAllReportClusters() {
  const reports = await Report.find({}).select('location').lean();
  const clusters: Record<string, number> = {};
  reports.forEach((r) => {
    const key = (r as any).location || 'Unknown';
    clusters[key] = (clusters[key] || 0) + 1;
  });
  return Object.entries(clusters)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}
