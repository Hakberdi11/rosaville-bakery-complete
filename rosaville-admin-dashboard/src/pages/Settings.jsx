import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { auth, pricingSettings, integrations } from '@/lib/api';
import { Settings as SettingsIcon, Save, Store, Globe, Bell, Calculator, Plus, X, Share2, Instagram, Facebook, Music2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import SocialAccountCard from "@/components/admin/SocialAccountCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    business_name: "", business_email: "", business_phone: "", business_address: "",
    currency: "USD", tagline: "", low_stock_alerts: true, new_order_alerts: true, feedback_alerts: true,
  });
  const [saving, setSaving] = useState(false);

  // Pricing settings are a separate backing model (operations.PricingSettings,
  // a staff-only singleton) from the Business Profile/Notification fields
  // above (which live on the logged-in User row) — kept as a distinct form
  // and save action so one save can never silently drop the other's fields.
  const [pricingForm, setPricingForm] = useState({
    target_margin_percent: 40, labor_hourly_rate: 0, overhead_percent: 0, waste_buffer_percent: 0,
  });
  const [categoryMargins, setCategoryMargins] = useState([]); // [{category, percent}] — dict on the wire
  const [pricingSaving, setPricingSaving] = useState(false);

  const [socialAccounts, setSocialAccounts] = useState([]);
  const loadSocialAccounts = () => integrations.listAccounts().then(setSocialAccounts).catch((e) => console.error(e));

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        business_name: user.business_name || "Rosaville Desserts",
        business_email: user.business_email || "",
        business_phone: user.business_phone || "",
        business_address: user.business_address || "",
        currency: user.currency || "USD",
        tagline: user.tagline || "Artisan cakes & desserts, handcrafted with love.",
        low_stock_alerts: user.low_stock_alerts !== false,
        new_order_alerts: user.new_order_alerts !== false,
        feedback_alerts: user.feedback_alerts !== false,
      }));
    }
  }, [user]);

  useEffect(() => {
    pricingSettings.get().then((data) => {
      setPricingForm({
        target_margin_percent: data.target_margin_percent ?? 40,
        labor_hourly_rate: data.labor_hourly_rate ?? 0,
        overhead_percent: data.overhead_percent ?? 0,
        waste_buffer_percent: data.waste_buffer_percent ?? 0,
      });
      setCategoryMargins(Object.entries(data.category_margin_overrides || {}).map(([category, percent]) => ({ category, percent })));
    }).catch((e) => console.error(e));
    loadSocialAccounts();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPricing = (k, v) => setPricingForm((f) => ({ ...f, [k]: v }));
  const setCategoryRow = (idx, patch) => {
    const rows = [...categoryMargins];
    rows[idx] = { ...rows[idx], ...patch };
    setCategoryMargins(rows);
  };
  const addCategoryRow = () => setCategoryMargins([...categoryMargins, { category: "", percent: 40 }]);
  const removeCategoryRow = (idx) => setCategoryMargins(categoryMargins.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      await auth.updateMe(form);
      await checkUserAuth();
      toast({ title: "Settings saved", description: "Your business profile has been updated." });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save", description: e.message || "Something went wrong.", variant: "destructive" });
    }
    setSaving(false);
  };

  const savePricing = async () => {
    setPricingSaving(true);
    try {
      const category_margin_overrides = {};
      categoryMargins.forEach((row) => {
        if (row.category.trim()) category_margin_overrides[row.category.trim()] = Number(row.percent) || 0;
      });
      await pricingSettings.update({
        target_margin_percent: Number(pricingForm.target_margin_percent) || 0,
        labor_hourly_rate: Number(pricingForm.labor_hourly_rate) || 0,
        overhead_percent: Number(pricingForm.overhead_percent) || 0,
        waste_buffer_percent: Number(pricingForm.waste_buffer_percent) || 0,
        category_margin_overrides,
      });
      toast({ title: "Pricing settings saved", description: "Suggested prices across the dashboard will use these values." });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save", description: e.message || "Something went wrong.", variant: "destructive" });
    }
    setPricingSaving(false);
  };

  return (
    <div className="p-5 lg:p-8 max-w-[800px] mx-auto">
      <PageHeader title="Settings" description="Business profile, branding & notification preferences." icon={SettingsIcon} actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={save} disabled={saving}><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}</Button>} />

      <div className="space-y-5">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4"><Store className="w-4 h-4 text-rose-500" /><h3 className="font-heading font-semibold text-[15px]">Business Profile</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Business Name</Label><Input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} className="mt-1" /></div>
            <div><Label>Email</Label><Input type="email" value={form.business_email} onChange={(e) => set("business_email", e.target.value)} className="mt-1" /></div>
            <div><Label>Phone</Label><Input value={form.business_phone} onChange={(e) => set("business_phone", e.target.value)} className="mt-1" /></div>
            <div className="col-span-2"><Label>Address</Label><Input value={form.business_address} onChange={(e) => set("business_address", e.target.value)} className="mt-1" /></div>
            <div><Label>Currency</Label>
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
                {["USD", "EUR", "GBP", "AZN", "AED"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="mt-1" /></div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-amber-500" /><h3 className="font-heading font-semibold text-[15px]">Notifications</h3></div>
          <div className="space-y-3">
            <label className="flex items-center justify-between"><span className="text-[13px] font-medium">New order alerts</span><Switch checked={form.new_order_alerts} onCheckedChange={(v) => set("new_order_alerts", v)} /></label>
            <label className="flex items-center justify-between"><span className="text-[13px] font-medium">Low stock alerts</span><Switch checked={form.low_stock_alerts} onCheckedChange={(v) => set("low_stock_alerts", v)} /></label>
            <label className="flex items-center justify-between"><span className="text-[13px] font-medium">New feedback alerts</span><Switch checked={form.feedback_alerts} onCheckedChange={(v) => set("feedback_alerts", v)} /></label>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Calculator className="w-4 h-4 text-emerald-500" /><h3 className="font-heading font-semibold text-[15px]">Pricing</h3></div>
            <Button size="sm" variant="outline" className="gap-2" onClick={savePricing} disabled={pricingSaving}><Save className="w-3.5 h-3.5" /> {pricingSaving ? "Saving…" : "Save Pricing Settings"}</Button>
          </div>
          <p className="text-[12px] text-muted-foreground mb-4">Drives the "Suggested Price" shown when adding or editing a dessert — ingredient cost (from Inventory) + labor + your margin below.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div>
              <Label>Default Target Margin %</Label>
              <Input type="number" step="0.01" value={pricingForm.target_margin_percent} onChange={(e) => setPricing("target_margin_percent", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Labor Hourly Rate ($)</Label>
              <Input type="number" step="0.01" value={pricingForm.labor_hourly_rate} onChange={(e) => setPricing("labor_hourly_rate", e.target.value)} className="mt-1" />
              {Number(pricingForm.labor_hourly_rate) === 0 && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Set this to include labor in suggested prices — currently ingredient-cost-only.</p>}
            </div>
            <div>
              <Label>Overhead %</Label>
              <Input type="number" step="0.01" value={pricingForm.overhead_percent} onChange={(e) => setPricing("overhead_percent", e.target.value)} className="mt-1" placeholder="0 = not included" />
            </div>
            <div>
              <Label>Waste/Spoilage Buffer %</Label>
              <Input type="number" step="0.01" value={pricingForm.waste_buffer_percent} onChange={(e) => setPricing("waste_buffer_percent", e.target.value)} className="mt-1" placeholder="0 = not included" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Category Margin Overrides <span className="text-muted-foreground font-normal text-[11.5px]">(optional — e.g. higher margin for wedding cakes)</span></Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={addCategoryRow}><Plus className="w-3.5 h-3.5" /> Add Category</Button>
            </div>
            <div className="space-y-2">
              {categoryMargins.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={row.category} onChange={(e) => setCategoryRow(idx, { category: e.target.value })} placeholder="e.g. Wedding Cakes" className="h-9 flex-1 text-[12.5px]" />
                  <div className="relative w-28">
                    <Input type="number" step="0.01" value={row.percent} onChange={(e) => setCategoryRow(idx, { percent: e.target.value })} className="h-9 pr-7 text-[12.5px]" />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">%</span>
                  </div>
                  <button onClick={() => removeCategoryRow(idx)} className="w-8 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>
              ))}
              {categoryMargins.length === 0 && <p className="text-[11.5px] text-muted-foreground italic">No category overrides — every dessert uses the default margin above unless it sets its own.</p>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2 mb-4"><Share2 className="w-4 h-4 text-sky-500" /><h3 className="font-heading font-semibold text-[15px]">Social Accounts</h3></div>
          <p className="text-[12px] text-muted-foreground mb-4">Connect Instagram, Facebook, and TikTok to see real follower/engagement numbers on the Social Media page.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { platform: "instagram", label: "Instagram", icon: Instagram },
              { platform: "facebook", label: "Facebook", icon: Facebook },
              { platform: "tiktok", label: "TikTok", icon: Music2 },
            ].map(({ platform, label, icon }) => (
              <SocialAccountCard
                key={platform}
                platform={platform}
                label={label}
                icon={icon}
                account={socialAccounts.find((a) => a.platform === platform)}
                onChanged={loadSocialAccounts}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}