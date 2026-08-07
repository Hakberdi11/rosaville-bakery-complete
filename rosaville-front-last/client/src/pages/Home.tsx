import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Streamdown } from 'streamdown';
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useRef, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import QuantitySelector from "@/components/QuantitySelector";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  const [, navigate] = useLocation();
  const { addToCart, updateQuantity } = useCart();
  const [quantitySelectorOpen, setQuantitySelectorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const featuredRef = useScrollReveal();
  const whyChooseRef = useScrollReveal();
  const newsletterRef = useScrollReveal();
  const specialRef = useScrollReveal();
  const cakeButtonsRef = useRef<HTMLDivElement>(null);

  // Character limiter function - only for homepage display
  // This truncates text with ellipsis ONLY on the homepage
  // The full text appears on product detail pages
  const truncateTextForHomepage = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <div className="w-full">
      {/* Hero Section - Clean and Balanced */}
      <section className="relative bg-[#FBF7F4]">
        {/* Desktop Layout */}
        <div className="hidden md:flex min-h-screen items-center py-12 md:py-0">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="fade-in-up space-y-8 order-2 md:order-1">
                <div className="space-y-4">
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D2817] leading-tight">
                    Fresh Cakes Made to Order in Roseville
                  </h1>
                  <p className="font-sans text-base md:text-lg text-[#5F3F1B]/80 leading-relaxed max-w-lg">
                    Handcrafted desserts made with love and the finest ingredients.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    className="bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-8 py-4 text-lg rounded-lg hover-lift shadow-lg hover:shadow-xl transition-all border-2 border-[#C9949B]"
                  >
                    <a href="/menu">Browse Cakes</a>
                  </Button>
                  <Button
                    asChild
                    className="border-2 border-[#C9949B] bg-white text-[#C9949B] hover:bg-[#F0D4D8] font-sans font-semibold px-8 py-4 text-lg rounded-lg hover-lift transition-all"
                  >
                    <a href="/custom-cakes">Design Your Own</a>
                  </Button>
                </div>
                <p className="text-[#5F3F1B]/60 text-sm flex items-center gap-2">
                  Explore our cakes <span className="text-lg">↓</span>
                </p>
              </div>

              {/* Right: Cake Image */}
              <div className="fade-in-up order-1 md:order-2 flex justify-center md:justify-end">
                <img 
                  src="/manus-storage/strawberry-cake-hero_4494ac95.jpg" 
                  alt="Strawberry Cake with Fresh Berries and Flowers"
                  className="w-full max-w-sm md:max-w-md h-auto object-contain drop-shadow-2xl rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Split Image with Text Between */}
        <div className="md:hidden">
          {/* Top Half of Cake */}
          <div className="w-full px-4 pt-4">
            <img 
              src="/manus-storage/cake-top-half_416e8c74.jpg" 
              alt="Decorated Cake Top"
              className="w-full h-auto object-cover rounded-lg drop-shadow-lg"
            />
          </div>

          {/* Text Content in Middle */}
          <div className="px-4 py-8 space-y-6">
            <h1 className="font-serif text-4xl font-bold text-[#3D2817] leading-tight">
              Fresh Cakes Made to Order
            </h1>
            <p className="font-sans text-base text-[#5F3F1B] leading-relaxed">
              Handcrafted desserts made with love and the finest ingredients.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                asChild
                className="bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-6 py-3 text-base rounded-lg hover-lift transition-all w-full border-2 border-[#C9949B]"
              >
                <a href="/menu">Browse Cakes</a>
              </Button>
              <Button
                asChild
                className="border-2 border-[#C9949B] bg-white text-[#C9949B] hover:bg-[#F0D4D8] font-sans font-semibold px-6 py-3 text-base rounded-lg hover-lift transition-all w-full"
              >
                <a href="/custom-cakes">Design Your Own</a>
              </Button>
            </div>
            <p className="text-[#5F3F1B]/60 text-xs flex items-center gap-2 pt-2">
              Explore our cakes <span>↓</span>
            </p>
          </div>

          {/* Bottom Half of Cake */}
          <div className="w-full px-4 pb-4">
            <img 
              src="/manus-storage/cake-bottom-half_84a5f945.jpg" 
              alt="Decorated Cake Bottom"
              className="w-full h-auto object-cover rounded-lg drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Featured Creations Section */}
      <section ref={featuredRef} className="py-32 md:py-40 bg-[#FBF7F4]">
        <div className="container">
          <div className="text-center mb-16 fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3D2817] mb-4">
              Featured Creations
            </h2>
            <p className="font-sans text-lg text-[#5F3F1B]/80">
              Discover our most beloved desserts, each one a masterpiece of flavor and artistry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: '/manus-storage/caramel-cake_f84bcba5.jpg',
                title: 'Decadent Chocolate Cake',
                description: 'Rich, moist layers of premium chocolate with silky ganache.',
              },
              {
                image: '/manus-storage/caramel-cake_f84bcba5.jpg',
                title: 'Golden Caramel Dream',
                description: 'Buttery cake with luscious caramel and delicate decorations.',
              },
              {
                image: '/manus-storage/golden-chocolate-cake_7df42831.jpg',
                title: 'Velvet Raspberry Bliss',
                description: 'Elegant sponge with fresh raspberries and cream filling.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="fade-in-up rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow border border-[#E8D4D8]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-64 overflow-hidden bg-[#FBF7F4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-[#3D2817] mb-2">
                    {item.title}
                  </h3>
                  <p className="font-sans text-[#5F3F1B]/70 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 fade-in-up">
            <p className="text-[#5F3F1B]/60 text-sm flex items-center justify-center gap-2 mb-6">
              View all options <span className="text-lg">↓</span>
            </p>
          </div>
        </div>
      </section>

      {/* Month's Special Dessert Section - MOVED BEFORE What's Your Style */}
      <section ref={specialRef} className="py-32 md:py-40 bg-[#FBF7F4] fade-in-up">
        <div className="container max-w-4xl">
          <div className="text-center mb-12 fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3D2817] mb-4">
              This Month's Special
            </h2>
            <p className="font-sans text-lg text-[#5F3F1B]/80">
              Discover our exclusive limited-time dessert creation
            </p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-[#E8D4D8] fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Image */}
              <div className="flex items-center justify-center bg-[#FBF7F4] rounded-lg overflow-hidden h-80 md:h-96">
                <img 
                  src="/manus-storage/chocolate-cake_4df9a7a5.jpg" 
                  alt="Special Dessert of the Month"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-[#F0D4D8]/50 border border-[#E8D4D8] mb-4">
                    <span className="text-[#5F3F1B] font-sans text-xs font-semibold tracking-widest uppercase">
                      JULY SPECIAL
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#3D2817] mb-3">
                    Lavender Dream Cake
                  </h3>
                  {/* Mobile: Character limited description */}
                  <p className="md:hidden font-sans text-[#5F3F1B]/80 leading-relaxed mb-4">
                    {truncateTextForHomepage(
                      "A delicate blend of lavender-infused sponge with white chocolate ganache and fresh edible flowers. This ethereal creation captures the essence of summer gardens in every bite.",
                      100
                    )}
                  </p>
                  {/* Desktop: Full description */}
                  <p className="hidden md:block font-sans text-[#5F3F1B]/80 leading-relaxed mb-4">
                    A delicate blend of lavender-infused sponge with white chocolate ganache and fresh edible flowers. This ethereal creation captures the essence of summer gardens in every bite.
                  </p>
                </div>

                <div className="space-y-3 border-t border-[#E8D4D8] pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[#5F3F1B] font-semibold">Price:</span>
                    <span className="font-serif text-2xl font-bold text-[#3D2817]">$45</span>
                  </div>
                  <p className="font-sans text-sm text-[#5F3F1B]/60">
                    Available for pre-order. Limited quantities available.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => navigate('/special-dessert')}
                    className="bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all flex-1"
                  >
                    Learn More
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedItem({
                        id: 0,
                        name: 'Lavender Dream Cake',
                        price: 45,
                        image: '/manus-storage/chocolate-cake_4df9a7a5.jpg'
                      });
                      setQuantitySelectorOpen(true);
                    }}
                    className="border-2 border-[#C9949B] bg-white text-[#3D2817] hover:bg-[#F0D4D8]/30 font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all flex-1"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu & Custom Orders CTA Section - MOVED AFTER Month's Special */}
      <section ref={cakeButtonsRef} className="py-20 md:py-32 bg-[#C9949B]/10">
        <div className="container max-w-4xl">
          <div className="text-center mb-12 fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3D2817] mb-4">
              What's Your Style?
            </h2>
            <p className="font-sans text-lg text-[#5F3F1B]/80">
              Choose from our ready-made menu or create something uniquely yours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Menu Option */}
            <div className="fade-in-up p-8 md:p-12 rounded-2xl bg-white border-2 border-[#C9949B] hover:shadow-xl transition-all">
              <div className="text-center space-y-6">
                <div className="text-5xl">🍰</div>
                <h3 className="font-serif text-2xl font-bold text-[#3D2817]">
                  Browse Our Menu
                </h3>
                <p className="font-sans text-[#5F3F1B]/80">
                  Explore our carefully curated selection of signature desserts, ready to order and enjoy.
                </p>
                <Button
                  asChild
                  className="bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all w-full border-2 border-[#C9949B]"
                >
                  <a href="/menu">View Menu</a>
                </Button>
              </div>
            </div>

            {/* Custom Orders Option */}
            <div className="fade-in-up p-8 md:p-12 rounded-2xl bg-white border-2 border-[#C9949B] hover:shadow-xl transition-all">
              <div className="text-center space-y-6">
                <div className="text-5xl">✨</div>
                <h3 className="font-serif text-2xl font-bold text-[#3D2817]">
                  Design Your Own
                </h3>
                <p className="font-sans text-[#5F3F1B]/80">
                  Create a custom cake tailored to your vision. Perfect for special occasions and celebrations.
                </p>
                <Button
                  asChild
                  className="border-2 border-[#C9949B] bg-white text-[#C9949B] hover:bg-[#F0D4D8] font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all w-full"
                >
                  <a href="/custom-cakes">Custom Orders</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section ref={whyChooseRef} className="py-32 md:py-40 bg-[#FBF7F4]">
        <div className="container max-w-4xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3D2817] mb-4">
              Why Choose Rosaville
            </h2>
            <p className="font-sans text-lg text-[#5F3F1B]/80">
              We're committed to excellence in every bite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Premium Ingredients',
                description: 'Only the finest, freshest ingredients sourced from trusted suppliers.',
              },
              {
                title: 'Handcrafted Quality',
                description: 'Every dessert is made by hand with care and attention to detail.',
              },
              {
                title: 'Custom Creations',
                description: 'Your vision, our expertise. We create personalized desserts for your special moments.',
              },
              {
                title: 'Family Recipe',
                description: 'Generations of baking excellence passed down through our family.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="fade-in-up p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow border border-[#E8D4D8]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <h3 className="font-serif text-xl font-semibold text-[#3D2817] mb-3">
                  {item.title}
                </h3>
                <p className="font-sans text-[#5F3F1B]/70 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Newsletter Section */}
      <section ref={newsletterRef} className="py-32 md:py-40 bg-[#C9949B]/10">
        <div className="container max-w-2xl">
          <div className="text-center mb-12 fade-in">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3D2817] mb-4">
              Stay Updated
            </h2>
            <p className="font-sans text-lg text-[#5F3F1B]/80">
              Subscribe to our newsletter for exclusive offers, seasonal specials, and news
            </p>
          </div>

          <form className="fade-in-up flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-lg border border-[#E8D4D8] bg-white font-sans text-[#3D2817] placeholder-[#5F3F1B]/50 focus:outline-none focus:ring-2 focus:ring-[#C9949B]"
            />
            <Button
              type="submit"
              className="bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all border-2 border-[#C9949B]"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Quantity Selector Modal */}
      {selectedItem && (
        <QuantitySelector
          isOpen={quantitySelectorOpen}
          onClose={() => {
            setQuantitySelectorOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={(quantity) => {
            // Add item to cart first (increments by 1 if exists)
            addToCart({
              id: selectedItem.id,
              name: selectedItem.name,
              price: selectedItem.price,
              image: selectedItem.image
            });
            
            // If user selected more than 1, set to that quantity
            if (quantity > 1) {
              updateQuantity(selectedItem.id, quantity);
            }
            
            toast.success(`${selectedItem.name} (x${quantity}) added to cart!`);
            setQuantitySelectorOpen(false);
            setSelectedItem(null);
          }}
          productName={selectedItem.name}
        />
      )}
    </div>
  );
}
