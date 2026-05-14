import { describe, expect, it } from 'vitest';

import {
  controlFieldClassNames,
  controlLabelClassNames,
  leadFormSubmitButtonClassNames,
  requiredMarkClassNames,
} from '../../src/lib/fieldStyles';

describe('fieldStyles', () => {
  it('controlFieldClassNames includes border and radius tokens', () => {
    const s = controlFieldClassNames();
    expect(s).toContain('border-[2.5px]');
    expect(s).toContain('border-ds-charcoal');
    expect(s).toContain('rounded-md');
  });

  it('leadFormSubmitButtonClassNames includes CTA surface and shadow', () => {
    const s = leadFormSubmitButtonClassNames();
    expect(s).toContain('bg-ds-green-vivid');
    expect(s).toContain('shadow-ds-sm');
  });

  it('label and required mark reference semantic colors', () => {
    expect(controlLabelClassNames()).toContain('text-ds-charcoal');
    expect(requiredMarkClassNames()).toContain('text-ds-error');
  });
});
