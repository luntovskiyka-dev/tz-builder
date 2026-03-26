import { AutoField, FieldLabel, usePuck, type Config, type Data } from "@puckeditor/core";
import { getAllBlockTypeIds, getBlockInspectorSchema, getBlockLabel, getDefaultProps } from "@/lib/puckBlocks";
import type { CanvasBlock, InspectorFieldDefinition } from "@/lib/blockTypes";

type PuckNode = {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
};

const ARRAY_ITEM_KEY = "__item";

function toPuckArray(field: InspectorFieldDefinition, value: unknown): unknown {
  if (!Array.isArray(value)) return [];
  if (field.type === "string-list") {
    return value.map((item) => ({ [ARRAY_ITEM_KEY]: typeof item === "string" ? item : "" }));
  }
  return value;
}

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

function convertPropsForPuck(type: string, props: Record<string, unknown>): Record<string, unknown> {
  const schema = getBlockInspectorSchema(type);
  if (!schema) return props;

  const next = { ...props };
  for (const field of schema.fields) {
    if (field.type === "string-list" || field.type === "button-list" || field.type === "stats-list") {
      next[field.key] = toPuckArray(field, props[field.key]);
    }
  }
  return next;
}

function convertPropsFromPuck(type: string, props: Record<string, unknown>): Record<string, unknown> {
  const schema = getBlockInspectorSchema(type);
  if (!schema) return props;

  const next = { ...props };
  for (const field of schema.fields) {
    if (field.type === "string-list" || field.type === "button-list" || field.type === "stats-list") {
      next[field.key] = fromPuckArray(field, props[field.key]);
    }
  }
  return next;
}

function toPuckField(field: InspectorFieldDefinition): Record<string, unknown> {
  const label = field.label;
  const metadata = {
    visibilityKey: field.visibilityKey,
    visibleWhen: field.visibleWhen,
  };
  if (field.type === "text") return { type: "text", label, placeholder: field.placeholder, metadata };
  if (field.type === "textarea") return { type: "textarea", label, placeholder: field.placeholder, metadata };
  if (field.type === "number") return { type: "number", label, metadata };
  if (field.type === "radio") {
    return {
      type: "radio",
      label,
      options: (field.options ?? []).map((o) => ({ label: o.label, value: o.value })),
      metadata,
    };
  }
  if (field.type === "toggle") {
    return {
      type: "radio",
      label,
      options: [
        { label: "Да", value: true },
        { label: "Нет", value: false },
      ],
      metadata,
    };
  }
  if (field.type === "date") return { type: "text", label, placeholder: "YYYY-MM-DD", metadata };

  if (field.type === "string-list") {
    return {
      type: "array",
      label,
      arrayFields: {
        [ARRAY_ITEM_KEY]: { type: "text", label: "Значение" },
      },
      defaultItemProps: { [ARRAY_ITEM_KEY]: "" },
      metadata,
    };
  }
  if (field.type === "button-list") {
    return {
      type: "array",
      label,
      arrayFields: {
        text: { type: "text", label: "Текст" },
        url: { type: "text", label: "URL" },
      },
      defaultItemProps: { text: "", url: "" },
      metadata,
    };
  }
  if (field.type === "stats-list") {
    return {
      type: "array",
      label,
      arrayFields: {
        value: { type: "text", label: "Значение" },
        label: { type: "text", label: "Подпись" },
      },
      defaultItemProps: { value: "", label: "" },
      metadata,
    };
  }

  return { type: "text", label, metadata };
}

function buildFields(typeId: string): Record<string, unknown> {
  const schema = getBlockInspectorSchema(typeId);
  const source = schema?.fields ?? [];
  const fields: Record<string, unknown> = {};

  for (const field of source) {
    if (field.visibilityKey && !source.some((f) => f.key === field.visibilityKey) && !fields[field.visibilityKey]) {
      fields[field.visibilityKey] = {
        type: "radio",
        label: `Показывать: ${field.label}`,
        options: [
          { label: "Да", value: true },
          { label: "Нет", value: false },
        ],
      };
    }
    fields[field.key] = toPuckField(field);
  }

  return fields;
}

function renderTextSummary(props: Record<string, unknown>): string {
  const keys = ["title", "templateName", "text", "content", "copyright"];
  for (const key of keys) {
    const value = props[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return "Настройте свойства в панели справа";
}

const puckComponents: Record<string, any> = Object.fromEntries(
  getAllBlockTypeIds().map((typeId) => {
    const fields = buildFields(typeId);

    return [
      typeId,
      {
        label: getBlockLabel(typeId),
        defaultProps: convertPropsForPuck(typeId, getDefaultProps(typeId)),
        fields,
        render: (props: Record<string, unknown>) => (
          <section className="border-b border-border px-3 py-2">
            <div className="text-xs font-medium text-foreground">{getBlockLabel(typeId)}</div>
            <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
              {renderTextSummary(props)}
            </div>
          </section>
        ),
      },
    ];
  }),
);

function useShouldRenderField(field: any, id?: string): boolean {
  const { getItemById } = usePuck();
  const metadata = (field?.metadata ?? {}) as {
    visibilityKey?: string;
    visibleWhen?: { key: string; values: string[] };
  };
  if (!metadata.visibilityKey && !metadata.visibleWhen) return true;
  if (!id) return true;
  const item = getItemById(id);
  const props = (item?.props ?? {}) as Record<string, unknown>;

  const visibleByToggle = metadata.visibilityKey ? props[metadata.visibilityKey] !== false : true;
  const visibleByCondition = metadata.visibleWhen
    ? metadata.visibleWhen.values.includes(String(props[metadata.visibleWhen.key] ?? ""))
    : true;
  return visibleByToggle && visibleByCondition;
}

function BaseFieldType(props: any) {
  const { field, name, id, readOnly, value, onChange } = props;
  const visible = useShouldRenderField(field, id);
  if (!visible) return null;
  return (
    <FieldLabel label={field.label || name} readOnly={readOnly}>
      <AutoField field={field} value={value} onChange={onChange} />
    </FieldLabel>
  );
}

export const puckConfig: Config = {
  components: puckComponents,
};

export const puckOverrides = {
  fieldTypes: {
    text: BaseFieldType,
    textarea: BaseFieldType,
    number: BaseFieldType,
    radio: BaseFieldType,
    select: BaseFieldType,
    array: BaseFieldType,
  },
};

export function canvasBlocksToPuckData(blocks: CanvasBlock[]): Data {
  return {
    content: blocks.map((block) => ({
      id: block.id,
      type: block.type,
      props: {
        ...convertPropsForPuck(block.type, block.props ?? {}),
        __canvasId: block.id,
      },
    })),
    root: { props: {} },
  };
}

export function puckDataToCanvasBlocks(data: Partial<Data>): CanvasBlock[] {
  const content = Array.isArray(data.content) ? (data.content as PuckNode[]) : [];

  return content
    .filter((item): item is PuckNode => typeof item?.type === "string")
    .map((item, index) => {
      const type = String(item.type);
      const rawProps = item.props && typeof item.props === "object" ? item.props : {};
      const canvasId =
        typeof item.id === "string"
          ? item.id
          : typeof rawProps.__canvasId === "string"
            ? (rawProps.__canvasId as string)
            : `${type}-${index}`;
      const { __canvasId, ...propsWithoutMeta } = rawProps;
      void __canvasId;

      return {
        id: canvasId,
        type,
        props: convertPropsFromPuck(type, propsWithoutMeta),
      };
    });
}
