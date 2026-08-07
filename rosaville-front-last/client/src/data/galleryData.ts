/**
 * Gallery Data Structure
 * Contains 7 vertical cake images with metadata for the gallery carousel
 * Each cake has: id, name, description, image URL, and vertical orientation
 */

export interface GalleryCake {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export const galleryCakes: GalleryCake[] = [
  {
    id: 1,
    name: "Lavender Dream Cake",
    description: "A delicate blend of lavender-infused sponge with white chocolate ganache and fresh edible flowers. This ethereal creation captures the essence of summer gardens in every bite.",
    imageUrl: "/manus-storage/chocolate-cake_4df9a7a5.jpg",
  },
  {
    id: 2,
    name: "Strawberry Bliss",
    description: "Fresh strawberry cake with whipped cream and candied berries. A celebration of spring's sweetest flavors, perfect for garden parties and special occasions.",
    imageUrl: "/manus-storage/chocolate-cake_4df9a7a5.jpg",
  },
  {
    id: 3,
    name: "Chocolate Decadence",
    description: "Rich dark chocolate cake with silky ganache and chocolate shavings. This indulgent creation is a chocolate lover's dream, layered with decadence and elegance.",
    imageUrl: "/manus-storage/chocolate-cake_4df9a7a5.jpg",
  },
  {
    id: 4,
    name: "Vanilla Dream",
    description: "Classic vanilla cake with buttercream frosting and delicate decorations. A timeless favorite that brings warmth and comfort to every celebration.",
    imageUrl: "/manus-storage/chocolate-cake_4df9a7a5.jpg",
  },
  {
    id: 5,
    name: "Matcha Elegance",
    description: "Sophisticated matcha-infused sponge with white chocolate and green tea accents. A modern twist on tradition, bringing Japanese elegance to your table.",
    imageUrl: "/manus-storage/chocolate-cake_4df9a7a5.jpg",
  },
  {
    id: 6,
    name: "Rose Garden Cake",
    description: "Delicate rose-flavored cake with rose petal decorations and pink frosting. A romantic creation that celebrates the beauty and fragrance of blooming roses.",
    imageUrl: "/manus-storage/chocolate-cake_4df9a7a5.jpg",
  },
  {
    id: 7,
    name: "Pistachio Perfection",
    description: "Creamy pistachio cake with pistachio buttercream and crushed pistachios. A nutty, sophisticated flavor profile that brings Mediterranean charm to your dessert table.",
    imageUrl: "/manus-storage/chocolate-cake_4df9a7a5.jpg",
  },
];

/**
 * Gallery Configuration
 * Timer duration in milliseconds (5 seconds = 5000ms)
 * Can be adjusted as needed
 */
export const GALLERY_TIMER_DURATION = 5000; // 5 seconds
