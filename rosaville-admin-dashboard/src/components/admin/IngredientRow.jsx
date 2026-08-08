import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { X, ChevronDown } from "lucide-react";
import { UNITS, getCompatibleUnits } from "@/lib/ingredientCalc";

export default function IngredientRow({ ing, inventory, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const filtered = inventory.filter((i) => i.name.toLowerCase().includes((ing.name || "").toLowerCase()));
  const linkedItem = ing.inventory_item_id
    ? inventory.find((i) => String(i.id) === String(ing.inventory_item_id))
    : null;
  // Once linked to a real inventory item, only offer units convertUnit can
  // actually convert to/from that item's unit — prevents a silent 1:1
  // mis-conversion (e.g. picking "Flour" stocked in kg but leaving the
  // recipe's unit as "pcs") that would later mis-cost or mis-deduct stock.
  // Keep the row's current unit selectable even if it predates this constraint
  // (pre-existing data saved with a mismatched unit) — don't silently hide it.
  const unitOptions = linkedItem
    ? Array.from(new Set([...getCompatibleUnits(linkedItem.unit), ing.unit].filter(Boolean)))
    : UNITS;
  return (
    <div className="relative flex items-center gap-2">
      <div className="flex-1 relative">
        <Input
          value={ing.name}
          onChange={(e) => { onChange({ ...ing, name: e.target.value, inventory_item_id: "" }); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Type or choose ingredient…"
          className="h-9 text-[12.5px] pr-7"
        />
        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        {open && filtered.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-44 overflow-y-auto">
            {filtered.map((it) => (
              <button key={it.id} type="button" onMouseDown={() => { onChange({ ...ing, inventory_item_id: it.id, name: it.name, unit: it.unit }); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[12.5px] hover:bg-accent flex items-center justify-between">
                <span>{it.name}</span>
                <span className="text-[10.5px] text-muted-foreground">{it.current_stock} {it.unit} in stock</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Input type="number" step="0.01" value={ing.quantity} onChange={(e) => onChange({ ...ing, quantity: Number(e.target.value) })} className="h-9 w-20 text-[12.5px]" />
      <select value={ing.unit} onChange={(e) => onChange({ ...ing, unit: e.target.value })} className="h-9 w-20 px-2 rounded-lg border border-input bg-card text-[12.5px]">
        {unitOptions.map((u) => <option key={u}>{u}</option>)}
      </select>
      <button onClick={onRemove} className="w-8 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
    </div>
  );
}