import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  ingredients: string[];
  dietary: string[];
  recipe: {
    prep_time: string;
    bake_time: string;
    servings: number;
    instructions: string[];
  };
}

const products: Record<number, Product> = {
  0: {
    id: 0,
    name: 'Lavender Dream Cake',
    category: 'special',
    price: 7.99,
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663783924398/FwwETuOGxkQRJXFN.jpg',
    description: 'A delicate blend of lavender-infused sponge with white chocolate ganache and fresh edible flowers.',
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Lavender Extract', 'White Chocolate', 'Edible Flowers', 'Vanilla Extract'],
    dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
    recipe: {
      prep_time: '20 minutes',
      bake_time: '35 minutes',
      servings: 8,
      instructions: [
        'Preheat oven to 350°F (175°C)',
        'Cream butter and sugar until light and fluffy',
        'Beat in eggs one at a time',
        'Fold in flour and lavender extract',
        'Pour into greased pan',
        'Bake for 35 minutes until golden',
        'Cool completely before frosting',
        'Top with white chocolate ganache and edible flowers'
      ]
    }
  },
  1: {
    id: 1,
    name: 'Chocolate Decadence',
    category: 'cakes',
    price: 4.50,
    image: '/manus-storage/chocolate-cake_4df9a7a5.jpg',
    description: 'Rich dark chocolate cake with silky ganache',
    ingredients: ['Dark Chocolate', 'Flour', 'Sugar', 'Eggs', 'Butter', 'Cocoa Powder', 'Vanilla Extract'],
    dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
    recipe: {
      prep_time: '15 minutes',
      bake_time: '30 minutes',
      servings: 10,
      instructions: [
        'Melt chocolate and butter together',
        'Mix in sugar and eggs',
        'Fold in flour and cocoa powder',
        'Bake at 350°F for 30 minutes',
        'Cool and top with ganache'
      ]
    }
  },
  2: {
    id: 2,
    name: 'Vanilla Dream',
    category: 'cakes',
    price: 3.99,
    image: '/manus-storage/caramel-cake_f84bcba5.jpg',
    description: 'Classic vanilla cake with buttercream frosting',
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla Extract', 'Baking Powder', 'Salt', 'Milk'],
    dietary: ['Contains Eggs', 'Contains Dairy', 'Contains Gluten'],
    recipe: {
      prep_time: '15 minutes',
      bake_time: '25 minutes',
      servings: 8,
      instructions: [
        'Cream butter and sugar',
        'Beat in eggs and vanilla',
        'Alternate flour and milk',
        'Bake at 350°F for 25 minutes',
        'Frost with buttercream'
      ]
    }
  }
};

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const [isActive, params] = useRoute("/product/:id");
  const { addToCart } = useCart();
  
  const productId = params?.id ? parseInt(params.id) : null;
  const product = productId !== null ? products[productId] : null;

  if (!product) {
    return (
      <div className="w-full bg-[#FDF7F3] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-[#8B6F47] mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/menu')} className="bg-[#A8C9B8] text-white hover:bg-[#96B8A6]">
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
      price: product.price,
      image: product.image
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="w-full bg-[#FDF7F3]">
      <section className="py-12">
        <div className="container">
          <button
            onClick={() => navigate(product.category === 'special' ? '/special-dessert' : '/menu')}
            className="text-[#A0845C] hover:text-[#8B6F47] font-sans text-sm font-semibold mb-8 transition-colors"
          >
            ← Back
          </button>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md h-auto rounded-lg shadow-lg object-cover"
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="font-serif text-4xl font-bold text-[#8B6F47] mb-4">{product.name}</h1>
              <p className="font-sans text-lg text-[#8B6F47]/80 mb-6">{product.description}</p>
              
              <div className="bg-white border border-[#E8D4C8] rounded-lg p-6 mb-6">
                <p className="font-serif text-3xl font-bold text-[#A0845C] mb-4">${product.price.toFixed(2)}</p>
                
                {/* Dietary Info */}
                <div className="mb-6">
                  <p className="font-sans font-semibold text-[#8B6F47] mb-3">Dietary Information:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.dietary.map((diet, idx) => (
                      <span key={idx} className="bg-[#E8F3ED] text-[#8B6F47] px-3 py-1 rounded-full text-sm font-sans">
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#A8C9B8] text-white hover:bg-[#96B8A6] font-sans font-semibold py-4 mb-4"
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={() => navigate('/cart')}
                  className="w-full border-2 border-[#A8C9B8] bg-white text-[#8B6F47] hover:bg-[#F0E8DC] font-sans font-semibold py-4"
                >
                  View Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white border border-[#E8D4C8] rounded-lg p-8 mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#8B6F47] mb-6">Ingredients</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {product.ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="w-2 h-2 bg-[#A8C9B8] rounded-full mr-3"></span>
                  <p className="font-sans text-[#8B6F47]">{ingredient}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recipe */}
          <div className="bg-white border border-[#E8D4C8] rounded-lg p-8">
            <h2 className="font-serif text-2xl font-bold text-[#8B6F47] mb-6">Recipe</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="font-sans text-sm text-[#8B6F47]/70 mb-2">Prep Time</p>
                <p className="font-serif text-xl font-bold text-[#A0845C]">{product.recipe.prep_time}</p>
              </div>
              <div className="text-center">
                <p className="font-sans text-sm text-[#8B6F47]/70 mb-2">Bake Time</p>
                <p className="font-serif text-xl font-bold text-[#A0845C]">{product.recipe.bake_time}</p>
              </div>
              <div className="text-center">
                <p className="font-sans text-sm text-[#8B6F47]/70 mb-2">Servings</p>
                <p className="font-serif text-xl font-bold text-[#A0845C]">{product.recipe.servings}</p>
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#8B6F47] mb-4">Instructions</h3>
            <ol className="space-y-3">
              {product.recipe.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="font-serif font-bold text-[#A8C9B8] min-w-6">{idx + 1}.</span>
                  <p className="font-sans text-[#8B6F47]">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
