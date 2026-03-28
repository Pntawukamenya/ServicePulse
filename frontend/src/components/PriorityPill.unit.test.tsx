import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityPill } from './PriorityPill';

vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
  }),
}));

describe('PriorityPill (unit)', () => {
  it('renders nothing when level is undefined', () => {
    const { container } = render(<PriorityPill />);
    expect(container.firstChild).toBeNull();
  });

  it('renders translated label for high priority', () => {
    render(<PriorityPill level="high" />);
    expect(screen.getByText('citizen.priorityCritical')).toBeInTheDocument();
  });

  it('renders medium and low levels', () => {
    const { rerender } = render(<PriorityPill level="medium" />);
    expect(screen.getByText('citizen.priorityMedium')).toBeInTheDocument();
    rerender(<PriorityPill level="low" />);
    expect(screen.getByText('citizen.priorityLow')).toBeInTheDocument();
  });
});
