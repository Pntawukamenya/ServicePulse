/**
 * Rwanda agency-specific services
 * Based on REG, WASAC, and Emergency Services (Police, RIB, Disaster, Fire)
 */

export type AgencyCode = 'REG' | 'WASAC' | 'EMERGENCY';

export interface Service {
  code: string;
  labelKey: string;
  agency: AgencyCode;
}

// REG - Rwanda Energy Group (Electricity)
export const REG_SERVICES: Service[] = [
  { code: 'REG_POWER_OUTAGE', labelKey: 'services.reg.powerOutage', agency: 'REG' },
  { code: 'REG_METER_ISSUE', labelKey: 'services.reg.meterIssue', agency: 'REG' },
  { code: 'REG_CONNECTION', labelKey: 'services.reg.connection', agency: 'REG' },
  { code: 'REG_BILLING', labelKey: 'services.reg.billing', agency: 'REG' },
  { code: 'REG_TRANSFORMER_FAULT', labelKey: 'services.reg.transformerFault', agency: 'REG' },
  { code: 'REG_LOAD_SHEDDING', labelKey: 'services.reg.loadShedding', agency: 'REG' },
  { code: 'REG_SAFETY_HAZARD', labelKey: 'services.reg.safetyHazard', agency: 'REG' },
];

// WASAC - Water and Sanitation Corporation
export const WASAC_SERVICES: Service[] = [
  { code: 'WASAC_WATER_SUPPLY', labelKey: 'services.wasac.waterSupply', agency: 'WASAC' },
  { code: 'WASAC_WATER_QUALITY', labelKey: 'services.wasac.waterQuality', agency: 'WASAC' },
  { code: 'WASAC_PIPE_BURST', labelKey: 'services.wasac.pipeBurst', agency: 'WASAC' },
  { code: 'WASAC_LOW_PRESSURE', labelKey: 'services.wasac.lowPressure', agency: 'WASAC' },
  { code: 'WASAC_CONNECTION', labelKey: 'services.wasac.connection', agency: 'WASAC' },
  { code: 'WASAC_BILLING', labelKey: 'services.wasac.billing', agency: 'WASAC' },
  { code: 'WASAC_SEWAGE', labelKey: 'services.wasac.sewage', agency: 'WASAC' },
];

// EMERGENCY - Police, RIB, Fire, Disaster, Public Safety
export const EMERGENCY_SERVICES: Service[] = [
  { code: 'EMERGENCY_POLICE', labelKey: 'services.emergency.police', agency: 'EMERGENCY' },
  { code: 'EMERGENCY_CRIME', labelKey: 'services.emergency.crime', agency: 'EMERGENCY' },
  { code: 'EMERGENCY_FIRE', labelKey: 'services.emergency.fire', agency: 'EMERGENCY' },
  { code: 'EMERGENCY_AMBULANCE', labelKey: 'services.emergency.ambulance', agency: 'EMERGENCY' },
  { code: 'EMERGENCY_DISASTER', labelKey: 'services.emergency.disaster', agency: 'EMERGENCY' },
  { code: 'EMERGENCY_RIB', labelKey: 'services.emergency.rib', agency: 'EMERGENCY' },
];

export const ALL_SERVICES: Service[] = [...REG_SERVICES, ...WASAC_SERVICES, ...EMERGENCY_SERVICES];

export function getServicesByAgency(agencyCode: AgencyCode): Service[] {
  switch (agencyCode) {
    case 'REG': return REG_SERVICES;
    case 'WASAC': return WASAC_SERVICES;
    case 'EMERGENCY': return EMERGENCY_SERVICES;
    default: return [];
  }
}

export function getAgencyFromServiceCode(code: string): AgencyCode | null {
  if (code.startsWith('REG')) return 'REG';
  if (code.startsWith('WASAC')) return 'WASAC';
  if (code.startsWith('EMERGENCY')) return 'EMERGENCY';
  return null;
}

export function isValidServiceForAgency(serviceCode: string, agencyCode: AgencyCode): boolean {
  const services = getServicesByAgency(agencyCode);
  return services.some((s) => s.code === serviceCode);
}

export function getServiceLabelKey(serviceCode: string): string | null {
  const service = ALL_SERVICES.find((s) => s.code === serviceCode);
  return service?.labelKey ?? null;
}

/** User-facing display name: translated label or formatted code (no underscores). */
export function getServiceDisplayName(serviceCode: string, t: (key: string) => string): string {
  const key = getServiceLabelKey(serviceCode);
  if (key) return t(key);
  return (serviceCode || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
