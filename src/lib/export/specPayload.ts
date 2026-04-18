import { getBlockInspectorSchema } from "@/lib/puckBlocks";

type RawBlock = {
  type?: unknown;
  props?: unknown;
};

/**
 * Visual props that renderers use but the inspector schema does not expose.
 * These would otherwise be lost when building the spec payload.
 */
const EXTRA_VISUAL_KEYS: Record<string, string[]> = {
  header: ["backgroundColor", "textColor"],
  footer: ["backgroundColor", "textColor"],
};

function normalizeProps(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

function normalizeScalar(value: unknown): unknown {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return null;
}

function collectExtraVisualProps(
  type: string,
  props: Record<string, unknown>,
  fieldKeys: Set<string>,
): Record<string, unknown> | null {
  const extraKeys = EXTRA_VISUAL_KEYS[type];
  if (!extraKeys) return null;

  const extra: Record<string, unknown> = {};
  let hasAny = false;

  for (const key of extraKeys) {
    if (fieldKeys.has(key)) continue;
    const val = props[key];
    if (val !== undefined && val !== null && val !== "") {
      extra[key] = val;
      hasAny = true;
    }
  }

  return hasAny ? extra : null;
}

export function buildStructuredSpecPayload(blocks: unknown[]): Array<Record<string, unknown>> {
  return blocks.map((raw, index) => {
    const block = (raw ?? {}) as RawBlock;
    const type = typeof block.type === "string" ? block.type : "unknown";
    const props = normalizeProps(block.props);
    const variant = typeof props.variant === "string" ? props.variant : undefined;
    const schema = getBlockInspectorSchema(type, { variant });

    if (!schema) {
      return {
        index: index + 1,
        type,
        props,
      };
    }

    const fields = schema.fields.map((field) => ({
      key: field.key,
      label: field.label,
      value: props[field.key] ?? null,
      visible:
        (field.visibilityKey ? props[field.visibilityKey] !== false : true) &&
        (field.visibleWhen
          ? field.visibleWhen.values.includes(String(props[field.visibleWhen.key] ?? ""))
          : true),
      valuePreview:
        field.type === "string-list" ||
        field.type === "button-list" ||
        field.type === "stats-list" ||
        field.type === "logos-list"
          ? Array.isArray(props[field.key])
            ? (props[field.key] as unknown[]).length
            : 0
          : normalizeScalar(props[field.key]),
    }));

    const fieldKeys = new Set(schema.fields.map((f) => f.key));
    const extraVisual = collectExtraVisualProps(type, props, fieldKeys);

    const result: Record<string, unknown> = {
      index: index + 1,
      type,
      variant: variant ?? null,
      fields,
    };

    if (extraVisual) {
      result.visualOverrides = extraVisual;
    }

    return result;
  });
}

