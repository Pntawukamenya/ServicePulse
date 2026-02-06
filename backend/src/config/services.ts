/**
 * Rwanda agency-specific services - must match frontend config
 */
export type AgencyCode = 'REG' | 'WASAC' | 'EMERGENCY';

const REG_SERVICES = ['REG', 'REG_POWER_OUTAGE', 'REG_METER_ISSUE', 'REG_CONNECTION', 'REG_BILLING', 'REG_TRANSFORMER_FAULT', 'REG_LOAD_SHEDDING', 'REG_SAFETY_HAZARD'];
const WASAC_SERVICES = ['WASAC', 'WASAC_WATER_SUPPLY', 'WASAC_WATER_QUALITY', 'WASAC_PIPE_BURST', 'WASAC_LOW_PRESSURE', 'WASAC_CONNECTION', 'WASAC_BILLING', 'WASAC_SEWAGE'];
const EMERGENCY_SERVICES = ['EMERGENCY', 'EMERGENCY_POLICE', 'EMERGENCY_CRIME', 'EMERGENCY_FIRE', 'EMERGENCY_AMBULANCE', 'EMERGENCY_DISASTER', 'EMERGENCY_RIB'];

export function isValidServiceForAgency(serviceCode: string, agencyCode: AgencyCode): boolean {
  switch (agencyCode) {
    case 'REG': return REG_SERVICES.includes(serviceCode);
    case 'WASAC': return WASAC_SERVICES.includes(serviceCode);
    case 'EMERGENCY': return EMERGENCY_SERVICES.includes(serviceCode);
    default: return false;
  }
}

export function getAgencyFromServiceCode(code: string): AgencyCode | null {
  if (code.startsWith('REG')) return 'REG';
  if (code.startsWith('WASAC')) return 'WASAC';
  if (code.startsWith('EMERGENCY')) return 'EMERGENCY';
  return null;
}
