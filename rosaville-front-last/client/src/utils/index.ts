/**
 * UTILS / INDEX.TS
 * 
 * Central export point for all utility functions.
 * Import utilities from this file instead of individual files for cleaner imports.
 * 
 * @example
 * // Instead of:
 * import { truncateText } from '@/utils/stringHelpers';
 * 
 * // Use:
 * import { truncateText } from '@/utils';
 */

// String manipulation utilities
export {
  truncateText,
  capitalizeFirst,
  toTitleCase,
  normalizeWhitespace,
  slugify,
  formatPrice,
  truncateAtWord,
  extractWords,
  isEmpty,
  repeatString,
} from './stringHelpers';

// Tailwind utility (already exists)
export { cn } from '@/lib/utils';
