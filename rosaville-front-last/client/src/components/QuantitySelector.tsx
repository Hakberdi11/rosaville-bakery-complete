import { useState } from "react";
import { Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  productName: string;
  maxQuantity?: number;
}

/**
 * Quantity Selector Modal
 * Allows users to choose quantity (1-5+) before adding to cart
 * Reduces friction and improves conversion
 */
export default function QuantitySelector({
  isOpen,
  onClose,
  onConfirm,
  productName,
  maxQuantity = 10,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#3D2817]">
            How many?
          </h2>
          <button
            onClick={onClose}
            className="text-[#5F3F1B]/60 hover:text-[#5F3F1B] transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Product Name */}
        <p className="font-sans text-sm text-[#5F3F1B]/70 mb-6">
          {productName}
        </p>

        {/* Quantity Selector */}
        <div className="flex items-center justify-center gap-6 mb-8 bg-[#FBF7F4] p-6 rounded-xl">
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="bg-[#C9949B] hover:bg-[#C97A85] disabled:bg-[#C9949B]/50 text-white p-3 rounded-full transition-all disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus size={20} />
          </button>

          <div className="text-center">
            <p className="font-serif text-4xl font-bold text-[#3D2817]">
              {quantity}
            </p>
            <p className="font-sans text-xs text-[#5F3F1B]/60 mt-1">
              {quantity === 1 ? "item" : "items"}
            </p>
          </div>

          <button
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity}
            className="bg-[#C9949B] hover:bg-[#C97A85] disabled:bg-[#C9949B]/50 text-white p-3 rounded-full transition-all disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-[#C9949B] text-[#C9949B] hover:bg-[#FBF7F4]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-[#C9949B] hover:bg-[#C97A85] text-white"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
