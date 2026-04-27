import type { Data } from "@puckeditor/core";
import { puckDataToCanvasBlocks } from "@/lib/puckDataToCanvasBlocks";

/**
 * Supabase may return `blocks` as:
 * - jsonb array (CanvasBlock[])
 * - text / double-encoded JSON string
 * - full Puck document `{ content, zones, root }` instead of a flat array
 */
export function unwrapJsonValue(raw: unknown): unknown {
  let v: unknown = raw;
  for (let i = 0; i < 8; i += 1) {
    if (typeof v !== "string") break;
    const t = v.trim();
    if (!t || t === "null") return null;
    try {
      v = JSON.parse(t) as unknown;
    } catch {
      return raw;
    }
  }
  return v;
}

export function normalizeBlocksFromDb(raw: unknown): unknown[] {
  const v = unwrapJsonValue(raw);
  if (v === null || v === undefined) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.blocks)) return o.blocks;
    if (Array.isArray(o.content)) {
      return puckDataToCanvasBlocks({
        content: o.content as Data["content"],
        zones: (o.zones as Data["zones"]) ?? {},
        root: (o.root as Data["root"]) ?? { props: { title: "" } },
      } as Partial<Data>);
    }
  }
  return [];
}
