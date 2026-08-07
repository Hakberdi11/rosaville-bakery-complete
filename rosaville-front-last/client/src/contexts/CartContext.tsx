/**
 * CONTEXTS / CART CONTEXT.TSX
 * 
 * Global shopping cart state management using React Context.
 * This file manages all cart operations: adding items, removing items, updating quantities, etc.
 * 
 * How it works:
 * 1. CartProvider wraps your app and provides cart state to all child components
 * 2. useCart() hook lets any component access and modify the cart
 * 3. Cart data is stored in React state (not persisted - clears on page refresh)
 * 
 * Usage:
 * - Wrap your app: <CartProvider><App /></CartProvider>
 * - Use in component: const { items, addToCart, total } = useCart();
 */

import React, { createContext, useContext, useState } from 'react';

/**
 * Represents a single item in the shopping cart
 * @property id - Unique product identifier
 * @property name - Product name
 * @property price - Price per unit
 * @property quantity - Number of items in cart
 * @property image - Product image URL
 */
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

/**
 * Type definition for the cart context value
 * Contains all cart state and operations available to components
 */
interface CartContextType {
  /** Array of items currently in the cart */
  items: CartItem[];
  
  /** Add a new item to cart (or increment quantity if already exists) */
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  
  /** Remove an item from cart by ID */
  removeFromCart: (id: number) => void;
  
  /** Update quantity of an item (removes if quantity <= 0) */
  updateQuantity: (id: number, quantity: number) => void;
  
  /** Clear all items from cart at once */
  clearCart: () => void;
  
  /** Total price of all items in cart (calculated automatically) */
  total: number;
}

/**
 * Create the cart context
 * This is the internal context object - don't use directly, use useCart() hook instead
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider Component
 * 
 * Wraps your app to provide cart state to all child components.
 * Must wrap your entire app in main.tsx for useCart() to work anywhere.
 * 
 * @param children - React components to wrap with cart functionality
 * 
 * @example
 * // In main.tsx:
 * <CartProvider>
 *   <App />
 * </CartProvider>
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  // State: array of items currently in the cart
  const [items, setItems] = useState<CartItem[]>([]);

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  /**
   * Add item to cart or increment quantity if already exists
   * 
   * Logic:
   * - If item already in cart: increment quantity by 1
   * - If item not in cart: add it with quantity 1
   * 
   * @param item - Product to add (without quantity, since we set it to 1)
   * 
   * @example
   * addToCart({ id: 1, name: 'Cake', price: 5, image: 'url' })
   */
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      // Check if item already exists in cart
      const existing = prev.find(i => i.id === item.id);
      
      if (existing) {
        // Item exists: increment quantity by 1
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      
      // Item doesn't exist: add it with quantity 1
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  /**
   * Remove item from cart by ID
   * 
   * @param id - Product ID to remove
   * 
   * @example
   * removeFromCart(1) // Removes product with id 1
   */
  const removeFromCart = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  /**
   * Update quantity of item in cart
   * 
   * Logic:
   * - If quantity <= 0: remove the item from cart
   * - Otherwise: update the quantity to the new value
   * 
   * @param id - Product ID to update
   * @param quantity - New quantity (0 or negative removes the item)
   * 
   * @example
   * updateQuantity(1, 3)  // Set product 1 quantity to 3
   * updateQuantity(1, 0)  // Remove product 1 from cart
   */
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      removeFromCart(id);
    } else {
      // Update quantity to the new value
      setItems(prev => 
        prev.map(i => i.id === id ? { ...i, quantity } : i)
      );
    }
  };

  /**
   * Clear all items from cart at once
   * 
   * @example
   * clearCart() // Empty the entire cart
   */
  const clearCart = () => {
    setItems([]);
  };

  // ============================================================================
  // CALCULATED VALUES
  // ============================================================================

  /**
   * Calculate total price of all items in cart
   * Formula: sum of (price × quantity) for each item
   * 
   * Example:
   * - Item 1: $5 × 2 = $10
   * - Item 2: $3 × 1 = $3
   * - Total: $13
   */
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // ============================================================================
  // PROVIDER
  // ============================================================================

  // Provide cart state and functions to all child components
  return (
    <CartContext.Provider 
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * useCart Hook
 * 
 * Access cart state and operations from any component.
 * Must be used inside a component wrapped by <CartProvider>.
 * 
 * @returns Cart context with items, functions, and total
 * @throws Error if used outside CartProvider
 * 
 * @example
 * function MyComponent() {
 *   const { items, addToCart, total } = useCart();
 *   
 *   return (
 *     <div>
 *       <p>Items in cart: {items.length}</p>
 *       <p>Total: ${total.toFixed(2)}</p>
 *       <button onClick={() => addToCart({ id: 1, name: 'Cake', price: 5, image: '' })}>
 *         Add to Cart
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useCart() {
  // Get the cart context
  const context = useContext(CartContext);
  
  // Error handling: make sure hook is used inside CartProvider
  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider. ' +
      'Make sure your app is wrapped with <CartProvider> in main.tsx'
    );
  }
  
  return context;
}
