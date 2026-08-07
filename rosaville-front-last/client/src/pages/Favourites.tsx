import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useFavourites } from "@/contexts/FavouritesContext";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export default function Favourites() {
  const [, navigate] = useLocation();
  const { favourites, removeFavourite } = useFavourites();

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Header */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          <button
            onClick={() => navigate("/")}
            className="text-foreground hover:text-foreground font-sans text-sm font-semibold mb-4 md:mb-6 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
            My Favourites
          </h1>
          <p className="font-sans text-base md:text-lg text-foreground/80 mt-2">
            Your saved cakes and gallery picks
          </p>
        </div>
      </section>

      {/* Favourites Grid */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          {favourites.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={48} className="mx-auto text-primary/40 mb-6" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
                No Favourites Yet
              </h2>
              <p className="font-sans text-foreground/80 mb-8 max-w-md mx-auto">
                Start adding your favorite cakes to your collection. Visit our gallery or menu to find cakes you love!
              </p>
              <Button
                onClick={() => navigate("/gallery")}
                className="bg-primary hover:bg-accent text-white font-sans font-semibold px-8 py-3 rounded-lg hover-lift transition-all"
              >
                Explore Gallery
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favourites.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-primary group"
                >
                  {/* Image Container */}
                  <div className="relative h-64 md:h-80 overflow-hidden bg-background">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Remove Button Overlay */}
                    <button
                      onClick={() => {
                        removeFavourite(item.id);
                        toast.success(`${item.name} removed from favourites`);
                      }}
                      className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Remove from favourites"
                    >
                      <Heart size={20} className="fill-white" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {item.name}
                    </h3>
                    <p className="font-sans text-sm text-foreground/70 mb-4">
                      Category: <span className="capitalize font-semibold">{item.category}</span>
                    </p>
                    {item.price > 0 && (
                      <p className="font-serif text-lg font-bold text-primary mb-4">
                        ${item.price.toFixed(2)}
                      </p>
                    )}
                    <Button
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="w-full bg-primary hover:bg-accent text-white font-sans font-semibold px-4 py-2 rounded-lg hover-lift transition-all"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
