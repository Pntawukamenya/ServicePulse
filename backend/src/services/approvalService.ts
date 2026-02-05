import { supabase } from '../config/database';

export async function getPendingApprovals(agencyCode: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, phone_number, full_name, created_at')
    .eq('role', 'agency_employee')
    .eq('agency_code', agencyCode)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function approveUser(userId: string, approverId: string, agencyCode: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id, agency_code, status')
    .eq('id', userId)
    .single();

  if (!user || user.agency_code !== agencyCode || user.status !== 'pending_approval') {
    throw new Error('User not found or not pending approval');
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      status: 'active',
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
