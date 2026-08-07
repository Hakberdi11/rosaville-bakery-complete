import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useEffect } from "react";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();

  // Auto-scroll to bottom on mobile when cart page loads
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && items.length > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="w-full bg-background min-h-screen">
        <section className="py-20">
          <div className="container text-center">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Shopping Bag</h1>
            <p className="font-sans text-lg text-foreground/80 mb-8">Your cart is empty</p>
            <Button
              onClick={() => navigate('/menu')}
              className="bg-cta text-white hover:bg-cta-hover font-sans font-semibold px-8 py-4"
            >
              Continue Shopping
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <section className="py-16">
        <div className="container max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-12">Shopping Bag</h1>

          {/* Cart Items */}
          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-border rounded-lg p-6 flex gap-6 items-start">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{item.name}</h3>
                  <p className="font-sans text-foreground/80 mb-4">${item.price.toFixed(2)} each</p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-background rounded transition-colors"
                    >
                      <Minus size={18} className="text-foreground" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = parseInt(e.target.value, 10);
                        if (!Number.isNaN(next)) updateQuantity(item.id, next);
                      }}
                      className="w-12 text-center border border-border rounded px-2 py-1 font-sans"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-background rounded transition-colors"
                    >
                      <Plus size={18} className="text-foreground" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-serif text-xl font-bold text-accent mb-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white border border-border rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
              <span className="font-sans text-lg text-foreground font-semibold">Subtotal:</span>
              <span className="font-serif text-2xl font-bold text-accent">${total.toFixed(2)}</span>
            </div>
            <p className="font-sans text-sm text-foreground/70 mb-6">Shipping and taxes calculated at checkout</p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => navigate('/menu')}
                className="flex-1 border-2 border-cta bg-white text-foreground hover:bg-muted font-sans font-semibold py-4 order-2 md:order-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => navigate('/checkout')}
                className="flex-1 bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4 order-1 md:order-2"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>

          <button
            onClick={clearCart}
            className="w-full text-center text-accent hover:text-foreground font-sans font-semibold transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </section>
    </div>
  );
}
