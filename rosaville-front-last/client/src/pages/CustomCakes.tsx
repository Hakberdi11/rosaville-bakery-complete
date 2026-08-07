import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function CustomCakes() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occasion: '',
    cakeSize: '',
    flavor: '',
    customRequests: '',
    preferredDate: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.occasion || !formData.cakeSize || !formData.flavor || !formData.preferredDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      let inspirationImageUrl: string | undefined;
      if (imageFile) {
        try {
          const { file_url } = await api.uploadFile(imageFile);
          inspirationImageUrl = file_url;
        } catch {
          toast.error('Could not upload your inspiration image, submitting without it.');
        }
      }
      await api.customCakes.submit({ ...formData, inspirationImageUrl });
      toast.success('Your custom cake order has been submitted! We\'ll be in touch soon.');
      setFormData({
        name: '', email: '', phone: '', occasion: '', cakeSize: '', flavor: '',
        customRequests: '', preferredDate: '',
      });
      setImageFile(null);
      setImagePreview('');
    } catch {
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <section className="py-16 bg-background">
        <div className="container text-center fade-in">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-4">
            Custom Cakes
          </h1>
          <p className="font-sans text-lg text-foreground/70 max-w-2xl mx-auto">
            Create your perfect dessert. Tell us your vision, and we'll bring it to life.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-2xl fade-in-up">
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
                  className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            {/* Phone and Occasion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Occasion *
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select an occasion</option>
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="celebration">Celebration</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Cake Size and Flavor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Cake Size *
                </label>
                <select
                  name="cakeSize"
                  value={formData.cakeSize}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select size</option>
                  <option value="6-inch">6 inch (4-6 servings)</option>
                  <option value="8-inch">8 inch (8-12 servings)</option>
                  <option value="10-inch">10 inch (15-20 servings)</option>
                  <option value="12-inch">12 inch (25-30 servings)</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                  Flavor *
                </label>
                <select
                  name="flavor"
                  value={formData.flavor}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select flavor</option>
                  <option value="chocolate">Chocolate</option>
                  <option value="vanilla">Vanilla</option>
                  <option value="strawberry">Strawberry</option>
                  <option value="lemon">Lemon</option>
                  <option value="carrot">Carrot</option>
                  <option value="custom">Custom Flavor</option>
                </select>
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                Preferred Delivery Date *
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Custom Requests */}
            <div>
              <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                Custom Requests & Design Ideas
              </label>
              <textarea
                name="customRequests"
                value={formData.customRequests}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-primary bg-background font-sans focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell us about your vision, colors, decorations, dietary requirements, etc."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-sans text-sm font-semibold text-foreground mb-2">
                Inspiration Image (Optional)
              </label>
              <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="inspiration-image"
                />
                <label htmlFor="inspiration-image" className="cursor-pointer block">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      <p className="font-sans text-sm text-foreground/60">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-sans font-semibold text-foreground">Drop image here or click to upload</p>
                      <p className="font-sans text-sm text-foreground/60">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-sans font-semibold py-3 rounded-lg hover-lift"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Custom Cake Request'}
            </Button>
          </form>

          <p className="font-sans text-sm text-foreground/60 text-center mt-6">
            We typically respond within 24 hours. For urgent requests, please call us directly.
          </p>
        </div>
      </section>
    </div>
  );
}
