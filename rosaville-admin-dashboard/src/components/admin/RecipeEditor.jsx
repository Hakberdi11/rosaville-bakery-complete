import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IngredientRow from "@/components/admin/IngredientRow";

const blankIngredient = () => ({ inventory_item_id: "", name: "", quantity: 1, unit: "kg" });

// Shared "Base Recipe" + "Size Variants" ingredient editor, used identically
// by Desserts.jsx's DessertDialog and Recipes.jsx's RecipeDialog — both write
// to the same Dessert.ingredients/sizes fields, so this exists in exactly one
// place rather than two independently-maintained copies that could drift.
export default function RecipeEditor({ ingredients, sizes, basePrice, inventory, onIngredientsChange, onSizesChange }) {
  const setSize = (idx, patch) => {
    const arr = [...(sizes || [])];
    arr[idx] = { ...arr[idx], ...patch };
    onSizesChange(arr);
  };

  return (
    <>
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-1.5">
          <Label>Base Recipe <span className="text-muted-foreground font-normal text-[11.5px]">(Standard size — used when a size has no specific ingredients)</span></Label>
          <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={() => onIngredientsChange([...(ingredients || []), blankIngredient()])}>
            <Plus className="w-3.5 h-3.5" /> Add Ingredient
          </Button>
        </div>
        <div className="space-y-2">
          {(ingredients || []).map((ing, idx) => (
            <IngredientRow key={idx} ing={ing} inventory={inventory}
              onChange={(next) => { const arr = [...ingredients]; arr[idx] = next; onIngredientsChange(arr); }}
              onRemove={() => onIngredientsChange(ingredients.filter((_, i) => i !== idx))} />
          ))}
          {(!ingredients || ingredients.length === 0) && (
            <p className="text-[11.5px] text-muted-foreground italic">No ingredients added. Linking ingredients enables automatic inventory consumption.</p>
          )}
        </div>
      </div>

      <div className="col-span-2">
        <div className="flex items-center justify-between mb-1.5">
          <Label>Size Variants <span className="text-muted-foreground font-normal">(optional — scales ingredient quantities)</span></Label>
          <Button type="button" variant="outline" size="sm" className="h-7 text-[12px] gap-1" onClick={() => onSizesChange([...(sizes || []), { label: "", multiplier: 1, price: basePrice || 0, ingredients: [] }])}>
            <Plus className="w-3.5 h-3.5" /> Add Size
          </Button>
        </div>
        <div className="space-y-2">
          {(sizes || []).map((sz, idx) => (
            <div key={idx} className="rounded-xl border border-border/60 p-3 bg-muted/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <Input value={sz.label} onChange={(e) => setSize(idx, { label: e.target.value })} placeholder='e.g. Medium (8")' className="h-9 flex-1 text-[12.5px]" />
                <div className="relative w-24">
                  <Input type="number" step="0.1" value={sz.multiplier} onChange={(e) => setSize(idx, { multiplier: Number(e.target.value) })} className="h-9 pr-12 text-[12.5px]" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">×</span>
                </div>
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">$</span>
                  <Input type="number" value={sz.price} onChange={(e) => setSize(idx, { price: Number(e.target.value) })} className="h-9 pl-5 text-[12.5px]" />
                </div>
                <button onClick={() => onSizesChange(sizes.filter((_, i) => i !== idx))} className="w-8 h-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
              <div className="pl-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">Ingredients for this size <span className="text-muted-foreground/70">(overrides base × multiplier)</span></span>
                  <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] gap-1" onClick={() => setSize(idx, { ingredients: [...(sz.ingredients || []), blankIngredient()] })}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {(sz.ingredients || []).map((ing, i) => (
                    <IngredientRow key={i} ing={ing} inventory={inventory}
                      onChange={(next) => { const arr = [...(sz.ingredients || [])]; arr[i] = next; setSize(idx, { ingredients: arr }); }}
                      onRemove={() => setSize(idx, { ingredients: (sz.ingredients || []).filter((_, j) => j !== i) })} />
                  ))}
                  {(!sz.ingredients || sz.ingredients.length === 0) && (
                    <p className="text-[11px] text-muted-foreground italic">Uses base recipe × {sz.multiplier || 1} when size-specific ingredients aren't set.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!sizes || sizes.length === 0) && (
            <p className="text-[11.5px] text-muted-foreground italic">No size variants — orders use the base recipe (1×).</p>
          )}
        </div>
      </div>
    </>
  );
}
