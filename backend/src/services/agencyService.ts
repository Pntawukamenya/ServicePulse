import Agency from '../models/Agency';

export async function getAgencyCode(agencyId: string): Promise<string | null> {
  const agency = await Agency.findById(agencyId).select('code').lean();
  return agency?.code || null;
}

/** Returns agency id and code if the code exists (for validation). */
export async function getAgencyByCode(code: string): Promise<{ id: string; code: string } | null> {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) return null;
  const agency = await Agency.findOne({ code: normalized }).select('_id code').lean();
  if (!agency) return null;
  return { id: (agency as any)._id.toString(), code: (agency as any).code };
}

export async function getAgencyById(agencyId: string) {
  const agency = await Agency.findById(agencyId).lean();
  if (!agency) {
    throw new Error(`Agency not found: ${agencyId}`);
  }
  return {
    ...agency,
    id: agency._id.toString(),
  };
}
