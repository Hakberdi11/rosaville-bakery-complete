// Shared ingredient-consumption + projected-stock logic for the bakery OS.

export const UNITS = ["kg", "g", "lb", "oz", "L", "ml", "pcs", "box", "cup", "tbsp", "tsp"];

const CONVERSIONS = {
  kg: { g: 1000, lb: 2.20462, oz: 35.274 },
  g: { kg: 0.001, lb: 0.00220462, oz: 0.035274 },
  lb: { kg: 0.453592, g: 453.592, oz: 16 },
  oz: { kg: 0.0283495, g: 28.3495, lb: 0.0625 },
  L: { ml: 1000 },
  ml: { L: 0.001 },
};

export function convertUnit(quantity, from, to) {
  if (!from || !to || from === to) return quantity;
  if (CONVERSIONS[from] && CONVERSIONS[from][to]) return quantity * CONVERSIONS[from][to];
  if (CONVERSIONS[to] && CONVERSIONS[to][from]) return quantity / CONVERSIONS[to][from];
  return quantity; // unknown pairing — assume 1:1
}

// Units convertUnit can actually convert to/from the given unit (its own
// compatibility group, e.g. {kg,g,lb,oz} or {L,ml}), plus itself. Units with
// no CONVERSIONS entries (pcs, box, cup, tbsp, tsp) only match themselves —
// used to keep an ingredient's unit picker from offering an incompatible unit
// once it's linked to a real InventoryItem (convertUnit silently assumes 1:1
// for unknown pairings, which would silently mis-cost/mis-deduct stock).
export function getCompatibleUnits(unit) {
  if (!unit) return UNITS;
  const group = new Set([unit]);
  if (CONVERSIONS[unit]) Object.keys(CONVERSIONS[unit]).forEach((u) => group.add(u));
  for (const [from, targets] of Object.entries(CONVERSIONS)) {
    if (targets[unit] !== undefined) group.add(from);
  }
  return UNITS.filter((u) => group.has(u));
}

// Returns { [inventory_item_id]: { name, unit, quantity } } for one order.
// Uses size-specific ingredients when a size defines its own; otherwise falls
// back to the base recipe scaled by the size multiplier.
export function calculateOrderIngredients(order, desserts) {
  const consumption = {};
  for (const item of order.items || []) {
    // dessert_id on stored order items is often a string (HTML <select> values
    // are always strings) while Dessert.id comes back as a number from the API —
    // compare loosely so ingredient consumption isn't silently dropped.
    const dessert = desserts.find((d) => String(d.id) === String(item.dessert_id));
    if (!dessert) continue;
    const size = (dessert.sizes || []).find((s) => s.label === item.size);
    let ingredients = dessert.ingredients || [];
    let multiplier = (item.size_multiplier || 1) * (item.quantity || 1);
    if (size && size.ingredients && size.ingredients.length > 0) {
      // Size has its own absolute ingredient quantities — no multiplier scaling.
      ingredients = size.ingredients;
      multiplier = item.quantity || 1;
    }
    for (const ing of ingredients) {
      if (!ing.inventory_item_id) continue;
      const key = ing.inventory_item_id;
      if (!consumption[key]) consumption[key] = { name: ing.name, unit: ing.unit, quantity: 0 };
      consumption[key].quantity += (ing.quantity || 0) * multiplier;
    }
  }
  return consumption;
}

// Adds predicted_usage + projected_stock to each inventory item, based on active orders.
export function calculateProjectedStock(inventory, orders, desserts) {
  const activeStatuses = ["Pending", "Confirmed", "In Production", "Ready"];
  const activeOrders = orders.filter((o) => activeStatuses.includes(o.status));
  const totalConsumption = {};
  for (const order of activeOrders) {
    const cons = calculateOrderIngredients(order, desserts);
    for (const [id, c] of Object.entries(cons)) {
      const item = inventory.find((i) => String(i.id) === String(id));
      const converted = convertUnit(c.quantity, c.unit, item?.unit);
      totalConsumption[id] = (totalConsumption[id] || 0) + converted;
    }
  }
  return inventory.map((item) => {
    const usage = totalConsumption[item.id] || 0;
    return {
      ...item,
      predicted_usage: usage,
      projected_stock: (item.current_stock || 0) - usage,
    };
  });
}

// Total ingredient (COGS) cost across a list of orders, reusing the same
// size-aware consumption logic as calculateProjectedStock — used for the
// Reports page's monthly gross-margin figure.
export function calculateOrdersCOGS(orders, desserts, inventory) {
  let totalCost = 0;
  for (const order of orders) {
    const cons = calculateOrderIngredients(order, desserts);
    for (const [id, c] of Object.entries(cons)) {
      const item = inventory.find((i) => String(i.id) === String(id));
      if (!item) continue;
      const converted = convertUnit(c.quantity, c.unit, item.unit);
      totalCost += converted * (item.cost_per_unit || 0);
    }
  }
  return totalCost;
}

// Flags ingredients where current stock represents far more supply than recent
// actual usage supports — a lightweight over-ordering/waste-risk signal, not a
// full demand-forecasting model. Looks at fulfilled/placed orders (excluding
// Cancelled/Refunded) from the last `lookbackDays`, derives a weekly usage
// rate per ingredient, and flags items stocked beyond `overstockWeeks` worth
// of that rate. Items with no usage history in the window aren't flagged —
// "never sold" and "overstocked" aren't the same signal, and treating
// zero-usage as overstocked would false-flag every seasonal/new ingredient.
export function calculateWasteRisk(inventory, orders, desserts, { lookbackDays = 28, overstockWeeks = 6 } = {}) {
  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const recentOrders = orders.filter((o) => {
    if (["Cancelled", "Refunded"].includes(o.status)) return false;
    const created = o.created_at ? new Date(o.created_at).getTime() : NaN;
    return !Number.isNaN(created) && created >= cutoff;
  });

  const totalConsumption = {};
  for (const order of recentOrders) {
    const cons = calculateOrderIngredients(order, desserts);
    for (const [id, c] of Object.entries(cons)) {
      const item = inventory.find((i) => String(i.id) === String(id));
      const converted = convertUnit(c.quantity, c.unit, item?.unit);
      totalConsumption[id] = (totalConsumption[id] || 0) + converted;
    }
  }

  const weeks = lookbackDays / 7;
  return inventory.map((item) => {
    const used = totalConsumption[item.id] || 0;
    const weeklyUsageRate = used / weeks;
    const weeksOfSupply = weeklyUsageRate > 0 ? (item.current_stock || 0) / weeklyUsageRate : null;
    return {
      ...item,
      weekly_usage_rate: weeklyUsageRate,
      weeks_of_supply: weeksOfSupply,
      overstocked: weeksOfSupply !== null && weeksOfSupply > overstockWeeks,
    };
  });
}

// Aggregates ingredient needs across a list of orders (for the order composer preview).
export function summarizeIngredients(items, desserts, inventory) {
  const pseudo = { items };
  const cons = calculateOrderIngredients(pseudo, desserts);
  return Object.entries(cons).map(([id, c]) => {
    const item = inventory.find((i) => String(i.id) === String(id));
    const converted = convertUnit(c.quantity, c.unit, item?.unit);
    return {
      inventory_item_id: id,
      name: item?.name || c.name,
      unit: item?.unit || c.unit,
      needed: converted,
      available: item?.current_stock || 0,
      sufficient: (item?.current_stock || 0) >= converted,
    };
  });
}