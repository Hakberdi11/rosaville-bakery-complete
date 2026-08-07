import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import QuantitySelector from '@/components/QuantitySelector';
import CategoryDropdown from '@/components/CategoryDropdown';
import { api, type Dessert } from '@/lib/api';

function toMenuItem(d: Dessert) {
  return {
    id: d.id,
    name: d.name,
    category: d.category,
    description: d.description,
    price: Number(d.price),
    image: d.featured_image || '/placeholder-dessert.svg',
    allergens: d.allergens || [],
    preparationTime: d.preparation_time || '',
    availability: d.availability,
  };
}

export default function Menu() {
  const [, navigate] = useLocation();
  const { addToCart, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantitySelectorOpen, setQuantitySelectorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<ReturnType<typeof toMenuItem>[]>([]);
  const [categories, setCategories] = useState(['all']);

  useEffect(() => {
    api.desserts.list().then(desserts => {
      setMenuItems(desserts.map(toMenuItem));
      setCategories(['all', ...Array.from(new Set(desserts.map(d => d.category)))]);
    }).catch(() => toast.error('Failed to load menu'));
  }, []);

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-16 bg-background">
        <div className="container text-center fade-in">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Our Menu
          </h1>
          <p className="font-sans text-sm sm:text-base md:text-lg text-foreground/80 max-w-2xl mx-auto px-4">
            Discover our carefully curated selection of handcrafted desserts and premium coffee.
          </p>
        </div>
      </section>

      {/* Category Filter - Using CategoryDropdown */}
      <section className="py-12 bg-white border-b border-border">
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
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-2 md:px-0">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="fade-in-up rounded-xl border border-border bg-white hover:border-primary hover:shadow-lg transition-all hover-lift overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-48 bg-background overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {!item.availability && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-foreground/80 text-white text-[11px] font-semibold">
                      Unavailable
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground flex-1">
                      {item.name}
                    </h3>
                    <span className="font-serif text-base sm:text-lg font-bold text-foreground ml-2 whitespace-nowrap text-sm">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-foreground/70 mb-3">
                    {item.description}
                  </p>
                  {(item.preparationTime || item.allergens.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.preparationTime && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-foreground/70 text-[11px] font-sans">
                          ⏱ {item.preparationTime}
                        </span>
                      )}
                      {item.allergens.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-cta/10 text-foreground/70 text-[11px] font-sans">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="flex-1 bg-white border-2 border-primary text-primary hover:bg-muted font-sans font-semibold transition-all text-sm py-2"
                    >
                      Learn More
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedItem(item);
                        setQuantitySelectorOpen(true);
                      }}
                      disabled={!item.availability}
                      className="flex-1 bg-primary text-white hover:bg-accent font-sans font-semibold transition-all text-sm py-2 disabled:opacity-50"
                    >
                      {item.availability ? "Add to Cart" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Orders Banner - Below Menu Items */}
      <section className="py-12 bg-primary/10 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-0">
            <div className="flex-1">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                ✨ Don't Know What You're Looking For?
              </h3>
              <p className="font-sans text-foreground/80">
                Design your own custom cake for any occasion! We'll bring your vision to life with our handcrafted expertise.
              </p>
            </div>
            <Button
              asChild
              className="bg-primary hover:bg-accent text-white font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all whitespace-nowrap border-2 border-primary"
            >
              <Link href="/custom-cakes">Order Custom Cake</Link>
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
