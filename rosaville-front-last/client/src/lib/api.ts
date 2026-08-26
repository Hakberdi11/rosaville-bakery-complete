const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Customer-account auth tokens. Namespaced "customer" (rather than reusing the
// admin dashboard's rv_access_token/rv_refresh_token keys) since these are a
// different identity/app, even though they'd never share an origin in practice.
const ACCESS_KEY = "rv_customer_access_token";
const REFRESH_KEY = "rv_customer_refresh_token";

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
function setTokens(data: { access: string; refresh?: string }) {
  localStorage.setItem(ACCESS_KEY, data.access);
  if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
}
function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  setTokens(data);
  return true;
}

async function request<T>(path: string, init?: RequestInit, allowRetry = true): Promise<T> {
  const access = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (res.status === 401 && allowRetry && (await tryRefresh())) {
    return request<T>(path, init, false);
  }
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
  about_subtitle: string;
  about_values_title: string;
  about_values_items: { title: string; description: string }[];
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  business_hours: { day: string; hours: string }[];
  instagram_url: string;
  facebook_url: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  border_color: string;
  muted_color: string;
  heading_font: string;
  body_font: string;
  site_name: string;
  home_why_choose_title: string;
  home_why_choose_subtitle: string;
  home_why_choose_items: { title: string; description: string }[];
  show_testimonials: boolean;
}

export interface PublicFeedback {
  id: number;
  customer_name: string;
  rating: number;
  message: string;
  dessert_name: string;
  created_at: string;
}

export interface OrderStatus {
  order_number: string;
  status: string;
  payment_status: string;
  items: { name: string; quantity: number; price: number; size?: string }[];
  total_value: number;
  delivery_date: string | null;
  created_at: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CustomerUser {
  id: number;
  email: string;
  role: string;
  full_name: string;
  phone: string;
  address: string;
  loyalty: { order_count: number; loyalty_points: number; reward_available: boolean } | null;
}

export interface LoyaltySettings {
  enabled: boolean;
  purchases_required: number;
  reward_type: "percent_off" | "fixed_off";
  reward_value: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  payment_status: string;
  items: { name: string; quantity: number; price: number; size?: string }[];
  total_value: number;
  delivery_date: string | null;
  created_at: string;
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
  feedback: {
    public: () => request<PublicFeedback[]>("/api/feedback/public/"),
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
      internal_notes?: string;
      redeem_loyalty_reward?: boolean;
      // total_value is intentionally not accepted: the server recomputes it
      // from the catalog + LoyaltySettings and ignores anything posted here.
    }) =>
      request<{ order_number: string; total_value: number; loyalty_discount_amount: number }>("/api/orders/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    lookup: (orderNumber: string, email: string) =>
      request<OrderStatus>(
        `/api/orders/lookup/?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      ),
    mine: () => request<Order[]>("/api/orders/mine/"),
    cancel: (id: number) => request<Order>(`/api/orders/${id}/cancel/`, { method: "POST" }),
  },
  loyaltySettings: {
    get: () => request<LoyaltySettings>("/api/loyalty-settings/"),
  },
  auth: {
    register: (data: { email: string; password: string; full_name: string }) =>
      request<{ access: string; refresh: string; user: CustomerUser }>("/api/auth/register/", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => {
        setTokens(res);
        return res.user;
      }),
    login: (email: string, password: string) =>
      request<{ access: string; refresh: string }>("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }).then((res) => {
        setTokens(res);
        return res;
      }),
    me: () => request<CustomerUser>("/api/auth/me/"),
    updateMe: (data: Partial<Pick<CustomerUser, "full_name" | "phone" | "address">>) =>
      request<CustomerUser>("/api/auth/me/", { method: "PATCH", body: JSON.stringify(data) }),
    logout: async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          await request("/api/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) });
        } catch {
          // best-effort — clear local tokens regardless
        }
      }
      clearTokens();
    },
    isAuthenticated: () => Boolean(getAccessToken()),
    requestPasswordReset: (email: string) =>
      request<{ detail: string }>("/api/auth/password-reset/", { method: "POST", body: JSON.stringify({ email }) }),
    confirmPasswordReset: (uid: string, token: string, newPassword: string) =>
      request<{ detail: string }>("/api/auth/password-reset-confirm/", {
        method: "POST",
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      }),
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/api/upload/`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<{ file_url: string }>;
  },
};
