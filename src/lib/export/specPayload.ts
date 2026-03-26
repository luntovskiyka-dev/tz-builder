import { getBlockInspectorSchema } from "@/lib/puckBlocks";

type RawBlock = {
  type?: unknown;
  props?: unknown;
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
        field.type === "string-list" || field.type === "button-list" || field.type === "stats-list"
          ? Array.isArray(props[field.key])
            ? (props[field.key] as unknown[]).length
            : 0
          : normalizeScalar(props[field.key]),
    }));

    return {
      index: index + 1,
      type,
      variant: variant ?? null,
      fields,
    };
  });
}

