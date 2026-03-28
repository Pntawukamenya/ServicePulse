import { describe, it, expect } from 'vitest';
import {
  normalizeStatus,
  isValidTransition,
  getAllowedNextStatuses,
} from './statusWorkflow';

describe('statusWorkflow (unit)', () => {
  describe('normalizeStatus', () => {
    it('maps legacy received to submitted', () => {
      expect(normalizeStatus('received')).toBe('submitted');
    });

    it('preserves known statuses', () => {
      expect(normalizeStatus('in_progress')).toBe('in_progress');
      expect(normalizeStatus('escalated')).toBe('escalated');
    });

    it('falls back to submitted for unknown', () => {
      expect(normalizeStatus('unknown_status')).toBe('submitted');
    });
  });

  describe('isValidTransition', () => {
    it('allows in_progress to resolved', () => {
      expect(isValidTransition('in_progress', 'resolved')).toBe(true);
    });

    it('allows in_progress to escalated', () => {
      expect(isValidTransition('in_progress', 'escalated')).toBe(true);
    });

    it('allows escalated to resolved', () => {
      expect(isValidTransition('escalated', 'resolved')).toBe(true);
    });

    it('disallows resolved to anything', () => {
      expect(isValidTransition('resolved', 'in_progress')).toBe(false);
    });
  });

  describe('getAllowedNextStatuses', () => {
    it('returns next states for submitted', () => {
      expect(getAllowedNextStatuses('submitted')).toContain('in_progress');
    });

    it('normalizes received before lookup', () => {
      expect(getAllowedNextStatuses('received')).toEqual(getAllowedNextStatuses('submitted'));
    });
  });
});
