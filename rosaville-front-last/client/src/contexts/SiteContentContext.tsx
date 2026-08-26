import React, { createContext, useContext, useEffect, useState } from "react";
import { api, type SiteContent } from "@/lib/api";

interface SiteContentContextType {
  content: SiteContent | null;
  loading: boolean;
}

const SiteContentContext = createContext<SiteContentContextType>({ content: null, loading: true });

function readableForeground(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#FFFFFF";
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#2C1810" : "#FFFFFF";
}

function applyBrandColors(data: SiteContent) {
  const root = document.documentElement.style;
  root.setProperty("--primary", data.primary_color);
  root.setProperty("--primary-foreground", readableForeground(data.primary_color));
  root.setProperty("--secondary", data.primary_color);
  root.setProperty("--ring", data.primary_color);
  root.setProperty("--accent", data.accent_color);
  root.setProperty("--accent-foreground", readableForeground(data.accent_color));
  if (data.background_color) {
    root.setProperty("--background", data.background_color);
    root.setProperty("--sidebar", data.background_color);
  }
  if (data.foreground_color) {
    root.setProperty("--foreground", data.foreground_color);
    root.setProperty("--card-foreground", data.foreground_color);
    root.setProperty("--popover-foreground", data.foreground_color);
    root.setProperty("--secondary-foreground", data.foreground_color);
    root.setProperty("--sidebar-foreground", data.foreground_color);
  }
  if (data.border_color) {
    root.setProperty("--border", data.border_color);
    root.setProperty("--sidebar-border", data.border_color);
  }
  if (data.muted_color) {
    root.setProperty("--muted", data.muted_color);
  }
  if (data.heading_font) {
    root.setProperty("--font-heading", `'${data.heading_font}', serif`);
  }
  if (data.body_font) {
    root.setProperty("--font-body", `'${data.body_font}', sans-serif`);
  }
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.siteContent
      .get()
      .then((data) => {
        setContent(data);
        applyBrandColors(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
