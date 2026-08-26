import { CheckCircle2, X, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/contexts/SiteContentContext";
import type { CartItem } from "@/contexts/CartContext";

interface OrderConfirmationModalProps {
  orderNumber: string;
  items: CartItem[];
  total: number;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
}

/**
 * Persistent order-confirmation pop-up shown right after checkout. No payment
 * is collected anywhere in this app — the reassurance copy here is deliberate:
 * it tells the customer plainly that this is a real order, nothing was
 * silently charged, and gives them a real way to reach the business, rather
 * than just a "thanks" that could belong to any placeholder site.
 */
export default function OrderConfirmationModal({
  orderNumber,
  items,
  total,
  onTrackOrder,
  onContinueShopping,
}: OrderConfirmationModalProps) {
  const { content } = useSiteContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onContinueShopping}
          className="absolute top-4 right-4 text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <CheckCircle2 className="text-primary mb-3" size={44} />
          <h2 className="font-serif text-2xl font-bold text-foreground">Order Received</h2>
          <p className="font-sans text-sm text-foreground/60 mt-1">Order #{orderNumber}</p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-5">
          <p className="font-sans text-sm text-foreground/85 leading-relaxed">
            This is a real order — we have it, and we're on it. No payment has been taken today;
            we'll be in touch shortly to confirm the details and arrange payment together.
          </p>
        </div>

        <div className="border-t border-border pt-4 mb-5 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-sans font-semibold text-foreground">{item.name}</p>
                <p className="font-sans text-foreground/60">Qty: {item.quantity}</p>
              </div>
              <p className="font-serif font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="pt-3 border-t-2 border-cta flex justify-between items-center">
            <span className="font-sans font-semibold text-foreground">Total:</span>
            <span className="font-serif text-xl font-bold text-accent">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-6">
          <p className="font-sans text-sm font-semibold text-foreground mb-2.5">
            Questions right now? Reach us directly:
          </p>
          <div className="space-y-1.5 font-sans text-sm text-foreground/75">
            <div className="flex items-start gap-2">
              <Phone size={15} className="mt-0.5 text-accent shrink-0" />
              <span>{content?.contact_phone || "(555) 123-4567"}</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail size={15} className="mt-0.5 text-accent shrink-0" />
              <span>{content?.contact_email || "hello@rosaville.com"}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 text-accent shrink-0" />
              <span className="whitespace-pre-line">
                {content?.contact_address || "123 Sweet Street\nDessert City, DC 12345"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onTrackOrder}
            className="flex-1 border-2 border-cta bg-white text-foreground hover:bg-muted font-sans font-semibold"
          >
            Track Your Order
          </Button>
          <Button
            onClick={onContinueShopping}
            className="flex-1 bg-cta text-white hover:bg-cta-hover font-sans font-semibold"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
