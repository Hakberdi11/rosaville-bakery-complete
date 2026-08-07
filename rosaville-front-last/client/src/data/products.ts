/**
 * DATA / PRODUCTS.TS
 * 
 * Central repository for all product/menu data.
 * This file contains all dessert items, their descriptions, prices, and details.
 * 
 * Benefits of centralizing data:
 * - Easy to update product information in one place
 * - Can be easily connected to a database later
 * - Reduces code duplication across pages
 * - Makes the app more maintainable
 * 
 * Structure:
 * - Menu items organized by category
 * - Featured/special items
 * - Product details with recipes and dietary info
 */

import { Product } from '@/types';

// ============================================================================
// MENU CATEGORIES
// ============================================================================

/**
 * List of all product categories used for filtering
 */
export const PRODUCT_CATEGORIES = [
  'Cakes',
  'Pastries',
  'Cookies',
  'Cheesecakes',
  'Coffee',
] as const;

// ============================================================================
// MENU ITEMS - CAKES
// ============================================================================

/**
 * Chocolate Decadence - Rich dark chocolate cake
 */
export const CHOCOLATE_DECADENCE: Product = {
  id: 1,
  name: 'Chocolate Decadence',
  description: 'Rich dark chocolate cake with silky ganache',
  price: 4.50,
  image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  category: 'Cakes',
  ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Cocoa Powder'],
  dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
  prepTime: '20 mins',
  bakeTime: '35 mins',
  servings: 8,
  recipe: [
    { step: 1, instruction: 'Preheat oven to 350°F (175°C)' },
    { step: 2, instruction: 'Melt chocolate and butter together' },
    { step: 3, instruction: 'Mix in eggs and sugar' },
    { step: 4, instruction: 'Pour into prepared pan' },
    { step: 5, instruction: 'Bake for 35 minutes until set' },
    { step: 6, instruction: 'Cool and top with ganache' },
  ],
  tips: 'For extra richness, serve with a scoop of vanilla ice cream',
};

/**
 * Vanilla Dream - Classic vanilla cake with buttercream
 */
export const VANILLA_DREAM: Product = {
  id: 2,
  name: 'Vanilla Dream',
  description: 'Classic vanilla cake with buttercream frosting',
  price: 3.99,
  image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  category: 'Cakes',
  ingredients: ['Vanilla Extract', 'Flour', 'Butter', 'Eggs', 'Sugar', 'Milk'],
  dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
  prepTime: '15 mins',
  bakeTime: '30 mins',
  servings: 10,
  recipe: [
    { step: 1, instruction: 'Preheat oven to 350°F (175°C)' },
    { step: 2, instruction: 'Cream butter and sugar' },
    { step: 3, instruction: 'Add eggs and vanilla extract' },
    { step: 4, instruction: 'Alternate adding flour and milk' },
    { step: 5, instruction: 'Pour into prepared pan' },
    { step: 6, instruction: 'Bake for 30 minutes until golden' },
  ],
  tips: 'Perfect for celebrations - customize with any frosting flavor',
};

/**
 * Strawberry Bliss - Fresh strawberry cake with whipped cream
 */
export const STRAWBERRY_BLISS: Product = {
  id: 3,
  name: 'Strawberry Bliss',
  description: 'Fresh strawberry cake with whipped cream',
  price: 4.99,
  image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  category: 'Cakes',
  ingredients: ['Fresh Strawberries', 'Flour', 'Eggs', 'Sugar', 'Whipped Cream'],
  dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
  prepTime: '25 mins',
  bakeTime: '32 mins',
  servings: 8,
  recipe: [
    { step: 1, instruction: 'Prepare fresh strawberries' },
    { step: 2, instruction: 'Bake vanilla cake base' },
    { step: 3, instruction: 'Layer with strawberries' },
    { step: 4, instruction: 'Top with whipped cream' },
    { step: 5, instruction: 'Garnish with fresh berries' },
  ],
  tips: 'Best served fresh - use seasonal strawberries for best flavor',
};

// ============================================================================
// MENU ITEMS - PASTRIES
// ============================================================================

/**
 * Croissant - Buttery French pastry
 */
export const CROISSANT: Product = {
  id: 4,
  name: 'Croissant',
  description: 'Buttery flaky French pastry',
  price: 3.50,
  image: 'https://images.unsplash.com/photo-1585080872051-9bac8a1014d3?w=500&h=500&fit=crop',
  category: 'Pastries',
  ingredients: ['Flour', 'Butter', 'Yeast', 'Salt', 'Sugar'],
  dietary: ['Contains Gluten', 'Contains Dairy'],
  prepTime: '30 mins',
  bakeTime: '25 mins',
  servings: 1,
  tips: 'Serve warm for the best experience',
};

/**
 * Eclair - Chocolate-filled pastry
 */
export const ECLAIR: Product = {
  id: 5,
  name: 'Eclair',
  description: 'Choux pastry filled with cream and topped with chocolate',
  price: 3.75,
  image: 'https://images.unsplash.com/photo-1585080872051-9bac8a1014d3?w=500&h=500&fit=crop',
  category: 'Pastries',
  ingredients: ['Choux Pastry', 'Custard Cream', 'Dark Chocolate'],
  dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
  prepTime: '20 mins',
  bakeTime: '30 mins',
  servings: 1,
  tips: 'Enjoy within 24 hours for best taste',
};

// ============================================================================
// MENU ITEMS - COOKIES
// ============================================================================

/**
 * Chocolate Chip Cookie - Classic cookie
 */
export const CHOCOLATE_CHIP_COOKIE: Product = {
  id: 6,
  name: 'Chocolate Chip Cookie',
  description: 'Classic chocolate chip cookie with chunks of dark chocolate',
  price: 2.50,
  image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&h=500&fit=crop',
  category: 'Cookies',
  ingredients: ['Flour', 'Butter', 'Chocolate Chips', 'Eggs', 'Sugar', 'Vanilla'],
  dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
  prepTime: '10 mins',
  bakeTime: '12 mins',
  servings: 24,
  tips: 'Bake fresh daily for the best taste',
};

// ============================================================================
// MENU ITEMS - CHEESECAKES
// ============================================================================

/**
 * New York Cheesecake - Classic cheesecake
 */
export const NY_CHEESECAKE: Product = {
  id: 7,
  name: 'New York Cheesecake',
  description: 'Classic New York style cheesecake with graham cracker crust',
  price: 5.99,
  image: 'https://images.unsplash.com/photo-1533134242443-742a28317e81?w=500&h=500&fit=crop',
  category: 'Cheesecakes',
  ingredients: ['Cream Cheese', 'Graham Crackers', 'Butter', 'Eggs', 'Sugar'],
  dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
  prepTime: '20 mins',
  bakeTime: '55 mins',
  servings: 12,
  tips: 'Refrigerate for at least 4 hours before serving',
};

// ============================================================================
// SPECIAL / FEATURED ITEMS
// ============================================================================

/**
 * This Month's Special - Limited time offering
 * ID 0 is reserved for the special dessert page
 */
export const SPECIAL_DESSERT: Product = {
  id: 0,
  name: 'Lavender Cake',
  description: 'Delicate lavender-infused sponge cake with lavender buttercream',
  price: 6.50,
  image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
  category: 'Cakes',
  ingredients: ['Lavender Buds', 'Flour', 'Butter', 'Eggs', 'Sugar', 'Vanilla'],
  dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
  prepTime: '30 mins',
  bakeTime: '35 mins',
  servings: 10,
  recipe: [
    { step: 1, instruction: 'Infuse lavender in milk for 30 minutes' },
    { step: 2, instruction: 'Strain and use in cake batter' },
    { step: 3, instruction: 'Bake at 350°F for 35 minutes' },
    { step: 4, instruction: 'Cool completely' },
    { step: 5, instruction: 'Frost with lavender buttercream' },
  ],
  tips: 'A unique and elegant choice for special occasions',
};

// ============================================================================
// ALL PRODUCTS COLLECTION
// ============================================================================

/**
 * Complete list of all products available
 * Used for menu display, search, and filtering
 */
export const ALL_PRODUCTS: Product[] = [
  CHOCOLATE_DECADENCE,
  VANILLA_DREAM,
  STRAWBERRY_BLISS,
  CROISSANT,
  ECLAIR,
  CHOCOLATE_CHIP_COOKIE,
  NY_CHEESECAKE,
  SPECIAL_DESSERT,
];

/**
 * Get all products in a specific category
 * @param category - The category to filter by
 * @returns Array of products in that category
 */
export function getProductsByCategory(category: string): Product[] {
  return ALL_PRODUCTS.filter(product => product.category === category);
}

/**
 * Get a single product by ID
 * @param id - The product ID
 * @returns The product or undefined if not found
 */
export function getProductById(id: number): Product | undefined {
  return ALL_PRODUCTS.find(product => product.id === id);
}

/**
 * Get featured products for homepage
 * @returns Array of featured products
 */
export function getFeaturedProducts(): Product[] {
  return [CHOCOLATE_DECADENCE, VANILLA_DREAM, STRAWBERRY_BLISS];
}
