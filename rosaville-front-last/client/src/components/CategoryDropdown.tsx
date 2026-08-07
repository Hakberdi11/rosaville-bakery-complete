import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CategoryDropdownProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

/**
 * Category Dropdown Filter
 * Beautiful dropdown menu for filtering menu items by category
 * Matches website design with rose/warm color palette
 */
export default function CategoryDropdown({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCategory = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full md:w-64">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-[#C9949B] hover:border-[#C97A85] text-[#3D2817] font-sans font-semibold px-6 py-3 rounded-full transition-all flex items-center justify-between"
      >
        <span className="truncate">{selectedCategory}</span>
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border-2 border-[#C9949B] rounded-2xl shadow-xl z-50 overflow-hidden">
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => handleSelectCategory(category)}
              className={`w-full text-left px-6 py-3 font-sans text-[#3D2817] hover:bg-[#FBF7F4] transition-colors ${
                selectedCategory === category ? "bg-[#E8B4B8] font-semibold" : ""
              } ${index !== categories.length - 1 ? "border-b border-[#E8B4B8]" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
