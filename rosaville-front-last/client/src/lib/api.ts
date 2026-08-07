const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  inventory_item_id?: string;
}

export interface Dessert {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  featured_image: string | null;
  images: string[];
  ingredients: Ingredient[];
  sizes: { label: string; multiplier: number; price: number }[];
  allergens: string[];
  tags: string[];
  preparation_time: string;
  availability: boolean;
  featured: boolean;
  seasonal: boolean;
  display_order: number;
}

export interface SpecialOfMonth {
  id: number;
  dessert: number;
  dessert_detail: Dessert;
  month_label: string;
  display_title: string;
  display_story: string;
  is_active: boolean;
}

export interface SiteContent {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  about_title: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  business_hours: { day: string; hours: string }[];
  instagram_url: string;
  facebook_url: string;
  primary_color: string;
  accent_color: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const api = {
  desserts: {
    list: async (category?: string) => {
      const qs = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
      const data = await request<Paginated<Dessert>>(`/api/desserts/${qs}`);
      return data.results;
    },
    get: (id: number | string) => request<Dessert>(`/api/desserts/${id}/`),
    listGallery: async () => {
      const data = await request<Paginated<Dessert>>("/api/desserts/?in_gallery=true");
      return data.results;
    },
  },
  specialOfMonth: {
    getCurrent: async () => {
      const data = await request<Paginated<SpecialOfMonth>>("/api/specials/?is_active=true");
      return data.results[0] ?? null;
    },
  },
  siteContent: {
    get: () => request<SiteContent>("/api/site-content/"),
  },
  contact: {
    submit: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
      request("/api/contact-requests/", { method: "POST", body: JSON.stringify(data) }),
  },
  customCakes: {
    submit: (data: {
      name: string;
      email: string;
      phone: string;
      occasion: string;
      cakeSize: string;
      flavor: string;
      customRequests?: string;
      preferredDate: string;
      inspirationImageUrl?: string;
    }) =>
      request("/api/custom-cake-orders/", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          occasion: data.occasion,
          cake_size: data.cakeSize,
          flavor: data.flavor,
          custom_requests: data.customRequests || "",
          preferred_date: data.preferredDate,
          inspiration_image_url: data.inspirationImageUrl || "",
        }),
      }),
  },
  team: {
    list: async () => {
      const data = await request<Paginated<any>>("/api/team-members/");
      return data.results;
    },
  },
  newsletter: {
    subscribe: (email: string) =>
      request("/api/newsletter-subscribers/", { method: "POST", body: JSON.stringify({ email }) }),
  },
  orders: {
    submit: (data: {
      customer_name: string;
      email: string;
      phone: string;
      address: string;
      items: { name: string; dessert_id: number; quantity: number; price: number }[];
      total_value: number;
      internal_notes?: string;
    }) => request("/api/orders/", { method: "POST", body: JSON.stringify(data) }),
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/api/upload/`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<{ file_url: string }>;
  },
};
