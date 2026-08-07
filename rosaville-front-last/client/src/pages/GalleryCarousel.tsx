import { Heart, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import React from "react";
import { useFavourites } from "@/contexts/FavouritesContext";
import { toast } from "sonner";
import { api, type Dessert } from "@/lib/api";

/**
 * Gallery Carousel Page - Full Screen Art Gallery
 * Curated desserts (dashboard's Gallery -> "Add from Menu"), shown full-bleed.
 */

export default function GalleryCarousel() {
  const [images, setImages] = React.useState<Dessert[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const [, navigate] = useLocation();
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();

  React.useEffect(() => {
    api.desserts.listGallery().then(setImages).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const currentCake = images[currentIndex];
  const TIMER_DURATION = 5000; // 5 seconds

  // Block all scrolling and swiping except carousel
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => e.preventDefault();
    const handleTouchMove = (e: TouchEvent) => {
      // Only allow horizontal swipe for carousel
      const touch = e.touches[0];
      const moveX = Math.abs(touch.clientX - touchStart);
      const moveY = Math.abs(touch.clientY - touchStart);
      if (moveY > moveX) {
        e.preventDefault();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [touchStart]);

  // Auto-advance timer
  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (TIMER_DURATION / 100));
        if (newProgress >= 100) {
          setCurrentIndex((prev) => (prev + 1) % images.length);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgress(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    if (touchStart - touchEnd > 50) {
      handleNext();
    }
    if (touchStart - touchEnd < -50) {
      handlePrevious();
    }
  };

  const handleGoBack = () => {
    navigate("/gallery");
  };

  if (loaded && !currentCake) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white px-4">
          <p className="mb-4">Our gallery is being freshened up — check back soon!</p>
          <button onClick={handleGoBack} className="underline">← Back to Gallery</button>
        </div>
      </div>
    );
  }

  if (!currentCake) return null;

  return (
    <div
      className="w-screen h-screen bg-black overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image */}
      <img
        key={currentCake.id}
        src={currentCake.featured_image || "/placeholder-dessert.svg"}
        alt={currentCake.name}
        className="w-full h-full object-cover"
        loading="eager"
        crossOrigin="anonymous"
      />

      {/* Gradient Overlay Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent h-64 md:h-72 z-10" />

      {/* Bottom Info Box */}
      <div className="absolute bottom-0 left-0 right-0 z-20 py-8 md:py-10 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-4">
            {/* Title & Counter */}
            <div className="flex-1">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-white truncate">
                {currentCake.name}
              </h2>
              <p className="text-white/60 text-sm mt-1">
                {currentIndex + 1} of {images.length}
              </p>
            </div>

            {/* Pause Button with Circular Progress */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-100"
                />
              </svg>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="absolute inset-0 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all"
                aria-label="Pause/Play"
              >
                {isPaused ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-5 border-l-white border-t-3 border-t-transparent border-b-3 border-b-transparent" />
                  </div>
                ) : (
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 bg-white rounded-full" />
                    <div className="w-0.5 h-4 bg-white rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Short Description - Hero Font - 2-3 Lines */}
          <p className="font-serif text-sm text-white/80 leading-relaxed line-clamp-3">
            {currentCake.description}
          </p>
        </div>
      </div>

      {/* Back Button - Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={handleGoBack}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-all text-2xl"
          aria-label="Go back"
          title="Back"
        >
          ←
        </button>
      </div>

      {/* Heart/Favorite Button - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => {
            const isFav = isFavourite(currentCake.id);
            if (isFav) {
              removeFavourite(currentCake.id);
              toast.success(`${currentCake.name} removed from favourites`);
            } else {
              addFavourite({
                id: currentCake.id,
                name: currentCake.name,
                price: 0,
                image: currentCake.featured_image || "/placeholder-dessert.svg",
                category: 'gallery'
              });
              toast.success(`${currentCake.name} added to favourites`);
            }
          }}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-all text-2xl"
          aria-label="Like"
          title="Add to Favorites"
        >
          {isFavourite(currentCake.id) ? "♥" : "♡"}
        </button>
      </div>
    </div>
  );
}
