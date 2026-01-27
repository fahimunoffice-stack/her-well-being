import * as React from "react";

export type OrdersPreset = {
  id: string;
  name: string;
  search: string;
  status: "all" | "pending" | "confirmed" | "rejected";
  fromDate: string;
  toDate: string;
};

const STORAGE_KEY = "admin:orders:presets";

function safeParse(json: string | null): OrdersPreset[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data
      .map((x) => ({
        id: String(x?.id ?? ""),
        name: String(x?.name ?? ""),
        search: String(x?.search ?? ""),
        status: (x?.status ?? "all") as OrdersPreset["status"],
        fromDate: String(x?.fromDate ?? ""),
        toDate: String(x?.toDate ?? ""),
      }))
      .filter((x) => x.id && x.name);
  } catch {
    return [];
  }
}

export function useOrdersPresets() {
  const [presets, setPresets] = React.useState<OrdersPreset[]>(() => safeParse(localStorage.getItem(STORAGE_KEY)));

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }, [presets]);

  const addPreset = React.useCallback((preset: Omit<OrdersPreset, "id">) => {
    const id = crypto.randomUUID();
    setPresets((prev) => [{ id, ...preset }, ...prev].slice(0, 20));
  }, []);

  const removePreset = React.useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { presets, addPreset, removePreset };
}
