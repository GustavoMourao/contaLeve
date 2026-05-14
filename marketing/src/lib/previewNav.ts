/**
 * Shared navigation for the marketing preview hub (LP index, design system, handbook).
 */

export type PreviewHubArea = 'campaigns' | 'design-system' | 'docs';

export interface PreviewTopNavItem {
  area: PreviewHubArea;
  href: string;
  label: string;
}

export const previewTopNavItems: PreviewTopNavItem[] = [
  { area: 'campaigns', href: '/', label: 'Campaigns' },
  { area: 'design-system', href: '/design-system', label: 'Design system' },
  { area: 'docs', href: '/docs', label: 'Handbook' },
];

/** In-page sections for `/design-system` (single page, anchor navigation). */
export interface DesignSystemNavItem {
  id: string;
  label: string;
}

export const designSystemNavItems: DesignSystemNavItem[] = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'tokens', label: 'Tokens CSS' },
  { id: 'typography', label: 'Tipografia' },
  { id: 'buttons', label: 'Botões' },
  { id: 'shadows', label: 'Sombras' },
  { id: 'badges', label: 'Badges e raios' },
  { id: 'fields', label: 'Campos' },
  { id: 'alerts', label: 'Alertas' },
  { id: 'content-overrides', label: 'Token overrides' },
];
