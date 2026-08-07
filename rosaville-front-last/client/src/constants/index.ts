/**
 * CONSTANTS / INDEX.TS
 * 
 * Central export point for all application constants.
 * This makes it easy to find and manage all constants in one place.
 * 
 * @example
 * // Instead of:
 * import { COLOR_PRIMARY } from '@/constants/colors';
 * 
 * // Use:
 * import { COLOR_PRIMARY } from '@/constants';
 */

// Color palette
export {
  COLOR_PRIMARY,
  COLOR_PRIMARY_HOVER,
  COLOR_ACCENT,
  COLOR_BACKGROUND,
  COLOR_BACKGROUND_ALT,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_MUTED,
  COLOR_BORDER,
  COLOR_DIVIDER,
  COLOR_SUCCESS,
  COLOR_ERROR,
  COLOR_WARNING,
  COLOR_INFO,
  BUTTON_CLASSES,
  TEXT_CLASSES,
} from './colors';

// Auth constants (from shared)
export { COOKIE_NAME, ONE_YEAR_MS } from '@shared/const';

// OAuth utilities
export { getLoginUrl } from '@/const';

// ============================================================================
// APP-WIDE CONSTANTS
// ============================================================================

/** Site name */
export const SITE_NAME = 'Rosaville Desserts';

/** Site tagline */
export const SITE_TAGLINE = 'Fresh Cakes Made to Order in Roseville';

/** Business email */
export const BUSINESS_EMAIL = 'hello@roseville-desserts.com';

/** Business phone */
export const BUSINESS_PHONE = '(555) 123-4567';

/** Business address */
export const BUSINESS_ADDRESS = '123 Main Street, Roseville, CA 95678';

/** Business hours */
export const BUSINESS_HOURS = {
  monday: '9:00 AM - 6:00 PM',
  tuesday: '9:00 AM - 6:00 PM',
  wednesday: '9:00 AM - 6:00 PM',
  thursday: '9:00 AM - 6:00 PM',
  friday: '9:00 AM - 8:00 PM',
  saturday: '10:00 AM - 6:00 PM',
  sunday: 'Closed',
};

/** Social media links */
export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/roseville-desserts',
  facebook: 'https://facebook.com/roseville-desserts',
  twitter: 'https://twitter.com/roseville-desserts',
  pinterest: 'https://pinterest.com/roseville-desserts',
};

/** Navigation menu items */
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Custom Cakes', href: '/custom-cakes' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

/** Pagination and limits */
export const PAGINATION = {
  itemsPerPage: 12,
  maxDescriptionLength: 150,
  maxTitleLength: 50,
};

/** Animation durations (in milliseconds) */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

/** Toast notification durations (in milliseconds) */
export const TOAST_DURATIONS = {
  short: 2000,
  normal: 3000,
  long: 5000,
};

/** Form validation messages */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
};

/** API endpoints */
export const API_ENDPOINTS = {
  menu: '/api/trpc/menu.getAll',
  customCakes: '/api/trpc/customCakes.submitOrder',
  contact: '/api/trpc/contact.submitMessage',
};
