import Report from '../models/Report';
import mongoose from 'mongoose';

const SLA_CRITICAL_HOURS = 24;

export interface ReportAnalytics {
  totalByCategory: { service_type: string; count: number }[];
  resolutionRate: number;
  averageResolutionTimeHours: number | null;
  monthlyTrends: { month: string; total: number; resolved: number }[];
  priorityDistribution: { priority: string; count: number }[];
  criticalOverdueCount: number;
}

function getMatchForAgency(agencyCode: string | null): Record<string, unknown> {
  if (!agencyCode) return {};
  return {
    $or: [
      { service_type: agencyCode },
      { service_type: new RegExp(`^${agencyCode}_`, 'i') },
    ],
  };
}

export async function getReportAnalytics(agencyCode: string | null): Promise<ReportAnalytics> {
  const match = getMatchForAgency(agencyCode);
  const matchBase = Object.keys(match).length ? match : {};

  const [
    totalByCategoryRes,
    resolutionRateRes,
    avgResolutionRes,
    monthlyRes,
    priorityRes,
    criticalOverdueRes,
  ] = await Promise.all([
    Report.aggregate([
      { $match: matchBase },
      { $group: { _id: '$service_type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { service_type: '$_id', count: 1, _id: 0 } },
    ]),
    Report.aggregate([
      { $match: matchBase },
      { $group: { _id: null, total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
      { $project: { resolutionRate: { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$resolved', '$total'] } ] } } },
    ]),
    Report.aggregate([
      { $match: { ...matchBase, status: 'resolved', resolved_at: { $exists: true, $ne: null } } },
      { $project: { created: '$createdAt', resolved: '$resolved_at' } },
      { $project: { hours: { $divide: [{ $subtract: ['$resolved', '$created'] }, 1000 * 60 * 60] } } },
      { $group: { _id: null, avgHours: { $avg: '$hours' } } },
    ]),
    Report.aggregate([
      { $match: matchBase },
      { $project: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, status: 1 } },
      { $group: { _id: '$month', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', total: 1, resolved: 1, _id: 0 } },
    ]),
    Report.aggregate([
      { $match: matchBase },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { priority: { $ifNull: ['$_id', 'medium'] }, count: 1, _id: 0 } },
    ]),
    Report.countDocuments({
      ...matchBase,
      priority: 'critical',
      status: { $nin: ['resolved', 'rejected'] },
      createdAt: { $lt: new Date(Date.now() - SLA_CRITICAL_HOURS * 60 * 60 * 1000) },
    }),
  ]);

  const resolutionRate = resolutionRateRes[0]?.resolutionRate ?? 0;
  const avgResolutionHours = avgResolutionRes[0]?.avgHours ?? null;

  return {
    totalByCategory: totalByCategoryRes,
    resolutionRate: Math.round(resolutionRate * 100) / 100,
    averageResolutionTimeHours: avgResolutionHours != null ? Math.round(avgResolutionHours * 100) / 100 : null,
    monthlyTrends: monthlyRes,
    priorityDistribution: priorityRes,
    criticalOverdueCount: criticalOverdueRes,
  };
}
