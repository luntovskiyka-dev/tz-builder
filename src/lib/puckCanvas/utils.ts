export function renderTextSummary(props: Record<string, unknown>): string {
  const keys = [
    "title",
    "template",
    "templateName",
    "label",
    "text",
    "description",
    "richtext",
    "content",
    "quote",
    "children",
  ];
  for (const key of keys) {
    const value = props[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return "Настройте свойства в панели справа";
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Accepts finite numbers and numeric strings from forms / serialized data. */
export function parseNumeric(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** Migrates legacy `"1"`…`"6"` to semantic `h1`…`h6`; empty stays unset. */
export function migrateHeadingLevel(value: unknown): string {
  if (value === "" || value === undefined || value === null) return "";
  const s = String(value).trim();
  if (/^h[1-6]$/i.test(s)) return s.toLowerCase();
  if (/^[1-6]$/.test(s)) return `h${s}`;
  return "";
}

/** Migrates legacy empty string for "both" to explicit `both`. */
export function migrateSpaceDirection(value: unknown): string {
  if (value === "" || value === undefined || value === null) return "both";
  const s = String(value);
  if (s === "vertical" || s === "horizontal" || s === "both") return s;
  return "both";
}

export function getGridColumnCount(raw: unknown): number {
  const value = parseNumeric(raw, 4);
  return Math.min(12, Math.max(1, Math.round(value)));
}

export function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function asButtonList(value: unknown): Array<{ text: string; url: string }> {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      return {
        text: asString(obj.text || obj.label),
        url: asString(obj.url || obj.href),
      };
    }
    return { text: "", url: "" };
  });
}

/** Logos rows: `alt` + `imageUrl`, with legacy `{ text, url }` migration. */
export function asLogosList(value: unknown): Array<{ alt: string; imageUrl: string }> {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const alt = asString(obj.alt ?? obj.text ?? obj.label);
      const imageUrl = asString(obj.imageUrl ?? obj.url ?? obj.href);
      return { alt, imageUrl };
    }
    return { alt: "", imageUrl: "" };
  });
}

export function asStatsList(value: unknown): Array<{ title: string; description: string }> {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const title = asString(obj.title ?? obj.value);
      const description = asString(obj.description ?? obj.label);
      return { title, description };
    }
    return { title: "", description: "" };
  });
}

/** Puck injects `puck` on component render props; use for `tabIndex` / href while editing. */
export function isPuckEditing(props: Record<string, unknown>): boolean {
  const puck = props.puck as { isEditing?: boolean } | undefined;
  return puck?.isEditing === true;
}
