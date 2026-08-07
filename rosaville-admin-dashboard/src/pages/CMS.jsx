import React, { useState, useEffect } from "react";
import { siteContent, uploadFile } from '@/lib/api';
import { FileText, Save, Eye, Upload, Plus, X, Palette, Instagram, Facebook } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_FORM = {
  hero_title: "", hero_subtitle: "", hero_image: "",
  about_title: "", about_text: "",
  contact_email: "", contact_phone: "", contact_address: "",
  business_hours: [],
  instagram_url: "", facebook_url: "",
  primary_color: "#C9949B", accent_color: "#C97A85",
};

function Section({ title, help, children }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h3 className="font-heading font-semibold text-[15px] mb-1">{title}</h3>
      {help && <p className="text-[12px] text-muted-foreground mb-3">{help}</p>}
      <div className="grid gap-3 mt-3">{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 rounded-md border border-input cursor-pointer bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      </div>
    </div>
  );
}

export default function CMS() {
  const { toast } = useToast();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await siteContent.get();
      setForm({ ...DEFAULT_FORM, ...data });
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setHour = (idx, patch) => {
    const hours = [...form.business_hours];
    hours[idx] = { ...hours[idx], ...patch };
    set("business_hours", hours);
  };
  const addHourRow = () => set("business_hours", [...form.business_hours, { day: "", hours: "" }]);
  const removeHourRow = (idx) => set("business_hours", form.business_hours.filter((_, i) => i !== idx));

  const onUploadHero = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      set("hero_image", file_url);
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await siteContent.update(form);
      toast({ title: "Website updated", description: "Changes are now live on the public site." });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save", description: e.message || "Something went wrong.", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-5 lg:p-8 max-w-[1200px] mx-auto">
      <PageHeader
        title="Website Content"
        description="Everything here shows up live on your public website — no code, no rebuild needed."
        icon={FileText}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={save} disabled={saving}><Save className="w-4 h-4" /> {saving ? "Saving…" : "Publish Changes"}</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Section title="Homepage Banner" help="The big headline visitors see first when they open your website.">
            <div><Label>Headline</Label><Input value={form.hero_title} onChange={(e) => set("hero_title", e.target.value)} className="mt-1" /></div>
            <div><Label>Subheadline</Label><Textarea value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} className="mt-1" rows={2} /></div>
            <div>
              <Label>Banner Photo</Label>
              <div className="mt-1 flex gap-3">
                <div className="w-20 h-20 rounded-xl border border-border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {form.hero_image ? <img src={form.hero_image} alt="hero" className="w-full h-full object-cover" /> : <FileText className="w-6 h-6 text-muted-foreground/40" />}
                </div>
                <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted text-[12.5px] font-medium self-center">
                  {uploading ? "Uploading…" : <><Upload className="w-3.5 h-3.5" /> Upload photo</>}
                  <input type="file" accept="image/*" className="hidden" onChange={onUploadHero} disabled={uploading} />
                </label>
              </div>
            </div>
          </Section>

          <Section title="Our Story" help="Shown on your About page — tell customers who you are.">
            <div><Label>Title</Label><Input value={form.about_title} onChange={(e) => set("about_title", e.target.value)} className="mt-1" /></div>
            <div><Label>Story</Label><Textarea value={form.about_text} onChange={(e) => set("about_text", e.target.value)} className="mt-1" rows={4} /></div>
          </Section>

          <Section title="Contact Details" help="Your address, phone, and email — shown on the Contact page.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Address</Label><Input value={form.contact_address} onChange={(e) => set("contact_address", e.target.value)} className="mt-1" /></div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Business Hours</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={addHourRow}><Plus className="w-3.5 h-3.5" /> Add Row</Button>
              </div>
              <div className="space-y-2">
                {form.business_hours.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input value={row.day} onChange={(e) => setHour(idx, { day: e.target.value })} placeholder="e.g. Monday - Friday" className="h-9 flex-1 text-[12.5px]" />
                    <Input value={row.hours} onChange={(e) => setHour(idx, { hours: e.target.value })} placeholder="e.g. 9:00 AM - 7:00 PM" className="h-9 flex-1 text-[12.5px]" />
                    <button onClick={() => removeHourRow(idx)} className="w-8 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                ))}
                {form.business_hours.length === 0 && <p className="text-[11.5px] text-muted-foreground italic">No hours set — the site will show nothing here.</p>}
              </div>
            </div>
          </Section>

          <Section title="Social Media" help="Links shown in your website's footer. Leave blank to hide.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label className="flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5" /> Instagram URL</Label><Input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} className="mt-1" placeholder="https://instagram.com/…" /></div>
              <div><Label className="flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5" /> Facebook URL</Label><Input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} className="mt-1" placeholder="https://facebook.com/…" /></div>
            </div>
          </Section>

          <Section title="Brand Colors" help="Changes the accent color used across buttons, links, and highlights on your entire website.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorField label="Primary Color" value={form.primary_color} onChange={(v) => set("primary_color", v)} />
              <ColorField label="Accent Color (hover / secondary)" value={form.accent_color} onChange={(v) => set("accent_color", v)} />
            </div>
          </Section>
        </div>

        <div className="lg:sticky lg:top-20 self-start">
          <div className="flex items-center gap-2 mb-2 text-[12px] font-medium text-muted-foreground"><Eye className="w-3.5 h-3.5" /> Live Preview</div>
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
            <div className="relative h-44 bg-muted">
              {form.hero_image && <img src={form.hero_image} alt="hero" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                <h2 className="text-white text-[20px] font-heading font-bold leading-tight">{form.hero_title}</h2>
                <p className="text-white/80 text-[12px] mt-1">{form.hero_subtitle}</p>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-heading font-semibold text-[15px] mb-1.5">{form.about_title}</h3>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">{form.about_text}</p>
              <div className="mt-4 pt-4 border-t border-border/60 text-[12px] text-muted-foreground space-y-0.5">
                {form.contact_email && <div>{form.contact_email}</div>}
                {form.contact_phone && <div>{form.contact_phone}</div>}
                {form.contact_address && <div>{form.contact_address}</div>}
              </div>
              <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Buttons & accents:</span>
                <span className="w-6 h-6 rounded-full border border-border/60" style={{ backgroundColor: form.primary_color }} title="Primary" />
                <span className="w-6 h-6 rounded-full border border-border/60" style={{ backgroundColor: form.accent_color }} title="Accent" />
                <button
                  type="button"
                  className="ml-auto px-3 py-1.5 rounded-lg text-white text-[12px] font-semibold"
                  style={{ backgroundColor: form.primary_color }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
