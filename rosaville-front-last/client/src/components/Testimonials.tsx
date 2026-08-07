import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  imageUrl: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Wedding Client",
    content:
      "The lavender dream cake was absolutely stunning! Not only did it look beautiful, but it tasted even better. Our guests couldn't stop raving about it. Highly recommend!",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "James Chen",
    role: "Corporate Event Organizer",
    content:
      "We ordered custom cakes for our company's annual gala. The team was incredibly professional and delivered exactly what we envisioned. The desserts were a huge hit!",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    role: "Birthday Party Host",
    content:
      "My daughter's birthday cake was perfect! The chocolate decadence with fresh berries was her favorite. The presentation was Instagram-worthy and the taste was divine.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "Michael Thompson",
    role: "Regular Customer",
    content:
      "I've been ordering from Rosaville for over a year now. Every cake is consistently delicious and beautifully made. The customer service is exceptional!",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
];

/**
 * Customer Testimonials Section
 * Displays 4 customer reviews with ratings to build trust and social proof
 */
export default function Testimonials() {
  return (
    <section className="w-full bg-[#FBF7F4] py-20 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3D2817] mb-4">
            What Our Customers Say
          </h2>
          <p className="font-sans text-lg text-[#5F3F1B]/70">
            Join hundreds of satisfied customers who've experienced our handcrafted desserts
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[#E8B4B8] hover:shadow-xl transition-shadow"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-[#C9949B] text-[#C9949B]"
                  />
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="font-sans text-[#5F3F1B] leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.imageUrl}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C9949B]"
                />
                <div>
                  <p className="font-serif font-bold text-[#3D2817]">
                    {testimonial.name}
                  </p>
                  <p className="font-sans text-sm text-[#5F3F1B]/60">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="font-sans text-[#5F3F1B]/70 mb-4">
            Ready to create your own sweet memory?
          </p>
          <a
            href="/menu"
            className="inline-block bg-[#C9949B] hover:bg-[#C97A85] text-white font-sans font-semibold px-8 py-3 rounded-full transition-all"
          >
            Explore Our Menu
          </a>
        </div>
      </div>
    </section>
  );
}
