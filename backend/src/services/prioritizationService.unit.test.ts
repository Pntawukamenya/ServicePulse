import { describe, it, expect } from 'vitest';
import {
  computeReportPriority,
  computeNotificationPriority,
  prioritizeReports,
  prioritizeNotifications,
} from './prioritizationService';

describe('prioritizationService (unit)', () => {
  const recent = new Date().toISOString();

  describe('computeReportPriority', () => {
    it('returns higher score for emergency vs billing-style service', () => {
      const emergency = computeReportPriority({
        service_type: 'EMERGENCY_FIRE',
        status: 'submitted',
        description: 'Fire visible',
        created_at: recent,
      });
      const billing = computeReportPriority({
        service_type: 'REG_BILLING',
        status: 'submitted',
        description: 'Invoice question',
        created_at: recent,
      });
      expect(emergency.score).toBeGreaterThan(billing.score);
      expect(['high', 'medium', 'low']).toContain(emergency.level);
    });

    it('applies hotspot boost when location appears more than once', () => {
      const single = computeReportPriority(
        {
          service_type: 'WASAC_PIPE_BURST',
          status: 'in_progress',
          description: 'Leak',
          created_at: recent,
          location: 'Gasabo, Remera',
        },
        { 'Gasabo, Remera': 1 }
      );
      const hotspot = computeReportPriority(
        {
          service_type: 'WASAC_PIPE_BURST',
          status: 'in_progress',
          description: 'Leak',
          created_at: recent,
          location: 'Gasabo, Remera',
        },
        { 'Gasabo, Remera': 3 }
      );
      expect(hotspot.score).toBeGreaterThanOrEqual(single.score);
    });
  });

  describe('computeNotificationPriority', () => {
    it('produces score and level', () => {
      const r = computeNotificationPriority({
        service_type: 'EMERGENCY_POLICE',
        created_at: recent,
      });
      expect(r.score).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(r.level);
    });
  });

  describe('prioritizeReports / prioritizeNotifications', () => {
    it('sorts reports by priority_score descending', () => {
      const older = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const out = prioritizeReports([
        { id: '1', service_type: 'REG_BILLING', status: 'submitted', description: 'x', created_at: recent, location: 'A' },
        { id: '2', service_type: 'EMERGENCY_FIRE', status: 'submitted', description: 'fire', created_at: older, location: 'B' },
      ]);
      expect(out[0].priority_score).toBeGreaterThanOrEqual(out[1].priority_score);
      expect(out[0].priority_level).toBeDefined();
    });

    it('annotates notifications with priority fields', () => {
      const out = prioritizeNotifications([
        { id: '1', service_type: 'REG_POWER_OUTAGE', created_at: recent },
      ]);
      expect(out[0].priority_score).toBeDefined();
      expect(out[0].priority_level).toBeDefined();
    });
  });
});
