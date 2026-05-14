/**
 * Reusable Tailwind class strings for form controls.
 * Pure functions / constants — easy to unit-test and keep in sync with the design system.
 */

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-green focus-visible:ring-offset-2 focus-visible:ring-offset-ds-white';

/** Text input, select, textarea chrome (marketing / shared). */
export function controlFieldClassNames(): string {
  return [
    'mt-1 w-full',
    'rounded-md',
    'border-[2.5px] border-ds-charcoal',
    'bg-ds-white',
    'px-3 py-2.5',
    'text-base font-normal text-ds-charcoal',
    'placeholder:text-ds-gray',
    FOCUS_RING,
  ].join(' ');
}

export function controlLabelClassNames(): string {
  return 'block text-sm font-semibold text-ds-charcoal';
}

export function requiredMarkClassNames(): string {
  return 'ml-0.5 font-bold text-ds-error';
}

/** Primary submit action — matches Button `vivid` (CTA). */
export function leadFormSubmitButtonClassNames(): string {
  return [
    'mt-2 inline-flex w-full items-center justify-center gap-2',
    'rounded-md',
    'border-[2.5px] border-ds-charcoal',
    'bg-ds-green-vivid px-5 py-3',
    'text-base font-semibold text-ds-charcoal',
    'shadow-ds-sm',
    'transition-opacity duration-150 hover:opacity-90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-green focus-visible:ring-offset-2 focus-visible:ring-offset-ds-white',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' ');
}
