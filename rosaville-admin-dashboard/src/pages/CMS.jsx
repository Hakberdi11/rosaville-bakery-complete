import React, { useState, useEffect } from "react";
import { siteContent, uploadFile } from '@/lib/api';
import { FileText, Save, Eye, Upload, Plus, X, Palette, Instagram, Facebook, Type, MessageSquareQuote, Sparkles, Download } from "lucide-react";
import { generateCmsTemplatePdf } from '@/lib/cmsTemplatePdf';
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_FORM = {
  site_name: "Rosaville Desserts",
  hero_title: "", hero_subtitle: "", hero_image: "",
  about_title: "", about_text: "",
  about_subtitle: "", about_values_title: "Our Values", about_values_items: [],
  home_why_choose_title: "", home_why_choose_subtitle: "", home_why_choose_items: [],
  contact_email: "", contact_phone: "", contact_address: "",
  business_hours: [],
  instagram_url: "", facebook_url: "",
  primary_color: "#C9949B", accent_color: "#C97A85",
  background_color: "#FBF7F4", foreground_color: "#3D2817", border_color: "#E8D4D8", muted_color: "#F0D4D8",
  heading_font: "Playfair Display", body_font: "Poppins",
  show_testimonials: true,
};

const FONT_PAIRS = [
  { heading: "Playfair Display", body: "Poppins", label: "Playfair Display + Poppins (default)" },
  { heading: "Cormorant Garamond", body: "Lato", label: "Cormorant Garamond + Lato" },
  { heading: "Merriweather", body: "Montserrat", label: "Merriweather + Montserrat" },
  { heading: "Libre Baskerville", body: "Nunito Sans", label: "Libre Baskerville + Nunito Sans" },
  { heading: "DM Serif Display", body: "Inter", label: "DM Serif Display + Inter" },
  { heading: "Lora", body: "Work Sans", label: "Lora + Work Sans" },
];

function ItemsEditor({ items, onChange, placeholder = "Card title" }) {
  const setRow = (idx, patch) => {
    const rows = [...items];
    rows[idx] = { ...rows[idx], ...patch };
    onChange(rows);
  };
  const addRow = () => onChange([...items, { title: "", description: "" }]);
  const removeRow = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center justify-end mb-1.5">
        <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={addRow}><Plus className="w-3.5 h-3.5" /> Add Card</Button>
      </div>
      <div className="space-y-2">
        {items.map((row, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg border border-border/60">
            <div className="flex-1 space-y-1.5">
              <Input value={row.title} onChange={(e) => setRow(idx, { title: e.target.value })} placeholder={placeholder} className="h-8 text-[12.5px]" />
              <Textarea value={row.description} onChange={(e) => setRow(idx, { description: e.target.value })} placeholder="Description" className="text-[12.5px]" rows={2} />
            </div>
            <button onClick={() => removeRow(idx)} className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-[11.5px] text-muted-foreground italic">No cards yet — add one above.</p>}
      </div>
    </div>
  );
}

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
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

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

  const downloadTemplate = () => {
    setDownloadingTemplate(true);
    try {
      generateCmsTemplatePdf();
    } catch (e) {
      console.error(e);
      toast({ title: "Could not generate PDF", description: e.message || "Something went wrong.", variant: "destructive" });
    }
    setDownloadingTemplate(false);
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
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={downloadTemplate}
              disabled={downloadingTemplate}
              title="Reference guide showing which text/color in the CMS maps to which part of the site"
            >
              <Download className="w-4 h-4" /> {downloadingTemplate ? "Generating…" : "Download Template"}
            </Button>
            <Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={save} disabled={saving}><Save className="w-4 h-4" /> {saving ? "Saving…" : "Publish Changes"}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Section title="Brand" help="Your site name — shown in the navigation bar, footer, and copyright line.">
            <div><Label>Site Name</Label><Input value={form.site_name} onChange={(e) => set("site_name", e.target.value)} className="mt-1" /></div>
          </Section>

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

          <Section title="Homepage Highlights" help={'The "Why Choose Us" cards on your homepage.'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Heading</Label><Input value={form.home_why_choose_title} onChange={(e) => set("home_why_choose_title", e.target.value)} className="mt-1" /></div>
              <div><Label>Subheading</Label><Input value={form.home_why_choose_subtitle} onChange={(e) => set("home_why_choose_subtitle", e.target.value)} className="mt-1" /></div>
            </div>
            <ItemsEditor items={form.home_why_choose_items} onChange={(v) => set("home_why_choose_items", v)} />
          </Section>

          <Section title="Our Story" help="Shown on your About page — tell customers who you are.">
            <div><Label>Title</Label><Input value={form.about_title} onChange={(e) => set("about_title", e.target.value)} className="mt-1" /></div>
            <div><Label>Story</Label><Textarea value={form.about_text} onChange={(e) => set("about_text", e.target.value)} className="mt-1" rows={4} /></div>
            <div><Label>Subtitle (under the "About" page headline)</Label><Input value={form.about_subtitle} onChange={(e) => set("about_subtitle", e.target.value)} className="mt-1" /></div>
          </Section>

          <Section title="Our Values" help="The values cards on your About page.">
            <div><Label>Heading</Label><Input value={form.about_values_title} onChange={(e) => set("about_values_title", e.target.value)} className="mt-1" /></div>
            <ItemsEditor items={form.about_values_items} onChange={(v) => set("about_values_items", v)} />
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

          <Section title="Brand Colors" help={'Changes the colors used across your entire website. The "Add to Cart" button color always stays fixed for consistency, even if you change these.'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorField label="Primary Color" value={form.primary_color} onChange={(v) => set("primary_color", v)} />
              <ColorField label="Accent Color (hover / secondary)" value={form.accent_color} onChange={(v) => set("accent_color", v)} />
              <ColorField label="Background Color" value={form.background_color} onChange={(v) => set("background_color", v)} />
              <ColorField label="Text Color" value={form.foreground_color} onChange={(v) => set("foreground_color", v)} />
              <ColorField label="Border Color" value={form.border_color} onChange={(v) => set("border_color", v)} />
              <ColorField label="Muted / Highlight Color" value={form.muted_color} onChange={(v) => set("muted_color", v)} />
            </div>
          </Section>

          <Section title="Typography" help="Pick a font pairing for headings and body text across the whole website.">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={`${form.heading_font}|${form.body_font}`}
                onChange={(e) => {
                  const [heading, body] = e.target.value.split("|");
                  setForm((f) => ({ ...f, heading_font: heading, body_font: body }));
                }}
                className="w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]"
              >
                {FONT_PAIRS.map((p) => (
                  <option key={p.label} value={`${p.heading}|${p.body}`}>{p.label}</option>
                ))}
              </select>
            </div>
          </Section>

          <Section title="Testimonials" help={null}>
            <label className="flex items-center justify-between">
              <span className="text-[13px] font-medium flex items-center gap-1.5"><MessageSquareQuote className="w-3.5 h-3.5" /> Show testimonials section on website</span>
              <Switch checked={form.show_testimonials} onCheckedChange={(v) => set("show_testimonials", v)} />
            </label>
            <p className="text-[12px] text-muted-foreground">
              Mark customer reviews as featured from the Website Feedback widget on your Dashboard to have them appear here. Turning this off removes the whole section from the website.
            </p>
          </Section>
        </div>

        <div className="lg:sticky lg:top-20 self-start">
          <div className="flex items-center gap-2 mb-2 text-[12px] font-medium text-muted-foreground"><Eye className="w-3.5 h-3.5" /> Live Preview</div>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: form.background_color, borderColor: form.border_color, color: form.foreground_color, fontFamily: form.body_font }}
          >
            <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: form.border_color }}>
              <Sparkles className="w-4 h-4" style={{ color: form.primary_color }} />
              <span className="text-[15px] font-semibold" style={{ fontFamily: form.heading_font }}>{form.site_name}</span>
            </div>
            <div className="relative h-44" style={{ backgroundColor: form.muted_color }}>
              {form.hero_image && <img src={form.hero_image} alt="hero" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                <h2 className="text-white text-[20px] font-bold leading-tight" style={{ fontFamily: form.heading_font }}>{form.hero_title}</h2>
                <p className="text-white/80 text-[12px] mt-1">{form.hero_subtitle}</p>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-[15px] mb-1.5" style={{ fontFamily: form.heading_font }}>{form.about_title}</h3>
              <p className="text-[12.5px] opacity-70 leading-relaxed">{form.about_text}</p>
              <div className="mt-4 pt-4 border-t text-[12px] opacity-70 space-y-0.5" style={{ borderColor: form.border_color }}>
                {form.contact_email && <div>{form.contact_email}</div>}
                {form.contact_phone && <div>{form.contact_phone}</div>}
                {form.contact_address && <div>{form.contact_address}</div>}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center gap-1.5 flex-wrap" style={{ borderColor: form.border_color }}>
                <Palette className="w-3.5 h-3.5 opacity-60 mr-1" />
                {[
                  ["Primary", form.primary_color], ["Accent", form.accent_color],
                  ["Background", form.background_color], ["Text", form.foreground_color],
                  ["Border", form.border_color], ["Muted", form.muted_color],
                ].map(([label, color]) => (
                  <span key={label} className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: color }} title={label} />
                ))}
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
