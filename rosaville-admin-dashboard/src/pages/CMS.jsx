import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { FileText, Save, Eye } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function CMS() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    hero_title: "Crafting Sweet Moments",
    hero_subtitle: "Artisan cakes & desserts, handcrafted with love for every occasion.",
    hero_image: "https://rosaviledess-3jk43i4r.manus.space/manus-storage/strawberry-cake-hero_4494ac95.jpg",
    about_title: "Our Story",
    about_text: "Rosaville Desserts began as a small home kitchen with a big dream — to bring joy through beautifully crafted cakes. Today we serve hundreds of celebrations every month.",
    contact_email: "hello@rosavilledesserts.com",
    contact_phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        hero_title: user.hero_title || f.hero_title,
        hero_subtitle: user.hero_subtitle || f.hero_subtitle,
        hero_image: user.hero_image || f.hero_image,
        about_title: user.about_title || f.about_title,
        about_text: user.about_text || f.about_text,
        contact_email: user.contact_email || f.contact_email,
        contact_phone: user.contact_phone || f.contact_phone,
      }));
    }
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      await checkUserAuth();
      toast({ title: "Content saved", description: "Your website content has been updated." });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save", description: e.message || "Something went wrong.", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1100px] mx-auto">
      <PageHeader title="Website CMS" description="Edit your homepage content — changes save to your business profile." icon={FileText} actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={save} disabled={saving}><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <h3 className="font-heading font-semibold text-[15px] mb-3">Hero Section</h3>
            <div className="grid gap-3">
              <div><Label>Headline</Label><Input value={form.hero_title} onChange={(e) => set("hero_title", e.target.value)} className="mt-1" /></div>
              <div><Label>Subtitle</Label><Textarea value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} className="mt-1" rows={2} /></div>
              <div><Label>Hero Image URL</Label><Input value={form.hero_image} onChange={(e) => set("hero_image", e.target.value)} className="mt-1" /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <h3 className="font-heading font-semibold text-[15px] mb-3">About Section</h3>
            <div className="grid gap-3">
              <div><Label>Title</Label><Input value={form.about_title} onChange={(e) => set("about_title", e.target.value)} className="mt-1" /></div>
              <div><Label>Text</Label><Textarea value={form.about_text} onChange={(e) => set("about_text", e.target.value)} className="mt-1" rows={4} /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <h3 className="font-heading font-semibold text-[15px] mb-3">Contact Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className="mt-1" /></div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 self-start">
          <div className="flex items-center gap-2 mb-2 text-[12px] font-medium text-muted-foreground"><Eye className="w-3.5 h-3.5" /> Live Preview</div>
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
            <div className="relative h-44 bg-muted">
              <img src={form.hero_image} alt="hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                <h2 className="text-white text-[20px] font-heading font-bold leading-tight">{form.hero_title}</h2>
                <p className="text-white/80 text-[12px] mt-1">{form.hero_subtitle}</p>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-heading font-semibold text-[15px] mb-1.5">{form.about_title}</h3>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">{form.about_text}</p>
              <div className="mt-4 pt-4 border-t border-border/60 text-[12px] text-muted-foreground">
                {form.contact_email && <div>{form.contact_email}</div>}
                {form.contact_phone && <div>{form.contact_phone}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}