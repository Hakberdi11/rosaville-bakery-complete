import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";
import QuantitySelector from "@/components/QuantitySelector";

export default function SpecialDessert() {
  const [, navigate] = useLocation();
  const { addToCart, updateQuantity } = useCart();
  const [quantitySelectorOpen, setQuantitySelectorOpen] = useState(false);

  return (
    <div className="w-full bg-[#FBF7F4]">
      {/* Header */}
      <section className="py-8 md:py-12 bg-[#FBF7F4]">
        <div className="container">
          <button
            onClick={() => navigate('/')}
            className="text-[#5F3F1B] hover:text-[#3D2817] font-sans text-sm font-semibold mb-4 md:mb-6 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#3D2817]">
            Lavender Dream Cake
          </h1>
          <p className="font-sans text-base md:text-lg text-[#5F3F1B]/80 mt-2">
            July's Exclusive Limited-Time Creation
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-16">
            {/* Image */}
            <div className="fade-in-up">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#E8B4B8] h-64 md:h-96 md:h-full flex items-center justify-center">
                <img 
                  src="/manus-storage/chocolate-cake_4df9a7a5.jpg" 
                  alt="Lavender Dream Cake"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="fade-in-up space-y-4 md:space-y-8">
              {/* Description */}
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#3D2817] mb-3 md:mb-4">
                  About This Dessert
                </h2>
                <p className="font-sans text-sm md:text-base text-[#5F3F1B]/80 leading-relaxed mb-3 md:mb-4">
                  The Lavender Dream Cake is our celebration of summer's most delicate flavors. This ethereal creation combines a light, fluffy lavender-infused sponge cake with a silky white chocolate ganache, topped with edible flowers and a subtle honey drizzle.
                </p>
                <p className="font-sans text-sm md:text-base text-[#5F3F1B]/80 leading-relaxed">
                  Each slice reveals layers of sophistication: the gentle floral notes of lavender, the richness of white chocolate, and the delicate crunch of candied flowers. Perfect for garden parties, weddings, or any moment that deserves a touch of elegance.
                </p>
              </div>

              {/* Price & Availability */}
              <div className="bg-white p-4 md:p-6 rounded-lg border border-[#E8B4B8]">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="font-sans text-sm md:text-base text-[#3D2817] font-semibold">Price per Cake:</span>
                  <span className="font-serif text-2xl md:text-3xl font-bold text-[#C9949B]">$45</span>
                </div>
                <p className="font-sans text-xs md:text-sm text-[#5F3F1B]/70 mb-3 md:mb-4">
                  Available for pre-order. Limited quantities available. Serves 8-10 people.
                </p>
                <div className="space-y-2">
                  <p className="font-sans text-xs md:text-sm text-[#3D2817]">
                    <strong>Available until:</strong> July 31, 2026
                  </p>
                  <p className="font-sans text-xs md:text-sm text-[#3D2817]">
                    <strong>Minimum order:</strong> 24 hours in advance
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2 md:gap-3 pt-2 md:pt-4">
                <Button
                  onClick={() => setQuantitySelectorOpen(true)}
                  className="bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg hover-lift transition-all w-full text-base md:text-lg"
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="border-2 border-[#C9949B] bg-white text-[#3D2817] hover:bg-[#C9949B]/10 font-sans font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg hover-lift transition-all w-full text-base md:text-lg"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>

          {/* Recipe Section */}
          <div className="fade-in-up bg-white rounded-xl p-6 md:p-12 border border-[#E8B4B8] mb-8 md:mb-12">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2817] mb-6 md:mb-8">
              Recipe & Ingredients
            </h2>

            {/* Ingredients */}
            <div className="mb-8 md:mb-12">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#3D2817] mb-4 md:mb-6">
                Ingredients
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Cake */}
                <div>
                  <h4 className="font-sans font-semibold text-[#C9949B] text-sm md:text-base mb-3 md:mb-4 uppercase tracking-wide">
                    For the Lavender Sponge
                  </h4>
                  <ul className="font-sans text-sm md:text-base text-[#5F3F1B]/80 space-y-2">
                    <li>• 2 cups all-purpose flour</li>
                    <li>• 1 tablespoon dried culinary lavender</li>
                    <li>• 2 teaspoons baking powder</li>
                    <li>• ½ teaspoon salt</li>
                    <li>• 1 cup unsalted butter, softened</li>
                    <li>• 1 cup granulated sugar</li>
                    <li>• 4 large eggs</li>
                    <li>• ½ cup whole milk</li>
                    <li>• 2 tablespoons honey</li>
                    <li>• 1 teaspoon vanilla extract</li>
                  </ul>
                </div>

                {/* Ganache */}
                <div>
                  <h4 className="font-sans font-semibold text-[#C9949B] text-sm md:text-base mb-3 md:mb-4 uppercase tracking-wide">
                    For the White Chocolate Ganache
                  </h4>
                  <ul className="font-sans text-sm md:text-base text-[#5F3F1B]/80 space-y-2">
                    <li>• 8 oz white chocolate, chopped</li>
                    <li>• ¾ cup heavy cream</li>
                    <li>• 2 tablespoons butter</li>
                    <li>• 1 teaspoon vanilla extract</li>
                    <li>• Pinch of salt</li>
                  </ul>
                </div>
              </div>

              {/* Toppings */}
              <div className="mt-6 md:mt-8">
                <h4 className="font-sans font-semibold text-[#C9949B] text-sm md:text-base mb-3 md:mb-4 uppercase tracking-wide">
                  For Decoration
                </h4>
                <ul className="font-sans text-sm md:text-base text-[#5F3F1B]/80 space-y-2">
                  <li>• Edible flowers (pansies, violas, or crystallized flowers)</li>
                  <li>• Fresh lavender sprigs</li>
                  <li>• Honey for drizzling</li>
                  <li>• Powdered sugar for dusting</li>
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#3D2817] mb-4 md:mb-6">
                Instructions
              </h3>
              <ol className="font-sans text-sm md:text-base text-[#5F3F1B]/80 space-y-3 md:space-y-4 list-decimal list-inside">
                <li>
                  <strong>Prepare:</strong> Preheat oven to 350°F. Grease and flour two 8-inch round cake pans. Grind dried lavender into a fine powder.
                </li>
                <li>
                  <strong>Mix dry ingredients:</strong> Whisk together flour, lavender powder, baking powder, and salt in a bowl.
                </li>
                <li>
                  <strong>Cream butter and sugar:</strong> Beat softened butter and sugar until light and fluffy (3-4 minutes).
                </li>
                <li>
                  <strong>Add eggs:</strong> Add eggs one at a time, beating well after each addition.
                </li>
                <li>
                  <strong>Combine:</strong> Alternate adding dry ingredients and milk mixture to the butter mixture, starting and ending with dry ingredients.
                </li>
                <li>
                  <strong>Add flavor:</strong> Stir in honey and vanilla extract.
                </li>
                <li>
                  <strong>Bake:</strong> Divide batter between prepared pans. Bake for 25-30 minutes until a toothpick comes out clean.
                </li>
                <li>
                  <strong>Cool:</strong> Cool in pans for 10 minutes, then turn out onto wire racks to cool completely.
                </li>
                <li>
                  <strong>Make ganache:</strong> Heat cream until steaming. Pour over chopped white chocolate. Let sit 1 minute, then whisk until smooth. Stir in butter, vanilla, and salt.
                </li>
                <li>
                  <strong>Assemble:</strong> Place one cake layer on serving plate. Spread ganache on top. Add second layer. Cover entire cake with remaining ganache.
                </li>
                <li>
                  <strong>Decorate:</strong> Top with edible flowers, fresh lavender, and a honey drizzle. Dust with powdered sugar.
                </li>
              </ol>
            </div>
          </div>

          {/* Tips Section */}
          <div className="fade-in-up bg-[#FBF7F4] rounded-xl p-6 md:p-8 border border-[#E8B4B8]">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-[#3D2817] mb-4 md:mb-6">
              Baker's Tips
            </h3>
            <ul className="font-sans text-sm md:text-base text-[#5F3F1B]/80 space-y-3 md:space-y-4">
              <li>
                <strong>Lavender quality matters:</strong> Use culinary-grade dried lavender, not ornamental. It should smell floral and pleasant.
              </li>
              <li>
                <strong>Room temperature ingredients:</strong> This helps create a lighter, fluffier cake.
              </li>
              <li>
                <strong>Don't overmix:</strong> Mix just until combined to avoid a dense cake.
              </li>
              <li>
                <strong>Make ahead:</strong> Bake the cake layers a day ahead and wrap tightly. Assemble the day of serving for best results.
              </li>
              <li>
                <strong>Edible flowers:</strong> Ensure any flowers used are food-safe and pesticide-free.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quantity Selector Modal */}
      <QuantitySelector
        isOpen={quantitySelectorOpen}
        onClose={() => setQuantitySelectorOpen(false)}
        onConfirm={(quantity) => {
          // Add item to cart first (increments by 1 if exists)
          addToCart({
            id: 0,
            name: 'Lavender Dream Cake',
            price: 45,
            image: '/manus-storage/chocolate-cake_4df9a7a5.jpg'
          });
          
          // If user selected more than 1, set to that quantity
          if (quantity > 1) {
            updateQuantity(0, quantity);
          }
          
          toast.success(`Lavender Dream Cake (x${quantity}) added to cart!`);
          setQuantitySelectorOpen(false);
        }}
        productName="Lavender Dream Cake"
      />
    </div>
  );
}
