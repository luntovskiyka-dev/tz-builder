import { usePuck, type Config, type Data } from "@puckeditor/core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeBlockType } from "@/lib/puckDataToCanvasBlocks";
import type { ReactNode } from "react";
import { ChevronDown, PencilLine, PlusSquare } from "lucide-react";
import {
  blockTypeHasLayout,
  getAllBlockTypeIds,
  getBlockInspectorSchema,
  getBlockLabel,
  getDefaultProps,
  GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
  LAYOUT_OBJECT_SUBFIELDS,
} from "@/lib/puckBlocks";
import { CARD_LUCIDE_ICON_OPTIONS, DEFAULT_CARD_ICON } from "@/lib/cardLucideIcons";
import type { CanvasBlock, InspectorFieldDefinition } from "@/lib/blockTypes";
import { renderBlockPreview } from "@/lib/puckCanvas";
import {
  asString,
  getGridColumnCount,
  migrateHeadingLevel,
  migrateSpaceDirection,
} from "@/lib/puckCanvas/utils";

type PuckNode = {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
};

const ARRAY_ITEM_KEY = "__item";
const TEMPLATE_STORAGE_KEY = "puck-demo-templates:tz-builder";
const SAVE_TEMPLATE_VALUE = "__save_new__";

type StoredTemplate = {
  label: string;
  data: PuckNode[];
};

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cloneNodes(nodes: PuckNode[]): PuckNode[] {
  return JSON.parse(JSON.stringify(nodes)) as PuckNode[];
}

function readStoredTemplates(): Record<string, StoredTemplate> {
  if (!canUseLocalStorage()) return {};
  try {
    const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, StoredTemplate>;
  } catch {
    return {};
  }
}

function writeStoredTemplates(templates: Record<string, StoredTemplate>): void {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Best-effort persistence only.
  }
}

const TEMPLATE_INSPECTOR_LAYOUT_FIELD: Record<string, unknown> = {
  type: "object",
  label: "Layout",
  objectFields: {
    padding: {
      type: "select",
      label: "Vertical Padding",
      options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    },
  },
};

const DEFAULT_TEMPLATE_INSPECTOR_OPTIONS = [
  { label: "Blank", value: "blank" },
  { label: "Example 1", value: "example_1" },
  { label: "Example 2", value: "example_2" },
] as const;

/** Built-in presets (not stored in localStorage); never removable via Delete. */
const NON_REMOVABLE_TEMPLATE_IDS = new Set(
  DEFAULT_TEMPLATE_INSPECTOR_OPTIONS.map((o) => o.value as string),
);

function mergeTemplateInspectorOptions(
  field: { options?: Array<{ label: string; value: string }> } | undefined,
): Array<{ label: string; value: string }> {
  const base =
    field?.options && field.options.length > 0 ? field.options : [...DEFAULT_TEMPLATE_INSPECTOR_OPTIONS];
  const storedTemplates = readStoredTemplates();
  const dynamicOptions = Object.entries(storedTemplates).map(([value, item]) => ({
    value,
    label: item.label || value,
  }));
  const merged = [...base, ...dynamicOptions];
  return merged.filter(
    (option, index) => merged.findIndex((item) => item.value === option.value) === index,
  );
}

/** Single inspector field: Template select + save button (one `PuckFields-field`). */
function TemplateFieldWithSave(props: Record<string, unknown>) {
  const field = props.field as { options?: Array<{ label: string; value: string }> };
  const options = field.options ?? DEFAULT_TEMPLATE_INSPECTOR_OPTIONS;
  const valueRaw = props.value;
  const current = typeof valueRaw === "string" ? valueRaw : asString(valueRaw, "example_1");
  const onChange = props.onChange as (v: string) => void;
  const readOnly = props.readOnly as boolean | undefined;
  const label = props.label as string | undefined;
  const labelIcon = props.labelIcon as ReactNode | undefined;
  const Label = props.Label as React.ComponentType<Record<string, unknown>>;
  const id = props.id as string | undefined;
  const name = props.name as string | undefined;

  const { dispatch, selectedItem, getSelectorForId } = usePuck();
  const storedTemplates = readStoredTemplates();
  const canDeleteTemplate =
    current !== "blank" && !NON_REMOVABLE_TEMPLATE_IDS.has(current) && Boolean(storedTemplates[current]);

  const handleSaveNew = () => {
    if (!selectedItem || selectedItem.type !== "template") return;
    const p = selectedItem.props as Record<string, unknown>;
    const nodeId = typeof p.id === "string" ? p.id : undefined;
    if (!nodeId) return;
    const selector = getSelectorForId(nodeId);
    if (!selector) return;
    dispatch({
      type: "replace",
      destinationIndex: selector.index,
      destinationZone: selector.zone ?? "content",
      data: {
        type: "template",
        props: {
          ...p,
          id: nodeId,
          template: SAVE_TEMPLATE_VALUE,
        },
      },
    });
  };

  const handleDeleteTemplate = () => {
    if (!selectedItem || selectedItem.type !== "template" || !canDeleteTemplate) return;
    const p = selectedItem.props as Record<string, unknown>;
    const nodeId = typeof p.id === "string" ? p.id : undefined;
    if (!nodeId) return;
    const nextStored = { ...readStoredTemplates() };
    delete nextStored[current];
    writeStoredTemplates(nextStored);
    const selector = getSelectorForId(nodeId);
    if (!selector) return;
    dispatch({
      type: "replace",
      destinationIndex: selector.index,
      destinationZone: selector.zone ?? "content",
      data: {
        type: "template",
        props: {
          ...p,
          id: nodeId,
          template: "blank",
        },
      },
    });
  };

  return (
    <Label label={label || name} icon={labelIcon ?? <ChevronDown size={16} aria-hidden />} readOnly={readOnly}>
      <div className="flex flex-col gap-2">
        <select
          id={id}
          title={label || name}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs",
            "ring-offset-background focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          disabled={readOnly}
          value={current}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full text-xs border-foreground text-foreground hover:bg-muted/80 hover:text-foreground dark:border-foreground"
          onClick={handleSaveNew}
          disabled={readOnly}
        >
          Save new template
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full text-xs border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive dark:hover:bg-destructive/15"
          onClick={handleDeleteTemplate}
          disabled={readOnly || !canDeleteTemplate}
        >
          Delete template
        </Button>
      </div>
    </Label>
  );
}

function createTemplateNode(type: string, props: Record<string, unknown>): PuckNode {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    props,
  };
}

function buildTemplateContent(template: string): PuckNode[] {
  if (template === "blank") return [];
  if (template === "example_2") {
    return [
      createTemplateNode("heading", { text: "Template example", size: "xl", align: "left" }),
      createTemplateNode("text", {
        text: "Dynamically create components with template presets.",
        size: "m",
        color: "muted",
      }),
      createTemplateNode("button", { label: "Learn more", href: "#", variant: "secondary" }),
    ];
  }
  return [
    createTemplateNode("heading", { text: "Template example.", size: "xl", align: "left" }),
    createTemplateNode("text", {
      text: "This block uses slot content. Try switching template in the right panel.",
      size: "m",
      color: "muted",
    }),
  ];
}

function toPuckArray(field: InspectorFieldDefinition, value: unknown): unknown {
  if (!Array.isArray(value)) return [];
  if (field.type === "string-list") {
    return value.map((item) => ({ [ARRAY_ITEM_KEY]: typeof item === "string" ? item : "" }));
  }
  return value;
}

function convertPropsForPuck(type: string, props: Record<string, unknown>): Record<string, unknown> {
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
      next[field.key] = toPuckArray(field, props[field.key]);
    }
  }
  return next;
}

function applyDefaultProps(type: string, props: Record<string, unknown>): Record<string, unknown> {
  const defaults = getDefaultProps(type);
  return { ...defaults, ...props };
}

function toPuckField(field: InspectorFieldDefinition): Record<string, unknown> {
  const label = field.label;
  const metadata = {
    visibilityKey: field.visibilityKey,
    visibleWhen: field.visibleWhen,
  };
  if (field.type === "text") return { type: "text", label, placeholder: field.placeholder, metadata };
  if (field.type === "textarea") return { type: "textarea", label, placeholder: field.placeholder, metadata };
  if (field.type === "richtext") return { type: "richtext", label, metadata };
  if (field.type === "slot") return { type: "slot", label, metadata };
  if (field.type === "object") {
    const objectFields = Object.fromEntries(
      (field.objectFields ?? []).map((subField) => [subField.key, toPuckField(subField)]),
    );
    return { type: "object", label, objectFields, metadata };
  }
  if (field.type === "number") return { type: "number", label, metadata };
  if (field.type === "select") {
    return {
      type: "select",
      label,
      options: (field.options ?? []).map((o) => ({ label: o.label, value: o.value })),
      metadata,
    };
  }
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
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Href" },
        variant: { type: "text", label: "Variant" },
      },
      defaultItemProps: { label: "Button", href: "#", variant: "primary" },
      metadata,
    };
  }
  if (field.type === "stats-list") {
    return {
      type: "array",
      label,
      arrayFields: {
        title: { type: "text", label: "Title" },
        description: { type: "text", label: "Description" },
      },
      defaultItemProps: { title: "", description: "" },
      metadata,
    };
  }
  if (field.type === "logos-list") {
    return {
      type: "array",
      label,
      arrayFields: {
        alt: { type: "text", label: "Alt" },
        imageUrl: { type: "text", label: "Image URL" },
      },
      defaultItemProps: { alt: "", imageUrl: "" },
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

  if (typeId === "template") {
    fields.children = { type: "slot", label: "Items" };
  }

  if (typeId === "grid") {
    fields.items = { type: "slot", label: "Items", disallow: ["hero", "stats"] };
  }

  if (typeId === "flex") {
    fields.children = { type: "slot", label: "Items" };
  }

  return fields;
}

const LAYOUT_PROP_KEYS = ["spanCol", "spanRow", "grow", "padding"] as const;

/**
 * Which `layout` subfields to show depends on the parent component type (from Puck `resolveFields` `params.parent`).
 * Unknown parents (no layout context) hide the Layout group entirely.
 */
function getLayoutSubfieldsForParent(
  parent: { type?: string } | null | undefined,
): InspectorFieldDefinition[] | null {
  const parentType = parent?.type;
  if (parentType === "grid") {
    return LAYOUT_OBJECT_SUBFIELDS.filter((f) => ["spanCol", "spanRow", "padding"].includes(f.key));
  }
  if (parentType === "flex") {
    return LAYOUT_OBJECT_SUBFIELDS.filter((f) => ["grow", "padding"].includes(f.key));
  }
  if (parentType === "root" || parentType === "template" || parentType == null) {
    return LAYOUT_OBJECT_SUBFIELDS.filter((f) => f.key === "padding");
  }
  return null;
}

function applyLayoutFieldResolution(
  fields: Record<string, unknown>,
  parent: { type?: string } | null | undefined,
): Record<string, unknown> {
  const subfields = getLayoutSubfieldsForParent(parent);
  if (subfields === null) {
    const rest = { ...fields };
    delete rest.layout;
    return rest;
  }
  return {
    ...fields,
    layout: {
      type: "object",
      label: "Layout",
      objectFields: Object.fromEntries(subfields.map((sub) => [sub.key, toPuckField(sub)])),
    },
  };
}

function normalizeBlockLayoutProps(props: Record<string, unknown>): Record<string, unknown> {
  const next = { ...props };
  const fromNested =
    next.layout && typeof next.layout === "object" && !Array.isArray(next.layout)
      ? { ...(next.layout as Record<string, unknown>) }
      : {};

  const merged: Record<string, unknown> = { ...fromNested };
  for (const key of LAYOUT_PROP_KEYS) {
    if (Object.prototype.hasOwnProperty.call(next, key) && next[key] !== undefined) {
      merged[key] = next[key];
    }
  }

  for (const key of LAYOUT_PROP_KEYS) {
    delete next[key];
  }

  for (const key of ["spanCol", "spanRow", "grow"] as const) {
    const v = merged[key];
    if (v === "" || v === undefined) {
      delete merged[key];
      continue;
    }
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) merged[key] = n;
      else delete merged[key];
    } else if (typeof v === "number" && Number.isFinite(v)) {
      merged[key] = v;
    } else {
      delete merged[key];
    }
  }

  if (merged.padding !== undefined && merged.padding !== null && typeof merged.padding !== "string") {
    merged.padding = String(merged.padding);
  }

  next.layout = merged;
  return next;
}

const puckComponents = Object.fromEntries(
  getAllBlockTypeIds().map((typeId) => {
    const fields = buildFields(typeId);

    return [
      typeId,
      {
        label: getBlockLabel(typeId),
        defaultProps: convertPropsForPuck(typeId, getDefaultProps(typeId)),
        fields,
        resolveData: (
          data: { props?: Record<string, unknown> },
          params?: { changed?: Record<string, boolean>; trigger?: string },
        ) => {
          const props = data?.props && typeof data.props === "object" ? data.props : {};
          const normalizedProps = normalizeComponentProps(typeId, props);

          if (typeId === "template") {
            const template = asString(normalizedProps.template, "example_1");
            const currentChildren = Array.isArray(normalizedProps.children)
              ? (normalizedProps.children as PuckNode[])
              : [];
            const templateChanged = Boolean(params?.changed?.template);
            const shouldHydrate = templateChanged && params?.trigger !== "load";
            const storedTemplates = readStoredTemplates();

            if (templateChanged && template === SAVE_TEMPLATE_VALUE) {
              const templateId = `custom_${Date.now()}`;
              const nextTemplates = {
                ...storedTemplates,
                [templateId]: {
                  label: new Date().toLocaleString(),
                  data: cloneNodes(currentChildren),
                },
              };
              writeStoredTemplates(nextTemplates);
              return {
                props: {
                  ...normalizedProps,
                  template: templateId,
                  children: cloneNodes(currentChildren),
                },
              };
            }

            if (shouldHydrate || !Array.isArray(normalizedProps.children)) {
              const fromStorage = storedTemplates[template];
              return {
                props: {
                  ...normalizedProps,
                  children: fromStorage ? cloneNodes(fromStorage.data) : buildTemplateContent(template),
                },
              };
            }
          }

          return { props: normalizedProps };
        },
        resolveFields: (
          data: { props?: Record<string, unknown> },
          params: {
            fields: Record<string, unknown>;
            parent: { type?: string; props?: Record<string, unknown> } | null;
          },
        ) => {
          const { fields, parent } = params;

          if (typeId === "hero") {
            const align = asString(data?.props?.align, "left");
            if (align === "center") {
              return {
                ...fields,
                image: undefined,
              };
            }
          }

          if (typeId === "template") {
            const rawTemplate = fields.template as
              | { type?: string; options?: Array<{ label: string; value: string }> }
              | undefined;
            const optionSource =
              rawTemplate?.options && rawTemplate.options.length > 0 ? rawTemplate : undefined;
            const uniqueOptions = mergeTemplateInspectorOptions(optionSource);
            return {
              template: {
                type: "custom",
                label: "Template",
                render: TemplateFieldWithSave,
                options: uniqueOptions,
              },
              children: fields.children,
              layout: TEMPLATE_INSPECTOR_LAYOUT_FIELD,
            };
          }

          if (typeId === "heading") {
            return {
              ...fields,
              layout: {
                type: "object",
                label: "Layout",
                objectFields: {
                  padding: {
                    type: "select",
                    label: "Vertical Padding",
                    options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS.map((option) => ({
                      label: option.label,
                      value: option.value,
                    })),
                  },
                },
              },
            };
          }

          if (typeId === "text") {
            return {
              ...fields,
              layout: {
                type: "object",
                label: "Layout",
                objectFields: {
                  padding: {
                    type: "select",
                    label: "Vertical Padding",
                    options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS.map((option) => ({
                      label: option.label,
                      value: option.value,
                    })),
                  },
                },
              },
            };
          }

          if (typeId === "card") {
            return {
              ...fields,
              layout: {
                type: "object",
                label: "Layout",
                objectFields: {
                  padding: {
                    type: "select",
                    label: "Vertical Padding",
                    options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS.map((option) => ({
                      label: option.label,
                      value: option.value,
                    })),
                  },
                },
              },
            };
          }

          if (typeId === "richtext") {
            return {
              ...fields,
              layout: {
                type: "object",
                label: "Layout",
                objectFields: {
                  padding: {
                    type: "select",
                    label: "Vertical Padding",
                    options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS.map((option) => ({
                      label: option.label,
                      value: option.value,
                    })),
                  },
                },
              },
            };
          }

          if (blockTypeHasLayout(typeId)) {
            return applyLayoutFieldResolution(fields, parent);
          }

          return fields;
        },
        render: (props: Record<string, unknown>) => (
          <div className="px-4 py-6 sm:px-6 first:pt-8 last:pb-10">
            {renderBlockPreview(typeId, props)}
          </div>
        ),
      },
    ];
  }),
) as Config["components"];

function normalizeComponentProps(type: string, props: Record<string, unknown>): Record<string, unknown> {
  const withDefaults = applyDefaultProps(type, props);

  if (type === "hero") {
    const { imageUrl, imageMode, ...rest } = withDefaults;
    const legacyUrl = asString(imageUrl);
    const legacyMode = asString(imageMode, "inline");
    const imageObject =
      rest.image && typeof rest.image === "object"
        ? (rest.image as Record<string, unknown>)
        : {
            url: legacyUrl,
            mode: legacyMode,
            content: [],
          };

    const align = asString(rest.align, "left");
    let next: Record<string, unknown> =
      align === "center"
        ? { ...rest, image: { ...imageObject, mode: "inline" } }
        : { ...rest, image: imageObject };

    if (Array.isArray(next.buttons)) {
      next = { ...next, buttons: (next.buttons as unknown[]).slice(0, 4) };
    }
    return next;
  }

  if (type === "logos") {
    const logos = withDefaults.logos;
    if (!Array.isArray(logos)) return withDefaults;
    const migrated = logos.map((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return { alt: "", imageUrl: "" };
      const o = row as Record<string, unknown>;
      if ("alt" in o || "imageUrl" in o) {
        return { alt: asString(o.alt), imageUrl: asString(o.imageUrl) };
      }
      return { alt: asString(o.text ?? o.label), imageUrl: asString(o.url ?? o.href) };
    });
    return { ...withDefaults, logos: migrated };
  }

  if (type === "stats") {
    const items = withDefaults.items;
    if (!Array.isArray(items)) return withDefaults;
    const migrated = items.map((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return { title: "", description: "" };
      const o = row as Record<string, unknown>;
      if ("title" in o || "description" in o) {
        return { title: asString(o.title), description: asString(o.description) };
      }
      return { title: asString(o.value), description: asString(o.label) };
    });
    return { ...withDefaults, items: migrated };
  }

  if (type === "template") {
    const merged = { ...withDefaults } as Record<string, unknown>;
    if (Array.isArray(merged.content) && (!Array.isArray(merged.children) || (merged.children as unknown[]).length === 0)) {
      merged.children = merged.content;
    }
    delete merged.content;
    return normalizeBlockLayoutProps(merged);
  }

  if (type === "grid") {
    return normalizeBlockLayoutProps({
      ...withDefaults,
      numColumns: getGridColumnCount(withDefaults.numColumns),
    });
  }

  if (type === "flex") {
    return normalizeBlockLayoutProps(withDefaults);
  }

  if (type === "space") {
    return {
      ...withDefaults,
      direction: migrateSpaceDirection(withDefaults.direction),
    };
  }

  if (type === "heading") {
    return normalizeBlockLayoutProps({
      ...withDefaults,
      level: migrateHeadingLevel(withDefaults.level),
    });
  }

  if (type === "card") {
    const layoutNorm = normalizeBlockLayoutProps(withDefaults);
    const icon = asString(layoutNorm.icon, DEFAULT_CARD_ICON);
    const allowed = new Set(CARD_LUCIDE_ICON_OPTIONS.map((o) => o.value));
    return { ...layoutNorm, icon: allowed.has(icon) ? icon : DEFAULT_CARD_ICON };
  }

  if (blockTypeHasLayout(type)) {
    return normalizeBlockLayoutProps(withDefaults);
  }

  return withDefaults;
}

/** Puck indexes nodes by `props.id` (LayerTree). Mirror node `id` into props when missing. */
function ensureComponentPropsId(
  item: PuckNode,
  normalizedProps: Record<string, unknown>,
): Record<string, unknown> {
  const existing = normalizedProps.id;
  if (typeof existing === "string" && existing.length > 0) {
    return normalizedProps;
  }
  const topId = typeof item.id === "string" ? item.id : undefined;
  if (topId) {
    return { ...normalizedProps, id: topId };
  }
  return normalizedProps;
}

export function normalizePuckData(data: Data): Data {
  const content = Array.isArray(data.content) ? data.content : [];
  const normalizedContent = content.map((item) => {
    const rawType = typeof item?.type === "string" ? item.type : "";
    const type = normalizeBlockType(rawType) ?? rawType;
    const props = item?.props && typeof item.props === "object" ? item.props : {};
    const normalizedProps = normalizeComponentProps(type, props as Record<string, unknown>);
    const propsWithId = ensureComponentPropsId(item as PuckNode, normalizedProps);
    return { ...item, type, props: propsWithId };
  });
  const zones = data.zones && typeof data.zones === "object" ? data.zones : {};
  const normalizedZones: Record<string, PuckNode[]> = {};
  for (const [zoneKey, zoneContent] of Object.entries(zones)) {
    if (!Array.isArray(zoneContent)) continue;
    normalizedZones[zoneKey] = zoneContent.map((item) => {
      const rawType = typeof item?.type === "string" ? item.type : "";
      const type = normalizeBlockType(rawType) ?? rawType;
      const props = item?.props && typeof item.props === "object" ? item.props : {};
      const normalizedProps = normalizeComponentProps(type, props as Record<string, unknown>);
      const propsWithId = ensureComponentPropsId(item as PuckNode, normalizedProps);
      return { ...item, type, props: propsWithId };
    });
  }

  // Backward compatibility: migrate legacy grid zone "{gridId}:children" into "{gridId}:items"
  for (const node of normalizedContent as PuckNode[]) {
    const nodeId =
      typeof node.id === "string"
        ? node.id
        : typeof node.props?.id === "string"
          ? node.props.id
          : typeof node.props?.__canvasId === "string"
            ? node.props.__canvasId
            : "";
    if (!nodeId || node.type !== "grid") continue;
    const legacyZone = `${nodeId}:children`;
    const itemsZone = `${nodeId}:items`;
    if (!Array.isArray(normalizedZones[legacyZone]) || normalizedZones[legacyZone].length === 0) continue;
    const existingItems = Array.isArray(normalizedZones[itemsZone]) ? normalizedZones[itemsZone] : [];
    normalizedZones[itemsZone] = [...existingItems, ...normalizedZones[legacyZone]];
    delete normalizedZones[legacyZone];
  }

  // Merge legacy per-column zones "{gridId}:col-N" into "{gridId}:items" (order: col-1, col-2, …)
  const colZonePattern = /^([^:]+):col-(\d+)$/;
  const colZonesByGrid = new Map<string, Array<{ col: number; key: string }>>();
  for (const zoneKey of Object.keys(normalizedZones)) {
    const match = zoneKey.match(colZonePattern);
    if (!match) continue;
    const gridId = match[1];
    const col = Number(match[2]);
    if (!Number.isFinite(col)) continue;
    const list = colZonesByGrid.get(gridId) ?? [];
    list.push({ col, key: zoneKey });
    colZonesByGrid.set(gridId, list);
  }
  for (const [, entries] of colZonesByGrid) {
    entries.sort((a, b) => a.col - b.col);
  }
  for (const [gridId, entries] of colZonesByGrid) {
    const merged: PuckNode[] = [];
    for (const { key } of entries) {
      const zoneContent = normalizedZones[key];
      if (Array.isArray(zoneContent)) merged.push(...(zoneContent as PuckNode[]));
    }
    if (merged.length === 0) continue;
    const itemsKey = `${gridId}:items`;
    const existingItems = Array.isArray(normalizedZones[itemsKey]) ? (normalizedZones[itemsKey] as PuckNode[]) : [];
    normalizedZones[itemsKey] = [...existingItems, ...merged];
    for (const { key } of entries) {
      delete normalizedZones[key];
    }
  }

  function collectNodeIdToType(content: PuckNode[], zones: Record<string, unknown>): Map<string, string> {
    const map = new Map<string, string>();
    const visit = (nodes: PuckNode[]) => {
      for (const n of nodes) {
        const id = typeof n.id === "string" ? n.id : "";
        const t = typeof n.type === "string" ? n.type : "";
        if (id && t) map.set(id, t);
      }
    };
    visit(content);
    for (const nodes of Object.values(zones)) {
      if (Array.isArray(nodes)) visit(nodes as PuckNode[]);
    }
    return map;
  }

  const idTypes = collectNodeIdToType(normalizedContent as PuckNode[], normalizedZones);
  for (const key of Object.keys(normalizedZones)) {
    const m = key.match(/^([^:]+):content$/);
    if (!m) continue;
    const parentId = m[1];
    if (idTypes.get(parentId) !== "template") continue;
    const targetKey = `${parentId}:children`;
    const fromLegacy = Array.isArray(normalizedZones[key]) ? (normalizedZones[key] as PuckNode[]) : [];
    const existing = Array.isArray(normalizedZones[targetKey]) ? (normalizedZones[targetKey] as PuckNode[]) : [];
    normalizedZones[targetKey] = [...existing, ...fromLegacy];
    delete normalizedZones[key];
  }

  const existingRoot =
    data.root && typeof data.root === "object" && !Array.isArray(data.root) ? data.root : {};
  const existingRootProps =
    "props" in existingRoot &&
    existingRoot.props &&
    typeof existingRoot.props === "object" &&
    !Array.isArray(existingRoot.props)
      ? (existingRoot.props as Record<string, unknown>)
      : {};

  return {
    ...data,
    content: normalizedContent as Data["content"],
    zones: normalizedZones as Data["zones"],
    root: {
      ...existingRoot,
      props: { title: "", ...existingRootProps },
    },
  };
}

type FieldWithMetadata = {
  metadata?: { visibilityKey?: string; visibleWhen?: { key: string; values: string[] } };
};

function useShouldRenderField(field: FieldWithMetadata | null | undefined, id?: string): boolean {
  const puck = usePuck() as { getItemById?: (id: string) => { props?: Record<string, unknown> } | undefined } | null;
  const metadata = (field?.metadata ?? {}) as {
    visibilityKey?: string;
    visibleWhen?: { key: string; values: string[] };
  };
  if (!metadata.visibilityKey && !metadata.visibleWhen) return true;
  if (!id) return true;
  if (!puck || typeof puck.getItemById !== "function") return true;

  let item: { props?: Record<string, unknown> } | undefined;
  try {
    item = puck.getItemById(id);
  } catch {
    // Puck store may be transiently unavailable during mount/reload.
    return true;
  }
  const props = (item?.props ?? {}) as Record<string, unknown>;

  const visibleByToggle = metadata.visibilityKey ? props[metadata.visibilityKey] !== false : true;
  const visibleByCondition = metadata.visibleWhen
    ? metadata.visibleWhen.values.includes(String(props[metadata.visibleWhen.key] ?? ""))
    : true;
  return visibleByToggle && visibleByCondition;
}

function BaseFieldType(props: { field: FieldWithMetadata; id?: string; children?: ReactNode }) {
  const { field, id, children } = props;
  const visible = useShouldRenderField(field, id);
  if (!visible) return null;
  return children ?? null;
}

/** Right inspector: show fields only when a block is selected; empty canvas → empty panel (see Dashboard `PuckSelectionShell` + globals.css). */
function InspectorFieldsWhenSelected({ children }: { children: ReactNode }) {
  const { selectedItem } = usePuck();
  if (!selectedItem) {
    return (
      <div className="relative h-full min-h-[calc(100dvh-10rem)] w-full">
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="flex max-w-[220px] flex-col items-center gap-2 text-center">
            <div className="rounded-md border border-border p-1.5 text-muted-foreground">
              <PencilLine className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs text-muted-foreground">
              Выберите блок на канвасе
              <br />
              чтобы настроить его параметры
            </p>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

/** Single empty-state hint inside the page root (not the Puck preview chrome → avoids duplicate overlays). */
function RootWithEmptyHint({ children }: { children?: ReactNode }) {
  const { appState } = usePuck();
  const isEmpty = (appState.data.content?.length ?? 0) === 0;
  return (
    <div className="relative isolate flex min-h-full min-h-0 flex-col bg-background">
      {isEmpty && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4"
          aria-hidden
        >
          <div className="flex max-w-xl flex-col items-center gap-3 text-center">
            <div className="rounded-lg border border-border p-2 text-muted-foreground">
              <PlusSquare className="h-5 w-5" />
            </div>
            <p className="text-2xl font-medium leading-tight text-foreground">Начните с добавления блока</p>
            <p className="text-xl leading-relaxed text-muted-foreground">
              Перетащите любой блок из
              <br />
              библиотеки слева на эту область
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

const puckCategories: NonNullable<Config["categories"]> = {
  chrome: { title: "Chrome", components: ["header", "footer"] },
  layout: { title: "Layout", components: ["grid", "flex", "space"] },
  typography: { title: "Typography", components: ["heading", "text", "richtext"] },
  interactive: { title: "Actions", components: ["button"] },
  other: { title: "Other", components: ["card", "hero", "logos", "stats", "template"] },
};

export const puckConfig: Config = {
  categories: puckCategories,
  components: puckComponents,
  root: {
    fields: {},
    defaultProps: {},
    render: ({ children }: { children?: ReactNode }) => <RootWithEmptyHint>{children}</RootWithEmptyHint>,
  },
};

export const puckOverrides = {
  fieldTypes: {
    text: BaseFieldType,
    textarea: BaseFieldType,
    richtext: BaseFieldType,
    number: BaseFieldType,
    radio: BaseFieldType,
    select: BaseFieldType,
    array: BaseFieldType,
    object: BaseFieldType,
    slot: BaseFieldType,
    /** Do not override `custom`: Puck must use `field.render`; a wrapper breaks custom fields. */
  },
  fields: InspectorFieldsWhenSelected,
};

export function canvasBlocksToPuckData(blocks: CanvasBlock[]): Data {
  const childrenByZone = new Map<string, PuckNode[]>();
  const rootNodes: PuckNode[] = [];

  for (const block of blocks) {
    const normalizedType = normalizeBlockType(block.type);
    if (!normalizedType) continue;

    const rawProps = (block.props ?? {}) as Record<string, unknown>;
    const parentId = typeof rawProps.__parentId === "string" ? rawProps.__parentId : "";
    const zone = typeof rawProps.__zone === "string" ? rawProps.__zone : "children";
    const propsWithoutTreeMeta = { ...rawProps };
    delete propsWithoutTreeMeta.__parentId;
    delete propsWithoutTreeMeta.__zone;

    const node: PuckNode = {
      id: block.id,
      type: normalizedType,
      props: {
        ...convertPropsForPuck(normalizedType, propsWithoutTreeMeta),
        __canvasId: block.id,
        id: block.id,
      },
    };

    if (!parentId) {
      rootNodes.push(node);
      continue;
    }

    const zoneKey = `${parentId}:${zone}`;
    const list = childrenByZone.get(zoneKey) ?? [];
    list.push(node);
    childrenByZone.set(zoneKey, list);
  }

  return normalizePuckData({
    content: rootNodes as Data["content"],
    zones: Object.fromEntries(childrenByZone.entries()) as Data["zones"],
    root: { props: { title: "" } },
  });
}

export { puckDataToCanvasBlocks } from "@/lib/puckDataToCanvasBlocks";
