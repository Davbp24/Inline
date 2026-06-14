/**
 * Panel UI tokens — modelled directly on Attio's product surfaces:
 * crisp white cards, hairline borders, restrained elevation, a warm
 * cream sidebar, and the segmented "New toolbar" formatting bar.
 *
 * Token names are kept stable so every existing panel keeps rendering;
 * the values are tuned to the Attio reference shots (white pages, cream
 * sidebars only, soft 1px borders, gentle shadows).
 */
export const FONT =
  '-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", system-ui, sans-serif' as const

/** Deep navy brand colour — the launcher tile and every panel brand mark. */
export const BRAND = '#0B1735' as const

export const PANEL = {
  /* Warm, solid product surfaces — off-white panel, crisp white inner cards. */
  bg: '#FBFAF7',
  headerBg: '#FBFAF7',
  surfaceMuted: '#F1EFE9',
  surfaceBubble: '#FFFFFF',
  surfaceSunken: '#F4F2EC',
  border: 'rgba(17, 19, 33, 0.09)',
  borderStrong: 'rgba(17, 19, 33, 0.14)',
  divider: 'rgba(17, 19, 33, 0.06)',
  /* Layered, soft elevation — not heavy blur. */
  shadow: '0 1px 2px rgba(17, 19, 33, 0.05), 0 12px 26px -12px rgba(17, 19, 33, 0.18), 0 32px 60px -30px rgba(17, 19, 33, 0.28)',
  shadowSoft: '0 1px 2px rgba(17, 19, 33, 0.05), 0 3px 8px -3px rgba(17, 19, 33, 0.07)',
  shadowCard: '0 1px 2px rgba(17, 19, 33, 0.04), 0 6px 16px -10px rgba(17, 19, 33, 0.12)',
  text: '#16182B',
  textMuted: '#5B5F70',
  textLight: '#9498A6',
  accent: '#0B1735',
  accentHover: '#15244A',
  link: '#3F6FE3',
  hoverBg: 'rgba(17, 19, 33, 0.05)',
  toneSelectedBg: '#EEEBE4',
  radius: 26,
  radiusLg: 22,
  radiusMd: 16,
  radiusSm: 12,
  radiusPill: 9999,
  toggleOn: '#0B1735',
  toggleOff: '#D7D4CC',
  inputBg: '#F4F2EC',
} as const

/**
 * Cream/beige sidebar palette — Attio applies the warm tint *only* to the
 * sidebar/rail; main surfaces stay white. Used by panels that render a
 * navigation sidebar (e.g. Notebooks).
 */
export const SIDEBAR = {
  bg: '#F7F4EE',
  bgSubtle: '#F2EEE6',
  border: 'rgba(28, 24, 18, 0.08)',
  hover: 'rgba(28, 24, 18, 0.05)',
  active: 'rgba(28, 24, 18, 0.08)',
  text: '#1C1E26',
  textMuted: '#7A7468',
  textLight: '#A39C8E',
} as const

/**
 * The Attio "New toolbar" — a floating, segmented formatting bar.
 * `swatches` mirror the colour row in the reference (light variant).
 */
export const TOOLBAR = {
  bg: '#FFFFFF',
  border: 'rgba(15, 18, 23, 0.10)',
  divider: 'rgba(15, 18, 23, 0.09)',
  shadow: '0 10px 30px -8px rgba(15, 18, 23, 0.22), 0 2px 6px -2px rgba(15, 18, 23, 0.10)',
  text: '#3A3D44',
  textStrong: '#1C1E26',
  textMuted: '#8A8F98',
  hover: 'rgba(15, 18, 23, 0.05)',
  active: 'rgba(15, 18, 23, 0.08)',
  radius: 13,
  radiusInner: 8,
} as const

/** Colour swatches matching the Attio New-toolbar palette (light). */
export const SWATCHES = [
  { name: 'Default', value: '#2A2A2E' },
  { name: 'Gray', value: '#8A8F98' },
  { name: 'Red', value: '#F2555A' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Yellow', value: '#FACC15' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Cyan', value: '#22D3EE' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#A855F7' },
] as const

/** Soft highlight fills keyed to the swatch colours (used when highlighting). */
export const HIGHLIGHT_SWATCHES = [
  { name: 'Yellow', value: 'rgba(250, 204, 21, 0.45)' },
  { name: 'Green', value: 'rgba(34, 197, 94, 0.38)' },
  { name: 'Blue', value: 'rgba(59, 130, 246, 0.34)' },
  { name: 'Pink', value: 'rgba(236, 72, 153, 0.32)' },
  { name: 'Orange', value: 'rgba(245, 158, 11, 0.40)' },
  { name: 'Purple', value: 'rgba(168, 85, 247, 0.32)' },
] as const

export const DARK_PANEL = {
  bg: '#1C1E26',
  headerBg: '#252830',
  surfaceMuted: '#2a2d38',
  surfaceBubble: '#22252e',
  border: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
  shadow: '0 12px 40px -12px rgba(0, 0, 0, 0.28)',
  shadowSoft: 'none',
  text: '#E4E4E8',
  textMuted: '#9a9ba4',
  textLight: '#6b6d78',
  accent: '#E4E4E8',
  accentHover: '#FFFFFF',
  link: '#7DB4F0',
  hoverBg: 'rgba(255, 255, 255, 0.06)',
  toneSelectedBg: '#31343e',
  radius: 14,
  radiusMd: 10,
  radiusSm: 8,
  radiusPill: 9999,
  toggleOn: '#7DB4F0',
  toggleOff: '#3a3d48',
  inputBg: '#22252e',
} as const

export type PanelTheme = typeof PANEL
