import { useEffect, useState } from "react";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";

const FALLBACK_TEAM = [
  {
    name: 'Rosa',
    role: 'Head Baker & Founder',
    bio: 'With 20 years of baking experience, Rosa brings her grandmother\'s recipes and her own creative flair to every creation.',
    image_url: '',
  },
  {
    name: 'Marco',
    role: 'Pastry Chef',
    bio: 'Marco studied pastry arts in France and brings European elegance to our dessert collection.',
    image_url: '',
  },
  {
    name: 'Emma',
    role: 'Café Manager',
    bio: 'Emma ensures every guest feels welcomed and cared for, creating the warm atmosphere Rosaville is known for.',
    image_url: '',
  },
];

export default function About() {
  const { content } = useSiteContent();
  const [team, setTeam] = useState(FALLBACK_TEAM);

  useEffect(() => {
    api.team.list().then((members) => {
      if (members.length > 0) setTeam(members);
    }).catch(() => {});
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl text-center fade-in">
          <img
            src={content?.hero_image || "/placeholder-dessert.svg"}
            alt="Rosaville Desserts Logo"
            className="h-32 w-auto mx-auto mb-8 rounded-lg shadow-md object-cover"
          />
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
            {content?.about_title || "Our Story"}
          </h1>
          <p className="font-sans text-lg text-foreground/70">
            A tale of passion, family recipes, and the joy of creating sweet moments.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl">
          <div className="fade-in-up space-y-6">
            <p className="font-sans text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
              {content?.about_text ||
                "Rosaville Desserts began as a dream in a small kitchen, where generations of family recipes came to life. What started as a passion for creating beautiful, delicious desserts has blossomed into a beloved community gathering place."}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="font-serif text-4xl font-bold text-foreground text-center mb-16 fade-in">
            Our Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                title: 'Homemade Quality',
                description: 'Every dessert is handcrafted with the same care you would put into your own kitchen.',
              },
              {
                title: 'Fresh Ingredients',
                description: 'We source the finest, freshest ingredients to ensure every bite is exceptional.',
              },
              {
                title: 'Family Atmosphere',
                description: 'Our café is a warm, welcoming space where everyone feels like family.',
              },
              {
                title: 'Attention to Detail',
                description: 'From presentation to flavor, every element is thoughtfully considered.',
              },
              {
                title: 'Customization',
                description: 'Your dessert, your way. We love creating personalized creations for your special moments.',
              },
              {
                title: 'Hospitality',
                description: 'We treat every customer like a cherished guest in our home.',
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="fade-in-up p-6 rounded-xl border border-primary hover:border-primary hover:bg-background transition-all"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="font-sans text-foreground/70">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="font-serif text-4xl font-bold text-foreground text-center mb-16 fade-in">
            Meet Our Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="fade-in-up text-center hover-lift"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {member.image_url ? (
                  <img src={member.image_url} alt={member.name} className="w-32 h-32 mx-auto mb-4 rounded-full object-cover" />
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/30 to-muted flex items-center justify-center">
                    <span className="text-4xl">👨‍🍳</span>
                  </div>
                )}
                <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="font-sans text-sm text-primary font-semibold mb-3">
                  {member.role}
                </p>
                <p className="font-sans text-foreground/70">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
