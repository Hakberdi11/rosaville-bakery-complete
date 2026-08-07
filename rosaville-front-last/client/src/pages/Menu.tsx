import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import QuantitySelector from '@/components/QuantitySelector';
import CategoryDropdown from '@/components/CategoryDropdown';

export default function Menu() {
  const [, navigate] = useLocation();
  const { addToCart, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantitySelectorOpen, setQuantitySelectorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const categories = ['all', 'cakes', 'pastries', 'cookies', 'cheesecakes', 'coffee'];

  const menuItems = [
    // Cakes
    { id: 1, name: 'Chocolate Decadence', category: 'cakes', description: 'Rich dark chocolate cake with silky ganache', price: 4.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg' },
    { id: 2, name: 'Vanilla Dream', category: 'cakes', description: 'Classic vanilla cake with buttercream frosting', price: 3.99, image: '/manus-storage/caramel-cake_f84bcba5.jpg' },
    { id: 3, name: 'Strawberry Bliss', category: 'cakes', description: 'Fresh strawberry cake with whipped cream', price: 4.99, image: '/manus-storage/strawberry-cake-hero.jpg' },
    { id: 4, name: 'Lemon Sunshine', category: 'cakes', description: 'Bright lemon cake with tangy glaze', price: 4.25, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg' },
    // Pastries
    { id: 5, name: 'Croissant', category: 'pastries', description: 'Buttery, flaky French croissant', price: 3.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg' },
    { id: 6, name: 'Danish Pastry', category: 'pastries', description: 'Sweet danish with fruit filling', price: 3.75, image: '/manus-storage/caramel-cake_f84bcba5.jpg' },
    { id: 7, name: 'Éclair', category: 'pastries', description: 'Chocolate-topped choux pastry with cream', price: 3.99, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg' },
    // Cookies
    { id: 8, name: 'Chocolate Chip', category: 'cookies', description: 'Classic cookies with premium chocolate chips', price: 2.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg' },
    { id: 9, name: 'Macaron', category: 'cookies', description: 'Delicate French almond cookies', price: 2.99, image: '/manus-storage/caramel-cake_f84bcba5.jpg' },
    { id: 10, name: 'Sugar Cookie', category: 'cookies', description: 'Soft, buttery sugar cookies', price: 2.25, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg' },
    // Cheesecakes
    { id: 11, name: 'Classic Cheesecake', category: 'cheesecakes', description: 'Creamy New York style cheesecake', price: 5.99, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg' },
    { id: 12, name: 'Berry Cheesecake', category: 'cheesecakes', description: 'Cheesecake with fresh berry topping', price: 6.49, image: '/manus-storage/caramel-cake_f84bcba5.jpg' },
    // Coffee
    { id: 13, name: 'Espresso', category: 'coffee', description: 'Rich, bold espresso shot', price: 2.75, image: '/manus-storage/golden-chocolate-cake_7df42831.jpg' },
    { id: 14, name: 'Cappuccino', category: 'coffee', description: 'Smooth espresso with steamed milk', price: 3.50, image: '/manus-storage/chocolate-cake_4df9a7a5.jpg' },
    { id: 15, name: 'Latte', category: 'coffee', description: 'Creamy espresso and milk blend', price: 3.75, image: '/manus-storage/caramel-cake_f84bcba5.jpg' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-16 bg-[#FBF7F4]">
        <div className="container text-center fade-in">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D2817] mb-4">
            Our Menu
          </h1>
          <p className="font-sans text-sm sm:text-base md:text-lg text-[#5F3F1B]/80 max-w-2xl mx-auto px-4">
            Discover our carefully curated selection of handcrafted desserts and premium coffee.
          </p>
        </div>
      </section>

      {/* Category Filter - Using CategoryDropdown */}
      <section className="py-12 bg-white border-b border-[#E8D4D8]">
        <div className="container flex justify-center px-2">
          <CategoryDropdown
            categories={categories.map(cat => cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1))}
            selectedCategory={selectedCategory === 'all' ? 'All Items' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            onCategoryChange={(category) => {
              const categoryKey = category === 'All Items' ? 'all' : category.toLowerCase();
              setSelectedCategory(categoryKey);
            }}
          />
        </div>
      </section>

      {/* Menu Items Grid */}
      <section className="py-20 bg-[#FBF7F4]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-2 md:px-0">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="fade-in-up rounded-xl border border-[#E8D4D8] bg-white hover:border-[#C9949B] hover:shadow-lg transition-all hover-lift overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-48 bg-[#FBF7F4] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#3D2817] flex-1">
                      {item.name}
                    </h3>
                    <span className="font-serif text-base sm:text-lg font-bold text-[#5F3F1B] ml-2 whitespace-nowrap text-sm">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-[#5F3F1B]/70 mb-4">
                    {item.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="flex-1 bg-white border-2 border-[#C9949B] text-[#C9949B] hover:bg-[#F0D4D8] font-sans font-semibold transition-all text-sm py-2"
                    >
                      Learn More
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedItem(item);
                        setQuantitySelectorOpen(true);
                      }}
                      className="flex-1 bg-[#C9949B] text-white hover:bg-[#C97A85] font-sans font-semibold transition-all text-sm py-2"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Orders Banner - Below Menu Items */}
      <section className="py-12 bg-[#C9949B]/10 border-t border-[#E8D4D8]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-0">
            <div className="flex-1">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2817] mb-2">
                ✨ Don't Know What You're Looking For?
              </h3>
              <p className="font-sans text-[#5F3F1B]/80">
                Design your own custom cake for any occasion! We'll bring your vision to life with our handcrafted expertise.
              </p>
            </div>
            <Button
              asChild
              className="bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all whitespace-nowrap border-2 border-[#C9949B]"
            >
              <a href="/custom-cakes">Order Custom Cake</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Quantity Selector Modal */}
      {selectedItem && (
        <QuantitySelector
          isOpen={quantitySelectorOpen}
          onClose={() => {
            setQuantitySelectorOpen(false);
            setSelectedItem(null);
          }}
          onConfirm={(quantity) => {
            // Add item to cart first (increments by 1 if exists)
            addToCart({
              id: selectedItem.id,
              name: selectedItem.name,
              price: selectedItem.price,
              image: selectedItem.image
            });
            
            // If user selected more than 1, add the remaining quantity
            if (quantity > 1) {
              updateQuantity(selectedItem.id, quantity);
            }
            
            toast.success(`${selectedItem.name} (x${quantity}) added to cart!`);
            setQuantitySelectorOpen(false);
            setSelectedItem(null);
          }}
          productName={selectedItem.name}
        />
      )}
    </div>
  );
}
