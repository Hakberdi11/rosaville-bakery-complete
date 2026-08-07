import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMessage = trpc.contact.submitMessage.useMutation({
    onSuccess: () => {
      toast.success('Your message has been sent! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setIsSubmitting(false);
    },
    onError: () => {
      toast.error('Failed to send message. Please try again.');
      setIsSubmitting(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitMessage.mutateAsync(formData);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-16 bg-background">
        <div className="container text-center fade-in">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="font-sans text-lg text-foreground/70 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-foreground/5">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            {[
              {
                icon: MapPin,
                title: 'Location',
                content: '123 Sweet Street\nDessert City, DC 12345',
              },
              {
                icon: Phone,
                title: 'Phone',
                content: '(555) 123-4567\nCall us anytime',
              },
              {
                icon: Mail,
                title: 'Email',
                content: 'hello@rosaville.com\nWe respond within 24 hours',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="fade-in-up p-6 rounded-xl bg-background border border-border hover:border-accent transition-all hover-lift"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Icon className="w-8 h-8 text-accent mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="font-sans text-foreground/70 whitespace-pre-line">
                    {item.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hours */}
          <div className="fade-in-up bg-background border border-border rounded-xl p-8 mb-16 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-accent" />
              <h3 className="font-serif text-2xl font-semibold text-foreground">
                Business Hours
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { day: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
                { day: 'Saturday', hours: '10:00 AM - 8:00 PM' },
                { day: 'Sunday', hours: '11:00 AM - 6:00 PM' },
                { day: 'Holidays', hours: 'Call for hours' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-sans font-semibold text-foreground">
                    {item.day}
                  </span>
                  <span className="font-sans text-foreground/70">
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-background">
        <div className="container max-w-2xl fade-in-up">
          <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-12">
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-foreground/5 font-sans focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-foreground/5 font-sans focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            {/* Phone and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-foreground/5 font-sans focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-foreground/5 font-sans focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="How can we help?"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-border bg-foreground/5 font-sans focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-sans font-semibold py-3 rounded-lg hover-lift"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
