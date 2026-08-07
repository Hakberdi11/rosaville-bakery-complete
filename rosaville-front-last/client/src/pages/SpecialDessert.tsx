import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import QuantitySelector from "@/components/QuantitySelector";
import { api, type SpecialOfMonth } from "@/lib/api";

export default function SpecialDessert() {
  const [, navigate] = useLocation();
  const { addToCart, updateQuantity } = useCart();
  const [quantitySelectorOpen, setQuantitySelectorOpen] = useState(false);
  const [special, setSpecial] = useState<SpecialOfMonth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.specialOfMonth.getCurrent().then(setSpecial).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!special) {
    return (
      <div className="w-full bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">No Special Right Now</h1>
          <p className="font-sans text-foreground/70 mb-6">Check back soon for this month's featured creation.</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-accent text-white">Back to Home</Button>
        </div>
      </div>
    );
  }

  const dessert = special.dessert_detail;

  const handleAddToCart = () => {
    addToCart({
      id: dessert.id,
      name: special.display_title,
      price: Number(dessert.price),
      image: dessert.featured_image || '/placeholder-dessert.svg',
    });
  };

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          <button
            onClick={() => navigate('/')}
            className="text-foreground hover:text-foreground font-sans text-sm font-semibold mb-4 md:mb-6 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
            {special.display_title}
          </h1>
          <p className="font-sans text-base md:text-lg text-foreground/80 mt-2">
            {special.month_label}'s Exclusive Limited-Time Creation
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-16">
            {/* Image */}
            <div className="fade-in-up">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-primary h-64 md:h-96 md:h-full flex items-center justify-center">
                <img
                  src={dessert.featured_image || "/placeholder-dessert.svg"}
                  alt={special.display_title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="fade-in-up space-y-4 md:space-y-8">
              {/* Description */}
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">
                  About This Dessert
                </h2>
                <p className="font-sans text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                  {special.display_story}
                </p>
              </div>

              {/* Price & Availability */}
              <div className="bg-white p-4 md:p-6 rounded-lg border border-primary">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="font-sans text-sm md:text-base text-foreground font-semibold">Price:</span>
                  <span className="font-serif text-2xl md:text-3xl font-bold text-primary">${Number(dessert.price).toFixed(2)}</span>
                </div>
                {dessert.preparation_time && (
                  <p className="font-sans text-xs md:text-sm text-foreground/70">
                    <strong>Preparation time:</strong> {dessert.preparation_time}
                  </p>
                )}
                {!dessert.availability && (
                  <p className="font-sans text-xs md:text-sm text-foreground mt-2">Currently unavailable for order.</p>
                )}
              </div>

              {(dessert.ingredients?.length > 0 || dessert.allergens?.length > 0) && (
                <div className="bg-white p-4 md:p-6 rounded-lg border border-primary space-y-4">
                  {dessert.ingredients?.length > 0 && (
                    <div>
                      <p className="font-sans font-semibold text-foreground mb-2 text-sm md:text-base">Ingredients:</p>
                      <div className="flex flex-wrap gap-2">
                        {dessert.ingredients.map((ing, idx) => (
                          <span key={idx} className="bg-muted text-foreground/80 px-3 py-1 rounded-full text-xs font-sans">{ing.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {dessert.allergens?.length > 0 && (
                    <div>
                      <p className="font-sans font-semibold text-foreground mb-2 text-sm md:text-base">Allergens:</p>
                      <div className="flex flex-wrap gap-2">
                        {dessert.allergens.map((a, idx) => (
                          <span key={idx} className="bg-cta/10 text-foreground px-3 py-1 rounded-full text-xs font-sans">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2 md:gap-3 pt-2 md:pt-4">
                <Button
                  onClick={() => setQuantitySelectorOpen(true)}
                  disabled={!dessert.availability}
                  className="bg-primary hover:bg-accent text-white font-sans font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg hover-lift transition-all w-full text-base md:text-lg disabled:opacity-50"
                >
                  {dessert.availability ? "Add to Cart" : "Unavailable"}
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="border-2 border-primary bg-white text-foreground hover:bg-primary/10 font-sans font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg hover-lift transition-all w-full text-base md:text-lg"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quantity Selector Modal */}
      <QuantitySelector
        isOpen={quantitySelectorOpen}
        onClose={() => setQuantitySelectorOpen(false)}
        onConfirm={(quantity) => {
          handleAddToCart();
          if (quantity > 1) {
            updateQuantity(dessert.id, quantity);
          }
          toast.success(`${special.display_title} (x${quantity}) added to cart!`);
          setQuantitySelectorOpen(false);
        }}
        productName={special.display_title}
      />
    </div>
  );
}
