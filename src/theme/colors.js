// Tethered — warm, editorial, hand-stitched aesthetic.
// Off-white paper background, terracotta ink, sage and honey accents, deep
// cocoa text. Deliberately avoids the typical purple/pink couple-app cliché.

export const colors = {
  // Surfaces
  paper: '#FFF6EC',        // warm cream, primary background
  paperDeep: '#F4E7D2',    // toned section background
  card: '#FFFDF8',         // soft white for cards
  edge: '#E9D9BD',         // hairline borders
  ink: '#211913',          // deep cocoa, primary text
  inkSoft: '#5A463A',      // secondary text
  inkFaint: '#9C8775',     // tertiary, captions

  // Accents
  terracotta: '#C0532F',   // primary accent
  terracottaDeep: '#8E3A1C',
  sage: '#6E8F6C',         // secondary accent
  sageDeep: '#4D6C4B',
  honey: '#D9A441',        // tertiary accent
  blush: '#E9B8A5',        // soft highlight
  ivory: '#F7E6CE',

  // States
  success: '#6E8F6C',
  danger: '#B0432A',
  overlay: 'rgba(33, 25, 19, 0.55)',
  shadow: 'rgba(33, 25, 19, 0.12)',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  xxl: 48,
};

export const shadows = {
  card: {
    shadowColor: '#211913',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  floating: {
    shadowColor: '#211913',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
};
