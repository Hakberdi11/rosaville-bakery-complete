import { Link } from 'wouter';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';

const DEFAULT_HOURS = [
  { day: 'Mon - Fri', hours: '9am - 7pm' },
  { day: 'Sat', hours: '10am - 8pm' },
  { day: 'Sun', hours: '11am - 6pm' },
];

export default function Footer() {
  const { content } = useSiteContent();
  const currentYear = new Date().getFullYear();
  const hours = content?.business_hours && content.business_hours.length > 0 ? content.business_hours : DEFAULT_HOURS;
  const email = content?.contact_email || 'hello@rosaville.com';
  const phone = content?.contact_phone || '';

  return (
    <footer className="bg-foreground/5 border-t border-border mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Rosaville Desserts
            </h3>
            <p className="font-sans text-sm text-foreground">
              {content?.hero_subtitle || "Handcrafted desserts made with love and the finest ingredients."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/menu', label: 'Menu' },
                { href: '/custom-cakes', label: 'Custom Cakes' },
                { href: '/gallery', label: 'Gallery' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-sans text-sm text-foreground hover:text-cta transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Hours</h4>
            <ul className="font-sans text-sm text-foreground space-y-1">
              {hours.map((h, idx) => (
                <li key={idx}>{h.day}: {h.hours}</li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              {content?.instagram_url && (
                <a
                  href={content.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-accent transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}
              {content?.facebook_url && (
                <a
                  href={content.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-accent transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              )}
              <a
                href={`mailto:${email}`}
                className="text-foreground/60 hover:text-accent transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  className="text-foreground/60 hover:text-accent transition-colors"
                  aria-label="Phone"
                >
                  <Phone size={20} />
                </a>
              )}
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
