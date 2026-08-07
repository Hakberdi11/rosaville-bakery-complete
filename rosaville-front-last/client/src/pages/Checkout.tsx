import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    specialRequests: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order submitted:', { items, total, ...formData });
    alert('Order placed successfully! We will contact you soon.');
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    return (
      <div className="w-full bg-[#FDF7F3] min-h-screen">
        <section className="py-20">
          <div className="container text-center">
            <h1 className="font-serif text-4xl font-bold text-[#8B6F47] mb-4">Checkout</h1>
            <p className="font-sans text-lg text-[#8B6F47]/80 mb-8">Your cart is empty</p>
            <Button
              onClick={() => navigate('/menu')}
              className="bg-[#A8C9B8] text-white hover:bg-[#96B8A6] font-sans font-semibold px-8 py-4"
            >
              Continue Shopping
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDF7F3]">
      <section className="py-16">
        <div className="container max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-[#8B6F47] mb-12">Checkout</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#8B6F47] mb-6">Order Summary</h2>
              <div className="bg-white border border-[#E8D4C8] rounded-lg p-6 space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b border-[#E8D4C8]">
                    <div>
                      <p className="font-serif font-semibold text-[#8B6F47]">{item.name}</p>
                      <p className="font-sans text-sm text-[#8B6F47]/70">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-serif font-bold text-[#A0845C]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="pt-4 border-t-2 border-[#A8C9B8]">
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-semibold text-[#8B6F47]">Total:</span>
                    <span className="font-serif text-2xl font-bold text-[#A0845C]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#8B6F47] mb-6">Delivery Information</h2>
              <form onSubmit={handleSubmit} className="bg-white border border-[#E8D4C8] rounded-lg p-6 space-y-4">
                <div>
                  <label className="block font-sans font-semibold text-[#8B6F47] mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#E8D4C8] rounded px-4 py-2 font-sans focus:outline-none focus:border-[#A8C9B8]"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[#8B6F47] mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#E8D4C8] rounded px-4 py-2 font-sans focus:outline-none focus:border-[#A8C9B8]"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[#8B6F47] mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#E8D4C8] rounded px-4 py-2 font-sans focus:outline-none focus:border-[#A8C9B8]"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[#8B6F47] mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#E8D4C8] rounded px-4 py-2 font-sans focus:outline-none focus:border-[#A8C9B8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans font-semibold text-[#8B6F47] mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#E8D4C8] rounded px-4 py-2 font-sans focus:outline-none focus:border-[#A8C9B8]"
                    />
                  </div>
                  <div>
                    <label className="block font-sans font-semibold text-[#8B6F47] mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#E8D4C8] rounded px-4 py-2 font-sans focus:outline-none focus:border-[#A8C9B8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[#8B6F47] mb-2">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-[#E8D4C8] rounded px-4 py-2 font-sans focus:outline-none focus:border-[#A8C9B8]"
                    placeholder="Any special requests or dietary restrictions?"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="flex-1 border-2 border-[#A8C9B8] bg-white text-[#8B6F47] hover:bg-[#F0E8DC] font-sans font-semibold py-4"
                  >
                    Back to Cart
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#A8C9B8] text-white hover:bg-[#96B8A6] font-sans font-semibold py-4"
                  >
                    Place Order
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
