import Report from '../models/Report';
import User from '../models/User';
import { getAgencyCode } from './agencyService';
import { prioritizeReports } from './prioritizationService';

export interface CreateReportData {
  userId: string;
  serviceType: string;
  location: string;
  description: string;
  sector?: string;
  cell?: string;
}

export interface UpdateReportStatusData {
  reportId: string;
  status: 'received' | 'in_progress' | 'resolved';
  agencyId: string;
}

function mapReport(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    user_id: obj.user_id?.toString() || obj.user_id,
    created_at: obj.createdAt ?? obj.created_at,
    updated_at: obj.updatedAt ?? obj.updated_at,
  };
}

export async function createReport(data: CreateReportData) {
  const { userId, serviceType, location, description, sector, cell } = data;

  const report = await Report.create({
    user_id: userId,
    service_type: serviceType,
    location,
    sector: sector || null,
    cell: cell || null,
    description,
    status: 'received',
  });

  return mapReport(report);
}

export async function getReportsByUser(userId: string) {
  const reports = await Report.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .lean();

  return reports.map((r) => ({
    ...r,
    id: r._id.toString(),
    user_id: r.user_id?.toString(),
    created_at: (r as any).createdAt ?? (r as any).created_at,
    updated_at: (r as any).updatedAt ?? (r as any).updated_at,
  }));
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
    return {
      ...report,
      id: (report as any)._id.toString(),
      user_id: (report as any).user_id?.toString(),
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
    return {
      ...(populated || report),
      id: ((populated || report) as any)._id.toString(),
      user_id: u?._id?.toString() || (report as any).user_id?.toString(),
      users: u
        ? { full_name: u.full_name, phone_number: u.phone_number, email: u.email }
        : { full_name: null, phone_number: null, email: null },
      created_at: ((populated || report) as any).createdAt ?? ((populated || report) as any).created_at,
      updated_at: ((populated || report) as any).updatedAt ?? ((populated || report) as any).updated_at,
    };
  }

  throw new Error('Report not found');
}

export async function updateReportStatus(data: UpdateReportStatusData) {
  const { reportId, status } = data;

  const report = await Report.findByIdAndUpdate(
    reportId,
    { $set: { status } },
    { new: true }
  ).lean();

  if (!report) {
    throw new Error(`Failed to update report: ${reportId}`);
  }

  return {
    ...report,
    id: report._id.toString(),
    user_id: report.user_id?.toString(),
    created_at: (report as any).createdAt ?? (report as any).created_at,
    updated_at: (report as any).updatedAt ?? (report as any).updated_at,
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
