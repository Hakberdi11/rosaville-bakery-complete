import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, Search, X } from "lucide-react";
import PageHeader, { EmptyState } from "@/components/admin/PageHeader";
import { Input } from "@/components/ui/input";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Signature Cakes", "Custom Cakes", "Seasonal Specials", "Cupcakes", "Pastries", "Cheesecakes"];

export default function Gallery() {
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setDesserts(await base44.entities.Dessert.list("-display_order", 500)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = desserts.filter((d) => {
    const ms = !search || d.name?.toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || d.category === category;
    return ms && mc && (d.featured_image || d.images?.length);
  });

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Gallery" description={`${filtered.length} showcase images · click to view full size`} icon={ImageIcon} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery…" className="pl-9 h-10" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("px-3 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap border transition-colors",
                category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card"><EmptyState icon={ImageIcon} title="No images" description="Add featured images to your desserts to populate the gallery." /></div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((d) => {
            const imgs = [d.featured_image, ...(d.images || [])].filter(Boolean);
            return imgs.map((src, i) => (
              <div key={d.id + i} className="break-inside-avoid rounded-2xl overflow-hidden border border-border/60 bg-card cursor-pointer group relative" onClick={() => setLightbox({ src, name: d.name })}>
                <Image src={src} alt={d.name} fittingType="fill" className="w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-[12px] font-medium">{d.name}</span>
                </div>
              </div>
            ));
          })}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X className="w-5 h-5 text-white" /></button>
          <img src={lightbox.src} alt={lightbox.name} className="max-w-full max-h-full rounded-xl object-contain" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-[14px] font-medium">{lightbox.name}</div>
        </div>
      )}
    </div>
  );
}