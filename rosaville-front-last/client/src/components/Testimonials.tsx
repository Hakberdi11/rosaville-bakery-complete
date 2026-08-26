import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Link } from "wouter";
import { api, PublicFeedback } from "@/lib/api";
import { useSiteContent } from "@/contexts/SiteContentContext";

export default function Testimonials() {
  const { content } = useSiteContent();
  const [testimonials, setTestimonials] = useState<PublicFeedback[]>([]);

  useEffect(() => {
    api.feedback.public().then(setTestimonials).catch(() => {});
  }, []);

  if (content?.show_testimonials === false || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-background py-20 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="font-sans text-lg text-foreground/70">
            Join hundreds of satisfied customers who've experienced our handcrafted desserts
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-lg border border-primary hover:shadow-xl transition-shadow"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="font-sans text-foreground leading-relaxed mb-6 italic">
                "{testimonial.message}"
              </p>

              {/* Customer Info */}
              <div>
                <p className="font-serif font-bold text-foreground">
                  {testimonial.customer_name}
                </p>
                {testimonial.dessert_name && (
                  <p className="font-sans text-sm text-foreground/60">
                    on {testimonial.dessert_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="font-sans text-foreground/70 mb-4">
            Ready to create your own sweet memory?
          </p>
          <Link
            href="/menu"
            className="inline-block bg-primary hover:bg-accent text-white font-sans font-semibold px-8 py-3 rounded-full transition-all"
          >
            Explore Our Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
