/**
 * UTILS / STRING HELPERS.TS
 * 
 * Collection of utility functions for string manipulation and text processing.
 * These functions are used throughout the app for formatting, truncating, and transforming text.
 * 
 * Benefits:
 * - Centralized text manipulation logic
 * - Easy to test and maintain
 * - Reusable across components
 * - Consistent behavior throughout the app
 */

/**
 * Truncate text to a maximum length and add ellipsis
 * 
 * @param text - The text to truncate
 * @param limit - Maximum number of characters to keep
 * @returns Truncated text with "..." if it exceeds the limit
 * 
 * @example
 * truncateText("Hello World", 5) // Returns "Hello..."
 * truncateText("Hi", 5) // Returns "Hi"
 */
export function truncateText(text: string, limit: number): string {
  if (!text || text.length <= limit) {
    return text;
  }
  return text.substring(0, limit) + '...';
}

/**
 * Capitalize the first letter of a string
 * 
 * @param text - The text to capitalize
 * @returns Text with first letter capitalized
 * 
 * @example
 * capitalizeFirst("hello") // Returns "Hello"
 * capitalizeFirst("HELLO") // Returns "HELLO"
 */
export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert text to title case (capitalize each word)
 * 
 * @param text - The text to convert
 * @returns Text in title case
 * 
 * @example
 * toTitleCase("hello world") // Returns "Hello World"
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

/**
 * Remove extra whitespace from text
 * 
 * @param text - The text to clean
 * @returns Text with normalized whitespace
 * 
 * @example
 * normalizeWhitespace("hello    world") // Returns "hello world"
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Slugify text for URLs (convert to lowercase, replace spaces with hyphens)
 * 
 * @param text - The text to slugify
 * @returns Slugified text suitable for URLs
 * 
 * @example
 * slugify("Hello World") // Returns "hello-world"
 * slugify("My Product Name") // Returns "my-product-name"
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Format a price value as currency
 * 
 * @param price - The price value
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted price string
 * 
 * @example
 * formatPrice(19.99) // Returns "$19.99"
 * formatPrice(1000) // Returns "$1,000.00"
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(price);
}

/**
 * Truncate text but only on word boundaries (no mid-word cuts)
 * 
 * @param text - The text to truncate
 * @param limit - Maximum number of characters
 * @returns Truncated text ending at a word boundary
 * 
 * @example
 * truncateAtWord("Hello beautiful world", 15) // Returns "Hello beautiful..."
 */
export function truncateAtWord(text: string, limit: number): string {
  if (!text || text.length <= limit) {
    return text;
  }
  
  const truncated = text.substring(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace === -1) {
    return truncated + '...';
  }
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Extract first N words from text
 * 
 * @param text - The text to extract from
 * @param wordCount - Number of words to extract
 * @returns First N words with ellipsis if text is longer
 * 
 * @example
 * extractWords("Hello beautiful world", 2) // Returns "Hello beautiful..."
 */
export function extractWords(text: string, wordCount: number): string {
  if (!text) return '';
  
  const words = text.split(/\s+/);
  
  if (words.length <= wordCount) {
    return text;
  }
  
  return words.slice(0, wordCount).join(' ') + '...';
}

/**
 * Check if a string is empty or contains only whitespace
 * 
 * @param text - The text to check
 * @returns true if empty or whitespace-only, false otherwise
 */
export function isEmpty(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

/**
 * Repeat a string N times
 * 
 * @param text - The text to repeat
 * @param count - Number of times to repeat
 * @returns Repeated string
 * 
 * @example
 * repeatString("*", 5) // Returns "*****"
 */
export function repeatString(text: string, count: number): string {
  return text.repeat(Math.max(0, count));
}
