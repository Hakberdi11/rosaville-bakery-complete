import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { api, type Dessert } from "@/lib/api";

export default function MenuItem() {
  const [, navigate] = useLocation();
  const [isActive, params] = useRoute("/menu-item/:id");
  const itemId = params?.id ? parseInt(params.id) : null;
  const [item, setItem] = useState<Dessert | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }
    api.desserts.get(itemId)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  if (loading) {
    return null;
  }

  if (!item) {
    return (
      <div className="w-full bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Item Not Found</h1>
          <Button onClick={() => navigate('/menu')} className="bg-cta text-white hover:bg-cta-hover">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.featured_image || '/placeholder-dessert.svg',
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <section className="py-12 bg-background">
        <div className="container">
          <button
            onClick={() => navigate('/menu')}
            className="text-accent hover:text-foreground font-sans text-sm font-semibold mb-6 transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </section>

      {/* Item Details */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Image */}
            <div className="fade-in-up">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-border h-96 md:h-full flex items-center justify-center">
                <img
                  src={item.featured_image || '/placeholder-dessert.svg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="fade-in-up space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-cta/20 border border-cta text-foreground font-sans text-xs font-semibold uppercase">
                    {item.category}
                  </span>
                  {!item.availability && (
                    <span className="inline-block px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 text-foreground font-sans text-xs font-semibold uppercase">
                      Currently Unavailable
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {item.name}
                </h1>
                <p className="font-sans text-lg text-foreground/80 leading-relaxed">
                  {item.description}
                </p>
                {item.preparation_time && (
                  <p className="font-sans text-sm text-foreground/60 mt-3">Preparation time: {item.preparation_time}</p>
                )}
              </div>

              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground mb-2">Ingredients</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ing, idx) => (
                      <span key={idx} className="bg-muted text-foreground/80 px-3 py-1 rounded-full text-xs font-sans">
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.allergens && item.allergens.length > 0 && (
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground mb-2">Allergens</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.allergens.map((a, idx) => (
                      <span key={idx} className="bg-cta/10 text-foreground px-3 py-1 rounded-full text-xs font-sans">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & CTA */}
              <div className="bg-white p-8 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-sans text-foreground font-semibold">Price:</span>
                  <span className="font-serif text-4xl font-bold text-accent">${Number(item.price).toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!item.availability}
                    className="flex-1 bg-cta text-white hover:bg-cta-hover font-sans font-semibold px-8 py-4 rounded-lg hover-lift transition-all text-lg disabled:opacity-50"
                  >
                    {item.availability ? "Add to Cart" : "Unavailable"}
                  </Button>
                  <Button
                    onClick={() => navigate('/menu')}
                    className="flex-1 border-2 border-cta bg-white text-foreground hover:bg-muted font-sans font-semibold px-8 py-4 rounded-lg hover-lift transition-all"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
