import { ShoppingBag } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';

export default function FloatingCartButton() {
  const [, navigate] = useLocation();
  const { items } = useCart();
  const [animate, setAnimate] = useState(false);
  const [prevItemCount, setPrevItemCount] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  // Trigger animation when items are added
  useEffect(() => {
    if (items.length > prevItemCount) {
      setAnimate(true);
      setToastVisible(true);
      const animateTimer = setTimeout(() => setAnimate(false), 600);
      const toastTimer = setTimeout(() => setToastVisible(false), 3500);
      return () => {
        clearTimeout(animateTimer);
        clearTimeout(toastTimer);
      };
    }
    setPrevItemCount(items.length);
  }, [items.length, prevItemCount]);

  return (
    <button
      onClick={() => navigate('/cart')}
      className={`
        fixed right-6 md:hidden
        bg-cta hover:bg-cta-hover text-white
        rounded-full p-4 shadow-lg hover:shadow-xl
        transition-all duration-300 z-40
        flex items-center justify-center
        ${animate ? 'animate-bounce' : ''}
        ${toastVisible ? 'bottom-24' : 'bottom-6'}
      `}
      aria-label="Shopping cart"
    >
      <div className="relative">
        <ShoppingBag size={24} />
        {items.length > 0 && (
          <span
            className={`
              absolute -top-2 -right-2 bg-red-500 text-white
              text-xs font-bold rounded-full w-6 h-6
              flex items-center justify-center
              ${animate ? 'scale-125' : 'scale-100'}
              transition-transform duration-300
            `}
          >
            {items.length}
          </span>
        )}
      </div>
    </button>
  );
}
