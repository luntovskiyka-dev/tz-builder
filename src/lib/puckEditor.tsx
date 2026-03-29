import { usePuck, type Config, type Data } from "@puckeditor/core";
import { normalizeBlockType } from "@/lib/puckDataToCanvasBlocks";
import type { ComponentType, ReactNode } from "react";
import {
  Box,
  CheckCircle,
  Circle,
  Cpu,
  Feather,
  Globe,
  Heart,
  Layers,
  LayoutGrid,
  Lightbulb,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import {
  blockTypeHasLayout,
  getAllBlockTypeIds,
  getBlockInspectorSchema,
  getBlockLabel,
  getDefaultProps,
  LAYOUT_OBJECT_SUBFIELDS,
} from "@/lib/puckBlocks";
import { CARD_LUCIDE_ICON_OPTIONS, DEFAULT_CARD_ICON } from "@/lib/cardLucideIcons";
import type { CanvasBlock, InspectorFieldDefinition } from "@/lib/blockTypes";

const CARD_LUCIDE_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Feather,
  Sparkles,
  Zap,
  Star,
  Heart,
  Shield,
  Rocket,
  Lightbulb,
  CheckCircle,
  Box,
  Layers,
  LayoutGrid,
  Users,
  Globe,
  Cpu,
};

function CardLucidePreview({ name }: { name: string }) {
  const Cmp = CARD_LUCIDE_MAP[name] ?? Circle;
  return <Cmp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
}

type PuckNode = {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
};

type PuckDataLike = Partial<Data> & {
  content?: PuckNode[];
  zones?: Record<string, PuckNode[]>;
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

function renderTextSummary(props: Record<string, unknown>): string {
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

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Migrates legacy `"1"`…`"6"` to semantic `h1`…`h6`; empty stays unset. */
function migrateHeadingLevel(value: unknown): string {
  if (value === "" || value === undefined || value === null) return "";
  const s = String(value).trim();
  if (/^h[1-6]$/i.test(s)) return s.toLowerCase();
  if (/^[1-6]$/.test(s)) return `h${s}`;
  return "";
}

/** Migrates legacy empty string for "both" to explicit `both`. */
function migrateSpaceDirection(value: unknown): string {
  if (value === "" || value === undefined || value === null) return "both";
  const s = String(value);
  if (s === "vertical" || s === "horizontal" || s === "both") return s;
  return "both";
}

function getGridColumnCount(raw: unknown): number {
  const value = asNumber(raw, 4);
  return Math.min(12, Math.max(1, Math.round(value)));
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
  if (parentType === "root" || parentType === "template") {
    return LAYOUT_OBJECT_SUBFIELDS.filter((f) => f.key === "padding");
  }
  if (parentType === undefined || parentType === null) {
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
    const { layout: _removed, ...rest } = fields;
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

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asButtonList(value: unknown): Array<{ text: string; url: string }> {
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
function asLogosList(value: unknown): Array<{ alt: string; imageUrl: string }> {
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

function asStatsList(value: unknown): Array<{ title: string; description: string }> {
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

function renderBlockPreview(typeId: string, props: Record<string, unknown>) {
  const puckCtx = (props as { puck?: { renderDropZone?: (args: { zone: string }) => ReactNode } }).puck;
  const blockId = asString((props as { id?: unknown }).id);
  const renderDropZone = (
    name: string,
    className = "rounded border border-dashed border-border/70 bg-muted/10 p-2 text-xs",
    options?: { disallow?: string[] },
  ) => {
    if (!puckCtx || typeof puckCtx.renderDropZone !== "function" || !blockId) return null;
    return (
      <div className={className}>
        {puckCtx.renderDropZone({
          zone: `${blockId}:${name}`,
          ...(options?.disallow && options.disallow.length > 0 ? { disallow: options.disallow } : {}),
        })}
      </div>
    );
  };

  if (typeId === "heading") {
    const text = asString(props.text, "Заголовок");
    const size = asString(props.size, "m");
    const level = asString(props.level, "");
    const layoutObj =
      props.layout && typeof props.layout === "object" && !Array.isArray(props.layout)
        ? (props.layout as Record<string, unknown>)
        : {};
    const padding = asString(layoutObj.padding, "");
    const className =
      size === "xxxl" || size === "xxl"
        ? "text-2xl font-semibold"
        : size === "xl" || size === "l"
          ? "text-xl font-semibold"
          : "text-lg font-medium";
    const semantic = /^h[1-6]$/.test(level) ? level : null;
    const Tag = (semantic ?? "h3") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return (
      <Tag className={className} style={padding ? { padding } : undefined}>
        {text}
      </Tag>
    );
  }

  if (typeId === "text" || typeId === "richtext") {
    const content = asString(props.text || props.richtext || props.content, "Текстовый блок");
    const layoutObj =
      props.layout && typeof props.layout === "object" && !Array.isArray(props.layout)
        ? (props.layout as Record<string, unknown>)
        : {};
    const padding = asString(layoutObj.padding, "");
    return (
      <p
        className="text-sm leading-relaxed text-muted-foreground"
        style={padding ? { padding } : undefined}
      >
        {content}
      </p>
    );
  }

  if (typeId === "button") {
    const text = asString(props.label, "Кнопка");
    const variant = asString(props.variant, "primary");
    const classes =
      variant === "ghost"
        ? "border border-border bg-transparent text-foreground"
        : variant === "secondary"
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary text-primary-foreground";
    return (
      <button type="button" className={`rounded-md px-3 py-1.5 text-xs font-medium ${classes}`}>
        {text}
      </button>
    );
  }

  if (typeId === "hero") {
    const title = asString(props.title, "Заголовок секции");
    const text = asString(props.description, "Описание секции");
    const quote = asString(props.quote, "");
    const align = asString(props.align, "left");
    const imageObj = props.image && typeof props.image === "object" ? (props.image as Record<string, unknown>) : {};
    const imageUrl = asString(imageObj.url);
    const imageMode = asString(imageObj.mode, "inline");
    const buttons = asButtonList(props.buttons);
    return (
      <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
        <h3 className={`text-lg font-semibold ${align === "center" ? "text-center" : ""}`}>{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
        {quote ? (
          <blockquote className="border-l-2 border-primary/40 pl-3 text-xs italic text-muted-foreground">{quote}</blockquote>
        ) : null}
        {align !== "center" && imageUrl ? (
          <div className="h-24 rounded border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
            {`Image (${imageMode})`}
          </div>
        ) : null}
        {buttons.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {buttons.slice(0, 4).map((btn, i) => (
              <span key={`${btn.text}-${i}`} className="rounded-md bg-primary px-2.5 py-1 text-[11px] text-primary-foreground">
                {btn.text || "Кнопка"}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (typeId === "flex") {
    const direction = asString(props.direction, "row");
    const justify = asString(props.justifyContent, "start");
    return (
      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
        <div className="text-[11px] text-muted-foreground">{`Flex: ${direction} / ${justify}`}</div>
        {renderDropZone("children")}
      </div>
    );
  }

  if (typeId === "grid") {
    const count = getGridColumnCount(props.numColumns);
    return (
      <div className="space-y-2">
        <div className="text-[10px] text-muted-foreground">{`Сетка: ${count} колонок · слот items`}</div>
        {renderDropZone("items", "min-h-[72px] rounded border border-dashed border-border bg-muted/20 p-2 text-xs", {
          disallow: ["hero", "stats"],
        })}
      </div>
    );
  }

  if (typeId === "logos") {
    const logos = asLogosList(props.logos);
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Logos</div>
        <div className="grid grid-cols-4 gap-2">
          {logos.slice(0, 8).map((logo, i) => (
            <div
              key={`${logo.imageUrl}-${i}`}
              className="flex h-12 items-center justify-center overflow-hidden rounded border border-border bg-muted/20"
              title={logo.alt || "logo"}
            >
              {logo.imageUrl ? (
                <img src={logo.imageUrl} alt={logo.alt || ""} className="max-h-full max-w-full object-contain p-1" />
              ) : (
                <span className="px-2 text-center text-[10px] text-muted-foreground">{logo.alt || "logo"}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (typeId === "stats") {
    const stats = asStatsList(props.items);
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Stats</div>
        <div className="grid grid-cols-2 gap-2">
          {stats.slice(0, 4).map((item, i) => (
            <div key={`${item.title}-${item.description}-${i}`} className="rounded border border-border bg-muted/20 p-2">
              <div className="text-sm font-semibold">{item.title || "—"}</div>
              <div className="text-[11px] text-muted-foreground">{item.description || ""}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (typeId === "card") {
    const title = asString(props.title, "Title");
    const description = asString(props.description, "Description");
    const iconName = asString(props.icon, DEFAULT_CARD_ICON);
    const mode = asString(props.mode, "flat");
    return (
      <div
        className={`space-y-2 rounded-lg p-3 ${
          mode === "card" ? "border border-border bg-background shadow-sm" : "border border-transparent bg-muted/20"
        }`}
      >
        <div className="flex items-start gap-2">
          <CardLucidePreview name={iconName} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
          </div>
        </div>
      </div>
    );
  }

  if (typeId === "template") {
    const template = asString(props.template, "example_1");
    const ChildrenSlot = (props as { children?: ((args?: Record<string, unknown>) => ReactNode) | unknown }).children;
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/10 p-3">
        <div className="text-sm font-medium">{`Template: ${template}`}</div>
        <div className="text-[11px] text-muted-foreground">Slot: children</div>
        <div className="rounded border border-dashed border-primary/40 bg-background/60 p-2">
          {typeof ChildrenSlot === "function" ? ChildrenSlot() : renderDropZone("children")}
        </div>
      </div>
    );
  }

  if (typeId === "header") {
    const logoText = asString(props.logoText, "Logo");
    const logoImageUrl = asString(props.logoImageUrl);
    const logoHref = asString(props.logoHref, "/");
    const nav = asButtonList(props.navItems);
    const behavior = asString(props.behavior, "static");
    const bg = asString(props.backgroundColor);
    const fg = asString(props.textColor);
    const ctaLabel = asString(props.ctaLabel);
    const ctaHref = asString(props.ctaHref);
    const alignNav = asString(props.alignNav, "end");
    const showMobile = props.showMobileMenu !== false;
    const justify =
      alignNav === "start" ? "justify-start" : alignNav === "center" ? "justify-center" : "justify-end";
    return (
      <div
        className="space-y-2 rounded-lg border border-border p-3 text-xs"
        style={{
          ...(bg ? { backgroundColor: bg } : {}),
          ...(fg ? { color: fg } : {}),
        }}
      >
        <div className={`flex flex-wrap items-center gap-2 ${justify}`}>
          <div className="flex min-w-0 items-center gap-2">
            {logoImageUrl ? (
              <span className="block h-7 w-16 shrink-0 overflow-hidden rounded bg-muted/40">
                <img src={logoImageUrl} alt="" className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="truncate font-semibold">{logoText}</span>
            )}
            <span className="text-[10px] text-muted-foreground">{logoHref}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {nav.slice(0, 6).map((item, i) => (
              <span key={`${item.url}-${i}`} className="text-[11px] underline-offset-2 opacity-90">
                {item.text || "Link"}
              </span>
            ))}
          </div>
          {ctaLabel ? (
            <span className="rounded-md bg-primary px-2 py-1 text-[11px] text-primary-foreground">{ctaLabel}</span>
          ) : null}
          {showMobile ? <span className="text-[10px] text-muted-foreground">☰</span> : null}
        </div>
        <div className="text-[10px] text-muted-foreground">{`Behavior: ${behavior}`}</div>
      </div>
    );
  }

  if (typeId === "footer") {
    const columns = asStatsList(props.columns);
    const copyright = asString(props.copyright, "©");
    const bg = asString(props.backgroundColor);
    const fg = asString(props.textColor);
    const paddingY = asString(props.paddingY, "48px");
    const social = asButtonList(props.socialLinks);
    const newsletter = props.newsletter === true;
    const ph = asString(props.newsletterPlaceholder, "Email");
    return (
      <div
        className="space-y-3 rounded-lg border border-border p-3 text-xs"
        style={{
          ...(bg ? { backgroundColor: bg } : {}),
          ...(fg ? { color: fg } : {}),
          paddingTop: paddingY,
          paddingBottom: paddingY,
        }}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {columns.slice(0, 6).map((col, i) => (
            <div key={`${col.title}-${i}`} className="min-w-0">
              <div className="text-[11px] font-semibold">{col.title || "—"}</div>
              <div className="line-clamp-2 text-[10px] text-muted-foreground">{col.description}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2">
          <span className="text-[11px] text-muted-foreground">{copyright}</span>
          {social.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {social.slice(0, 5).map((s, i) => (
                <span key={`${s.url}-${i}`} className="text-[10px]">
                  {s.text || "Social"}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {newsletter ? (
          <div className="rounded border border-dashed border-border/70 bg-muted/20 px-2 py-1.5 text-[10px] text-muted-foreground">
            Newsletter · {ph}
          </div>
        ) : null}
      </div>
    );
  }

  if (typeId === "space") {
    const raw = asString(props.size, "24px");
    const parsed = Number.parseInt(raw, 10);
    const sizePx = Number.isFinite(parsed) ? parsed : 24;
    const bounded = Math.max(8, Math.min(160, sizePx));
    const dir = migrateSpaceDirection(props.direction);
    const boxClass =
      "rounded border border-dashed border-border bg-muted/10 text-[10px] text-muted-foreground flex items-center justify-center";
    if (dir === "horizontal") {
      return (
        <div className={boxClass} style={{ width: `${bounded}px`, minHeight: 12 }}>
          {`Space ${raw}`}
        </div>
      );
    }
    if (dir === "vertical") {
      return (
        <div className={boxClass} style={{ height: `${bounded}px`, lineHeight: `${bounded}px` }}>
          {`Space ${raw}`}
        </div>
      );
    }
    return (
      <div
        className={boxClass}
        style={{ width: `${bounded}px`, height: `${bounded}px` }}
      >{`Space ${raw}`}</div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-foreground">{getBlockLabel(typeId)}</div>
      <div className="text-[11px] text-muted-foreground line-clamp-2">{renderTextSummary(props)}</div>
    </div>
  );
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
            const field = fields.template as
              | { type?: string; options?: Array<{ label: string; value: string }> }
              | undefined;
            if (!field || (field.type !== "select" && field.type !== "radio")) {
              return blockTypeHasLayout(typeId) ? applyLayoutFieldResolution(fields, parent) : fields;
            }
            const storedTemplates = readStoredTemplates();
            const dynamicOptions = Object.entries(storedTemplates).map(([value, item]) => ({
              value,
              label: item.label || value,
            }));
            const mergedOptions = [...(field.options ?? []), ...dynamicOptions];
            const uniqueOptions = mergedOptions.filter(
              (option, index) => mergedOptions.findIndex((item) => item.value === option.value) === index,
            );
            return applyLayoutFieldResolution(
              {
                ...fields,
                template: {
                  ...field,
                  options: uniqueOptions,
                },
              },
              parent,
            );
          }

          if (blockTypeHasLayout(typeId)) {
            return applyLayoutFieldResolution(fields, parent);
          }

          return fields;
        },
        render: (props: Record<string, unknown>) => (
          <section className="border-b border-border px-3 py-3">
            {renderBlockPreview(typeId, props)}
          </section>
        ),
      },
    ];
  }),
);

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
    return { ...withDefaults, numColumns: getGridColumnCount(withDefaults.numColumns) };
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

export function normalizePuckData(data: Data): Data {
  const content = Array.isArray(data.content) ? data.content : [];
  const normalizedContent = content.map((item) => {
    const rawType = typeof item?.type === "string" ? item.type : "";
    const type = normalizeBlockType(rawType) ?? rawType;
    const props = item?.props && typeof item.props === "object" ? item.props : {};
    const normalizedProps = normalizeComponentProps(type, props as Record<string, unknown>);
    return { ...item, type, props: normalizedProps };
  });
  const zones = data.zones && typeof data.zones === "object" ? data.zones : {};
  const normalizedZones: Record<string, any> = {};
  for (const [zoneKey, zoneContent] of Object.entries(zones)) {
    if (!Array.isArray(zoneContent)) continue;
    normalizedZones[zoneKey] = zoneContent.map((item) => {
      const rawType = typeof item?.type === "string" ? item.type : "";
      const type = normalizeBlockType(rawType) ?? rawType;
      const props = item?.props && typeof item.props === "object" ? item.props : {};
      const normalizedProps = normalizeComponentProps(type, props as Record<string, unknown>);
      return { ...item, type, props: normalizedProps };
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
    content: normalizedContent as any,
    zones: normalizedZones as any,
    root: {
      ...existingRoot,
      props: { title: "", ...existingRootProps },
    },
  };
}

function useShouldRenderField(field: any, id?: string): boolean {
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

function BaseFieldType(props: any) {
  const { field, id, children } = props;
  const visible = useShouldRenderField(field, id);
  if (!visible) return null;
  return children ?? null;
}

const puckCategories: NonNullable<Config["categories"]> = {
  layout: { title: "Layout", components: ["grid", "flex", "space"] },
  typography: { title: "Typography", components: ["heading", "text", "richtext"] },
  interactive: { title: "Actions", components: ["button"] },
  other: { title: "Other", components: ["card", "hero", "logos", "stats", "template"] },
  chrome: { title: "Chrome", components: ["header", "footer"] },
};

export const puckConfig: Config = {
  categories: puckCategories,
  components: puckComponents,
  root: {
    fields: {
      title: { type: "text", label: "Page title" },
    },
    defaultProps: {
      title: "",
    },
    render: ({
      children,
      title,
    }: {
      children?: ReactNode;
      title?: string;
    }) => (
      <div className="flex min-h-0 min-h-full flex-col bg-background">
        {title ? (
          <div className="shrink-0 border-b border-border bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
            {title}
          </div>
        ) : null}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    ),
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
  },
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
    const { __parentId, __zone, ...propsWithoutTreeMeta } = rawProps;
    void __parentId;
    void __zone;

    const node: PuckNode = {
      id: block.id,
      type: normalizedType,
      props: {
        ...convertPropsForPuck(normalizedType, propsWithoutTreeMeta),
        __canvasId: block.id,
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
    content: rootNodes as any,
    zones: Object.fromEntries(childrenByZone.entries()) as any,
    root: { props: { title: "" } },
  });
}

export { puckDataToCanvasBlocks } from "@/lib/puckDataToCanvasBlocks";
