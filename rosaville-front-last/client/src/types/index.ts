/**
 * TYPES / INDEX.TS
 * 
 * Central location for all TypeScript interfaces and type definitions used across the application.
 * This file helps maintain consistency and makes it easy to find and update types.
 * 
 * Organization:
 * - Product-related types
 * - Cart-related types
 * - Form-related types
 * - API response types
 */

// ============================================================================
// PRODUCT TYPES
// ============================================================================

/**
 * Represents a single product/dessert item in the menu
 * Used throughout the app for displaying products, adding to cart, etc.
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Cakes' | 'Pastries' | 'Cookies' | 'Cheesecakes' | 'Coffee';
  ingredients?: string[];
  dietary?: string[];
  prepTime?: string;
  bakeTime?: string;
  servings?: number;
  recipe?: RecipeStep[];
  tips?: string;
}

/**
 * Represents a single step in a recipe
 */
export interface RecipeStep {
  step: number;
  instruction: string;
}

// ============================================================================
// CART TYPES
// ============================================================================

/**
 * Represents an item in the shopping cart
 * Extends Product with quantity information
 */
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

/**
 * Type for cart context operations
 */
export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Represents custom cake order form data
 */
export interface CustomCakeFormData {
  customerName: string;
  email: string;
  phone: string;
  cakeType: string;
  flavor: string;
  size: string;
  servings: string;
  occasion: string;
  specialRequests: string;
  inspirationImage?: File;
}

/**
 * Represents contact form data
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Menu item response from API
 */
export interface MenuItemResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}
