import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { api, type Dessert } from "@/lib/api";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const [isActive, params] = useRoute("/product/:id");
  const { addToCart } = useCart();

  const productId = params?.id ?? null;
  const [product, setProduct] = useState<Dessert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    api.desserts.get(productId)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return null;
  }

  if (!product) {
    return (
      <div className="w-full bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/menu')} className="bg-cta text-white hover:bg-cta-hover">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.featured_image || '/placeholder-dessert.svg',
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="w-full bg-background">
      <section className="py-12">
        <div className="container">
          <button
            onClick={() => navigate('/menu')}
            className="text-accent hover:text-foreground font-sans text-sm font-semibold mb-8 transition-colors"
          >
            ← Back
          </button>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <img
                src={product.featured_image || '/placeholder-dessert.svg'}
                alt={product.name}
                className="w-full max-w-md h-auto rounded-lg shadow-lg object-cover"
              />
            </div>

            {/* Product Info */}
            <div>
              {!product.availability && (
                <span className="inline-block px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 text-foreground font-sans text-xs font-semibold uppercase mb-3">
                  Currently Unavailable
                </span>
              )}
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">{product.name}</h1>
              <p className="font-sans text-lg text-foreground/80 mb-6">{product.description}</p>

              <div className="bg-white border border-border rounded-lg p-6 mb-6">
                <p className="font-serif text-3xl font-bold text-accent mb-4">${Number(product.price).toFixed(2)}</p>

                {/* Ingredients */}
                {product.ingredients && product.ingredients.length > 0 && (
                  <div className="mb-6">
                    <p className="font-sans font-semibold text-foreground mb-3">Ingredients:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ing, idx) => (
                        <span key={idx} className="bg-muted text-foreground/80 px-3 py-1 rounded-full text-sm font-sans">
                          {ing.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergens */}
                {product.allergens && product.allergens.length > 0 && (
                  <div className="mb-6">
                    <p className="font-sans font-semibold text-foreground mb-3">Allergen Information:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.allergens.map((a, idx) => (
                        <span key={idx} className="bg-cta/10 text-foreground px-3 py-1 rounded-full text-sm font-sans">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.preparation_time && (
                  <p className="font-sans text-sm text-foreground/70 mb-6">Preparation time: {product.preparation_time}</p>
                )}

                <Button
                  onClick={handleAddToCart}
                  disabled={!product.availability}
                  className="w-full bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4 mb-4 disabled:opacity-50"
                >
                  {product.availability ? "Add to Cart" : "Unavailable"}
                </Button>
                <Button
                  onClick={() => navigate('/cart')}
                  className="w-full border-2 border-cta bg-white text-foreground hover:bg-muted font-sans font-semibold py-4"
                >
                  View Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
