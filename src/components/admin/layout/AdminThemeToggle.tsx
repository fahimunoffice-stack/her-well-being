import * as React from "react";
import { Switch } from "@/components/ui/switch";

type AdminTheme = "default" | "neo";

export const ADMIN_THEME_STORAGE_KEY = "hd_admin_theme";

export function getStoredAdminTheme(): AdminTheme {
  if (typeof window === "undefined") return "default";
  const v = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
  return v === "neo" ? "neo" : "default";
}

export function setStoredAdminTheme(theme: AdminTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
}

export function AdminThemeToggle({
  value,
  onChange,
}: {
  value: AdminTheme;
  onChange: (next: AdminTheme) => void;
}) {
  const checked = value === "neo";

  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1">
      <span className="font-display text-xs font-medium text-foreground">Neo</span>
      <Switch
        checked={checked}
        onCheckedChange={(next) => onChange(next ? "neo" : "default")}
        aria-label="Toggle neo-brutal admin theme"
      />
    </div>
  );
}
