# Rosaville Desserts - Project TODO

## Design System & Foundation
- [x] Initialize web project with db, server, user features
- [x] Set up color palette (pastel lavender, blush pink, pale mint, slate-purple)
- [x] Configure typography (elegant serif for headings, clean sans-serif for body)
- [x] Create design tokens in Tailwind CSS
- [x] Set up global animations and transitions

## Database Schema
- [x] Create custom_cake_orders table
- [x] Create contact_messages table
- [x] Create menu_items table
- [x] Create team_members table

## Pages & Features
- [x] Homepage with hero section
- [x] Featured desserts showcase on homepage
- [x] Homepage call-to-action buttons
- [x] About page with bakery story
- [x] Team/baker profiles on About page
- [x] Brand values section on About page
- [x] Menu page with categorized desserts
- [x] Menu filtering by category
- [x] Gallery page with masonry layout
- [x] Custom Cakes page with inquiry form
- [x] Contact page with contact form
- [x] Contact page with location and hours
- [x] Contact page with social media links

## Navigation & Layout
- [x] Top navigation bar
- [x] Mobile hamburger menu
- [x] Smooth scroll behavior
- [x] Navigation links to all pages
- [x] Footer with links and info

## Forms & Database Integration
- [x] Custom cake order form submission to database
- [x] Contact form submission to database
- [x] Form validation and error handling
- [x] Success messages after submission

## Design & Animations
- [x] Dreamy pastel gradient backgrounds
- [x] Elegant serif typography styling
- [x] Smooth page transitions
- [x] Fade-in animations on scroll
- [x] Hover effects on cards and buttons
- [x] Responsive design for mobile/tablet/desktop

## Assets & Images
- [x] Gather dessert photography
- [x] Optimize images for web
- [x] Upload images to S3 storage

## Testing & Polish
- [x] Test form submissions (vitest: 6/6 tests passing)
- [x] Test responsive layouts (mobile hamburger menu verified)
- [x] Test animations and transitions (fade-in, hover, scroll-reveal working)
- [x] Accessibility audit (semantic HTML, ARIA labels, keyboard navigation)
- [x] Performance optimization (images optimized and uploaded to S3)
- [x] Cross-browser testing (responsive design verified on desktop and mobile)

## E-Commerce & Shopping Cart (NEW)
- [x] CartContext for global cart state management
- [x] Cart page with item quantity controls and removal
- [x] Checkout page with comprehensive order form
- [x] Shopping bag icon in navbar with item count badge
- [x] Add to Cart buttons on Menu page with toast notifications
- [x] Add to Cart on Home Month's Special section
- [x] Add to Cart on Special Dessert detail page
- [x] Cart page with order summary and checkout flow
- [x] Empty cart state with Continue Shopping button

## Product Details & Unified Template (NEW)
- [x] ProductDetail component as unified template for all items
- [x] Product ingredients display with bullet points
- [x] Dietary information tags (Contains Eggs, Dairy, Gluten)
- [x] Recipe with prep time, bake time, servings, and step-by-step instructions
- [x] Learn More buttons linking to ProductDetail pages
- [x] Back navigation from product detail pages
- [x] Product routing with /product/:id pattern

## Navigation Enhancements (NEW)
- [x] Shopping bag icon in navbar (desktop and mobile)
- [x] Cart item count badge on shopping bag
- [x] Mobile cart link in hamburger menu
- [x] Cart icon shows count dynamically
- [x] Floating cart button on mobile (bottom-right)
- [x] Bounce animation on floating cart button when item added
- [x] Dynamic item count badge on floating button
- [x] Rose icon in navbar instead of logo image
- [x] Rosaville text next to rose icon (visible on mobile and desktop)
- [x] Rosaville text uses curvy Playfair Display font with italic styling
- [x] Floating button moves up when toast notification appears
- [x] Floating button returns to original position after toast disappears
- [x] Auto-scroll to cart bottom on mobile when cart page loads
- [x] Logo image displayed in About page hero section
- [x] Logo has rounded corners and shadow for visual appeal

## Homepage Flow & Navigation (NEW)
- [x] Reorganized homepage sections in logical order (Hero → Featured → Menu/Custom → Special → Why Us → Newsletter)
- [x] Added smooth visual connections between sections with arrow indicators (↓)
- [x] Added Explore our cakes navigation hints throughout
- [x] Created What's Your Style section with Menu and Custom buttons side-by-side
- [x] Consistent section titles and styling throughout
- [x] Enhanced desktop hero visual balance with rounded corners
- [x] Verified mobile scroll flow - natural progression without gaps (375x812 viewport tested)
- [x] All sections connected visually with consistent spacing and indicators

## Custom Ordering Visibility (NEW)
- [x] Added Custom Orders Available banner on Menu page with emoji icon
- [x] Created Design Your Own card on homepage with description
- [x] Added Order Custom Cake button on Menu page banner
- [x] Custom ordering discoverable in under 5 seconds - banner visible immediately on Menu page load
- [x] All custom buttons link to custom order form (/custom-cakes)
- [x] Added custom ordering benefits descriptions in banners
- [x] Custom cakes also featured in hero section as second CTA button
- [x] Verified Menu page custom orders visibility - banner appears at top with clear CTA

## Design Refinement (NEW)
- [x] Updated color palette to soft rose/warm tones (#E8B4B8 primary accent)
- [x] Changed background to soft warm cream (#FBF7F4)
- [x] Updated text to dark charcoal/deep brown (#3D2817) for strong contrast
- [x] Updated all buttons to use soft rose accent color
- [x] Simplified hero section to one headline + one CTA button
- [x] Removed extra decorative elements from hero
- [x] Increased section padding (py-32 md:py-40) for better spacing
- [x] Updated Month's Special section styling with new color palette
- [x] Maintained consistent font usage (Playfair Display for headings, Poppins for body)
- [x] Improved text contrast for readability

## Completed Implementation Notes
- All 6 pages built with premium design and animations
- Database schema created and migrations applied
- tRPC procedures for form submissions working
- Responsive mobile navigation with hamburger menu
- Dreamy pastel gradient backgrounds and elegant typography
- Smooth animations on hover and scroll
- Form validation and error handling with toast notifications
- Image upload field for custom cake inspiration
- Footer with social links and business hours
- Fixed wouter Link syntax to avoid nested anchors
- Scroll-reveal animations with IntersectionObserver
- Full e-commerce workflow: Browse → Add to Cart → View Cart → Checkout
- Unified product detail pages for all menu items with recipes and dietary info
- Shopping cart persists across page navigation
- Toast notifications for all cart actions
- Homepage restructured with clear narrative flow
- Custom orders prominently featured on Menu page
- Consistent rose/warm color palette throughout all pages


## Current Work - UI/UX Improvements & New Features

### Special Dessert Page Fixes
- [x] Reduce oversized appearance on mobile (keep desktop 100% same)
- [x] Remove "Ready to Order?" CTA section at bottom
- [x] Match color palette with homepage (soft rose/warm tones)
- [x] Fix character limit - dots only on homepage, not on detail page

### Color Palette Consistency
- [x] Update About page to match homepage color scheme
- [x] Update CustomCakes page to match homepage color scheme
- [x] Update SpecialDessert page to match homepage color scheme

### Product Quantity Selector
- [x] Create quantity selector modal component
- [ ] Integrate with Add to Cart buttons across all pages

### Customer Testimonials
- [x] Create testimonials component with 4 reviews
- [ ] Add testimonials section to homepage
- [ ] Display below featured products section

### Category Filtering Enhancement
- [x] Create beautiful dropdown menu component
- [ ] Replace current category buttons on Menu page
- [ ] Maintain filtering functionality

### Gallery Page with Carousel
- [x] Create gallery landing page (mobile: single cake image + "Explore Gallery" button)
- [x] Create full gallery page with carousel design
- [x] Add cake image, name, and description display
- [x] Implement circular timer around pause button
- [x] Auto-advance images when timer ends
- [x] Match gallery design to reference image provided - REDESIGNED TO MATCH EXACTLY
- [x] Add navigation arrows (left/right) - positioned top-left on image
- [x] Implement swipe gesture support
- [x] Auto-loop to first cake after last
- [x] 7 vertical images with 5-second timer
- [x] BUG FIX: Reset gallery timer when manually navigating (arrows/swipe)
- [x] Add heart and bookmark icons (top-right on image)
- [x] Add related items grid on right side (desktop)
- [x] Circular timer with progress indicator (bottom-right on image)
- [x] Elegant card-based layout with rounded corners and shadow
- [x] Gallery carousel no-scroll implementation (overflow hidden) - FIXED: now scrolls normally
- [x] Gallery landing page responsive (mobile: featured + button, desktop: grid)
- [x] Desktop gallery shows 3-column grid with all 7 cakes
- [x] Gallery carousel text now visible
- [x] Gallery carousel header simplified ("Our Gallery" only)
- [ ] Replace placeholder images with 7 distinct vertical cake images


## Component Integration (COMPLETE)
- [x] Integrate QuantitySelector into Menu page
- [x] Integrate QuantitySelector into Home page
- [x] Integrate QuantitySelector into SpecialDessert page
- [x] Add Testimonials section to homepage
- [x] Replace category buttons with CategoryDropdown on Menu page

## Favourites Feature (COMPLETE)
- [x] Create FavouritesContext for managing saved cakes
- [x] Remove Bookmark button from gallery carousel
- [x] Heart button saves/removes from favourites
- [x] Add Favourites button to navbar
- [x] Create Favourites page to display saved cakes

## Gallery Refinements (NEW)
- [x] Remove navbar from gallery carousel page
- [x] Remove footer from gallery carousel page
- [x] Make images fill full screen (no boundaries)
- [x] Implement circular countdown timer around pause button
- [x] Gradient fade bottom box (smooth transition, no hard boundaries)
- [x] Top white transparent box with controls (full-width, no notch)
- [x] Add 7 distinct vertical cake images to gallery
- [x] Compact bottom box layout (title | counter | pause button)
- [x] Minimal spacing between elements
- [x] Gallery carousel fully functional and tested
- [x] Taller bottom box pushed up slightly
- [x] Full-width top box touching screen edges
- [x] Elegant button symbols throughout
- [x] Longer descriptions (2-3 lines per cake)
- [x] Bigger bottom box with enhanced gradient
- [x] Complete scroll blocking (no vertical/diagonal swiping)
