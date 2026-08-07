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

function applyBrandColors(primary: string, accent: string) {
  const root = document.documentElement.style;
  root.setProperty("--primary", primary);
  root.setProperty("--primary-foreground", readableForeground(primary));
  root.setProperty("--secondary", primary);
  root.setProperty("--ring", primary);
  root.setProperty("--accent", accent);
  root.setProperty("--accent-foreground", readableForeground(accent));
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.siteContent
      .get()
      .then((data) => {
        setContent(data);
        applyBrandColors(data.primary_color, data.accent_color);
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
