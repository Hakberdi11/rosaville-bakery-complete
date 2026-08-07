import { useState } from 'react';
import { Menu, X, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useFavourites } from '@/contexts/FavouritesContext';
import RoseIcon from './RoseIcon';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();
  const { favourites } = useFavourites();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/menu', label: 'Menu' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/custom-cakes', label: 'Custom Cakes' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#FDF7F3]/95 backdrop-blur-sm border-b border-[#E8D4C8] shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <RoseIcon className="w-8 h-8" />
          <span className="font-serif text-xl font-bold text-[#8B6F47]" style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>Rosaville</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="font-sans text-sm font-medium text-[#8B6F47] hover:text-[#A0845C] transition-colors">
              {link.label}
            </Link>
          ))}
          <Link href="/favourites" className="relative p-2 hover:bg-[#F0E8DC] rounded-lg transition-colors">
            <Heart size={20} className="text-[#8B6F47]" />
            {favourites.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#C9949B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {favourites.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-2 hover:bg-[#F0E8DC] rounded-lg transition-colors">
            <ShoppingBag size={20} className="text-[#8B6F47]" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#A0845C] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {items.length}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[#E8D4C8] bg-[#FDF7F3] animate-in fade-in slide-in-from-top-2 duration-200"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block py-2 px-3 font-sans text-sm font-medium text-[#8B6F47] hover:text-[#A0845C] hover:bg-[#F0E8DC] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/favourites"
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-3 font-sans text-sm font-medium text-[#8B6F47] hover:text-[#A0845C] hover:bg-[#F0E8DC] rounded-lg transition-colors"
            >
              <Heart size={18} />
              Favourites {favourites.length > 0 && `(${favourites.length})`}
            </Link>
            <Link
              href="/cart"
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-3 font-sans text-sm font-medium text-[#8B6F47] hover:text-[#A0845C] hover:bg-[#F0E8DC] rounded-lg transition-colors"
            >
              <ShoppingBag size={18} />
              Cart {items.length > 0 && `(${items.length})`}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
