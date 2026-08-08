import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api, type OrderStatus as OrderStatusResult } from "@/lib/api";

const STATUS_COPY: Record<string, string> = {
  Pending: "We've received your order and will confirm it shortly.",
  Confirmed: "Your order is confirmed and queued for production.",
  "In Production": "Your order is being baked right now!",
  Ready: "Your order is ready.",
  Delivered: "Your order has been delivered.",
  Completed: "Your order is complete. Thank you!",
  Cancelled: "This order was cancelled.",
  Refunded: "This order was refunded.",
};

export default function OrderStatus() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderStatusResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const order = await api.orders.lookup(orderNumber.trim(), email.trim());
      setResult(order);
    } catch (err) {
      let message = "We couldn't find an order matching that number and email.";
      try {
        const parsed = JSON.parse((err as Error).message);
        if (parsed?.detail) message = parsed.detail;
      } catch {
        // fall back to the default message
      }
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <section className="py-16">
        <div className="container max-w-xl">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Track Your Order</h1>
          <p className="font-sans text-foreground/80 mb-10">
            Enter your order number (from your confirmation) and the email you used at checkout.
          </p>

          <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 space-y-4 mb-8">
            <div>
              <label className="block font-sans font-semibold text-foreground mb-2">Order Number *</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                placeholder="RV-123456"
                className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
              />
            </div>
            <div>
              <label className="block font-sans font-semibold text-foreground mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4"
            >
              {loading ? "Looking up…" : "Track Order"}
            </Button>
          </form>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 font-sans text-sm text-foreground">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-white border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-foreground">{result.order_number}</h2>
                <span className="font-sans text-sm font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent">
                  {result.status}
                </span>
              </div>
              <p className="font-sans text-sm text-foreground/80">{STATUS_COPY[result.status] || ""}</p>

              <div className="border-t border-border pt-4 space-y-2">
                {result.items.map((item, i) => (
                  <div key={i} className="flex justify-between font-sans text-sm text-foreground">
                    <span>{item.quantity}× {item.name}{item.size && item.size !== "Standard" ? ` (${item.size})` : ""}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-cta pt-4 flex justify-between font-sans">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-serif text-lg font-bold text-accent">${Number(result.total_value).toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans text-sm text-foreground/70 pt-2">
                <div>Payment: {result.payment_status}</div>
                {result.delivery_date && <div>Delivery: {new Date(result.delivery_date).toLocaleDateString()}</div>}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
