import { supabase } from '../config/database';
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

export async function createReport(data: CreateReportData) {
  const { userId, serviceType, location, description, sector, cell } = data;

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      service_type: serviceType,
      location,
      sector: sector || null,
      cell: cell || null,
      description,
      status: 'received',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create report: ${error.message}`);
  }

  return report;
}

export async function getReportsByUser(userId: string) {
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return reports || [];
}

export async function getReportsByAgency(agencyId: string, filters?: { serviceType?: string; location?: string; status?: string }) {
  // Get agency code from agency ID
  const agencyCode = await getAgencyCode(agencyId);
  if (!agencyCode) {
    throw new Error('Invalid agency');
  }

  let query = supabase
    .from('reports')
    .select(`
      *,
      users:user_id (full_name, phone_number, email)
    `)
    .eq('service_type', agencyCode)
    .order('created_at', { ascending: false });

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data: reports, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return reports || [];
}

export async function updateReportStatus(data: UpdateReportStatusData) {
  const { reportId, status, agencyId } = data;

  const { data: report, error } = await supabase
    .from('reports')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update report: ${error.message}`);
  }

  return report;
}

export async function getReportClusters(agencyId: string) {
  // Get agency code from agency ID
  const agencyCode = await getAgencyCode(agencyId);
  if (!agencyCode) {
    throw new Error('Invalid agency');
  }

  const { data: reports, error } = await supabase
    .from('reports')
    .select('location, sector, cell, service_type')
    .eq('service_type', agencyCode);

  if (error) {
    throw new Error(`Failed to fetch clusters: ${error.message}`);
  }

  // Simple clustering by location
  const clusters: Record<string, number> = {};
  reports?.forEach((report) => {
    const key = report.location || 'Unknown';
    clusters[key] = (clusters[key] || 0) + 1;
  });

  return Object.entries(clusters)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}
