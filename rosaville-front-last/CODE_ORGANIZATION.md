# Code Organization Guide - Rosaville Desserts

This document explains how the codebase is organized and how to maintain it as you make changes.

## 📚 Table of Contents

1. [Project Structure](#project-structure)
2. [Frontend Organization](#frontend-organization)
3. [Backend Organization](#backend-organization)
4. [How to Add Features](#how-to-add-features)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)

---

## 📁 Project Structure

```
rosaville-desserts/
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full page components
│   │   ├── contexts/       # Global state (Cart, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions ⭐ NEW
│   │   ├── constants/      # App-wide constants ⭐ NEW
│   │   ├── types/          # TypeScript types ⭐ NEW
│   │   ├── data/           # Static data (products) ⭐ NEW
│   │   ├── lib/            # Library utilities
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   ├── index.css       # Global styles
│   │   └── README.md       # Frontend guide ⭐ NEW
│   ├── public/             # Static files
│   ├── index.html          # HTML template
│   └── package.json        # Dependencies
│
├── server/                 # Backend (Node.js + tRPC)
│   ├── routers.ts          # API endpoints
│   ├── db.ts               # Database queries
│   ├── storage.ts          # File storage
│   ├── _core/              # Framework code (don't edit)
│   └── *.test.ts           # Tests
│
├── drizzle/                # Database
│   ├── schema.ts           # Database tables
│   └── migrations/         # SQL migrations
│
├── shared/                 # Shared code
│   ├── const.ts            # Shared constants
│   └── types.ts            # Shared types
│
└── CODE_ORGANIZATION.md    # This file ⭐ NEW
```

---

## 🎨 Frontend Organization

### `/client/src/components/` - Reusable Components

Components that are used in multiple places.

**Examples:**
- `Navigation.tsx` - Top navbar
- `Footer.tsx` - Footer
- `FloatingCartButton.tsx` - Mobile cart button
- `ui/Button.tsx` - Button component

**When to create:** When you need the same UI in multiple pages.

**Structure:**
```tsx
// components/MyComponent.tsx

/**
 * MyComponent
 * 
 * Brief description of what this component does
 * 
 * @param prop1 - Description of prop1
 * @param prop2 - Description of prop2
 * 
 * @example
 * <MyComponent prop1="value" prop2={123} />
 */
export function MyComponent({ prop1, prop2 }: Props) {
  // Component code
}
```

### `/client/src/pages/` - Full Pages

Each file is a complete page/route.

**Examples:**
- `Home.tsx` - Homepage
- `Menu.tsx` - Product menu
- `Cart.tsx` - Shopping cart
- `Checkout.tsx` - Checkout form

**When to create:** When you add a new route/page.

**Structure:**
```tsx
// pages/MyPage.tsx

/**
 * MyPage
 * 
 * Full page component for /my-page route
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 */
export default function MyPage() {
  // Page code
}
```

### `/client/src/contexts/` - Global State

React Context for state shared across many components.

**Examples:**
- `CartContext.tsx` - Shopping cart state
- `ThemeContext.tsx` - Dark/light theme

**When to create:** When multiple unrelated components need the same state.

**Structure:**
```tsx
// contexts/MyContext.tsx

/**
 * MyContext
 * 
 * Global state for [what this manages]
 * 
 * Usage: const value = useMyContext();
 */

export function MyProvider({ children }) {
  // Provider code
}

export function useMyContext() {
  // Hook code
}
```

### `/client/src/hooks/` - Custom Hooks

Reusable logic wrapped in React hooks.

**Examples:**
- `useScrollReveal()` - Fade-in animation
- `useMobile()` - Detect mobile device
- `useAuth()` - Get user auth state

**When to create:** When you have logic that multiple components need.

### `/client/src/utils/` - Helper Functions ⭐ NEW

Pure functions for common tasks.

**Examples:**
- `stringHelpers.ts` - Text manipulation (truncate, format, etc.)
- `formatters.ts` - Format data for display
- `validators.ts` - Validate form inputs

**When to create:** When you have utility logic that doesn't fit elsewhere.

**Structure:**
```ts
// utils/myHelpers.ts

/**
 * Helper function description
 * 
 * @param param1 - Description
 * @returns Description of return value
 * 
 * @example
 * myHelper("input") // Returns "output"
 */
export function myHelper(param1: string): string {
  // Function code
}
```

### `/client/src/constants/` - App-Wide Constants ⭐ NEW

All hardcoded values and configuration.

**Examples:**
- `colors.ts` - Color palette
- `index.ts` - Business info, nav items, etc.

**When to create:** When you have values used in multiple places.

**Structure:**
```ts
// constants/myConstants.ts

/** Description of what this constant is */
export const MY_CONSTANT = 'value';

/** Description of constant group */
export const CONSTANT_GROUP = {
  item1: 'value1',
  item2: 'value2',
};
```

### `/client/src/types/` - TypeScript Definitions ⭐ NEW

All TypeScript interfaces and types.

**Examples:**
- `Product` - Product/menu item
- `CartItem` - Item in cart
- `CustomCakeFormData` - Form data

**When to create:** When you have a complex data structure.

**Structure:**
```ts
// types/index.ts

/**
 * MyType
 * 
 * Description of what this type represents
 * 
 * @property prop1 - Description
 * @property prop2 - Description
 */
export interface MyType {
  prop1: string;
  prop2: number;
}
```

### `/client/src/data/` - Static Data ⭐ NEW

All product information and menu data.

**Examples:**
- `products.ts` - All dessert items with details

**When to create:** When you have data that's used in multiple places.

**Structure:**
```ts
// data/myData.ts

/**
 * MyData
 * 
 * Description of data
 */
export const MY_DATA = {
  // Data here
};

/**
 * Helper function to access data
 */
export function getMyData() {
  // Function code
}
```

---

## 🔧 Backend Organization

### `/server/routers.ts` - API Endpoints

All tRPC procedures (API endpoints).

**Structure:**
```ts
// server/routers.ts

export const appRouter = router({
  // Feature group 1
  feature1: router({
    procedure1: publicProcedure.query(() => {
      // Code
    }),
  }),
  
  // Feature group 2
  feature2: router({
    procedure1: protectedProcedure.mutation(({ input, ctx }) => {
      // Code
    }),
  }),
});
```

### `/server/db.ts` - Database Queries

Helper functions for database operations.

**Structure:**
```ts
// server/db.ts

/**
 * Get all items from database
 * 
 * @returns Array of items
 */
export async function getAllItems() {
  // Database query
}

/**
 * Create new item in database
 * 
 * @param data - Item data
 * @returns Created item
 */
export async function createItem(data: ItemData) {
  // Database query
}
```

### `/server/storage.ts` - File Storage

Helper functions for uploading/downloading files.

---

## 🚀 How to Add Features

### Adding a New Page

1. **Create page component:**
   ```tsx
   // client/src/pages/NewPage.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. **Add route in App.tsx:**
   ```tsx
   <Route path="/new-page" component={NewPage} />
   ```

3. **Add navigation link in constants:**
   ```ts
   // constants/index.ts
   export const NAV_ITEMS = [
     // ...
     { label: 'New Page', href: '/new-page' },
   ];
   ```

### Adding a New Component

1. **Create component file:**
   ```tsx
   // client/src/components/NewComponent.tsx
   export function NewComponent() {
     return <div>New Component</div>;
   }
   ```

2. **Use in pages:**
   ```tsx
   import { NewComponent } from '@/components/NewComponent';
   
   export default function MyPage() {
     return <NewComponent />;
   }
   ```

### Adding New Product Data

1. **Add to products.ts:**
   ```ts
   // data/products.ts
   export const NEW_PRODUCT: Product = {
     id: 8,
     name: 'New Dessert',
     price: 5.99,
     // ... other properties
   };
   
   export const ALL_PRODUCTS = [
     // ... existing
     NEW_PRODUCT,
   ];
   ```

2. **Use in components:**
   ```tsx
   import { ALL_PRODUCTS } from '@/data/products';
   
   ALL_PRODUCTS.map(product => (
     <ProductCard key={product.id} product={product} />
   ))
   ```

### Adding New Utility Function

1. **Add to utils/stringHelpers.ts:**
   ```ts
   export function myNewFunction(input: string): string {
     // Function code
   }
   ```

2. **Export from utils/index.ts:**
   ```ts
   export { myNewFunction } from './stringHelpers';
   ```

3. **Use in components:**
   ```tsx
   import { myNewFunction } from '@/utils';
   
   const result = myNewFunction('input');
   ```

### Adding New Constant

1. **Add to constants/index.ts:**
   ```ts
   export const MY_NEW_CONSTANT = 'value';
   ```

2. **Use in components:**
   ```tsx
   import { MY_NEW_CONSTANT } from '@/constants';
   
   <div>{MY_NEW_CONSTANT}</div>
   ```

---

## ✅ Best Practices

### 1. Use Centralized Data

❌ **Don't:**
```tsx
const products = [
  { id: 1, name: 'Cake', price: 5 },
  { id: 2, name: 'Cookie', price: 3 },
];
```

✅ **Do:**
```tsx
import { ALL_PRODUCTS } from '@/data/products';

ALL_PRODUCTS.map(product => ...)
```

### 2. Use Constants Instead of Hardcoding

❌ **Don't:**
```tsx
<button className="bg-[#C9949B]">Click me</button>
<p>Contact: hello@roseville-desserts.com</p>
```

✅ **Do:**
```tsx
import { COLOR_PRIMARY, BUSINESS_EMAIL } from '@/constants';

<button className={`bg-[${COLOR_PRIMARY}]`}>Click me</button>
<p>Contact: {BUSINESS_EMAIL}</p>
```

### 3. Use Utility Functions

❌ **Don't:**
```tsx
const shortText = text.length > 100 ? text.substring(0, 100) + '...' : text;
const price = '$' + item.price.toFixed(2);
```

✅ **Do:**
```tsx
import { truncateText, formatPrice } from '@/utils';

const shortText = truncateText(text, 100);
const price = formatPrice(item.price);
```

### 4. Add Comments to Complex Logic

```tsx
/**
 * Calculate total price with tax
 * Formula: (price × quantity) × (1 + tax rate)
 */
const total = items.reduce(
  (sum, item) => sum + (item.price * item.quantity * 1.08),
  0
);
```

### 5. Use TypeScript Types

❌ **Don't:**
```tsx
function addToCart(item) {
  // ...
}
```

✅ **Do:**
```tsx
import { CartItem } from '@/types';

function addToCart(item: Omit<CartItem, 'quantity'>) {
  // ...
}
```

### 6. Organize Imports

```tsx
// 1. React and external libraries
import React, { useState } from 'react';
import { useLocation } from 'wouter';

// 2. Internal utilities and constants
import { truncateText } from '@/utils';
import { COLOR_PRIMARY } from '@/constants';

// 3. Components
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';

// 4. Types
import { Product } from '@/types';

// 5. Data
import { ALL_PRODUCTS } from '@/data/products';
```

---

## 🔄 Common Patterns

### Pattern 1: Display List of Products

```tsx
import { ALL_PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';

export function ProductList() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {ALL_PRODUCTS.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Pattern 2: Format and Display Price

```tsx
import { formatPrice } from '@/utils';

export function PriceDisplay({ price }: { price: number }) {
  return <span className="text-lg font-bold">{formatPrice(price)}</span>;
}
```

### Pattern 3: Truncate Long Text

```tsx
import { truncateText } from '@/utils';

export function ProductDescription({ description }: { description: string }) {
  return <p>{truncateText(description, 100)}</p>;
}
```

### Pattern 4: Use Cart State

```tsx
import { useCart } from '@/contexts/CartContext';

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  
  return (
    <button onClick={() => addToCart(product)}>
      Add to Cart
    </button>
  );
}
```

### Pattern 5: Conditional Styling

```tsx
import { COLOR_PRIMARY, COLOR_ACCENT } from '@/constants';

export function CategoryButton({ isActive }: { isActive: boolean }) {
  const bgColor = isActive ? COLOR_PRIMARY : COLOR_ACCENT;
  
  return (
    <button className={`bg-[${bgColor}]`}>
      Category
    </button>
  );
}
```

---

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Pages | PascalCase | `Home.tsx` |
| Utilities | camelCase | `stringHelpers.ts` |
| Constants | camelCase | `colors.ts` |
| Types | camelCase | `index.ts` |
| Data | camelCase | `products.ts` |
| Hooks | camelCase | `useScrollReveal.ts` |

---

## 🎯 Quick Reference

### Finding Things

| Need | Location |
|------|----------|
| Component | `client/src/components/` |
| Page | `client/src/pages/` |
| Utility function | `client/src/utils/` |
| Constant | `client/src/constants/` |
| Type | `client/src/types/` |
| Product data | `client/src/data/products.ts` |
| Global state | `client/src/contexts/` |
| Custom hook | `client/src/hooks/` |
| API endpoint | `server/routers.ts` |
| Database query | `server/db.ts` |

### Importing

```tsx
// Components
import { ProductCard } from '@/components/ProductCard';

// Utilities
import { truncateText, formatPrice } from '@/utils';

// Constants
import { COLOR_PRIMARY, SITE_NAME } from '@/constants';

// Types
import { Product, CartItem } from '@/types';

// Data
import { ALL_PRODUCTS } from '@/data/products';

// Contexts
import { useCart } from '@/contexts/CartContext';

// Hooks
import { useScrollReveal } from '@/hooks/useScrollReveal';
```

---

## 🆘 Troubleshooting

### "Can't find module"
- Check the import path
- Make sure file exists in the correct folder
- Check file name spelling (case-sensitive)

### "Type error"
- Check `client/src/types/index.ts` for the correct type
- Make sure you're using the right type for the data

### "Constant not found"
- Check `client/src/constants/index.ts`
- Make sure it's exported

### "Function not working"
- Check `client/src/utils/index.ts`
- Make sure function is exported
- Check function documentation for correct usage

---

## 📚 Additional Resources

- [Frontend README](./client/src/README.md) - Detailed frontend guide
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

Happy coding! 🎂✨
