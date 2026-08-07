import { Link } from 'wouter';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground/5 border-t border-border mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#5F3F1B] mb-4">
              Rosaville Desserts
            </h3>
            <p className="font-sans text-sm text-[#795138]">
              Handcrafted desserts made with love and the finest ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-[#5F3F1B] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/menu', label: 'Menu' },
                { href: '/custom-cakes', label: 'Custom Cakes' },
                { href: '/gallery', label: 'Gallery' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-sans text-sm text-[#795138] hover:text-[#C8D9D3] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-serif font-semibold text-[#5F3F1B] mb-4">Hours</h4>
            <ul className="font-sans text-sm text-[#795138] space-y-1">
              <li>Mon - Fri: 9am - 7pm</li>
              <li>Sat: 10am - 8pm</li>
              <li>Sun: 11am - 6pm</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="mailto:hello@rosaville.com"
                className="text-foreground/60 hover:text-accent transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              <a
                href="tel:+1234567890"
                className="text-foreground/60 hover:text-accent transition-colors"
                aria-label="Phone"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center">
          <p className="font-sans text-sm text-foreground/50">
            © {currentYear} Rosaville Desserts. All rights reserved. Made with love.
          </p>
        </div>
      </div>
    </footer>
  );
}
