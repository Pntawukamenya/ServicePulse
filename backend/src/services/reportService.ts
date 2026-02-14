import Report from '../models/Report';
import User from '../models/User';
import { getAgencyCode } from './agencyService';

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
  const r = doc.toObject ? doc.toObject() : doc;
  return {
    ...r,
    id: r._id?.toString() || r.id,
    user_id: r.user_id?.toString() || r.user_id,
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
    .sort({ created_at: -1 })
    .lean();

  return reports.map((r) => ({
    ...r,
    id: r._id.toString(),
    user_id: r.user_id?.toString(),
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
    .sort({ created_at: -1 })
    .lean();

  return reports.map((r) => {
    const u = (r as any).user_id;
    const users = u
      ? { full_name: u.full_name, phone_number: u.phone_number, email: u.email }
      : { full_name: null, phone_number: null, email: null };
    return {
      ...r,
      id: (r as any)._id.toString(),
      user_id: u?._id?.toString() || (r as any).user_id?.toString(),
      users,
    };
  });
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
  };
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
