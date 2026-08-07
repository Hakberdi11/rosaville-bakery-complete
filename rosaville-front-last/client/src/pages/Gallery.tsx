import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/useMobile";
import { api, type Dessert } from "@/lib/api";

/**
 * Gallery Landing Page
 * Mobile: Single featured cake with "Explore our Gallery" button
 * Desktop: Full gallery grid layout
 */
export default function Gallery() {
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [cakes, setCakes] = useState<Dessert[]>([]);

  useEffect(() => {
    api.desserts.listGallery().then(setCakes).catch(() => {});
  }, []);

  if (cakes.length === 0) {
    return (
      <div className="w-full bg-background min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Our Gallery</h1>
          <p className="font-sans text-foreground/70">Our gallery is being freshened up — check back soon!</p>
        </div>
      </div>
    );
  }

  const featuredCake = cakes[0];

  // Mobile view - Single featured cake with button
  if (isMobile) {
    return (
      <div className="w-full bg-background min-h-screen flex flex-col">
        {/* Header Section */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-center">
              Our Gallery
            </h1>
            <p className="font-sans text-base md:text-lg text-foreground/80 text-center mt-3">
              Discover our collection of handcrafted masterpieces
            </p>
          </div>
        </section>

        {/* Featured Cake Section - Mobile Landing */}
        <section className="flex-1 flex items-center justify-center py-12 md:py-20 px-4">
          <div className="w-full max-w-md fade-in-up">
            {/* Vertical Image Container */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-primary aspect-[3/4] flex items-center justify-center">
                <img
                  src={featuredCake.featured_image || "/placeholder-dessert.svg"}
                  alt={featuredCake.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Cake Info */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
                {featuredCake.name}
              </h2>
              <p className="font-sans text-sm md:text-base text-foreground/80 leading-relaxed mb-6">
                {featuredCake.description}
              </p>
            </div>

            {/* Explore Gallery Button */}
            <Button
              onClick={() => navigate("/gallery-carousel")}
              className="w-full bg-primary hover:bg-accent text-white font-sans font-semibold px-8 py-4 rounded-lg hover-lift transition-all text-lg"
            >
              Explore our Gallery ↓
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Desktop view - Full gallery grid
  return (
    <div className="w-full bg-background min-h-screen">
      {/* Header Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-center">
            Our Gallery
          </h1>
          <p className="font-sans text-base md:text-lg text-foreground/80 text-center mt-3">
            Discover our collection of handcrafted masterpieces
          </p>
        </div>
      </section>

      {/* Gallery Grid - Desktop Only */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {cakes.map((cake) => (
              <div
                key={cake.id}
                onClick={() => navigate(`/product/${cake.id}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-primary hover:border-primary"
              >
                {/* Image Container */}
                <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                  <img
                    src={cake.featured_image || "/placeholder-dessert.svg"}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Cake Info */}
                <div className="p-4 bg-white">
                  <h3 className="font-serif font-bold text-foreground mb-2">
                    {cake.name}
                  </h3>
                  <p className="font-sans text-sm text-foreground/70 line-clamp-2">
                    {cake.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <p className="font-sans text-foreground/70 mb-6">
              Interested in a custom design?
            </p>
            <Button
              onClick={() => navigate("/custom-cakes")}
              className="bg-primary hover:bg-accent text-white font-sans font-semibold px-8 py-3 rounded-full transition-all"
            >
              Order a Custom Cake
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
