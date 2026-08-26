import { useState } from 'react';
import { Menu, X, ShoppingBag, Heart, User } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useFavourites } from '@/contexts/FavouritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import RoseIcon from './RoseIcon';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();
  const { favourites } = useFavourites();
  const { isAuthenticated } = useAuth();
  const { content } = useSiteContent();

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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <RoseIcon className="w-8 h-8" />
          <span className="font-serif text-xl font-bold text-foreground italic">{content?.site_name || 'Rosaville Desserts'}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="font-sans text-sm font-medium text-foreground hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
          <Link href="/favourites" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Heart size={20} className="text-foreground" />
            {favourites.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {favourites.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <ShoppingBag size={20} className="text-foreground" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {items.length}
              </span>
            )}
          </Link>
          <Link href={isAuthenticated ? '/account' : '/login'} className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Account">
            <User size={20} className="text-foreground" />
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
          className="md:hidden border-t border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block py-2 px-3 font-sans text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/favourites"
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-3 font-sans text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
            >
              <Heart size={18} />
              Favourites {favourites.length > 0 && `(${favourites.length})`}
            </Link>
            <Link
              href="/cart"
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-3 font-sans text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
            >
              <ShoppingBag size={18} />
              Cart {items.length > 0 && `(${items.length})`}
            </Link>
            <Link
              href={isAuthenticated ? '/account' : '/login'}
              onClick={closeMenu}
              className="flex items-center gap-2 py-2 px-3 font-sans text-sm font-medium text-foreground hover:text-accent hover:bg-muted rounded-lg transition-colors"
            >
              <User size={18} />
              {isAuthenticated ? 'My Account' : 'Log In'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
