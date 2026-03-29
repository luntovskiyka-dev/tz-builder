import type { Data } from "@puckeditor/core";
import type { CanvasBlock, InspectorFieldDefinition } from "@/lib/blockTypes";
import { getAllBlockTypeIds, getBlockInspectorSchema } from "@/lib/puckBlocks";

const ARRAY_ITEM_KEY = "__item";

type PuckNode = {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
};

type PuckDataLike = Partial<Data> & {
  content?: PuckNode[];
  zones?: Record<string, PuckNode[]>;
};

function fromPuckArray(field: InspectorFieldDefinition, value: unknown): unknown {
  if (!Array.isArray(value)) return [];
  if (field.type === "string-list") {
    return value.map((item) => {
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        return typeof obj[ARRAY_ITEM_KEY] === "string" ? obj[ARRAY_ITEM_KEY] : "";
      }
      return typeof item === "string" ? item : "";
    });
  }
  return value;
}

function convertPropsFromPuck(type: string, props: Record<string, unknown>): Record<string, unknown> {
  const schema = getBlockInspectorSchema(type);
  if (!schema) return props;

  const next = { ...props };
  for (const field of schema.fields) {
    if (
      field.type === "string-list" ||
      field.type === "button-list" ||
      field.type === "stats-list" ||
      field.type === "logos-list"
    ) {
      next[field.key] = fromPuckArray(field, props[field.key]);
    }
  }
  return next;
}

export function normalizeBlockType(type: string): string | null {
  if (type === "stat") return "stats";
  return getAllBlockTypeIds().includes(type) ? type : null;
}

/** Pure conversion for server actions and editor; does not depend on React. */
export function puckDataToCanvasBlocks(data: Partial<Data>): CanvasBlock[] {
  const typedData = data as PuckDataLike;
  const content = Array.isArray(typedData.content) ? typedData.content : [];
  const zones = typedData.zones && typeof typedData.zones === "object" ? typedData.zones : {};
  const result: CanvasBlock[] = [];

  const visit = (nodes: PuckNode[], parentId?: string, zone?: string) => {
    nodes
      .filter((item): item is PuckNode => typeof item?.type === "string")
      .forEach((item, index) => {
        const normalizedType = normalizeBlockType(String(item.type));
        const type = normalizedType ?? "text";
        const rawProps = item.props && typeof item.props === "object" ? item.props : {};
        const canvasId =
          typeof item.id === "string"
            ? item.id
            : typeof rawProps.__canvasId === "string"
              ? (rawProps.__canvasId as string)
              : `${type}-${index}`;
        const { __canvasId, ...propsWithoutMeta } = rawProps;
        const { __parentId, __zone, ...propsClean } = propsWithoutMeta as Record<string, unknown>;
        void __canvasId;
        void __parentId;
        void __zone;

        const blockProps = convertPropsFromPuck(type, propsClean);
        if (parentId) {
          blockProps.__parentId = parentId;
          blockProps.__zone = zone ?? "children";
        }

        result.push({
          id: canvasId,
          type,
          props: blockProps,
        });

        const childZoneCandidates = Object.keys(zones).filter((zoneKey) => zoneKey.startsWith(`${canvasId}:`));
        for (const zoneKey of childZoneCandidates) {
          const zoneName = zoneKey.slice(canvasId.length + 1) || "children";
          const children = zones[zoneKey];
          if (!Array.isArray(children) || children.length === 0) continue;
          visit(children as PuckNode[], canvasId, zoneName);
        }
      });
  };

  visit(content);
  return result;
}
