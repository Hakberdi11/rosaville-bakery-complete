import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, LoyaltySettings } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import OrderConfirmationModal from "@/components/OrderConfirmationModal";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    items: CartItem[];
    total: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    specialRequests: ''
  });
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings | null>(null);
  const [applyReward, setApplyReward] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email,
        fullName: prev.fullName || user.full_name,
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    api.loyaltySettings.get().then(setLoyaltySettings).catch(() => {});
  }, []);

  const rewardAvailable = Boolean(isAuthenticated && user?.loyalty?.reward_available && loyaltySettings?.enabled);
  const discount =
    applyReward && rewardAvailable && loyaltySettings
      ? loyaltySettings.reward_type === 'percent_off'
        ? total * (loyaltySettings.reward_value / 100)
        : Math.min(loyaltySettings.reward_value, total)
      : 0;
  const finalTotal = Math.max(0, total - discount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const order = await api.orders.submit({
        customer_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city} ${formData.zipCode}`.trim(),
        items: items.map((item) => ({
          name: item.name,
          dessert_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        // No total_value: the server recomputes it from the catalog and the
        // owner's LoyaltySettings (OrderViewSet.perform_create). The `discount`
        // / `finalTotal` above are display-only estimates.
        internal_notes: formData.specialRequests,
        redeem_loyalty_reward: applyReward && rewardAvailable,
      });
      setConfirmedOrder({ orderNumber: order.order_number, items, total: Number(order.total_value ?? finalTotal) });
      clearCart();
      // Refresh the cached user snapshot — order_count/reward_available on
      // Customer just changed server-side (OrderViewSet.perform_create), and
      // AuthContext's user state is otherwise only refetched on login/mount.
      if (isAuthenticated) checkUserAuth();
    } catch {
      toast.error('Could not place your order. Please try again.');
    }
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <>
        <div className="w-full bg-background min-h-screen">
          <section className="py-20">
            <div className="container text-center">
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Checkout</h1>
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
        {confirmedOrder && (
          <OrderConfirmationModal
            orderNumber={confirmedOrder.orderNumber}
            items={confirmedOrder.items}
            total={confirmedOrder.total}
            onTrackOrder={() => navigate('/order-status')}
            onContinueShopping={() => navigate('/menu')}
          />
        )}
      </>
    );
  }

  return (
    <>
    <div className="w-full bg-background">
      <section className="py-16">
        <div className="container max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-12">Checkout</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Order Summary</h2>
              <div className="bg-white border border-border rounded-lg p-6 space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b border-border">
                    <div>
                      <p className="font-serif font-semibold text-foreground">{item.name}</p>
                      <p className="font-sans text-sm text-foreground/70">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-serif font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                {rewardAvailable && (
                  <label className="flex items-center gap-2 font-sans text-sm text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyReward}
                      onChange={(e) => setApplyReward(e.target.checked)}
                      className="accent-cta"
                    />
                    Apply your reward (
                    {loyaltySettings?.reward_type === 'percent_off'
                      ? `${loyaltySettings.reward_value}% off`
                      : `$${loyaltySettings?.reward_value} off`}
                    )
                  </label>
                )}

                {discount > 0 && (
                  <div className="flex justify-between items-center font-sans text-sm text-foreground/80">
                    <span>Reward discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-4 border-t-2 border-cta">
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-semibold text-foreground">Total:</span>
                    <span className="font-serif text-2xl font-bold text-accent">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Delivery Information</h2>
              {!isAuthenticated && (
                <p className="font-sans text-sm text-foreground/70 mb-4 bg-primary/10 border border-border rounded-lg px-4 py-3">
                  <Link href="/signup" className="text-accent font-semibold hover:underline">
                    Create an account
                  </Link>{' '}
                  to save your details for faster checkout next time.
                </p>
              )}
              <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6 space-y-4">
                <div>
                  <label className="block font-sans font-semibold text-foreground mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-foreground mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-foreground mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans font-semibold text-foreground mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                    />
                  </div>
                  <div>
                    <label className="block font-sans font-semibold text-foreground mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans font-semibold text-foreground mb-2">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                    placeholder="Any special requests or dietary restrictions?"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="flex-1 border-2 border-cta bg-white text-foreground hover:bg-muted font-sans font-semibold py-4"
                  >
                    Back to Cart
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-cta text-white hover:bg-cta-hover font-sans font-semibold py-4"
                  >
                    {submitting ? "Placing Order…" : "Place Order"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
    {confirmedOrder && (
      <OrderConfirmationModal
        orderNumber={confirmedOrder.orderNumber}
        items={confirmedOrder.items}
        total={confirmedOrder.total}
        onTrackOrder={() => navigate('/order-status')}
        onContinueShopping={() => navigate('/menu')}
      />
    )}
    </>
  );
}
