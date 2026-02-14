import Agency from '../models/Agency';

export async function getAgencyCode(agencyId: string): Promise<string | null> {
  const agency = await Agency.findById(agencyId).select('code').lean();
  return agency?.code || null;
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
