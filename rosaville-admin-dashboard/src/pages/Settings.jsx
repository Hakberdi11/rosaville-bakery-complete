import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { auth } from '@/lib/api';
import { Settings as SettingsIcon, Save, Store, Globe, Bell } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
      </div>
    </div>
  );
}