# Rosaville Desserts - Frontend Code Structure

Welcome to the Rosaville Desserts frontend codebase! This guide will help you understand how the code is organized and how to navigate it.

## 📁 Folder Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page-level components (full pages)
├── contexts/           # React Context for state management
├── hooks/              # Custom React hooks
├── lib/                # Library utilities and helpers
├── utils/              # Utility functions (NEW)
├── constants/          # App-wide constants (NEW)
├── types/              # TypeScript type definitions (NEW)
├── data/               # Static data and product information (NEW)
├── _core/              # Framework-level code (don't edit)
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 🎯 Quick Navigation Guide

### 1. **components/** - Reusable Building Blocks
Contains all reusable React components used across multiple pages.

**Key files:**
- `Navigation.tsx` - Top navigation bar with logo and menu
- `Footer.tsx` - Footer with links and business info
- `Layout.tsx` - Main page wrapper (Nav + content + Footer)
- `FloatingCartButton.tsx` - Mobile floating cart button
- `ui/` - Pre-built UI components (buttons, cards, dialogs, etc.)

**When to use:** Import these components into pages to build UI.

### 2. **pages/** - Full Page Components
Each file represents a complete page in the app.

**Key pages:**
- `Home.tsx` - Homepage with hero, featured items, and specials
- `Menu.tsx` - Product menu with filtering
- `ProductDetail.tsx` - Single product detail page
- `Cart.tsx` - Shopping cart page
- `Checkout.tsx` - Checkout form
- `CustomCakes.tsx` - Custom cake order form
- `About.tsx` - About page
- `Contact.tsx` - Contact form page
- `Gallery.tsx` - Photo gallery

**When to use:** Add new pages here. Each page is a complete route.

### 3. **contexts/** - State Management
Global state that multiple components need to access.

**Key contexts:**
- `CartContext.tsx` - Shopping cart state (items, total, add/remove functions)
- `ThemeContext.tsx` - Theme switching (dark/light mode)

**When to use:** Use `useCart()` hook to access cart state in any component.

### 4. **hooks/** - Custom React Hooks
Reusable logic wrapped in React hooks.

**Key hooks:**
- `useScrollReveal()` - Fade-in animation when scrolling into view
- `useMobile()` - Detect if device is mobile
- `useAuth()` - Get current user auth state

**When to use:** Call these hooks in components to use their functionality.

### 5. **lib/** - Library Utilities
Low-level utilities and library integrations.

**Key files:**
- `trpc.ts` - Backend API client setup
- `utils.ts` - Tailwind CSS class merging utility

**When to use:** These are mostly used internally. Don't edit unless you know what you're doing.

### 6. **utils/** - Utility Functions (NEW) ⭐
Common helper functions for text manipulation and formatting.

**Key files:**
- `stringHelpers.ts` - Text functions (truncate, capitalize, format price, etc.)
- `index.ts` - Export point for all utilities

**When to use:** Import and use these functions in components:
```tsx
import { truncateText, formatPrice } from '@/utils';

const shortText = truncateText("Long text here", 20);
const price = formatPrice(19.99); // "$19.99"
```

### 7. **constants/** - App-Wide Constants (NEW) ⭐
All hardcoded values and configuration in one place.

**Key files:**
- `colors.ts` - Color palette and button/text styles
- `index.ts` - All constants exported together

**When to use:** Import constants instead of hardcoding values:
```tsx
import { COLOR_PRIMARY, SITE_NAME, BUSINESS_EMAIL } from '@/constants';

<button className={`bg-[${COLOR_PRIMARY}]`}>Click me</button>
<h1>{SITE_NAME}</h1>
<a href={`mailto:${BUSINESS_EMAIL}`}>Contact</a>
```

### 8. **types/** - TypeScript Definitions (NEW) ⭐
All TypeScript interfaces and types in one place.

**Key types:**
- `Product` - Product/menu item structure
- `CartItem` - Item in shopping cart
- `CustomCakeFormData` - Custom cake order form
- `ContactFormData` - Contact form

**When to use:** Use these types when working with data:
```tsx
import { Product, CartItem } from '@/types';

const product: Product = {
  id: 1,
  name: 'Chocolate Cake',
  price: 4.50,
  // ...
};
```

### 9. **data/** - Static Data (NEW) ⭐
All product information and menu data.

**Key files:**
- `products.ts` - All dessert items with details, recipes, ingredients

**When to use:** Import products to display them:
```tsx
import { ALL_PRODUCTS, getProductsByCategory } from '@/data/products';

const cakes = getProductsByCategory('Cakes');
const chocolate = ALL_PRODUCTS.find(p => p.id === 1);
```

## 🚀 Common Tasks

### Add a New Page
1. Create a new file in `pages/` (e.g., `pages/NewPage.tsx`)
2. Import components you need from `components/`
3. Add the route to `App.tsx`
4. Use data from `data/` and constants from `constants/`

### Add a New Component
1. Create a new file in `components/` (e.g., `components/ProductCard.tsx`)
2. Use TypeScript types from `types/`
3. Use utilities from `utils/` for text formatting
4. Use colors from `constants/`

### Update Product Information
1. Edit `data/products.ts`
2. Add/update product details
3. Changes automatically reflect everywhere products are used

### Change Colors
1. Edit `constants/colors.ts`
2. Update the color value
3. All buttons/text using that color automatically update

### Add a New Utility Function
1. Add function to `utils/stringHelpers.ts`
2. Export it from `utils/index.ts`
3. Import and use in components

## 📝 Code Style & Best Practices

### Imports
```tsx
// ✅ Good - specific imports
import { truncateText, formatPrice } from '@/utils';
import { COLOR_PRIMARY, SITE_NAME } from '@/constants';
import { Product } from '@/types';

// ❌ Avoid - importing from nested paths
import { truncateText } from '@/utils/stringHelpers';
```

### Components
```tsx
// ✅ Good - clear comments and organized
export default function ProductCard({ product }: { product: Product }) {
  // Format price for display
  const displayPrice = formatPrice(product.price);
  
  // Truncate long descriptions
  const shortDesc = truncateText(product.description, 100);
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{shortDesc}</p>
      <p>{displayPrice}</p>
    </div>
  );
}
```

### Using Constants
```tsx
// ✅ Good - use constants
import { COLOR_PRIMARY, BUTTON_CLASSES } from '@/constants';

<button className={BUTTON_CLASSES.primary}>Order Now</button>

// ❌ Avoid - hardcoding values
<button className="bg-[#C9949B] hover:bg-[#C97A85]...">Order Now</button>
```

## 🔄 Data Flow

```
User clicks button
    ↓
Component calls function from @/utils
    ↓
Function uses constants from @/constants
    ↓
Component displays data from @/data
    ↓
Types from @/types ensure type safety
    ↓
Result shown to user
```

## 📚 File Naming Conventions

- **Components:** PascalCase (e.g., `ProductCard.tsx`, `Navigation.tsx`)
- **Pages:** PascalCase (e.g., `Home.tsx`, `Menu.tsx`)
- **Utilities:** camelCase (e.g., `stringHelpers.ts`, `formatters.ts`)
- **Constants:** camelCase (e.g., `colors.ts`, `index.ts`)
- **Types:** camelCase (e.g., `index.ts`)
- **Data:** camelCase (e.g., `products.ts`)

## 🎨 Color Usage Example

```tsx
import { COLOR_PRIMARY, COLOR_BACKGROUND, TEXT_CLASSES } from '@/constants';

export function MyComponent() {
  return (
    <div className={`bg-[${COLOR_BACKGROUND}]`}>
      <h1 className={TEXT_CLASSES.heading1}>Welcome</h1>
      <button className={`bg-[${COLOR_PRIMARY}]`}>Click me</button>
    </div>
  );
}
```

## 🛠️ Debugging Tips

1. **Can't find a component?** Check `components/` folder
2. **Need a utility function?** Check `utils/stringHelpers.ts`
3. **Looking for product data?** Check `data/products.ts`
4. **Need a color value?** Check `constants/colors.ts`
5. **Type errors?** Check `types/index.ts`

## 📖 Further Reading

- React Documentation: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com
- tRPC: https://trpc.io

## ❓ Questions?

If you're confused about where something should go:
- **Reusable UI?** → `components/`
- **Full page?** → `pages/`
- **Text formatting?** → `utils/stringHelpers.ts`
- **Color/config?** → `constants/`
- **Product info?** → `data/products.ts`
- **Type definition?** → `types/`

---

Happy coding! 🎂✨
