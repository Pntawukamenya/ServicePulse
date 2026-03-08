/**
 * Rwanda agency-specific services - must match frontend config
 */
export type AgencyCode = 'REG' | 'WASAC' | 'EMERGENCY';

const REG_SERVICES = ['REG', 'REG_POWER_OUTAGE', 'REG_METER_ISSUE', 'REG_CONNECTION', 'REG_BILLING', 'REG_TRANSFORMER_FAULT', 'REG_LOAD_SHEDDING', 'REG_SAFETY_HAZARD'];
const WASAC_SERVICES = ['WASAC', 'WASAC_WATER_SUPPLY', 'WASAC_WATER_QUALITY', 'WASAC_PIPE_BURST', 'WASAC_LOW_PRESSURE', 'WASAC_CONNECTION', 'WASAC_BILLING', 'WASAC_SEWAGE'];
const EMERGENCY_SERVICES = ['EMERGENCY', 'EMERGENCY_POLICE', 'EMERGENCY_CRIME', 'EMERGENCY_FIRE', 'EMERGENCY_AMBULANCE', 'EMERGENCY_DISASTER', 'EMERGENCY_RIB'];

/** Display names for end-user UI (email, SMS). No underscores. */
const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  REG_POWER_OUTAGE: 'Power Outage',
  REG_METER_ISSUE: 'Meter Malfunction',
  REG_CONNECTION: 'Connection/Reconnection',
  REG_BILLING: 'Billing Inquiry',
  REG_TRANSFORMER_FAULT: 'Transformer Fault',
  REG_LOAD_SHEDDING: 'Load Shedding',
  REG_SAFETY_HAZARD: 'Safety Hazard',
  WASAC_WATER_SUPPLY: 'Water Supply Disruption',
  WASAC_WATER_QUALITY: 'Water Quality Issue',
  WASAC_PIPE_BURST: 'Pipe Burst/Leak',
  WASAC_LOW_PRESSURE: 'Low/No Water Pressure',
  WASAC_CONNECTION: 'Connection Issue',
  WASAC_BILLING: 'Billing',
  WASAC_SEWAGE: 'Sewage/Drainage Blockage',
  EMERGENCY_POLICE: 'Police Emergency',
  EMERGENCY_CRIME: 'Crime Report',
  EMERGENCY_FIRE: 'Fire Emergency',
  EMERGENCY_AMBULANCE: 'Medical/Ambulance',
  EMERGENCY_DISASTER: 'Disaster (Flood, Landslide)',
  EMERGENCY_RIB: 'RIB Report (Fraud, Investigation)',
};

export function getServiceDisplayName(serviceCode: string): string {
  const name = SERVICE_DISPLAY_NAMES[(serviceCode || '').trim()];
  if (name) return name;
  return (serviceCode || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

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
