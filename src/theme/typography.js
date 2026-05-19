// Typography — relies on system serif + a hand-written accent.
// We intentionally avoid Inter / Roboto / Poppins. Using "Georgia"/"Times"
// as a serif fallback that ships with both iOS and Android avoids the
// font-loading round-trip while still feeling editorial.
import { Platform } from 'react-native';

export const fonts = {
  // Editorial serif for headlines & display
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
  // Italic serif for romantic accents
  serifItalic: Platform.select({
    ios: 'Georgia-Italic',
    android: 'serif',
    default: 'Georgia',
  }),
  // Clean body
  body: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    default: 'system-ui',
  }),
  // Mono for dates / metadata
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const text = {
  displayXL: { fontFamily: fonts.serif, fontSize: 44, lineHeight: 50, fontWeight: '500', letterSpacing: -0.6 },
  display: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, fontWeight: '500', letterSpacing: -0.4 },
  title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, fontWeight: '500', letterSpacing: -0.2 },
  subtitle: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, fontStyle: 'italic' },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14, letterSpacing: 1.4, textTransform: 'uppercase' },
  numeric: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 16, letterSpacing: 0.5 },
};
