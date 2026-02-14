import User from '../models/User';
import Agency from '../models/Agency';

export async function getPendingApprovals(agencyCode: string) {
  const users = await User.find({
    role: 'agency_employee',
    agency_code: agencyCode,
    status: 'pending_approval',
  })
    .select('email phone_number full_name created_at')
    .sort({ created_at: -1 })
    .lean();

  return users.map((u) => ({
    ...u,
    id: u._id.toString(),
  }));
}

export async function approveUser(userId: string, approverId: string, agencyCode: string) {
  const user = await User.findById(userId).select('agency_code status').lean();
  if (!user || user.agency_code !== agencyCode || user.status !== 'pending_approval') {
    throw new Error('User not found or not pending approval');
  }

  const agency = await Agency.findOne({ code: agencyCode }).select('_id').lean();
  const updates: Record<string, any> = {
    status: 'active',
    approved_by: approverId,
    approved_at: new Date(),
  };
  if (agency) updates.agency_id = agency._id;

  const updated = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).lean();

  if (!updated) throw new Error('Failed to approve user');
  return {
    ...updated,
    id: updated._id.toString(),
    agency_id: updated.agency_id?.toString(),
  };
}
