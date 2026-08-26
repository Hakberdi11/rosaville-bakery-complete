import React, { useState, useEffect } from "react";
import { loyaltySettings } from '@/lib/api';
import { Gift, Save } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export default function Loyalty() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    enabled: false, purchases_required: 5, reward_type: "percent_off", reward_value: 50,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loyaltySettings.get().then((data) => {
      setForm({
        enabled: data.enabled ?? false,
        purchases_required: data.purchases_required ?? 5,
        reward_type: data.reward_type ?? "percent_off",
        reward_value: data.reward_value ?? 50,
      });
    }).catch((e) => console.error(e));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await loyaltySettings.update({
        enabled: form.enabled,
        purchases_required: Number(form.purchases_required) || 1,
        reward_type: form.reward_type,
        reward_value: Number(form.reward_value) || 0,
      });
      toast({ title: "Loyalty settings saved", description: "Customers will see this reward rule on the storefront." });
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save", description: e.message || "Something went wrong.", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="p-5 lg:p-8 max-w-[800px] mx-auto">
      <PageHeader
        title="Loyalty Program"
        description="Reward repeat customers with a punch-card style discount."
        icon={Gift}
        actions={<Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={save} disabled={saving}><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}</Button>}
      />

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <label className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-medium">Enable loyalty rewards</span>
          <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} />
        </label>
        <p className="text-[12px] text-muted-foreground mb-4">
          When enabled, a customer earns a reward every time their completed purchase count reaches a multiple
          of "Purchases Required" below. They can redeem it once, on their next order, from their account on
          the storefront.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Purchases Required</Label>
            <Input type="number" min="1" step="1" value={form.purchases_required} onChange={(e) => set("purchases_required", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Reward Type</Label>
            <select value={form.reward_type} onChange={(e) => set("reward_type", e.target.value)} className="mt-1 w-full h-9 px-3 rounded-lg border border-input bg-card text-[13px]">
              <option value="percent_off">Percent off</option>
              <option value="fixed_off">Fixed amount off</option>
            </select>
          </div>
          <div>
            <Label>Reward Value {form.reward_type === "percent_off" ? "(%)" : "($)"}</Label>
            <Input type="number" step="0.01" value={form.reward_value} onChange={(e) => set("reward_value", e.target.value)} className="mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
