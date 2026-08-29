const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAccessToken = () => localStorage.getItem("rv_access_token");
const getRefreshToken = () => localStorage.getItem("rv_refresh_token");

const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem("rv_access_token", access);
  if (refresh) localStorage.setItem("rv_refresh_token", refresh);
};

const clearTokens = () => {
  localStorage.removeItem("rv_access_token");
  localStorage.removeItem("rv_refresh_token");
};

async function tryRefresh() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data);
    return true;
  } catch {
    return false;
  }
}

async function request(path, options = {}, allowRetry = true) {
  const token = getAccessToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && allowRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(path, options, false);
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || JSON.stringify(body);
    } catch {
      // ignore body parse errors
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

function makeResource(path) {
  return {
    list: async (sort, limit) => {
      const params = new URLSearchParams();
      if (limit) params.set("limit", String(limit));
      if (sort) {
        params.set("ordering", sort.replace("created_date", "created_at").replace("updated_date", "updated_at"));
      }
      const qs = params.toString();
      const data = await request(`/api/${path}/${qs ? `?${qs}` : ""}`);
      return data?.results ?? data;
    },
    get: (id) => request(`/api/${path}/${id}/`),
    create: (payload) => request(`/api/${path}/`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/api/${path}/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    delete: (id) => request(`/api/${path}/${id}/`, { method: "DELETE" }),
  };
}

export const entities = {
  Order: makeResource("orders"),
  Customer: makeResource("customers"),
  Dessert: makeResource("desserts"),
  Feedback: makeResource("feedback"),
  InventoryItem: makeResource("inventory"),
  Task: makeResource("tasks"),
  ContactRequest: makeResource("contact-requests"),
  User: makeResource("users"),
  SpecialOfMonth: makeResource("specials"),
  NewsletterSubscriber: makeResource("newsletter-subscribers"),
  TeamMember: makeResource("team-members"),
  CustomCakeOrder: makeResource("custom-cake-orders"),
  GiftCard: makeResource("gift-cards"),
  Supplier: makeResource("suppliers"),
  StockMovement: makeResource("stock-movements"),
  PurchaseOrder: makeResource("purchase-orders"),
};

export async function lookupGiftCard(code) {
  return request(`/api/gift-cards/lookup/?code=${encodeURIComponent(code)}`);
}

export async function adjustGiftCard(id, delta) {
  return request(`/api/gift-cards/${id}/adjust/`, { method: "POST", body: JSON.stringify({ delta }) });
}

export async function voidGiftCard(id) {
  return request(`/api/gift-cards/${id}/void/`, { method: "POST" });
}

export async function receivePurchaseOrder(id, lines) {
  return request(`/api/purchase-orders/${id}/receive/`, { method: "POST", body: JSON.stringify({ lines }) });
}

export async function adjustInventoryStock(id, delta, { reason, movementType } = {}) {
  return request(`/api/inventory/${id}/adjust/`, {
    method: "POST",
    body: JSON.stringify({ delta, reason, movement_type: movementType }),
  });
}

export const siteContent = {
  get: () => request("/api/site-content/"),
  update: (payload) => request("/api/site-content/", { method: "PATCH", body: JSON.stringify(payload) }),
};

export const pricingSettings = {
  get: () => request("/api/pricing-settings/"),
  update: (payload) => request("/api/pricing-settings/", { method: "PATCH", body: JSON.stringify(payload) }),
};

export const loyaltySettings = {
  get: () => request("/api/loyalty-settings/"),
  update: (payload) => request("/api/loyalty-settings/", { method: "PATCH", body: JSON.stringify(payload) }),
};

export const integrations = {
  listAccounts: () => request("/api/integrations/accounts/"),
  getConnectUrl: (platform) => request(`/api/integrations/${platform}/connect/`, { method: "POST" }),
  disconnect: (platform) => request(`/api/integrations/${platform}/disconnect/`, { method: "POST" }),
  getAnalytics: (platform) => request(`/api/integrations/${platform}/analytics/`),
};

export const auth = {
  login: async (email, password) => {
    const data = await request("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setTokens(data);
    return data;
  },
  me: () => request("/api/auth/me/"),
  updateMe: (payload) => request("/api/auth/me/", { method: "PATCH", body: JSON.stringify(payload) }),
  logout: async () => {
    const refresh = getRefreshToken();
    try {
      await request("/api/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) });
    } catch {
      // token may already be invalid; clear locally regardless
    }
    clearTokens();
  },
  isAuthenticated: () => Boolean(getAccessToken()),
  requestPasswordReset: (email) =>
    request("/api/auth/password-reset/", { method: "POST", body: JSON.stringify({ email }) }),
  confirmPasswordReset: (uid, token, newPassword) =>
    request("/api/auth/password-reset-confirm/", {
      method: "POST",
      body: JSON.stringify({ uid, token, new_password: newPassword }),
    }),
};

export async function uploadFile(file) {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/upload/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
