import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";

export default function MenuItem() {
  const [, navigate] = useLocation();
  const [isActive, params] = useRoute("/menu-item/:id");
  const itemId = params?.id ? parseInt(params.id) : null;

  const menuItems: Record<number, any> = {
    1: { name: 'Chocolate Decadence', category: 'cakes', price: 4.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg', description: 'Rich dark chocolate cake with silky ganache', details: 'Layers of premium dark chocolate sponge cake with smooth chocolate ganache. Perfect for chocolate lovers.' },
    2: { name: 'Vanilla Dream', category: 'cakes', price: 3.99, image: '/manus-storage/caramel-cake_f84bcba5.jpg', description: 'Classic vanilla cake with buttercream frosting', details: 'Fluffy vanilla sponge with creamy buttercream. A timeless classic.' },
    3: { name: 'Strawberry Bliss', category: 'cakes', price: 4.99, image: '/manus-storage/strawberry-cake-hero.jpg', description: 'Fresh strawberry cake with whipped cream', details: 'Light sponge with fresh strawberries and whipped cream topping.' },
    4: { name: 'Lemon Sunshine', category: 'cakes', price: 4.25, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg', description: 'Bright lemon cake with tangy glaze', details: 'Zesty lemon cake with a tangy glaze. Refreshing and delightful.' },
    5: { name: 'Croissant', category: 'pastries', price: 3.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg', description: 'Buttery, flaky French croissant', details: 'Authentic French croissant with 100+ buttery layers.' },
    6: { name: 'Danish Pastry', category: 'pastries', price: 3.75, image: '/manus-storage/caramel-cake_f84bcba5.jpg', description: 'Sweet danish with fruit filling', details: 'Flaky pastry with sweet fruit filling inside.' },
    7: { name: 'Éclair', category: 'pastries', price: 3.99, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg', description: 'Chocolate-topped choux pastry with cream', details: 'Light choux pastry filled with cream and topped with chocolate.' },
    8: { name: 'Chocolate Chip', category: 'cookies', price: 2.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg', description: 'Classic cookies with premium chocolate chips', details: 'Soft cookies loaded with premium chocolate chips.' },
    9: { name: 'Macaron', category: 'cookies', price: 2.99, image: '/manus-storage/caramel-cake_f84bcba5.jpg', description: 'Delicate French almond cookies', details: 'Delicate French almond meringue cookies with various flavors.' },
    10: { name: 'Sugar Cookie', category: 'cookies', price: 2.25, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg', description: 'Soft, buttery sugar cookies', details: 'Soft and buttery sugar cookies, perfect for any occasion.' },
    11: { name: 'Classic Cheesecake', category: 'cheesecakes', price: 5.99, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg', description: 'Creamy New York style cheesecake', details: 'Rich and creamy New York style cheesecake with graham cracker crust.' },
    12: { name: 'Berry Cheesecake', category: 'cheesecakes', price: 6.49, image: '/manus-storage/caramel-cake_f84bcba5.jpg', description: 'Cheesecake with fresh berry topping', details: 'Creamy cheesecake topped with fresh berries.' },
    13: { name: 'Espresso', category: 'coffee', price: 2.75, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg', description: 'Rich, bold espresso shot', details: 'Rich and bold espresso made from premium beans.' },
    14: { name: 'Cappuccino', category: 'coffee', price: 3.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg', description: 'Smooth espresso with steamed milk', details: 'Smooth espresso with perfectly steamed milk and foam.' },
    15: { name: 'Latte', category: 'coffee', price: 3.75, image: '/manus-storage/caramel-cake_f84bcba5.jpg', description: 'Creamy espresso and milk blend', details: 'Creamy blend of espresso and steamed milk.' },
  };

  const item = itemId ? menuItems[itemId] : null;

  if (!item) {
    return (
      <div className="w-full bg-[#FDF7F3] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-[#8B6F47] mb-4">Item Not Found</h1>
          <Button onClick={() => navigate('/menu')} className="bg-[#A8C9B8] text-white hover:bg-[#96B8A6]">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDF7F3]">
      {/* Header */}
      <section className="py-12 bg-[#FDF7F3]">
        <div className="container">
          <button
            onClick={() => navigate('/menu')}
            className="text-[#A0845C] hover:text-[#8B6F47] font-sans text-sm font-semibold mb-6 transition-colors"
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
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#E8D4C8] h-96 md:h-full flex items-center justify-center">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="fade-in-up space-y-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#A8C9B8]/20 border border-[#A8C9B8] text-[#8B6F47] font-sans text-xs font-semibold uppercase mb-4">
                  {item.category}
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#8B6F47] mb-4">
                  {item.name}
                </h1>
                <p className="font-sans text-lg text-[#8B6F47]/80 leading-relaxed">
                  {item.details}
                </p>
              </div>

              {/* Price & CTA */}
              <div className="bg-white p-8 rounded-lg border border-[#E8D4C8]">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-sans text-[#8B6F47] font-semibold">Price:</span>
                  <span className="font-serif text-4xl font-bold text-[#A0845C]">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[#A8C9B8] text-white hover:bg-[#96B8A6] font-sans font-semibold px-8 py-4 rounded-lg hover-lift transition-all text-lg"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => navigate('/menu')}
                    className="flex-1 border-2 border-[#A8C9B8] bg-white text-[#8B6F47] hover:bg-[#F0E8DC] font-sans font-semibold px-8 py-4 rounded-lg hover-lift transition-all"
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
