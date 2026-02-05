import { supabase } from '../config/database';

export async function getAgencyCode(agencyId: string): Promise<string | null> {
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('code')
    .eq('id', agencyId)
    .single();

  if (error || !agency) {
    return null;
  }

  return agency.code;
}

export async function getAgencyById(agencyId: string) {
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', agencyId)
    .single();

  if (error) {
    throw new Error(`Agency not found: ${error.message}`);
  }

  return agency;
}
