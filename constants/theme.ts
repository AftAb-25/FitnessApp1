export const COLORS = {
  background: '#0F172A', // Deep slate / dark mode baseline
  surface: '#1E293B', // Slightly lighter slate for cards
  surfaceLight: '#334155', // For borders or lighter cards

  // Vibrant accents for premium feel
  primary: '#38BDF8', // Cyan/Light Blue
  primaryDark: '#0284C7',
  secondary: '#818CF8', // Indigo
  accent: '#A78BFA', // Violet

  // Status colors
  success: '#34D399', // Emerald
  warning: '#FBBF24', // Amber
  danger: '#F87171', // Red

  // Typography
  text: '#F8FAFC', // Near white
  textMuted: '#94A3B8', // Slate grey

  // Layout
  border: '#334155',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const FONTS = {
  light: 'System', // Could replace with custom fonts in the future
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6.27,
    elevation: 10,
  },
};
