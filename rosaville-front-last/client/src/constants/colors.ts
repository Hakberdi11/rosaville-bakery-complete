/**
 * CONSTANTS / COLORS.TS
 * 
 * Centralized color palette for the Rosaville Desserts website.
 * Using this file makes it easy to update colors globally without searching through code.
 * 
 * Color Scheme: Soft rose/warm tones with cream background
 * - Primary: Darker pinkish rose (#C9949B)
 * - Hover: Darker rose (#C97A85)
 * - Background: Soft warm cream (#FBF7F4)
 * - Text: Dark charcoal/brown (#3D2817)
 * - Accent: Soft rose (#E8B4B8)
 */

// ============================================================================
// PRIMARY COLORS
// ============================================================================

/** Main button and accent color - darker pinkish rose */
export const COLOR_PRIMARY = '#C9949B';

/** Hover state for primary buttons - darker rose */
export const COLOR_PRIMARY_HOVER = '#C97A85';

/** Accent color for secondary elements */
export const COLOR_ACCENT = '#E8B4B8';

// ============================================================================
// BACKGROUND COLORS
// ============================================================================

/** Main background color - soft warm cream */
export const COLOR_BACKGROUND = '#FBF7F4';

/** Alternative background for sections */
export const COLOR_BACKGROUND_ALT = '#FFFFFF';

// ============================================================================
// TEXT COLORS
// ============================================================================

/** Primary text color - dark charcoal/brown */
export const COLOR_TEXT_PRIMARY = '#3D2817';

/** Secondary text color - lighter brown */
export const COLOR_TEXT_SECONDARY = '#5F3F1B';

/** Muted text color - even lighter */
export const COLOR_TEXT_MUTED = '#5F3F1B/80';

// ============================================================================
// BORDER & DIVIDER COLORS
// ============================================================================

/** Border color for cards and inputs */
export const COLOR_BORDER = '#E8B4B8';

/** Divider color for sections */
export const COLOR_DIVIDER = '#E8B4B8';

// ============================================================================
// UTILITY COLORS
// ============================================================================

/** Success color for positive actions */
export const COLOR_SUCCESS = '#10B981';

/** Error color for alerts and errors */
export const COLOR_ERROR = '#EF4444';

/** Warning color for warnings */
export const COLOR_WARNING = '#F59E0B';

/** Info color for informational messages */
export const COLOR_INFO = '#3B82F6';

// ============================================================================
// TAILWIND CLASS STRINGS
// ============================================================================

/**
 * Pre-built Tailwind classes for common button styles
 * Use these to maintain consistency across buttons
 */
export const BUTTON_CLASSES = {
  primary: 'bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-8 py-4 text-lg rounded-lg hover-lift shadow-lg hover:shadow-xl transition-all border-2 border-[#C9949B]',
  secondary: 'bg-transparent border-2 border-[#C9949B] text-[#C9949B] hover:bg-[#C9949B] hover:text-white font-sans font-semibold px-8 py-3 rounded-lg transition-all',
  small: 'bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-6 py-2 rounded-lg transition-all',
};

/**
 * Pre-built Tailwind classes for common text styles
 * Use these to maintain consistent typography
 */
export const TEXT_CLASSES = {
  heading1: 'font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D2817] leading-tight',
  heading2: 'font-serif text-3xl md:text-4xl font-bold text-[#3D2817] leading-tight',
  heading3: 'font-serif text-2xl md:text-3xl font-bold text-[#3D2817] leading-tight',
  body: 'font-sans text-base md:text-lg text-[#5F3F1B]/80 leading-relaxed',
  small: 'font-sans text-sm text-[#5F3F1B]/70',
};
