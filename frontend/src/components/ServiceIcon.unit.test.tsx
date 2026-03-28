import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ServiceIconBadge } from './ServiceIcon';

describe('ServiceIconBadge (unit)', () => {
  it('renders an svg for REG service codes', () => {
    const { container } = render(<ServiceIconBadge serviceCode="REG_POWER_OUTAGE" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders for WASAC and EMERGENCY codes', () => {
    const { container: c1 } = render(<ServiceIconBadge serviceCode="WASAC_PIPE_BURST" />);
    const { container: c2 } = render(<ServiceIconBadge serviceCode="EMERGENCY_FIRE" />);
    expect(c1.querySelector('svg')).toBeTruthy();
    expect(c2.querySelector('svg')).toBeTruthy();
  });
});
