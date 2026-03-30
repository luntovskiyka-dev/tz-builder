import type {
  BlockInspectorSchema,
  CanvasBlock,
  InspectorFieldDefinition,
  InspectorFieldOption,
} from "@/lib/blockTypes";
import { CARD_LUCIDE_ICON_OPTIONS, DEFAULT_CARD_ICON } from "@/lib/cardLucideIcons";

/** Same steps as Puck demo `spacingOptions` + 0px — Vertical Padding on Grid layout ([demo](https://demo.puckeditor.com/edit)). */
export const GRID_LAYOUT_VERTICAL_PADDING_OPTIONS: InspectorFieldOption[] = [
  { label: "0px", value: "0px" },
  ...[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160].map((n) => ({
    label: `${n}px`,
    value: `${n}px`,
  })),
];

type PuckComponentConfig = {
  label: string;
  defaultProps: Record<string, unknown>;
  fields: InspectorFieldDefinition[];
  render: (props: Record<string, unknown>) => string;
};

/** Subfields for the shared `layout` object; which ones appear is filtered in `resolveFields` by parent type. */
export const LAYOUT_OBJECT_SUBFIELDS: InspectorFieldDefinition[] = [
  { key: "spanCol", label: "Span columns", type: "number" },
  { key: "spanRow", label: "Span rows", type: "number" },
  { key: "grow", label: "Grow", type: "number" },
  { key: "padding", label: "Padding", type: "text", placeholder: "e.g. 16px" },
];

export const BLOCK_TYPES_WITH_LAYOUT = [
  "heading",
  "text",
  "richtext",
  "card",
  "template",
] as const;

export type BlockTypeWithLayout = (typeof BLOCK_TYPES_WITH_LAYOUT)[number];

export function blockTypeHasLayout(typeId: string): typeId is BlockTypeWithLayout {
  return (BLOCK_TYPES_WITH_LAYOUT as readonly string[]).includes(typeId);
}

const layoutField: InspectorFieldDefinition = {
  key: "layout",
  label: "Layout",
  type: "object",
  objectFields: LAYOUT_OBJECT_SUBFIELDS,
};

const PUCK_COMPONENTS: Record<string, PuckComponentConfig> = {
  grid: {
    label: "Grid",
    defaultProps: {
      numColumns: 4,
      gap: 24,
      layout: { padding: "0px" },
    },
    fields: [
      {
        key: "numColumns",
        label: "Number of columns",
        type: "number",
      },
      { key: "gap", label: "Gap", type: "number" },
      {
        key: "layout",
        label: "Layout",
        type: "object",
        objectFields: [
          {
            key: "padding",
            label: "Vertical Padding",
            type: "select",
            options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
          },
        ],
      },
    ],
    render: (props) => String(props.numColumns ?? 4),
  },
  flex: {
    label: "Flex",
    defaultProps: {
      justifyContent: "start",
      direction: "row",
      gap: 24,
      wrap: "wrap",
      layout: { padding: "0px" },
    },
    fields: [
      {
        key: "direction",
        label: "Direction",
        type: "radio",
        options: [
          { value: "row", label: "Row" },
          { value: "column", label: "Column" },
        ],
      },
      {
        key: "justifyContent",
        label: "Justify Content",
        type: "radio",
        options: [
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "end", label: "End" },
        ],
      },
      { key: "gap", label: "Gap", type: "number" },
      {
        key: "wrap",
        label: "Wrap",
        type: "radio",
        options: [
          { value: "wrap", label: "true" },
          { value: "nowrap", label: "false" },
        ],
      },
      {
        key: "layout",
        label: "Layout",
        type: "object",
        objectFields: [
          {
            key: "padding",
            label: "Vertical Padding",
            type: "select",
            options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
          },
        ],
      },
    ],
    render: (props) => `${String(props.direction ?? "row")} / ${String(props.justifyContent ?? "start")}`,
  },
  space: {
    label: "Space",
    defaultProps: {
      direction: "both",
      size: "24px",
    },
    fields: [
      {
        key: "size",
        label: "Size",
        type: "select",
        options: [
          { label: "8px", value: "8px" },
          { label: "16px", value: "16px" },
          { label: "24px", value: "24px" },
          { label: "32px", value: "32px" },
          { label: "40px", value: "40px" },
          { label: "48px", value: "48px" },
          { label: "56px", value: "56px" },
          { label: "64px", value: "64px" },
          { label: "72px", value: "72px" },
          { label: "80px", value: "80px" },
          { label: "88px", value: "88px" },
          { label: "96px", value: "96px" },
          { label: "104px", value: "104px" },
          { label: "112px", value: "112px" },
          { label: "120px", value: "120px" },
          { label: "128px", value: "128px" },
          { label: "136px", value: "136px" },
          { label: "144px", value: "144px" },
          { label: "152px", value: "152px" },
          { label: "160px", value: "160px" },
        ],
      },
      {
        key: "direction",
        label: "Direction",
        type: "radio",
        options: [
          { value: "vertical", label: "Vertical" },
          { value: "horizontal", label: "Horizontal" },
          { value: "both", label: "Both" },
        ],
      },
    ],
    render: (props) => `${String(props.size ?? "24px")}`,
  },
  heading: {
    label: "Heading",
    defaultProps: {
      align: "left",
      text: "Heading",
      size: "m",
      level: "",
      layout: {},
    },
    fields: [
      { key: "text", label: "Text", type: "textarea" },
      {
        key: "size",
        label: "Size",
        type: "select",
        options: [
          { value: "xxxl", label: "XXXL" },
          { value: "xxl", label: "XXL" },
          { value: "xl", label: "XL" },
          { value: "l", label: "L" },
          { value: "m", label: "M" },
          { value: "s", label: "S" },
          { value: "xs", label: "XS" },
        ],
      },
      {
        key: "level",
        label: "Level",
        type: "select",
        options: [
          { value: "", label: "Default" },
          { value: "h1", label: "h1" },
          { value: "h2", label: "h2" },
          { value: "h3", label: "h3" },
          { value: "h4", label: "h4" },
          { value: "h5", label: "h5" },
          { value: "h6", label: "h6" },
        ],
      },
      {
        key: "align",
        label: "Align",
        type: "radio",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ],
      },
      {
        key: "layout",
        label: "Layout",
        type: "object",
        objectFields: [
          {
            key: "padding",
            label: "Vertical Padding",
            type: "select",
            options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
          },
        ],
      },
    ],
    render: (props) => String(props.text ?? ""),
  },
  text: {
    label: "Text",
    defaultProps: {
      align: "left",
      text: "Text",
      size: "m",
      color: "default",
      layout: {},
    },
    fields: [
      {
        key: "text",
        label: "Text",
        type: "textarea",
      },
      {
        key: "size",
        label: "Size",
        type: "select",
        options: [
          { label: "S", value: "s" },
          { label: "M", value: "m" },
        ],
      },
      {
        key: "align",
        label: "Align",
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      {
        key: "color",
        label: "Color",
        type: "radio",
        options: [
          { label: "Default", value: "default" },
          { label: "Muted", value: "muted" },
        ],
      },
      { key: "maxWidth", label: "Max Width", type: "text", placeholder: "800px" },
      {
        key: "layout",
        label: "Layout",
        type: "object",
        objectFields: [
          {
            key: "padding",
            label: "Vertical Padding",
            type: "select",
            options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
          },
        ],
      },
    ],
    render: (props) => String(props.text ?? ""),
  },
  richtext: {
    label: "RichText",
    defaultProps: {
      richtext: "<h2>Heading</h2><p>Body</p>",
      layout: {},
    },
    fields: [
      { key: "richtext", label: "Rich text", type: "richtext" },
      {
        key: "layout",
        label: "Layout",
        type: "object",
        objectFields: [
          {
            key: "padding",
            label: "Vertical Padding",
            type: "select",
            options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
          },
        ],
      },
    ],
    render: (props) => String(props.richtext ?? ""),
  },
  button: {
    label: "Button",
    defaultProps: {
      label: "Button",
      href: "#",
      variant: "primary",
    },
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "href", label: "Link", type: "text", placeholder: "#" },
      {
        key: "variant",
        label: "Variant",
        type: "radio",
        options: [
          { value: "primary", label: "primary" },
          { value: "secondary", label: "secondary" },
        ],
      },
    ],
    render: (props) => String(props.label ?? ""),
  },
  card: {
    label: "Card",
    defaultProps: {
      title: "Title",
      description: "Description",
      icon: DEFAULT_CARD_ICON,
      mode: "flat",
      layout: {},
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea", rows: 4 },
      {
        key: "icon",
        label: "Icon (Lucide)",
        type: "select",
        options: [...CARD_LUCIDE_ICON_OPTIONS],
      },
      {
        key: "mode",
        label: "Mode",
        type: "radio",
        options: [
          { value: "card", label: "card" },
          { value: "flat", label: "flat" },
        ],
      },
      {
        key: "layout",
        label: "Layout",
        type: "object",
        objectFields: [
          {
            key: "padding",
            label: "Vertical Padding",
            type: "select",
            options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
          },
        ],
      },
    ],
    render: (props) => String(props.title ?? ""),
  },
  hero: {
    label: "Hero",
    defaultProps: {
      title: "Hero",
      align: "left",
      description: "<p>Description</p>",
      quote: "",
      buttons: [{ label: "Learn more", href: "#", variant: "primary" }],
      image: {
        url: "",
        mode: "inline",
        content: [],
      },
      padding: "64px",
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "richtext" },
      { key: "quote", label: "Quote", type: "textarea", rows: 3, placeholder: "Optional external quote" },
      {
        key: "align",
        label: "Align",
        type: "radio",
        options: [
          { value: "left", label: "left" },
          { value: "center", label: "center" },
        ],
      },
      { key: "buttons", label: "Buttons", type: "button-list" },
      {
        key: "image",
        label: "Image",
        type: "object",
        objectFields: [
          { key: "content", label: "Content", type: "slot" },
          { key: "url", label: "Image URL", type: "text", placeholder: "https://..." },
          {
            key: "mode",
            label: "Image mode",
            type: "radio",
            options: [
              { value: "inline", label: "inline" },
              { value: "background", label: "bg" },
              { value: "custom", label: "custom" },
            ],
          },
        ],
        visibleWhen: { key: "align", values: ["left"] },
      },
      { key: "padding", label: "Padding", type: "select", options: [{ value: "32px", label: "32px" }, { value: "48px", label: "48px" }, { value: "64px", label: "64px" }, { value: "80px", label: "80px" }] },
    ],
    render: (props) => String(props.title ?? ""),
  },
  logos: {
    label: "Logos",
    defaultProps: {
      logos: [
        {
          alt: "Google",
          imageUrl: "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
        },
        {
          alt: "Google",
          imageUrl: "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
        },
        {
          alt: "Google",
          imageUrl: "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png",
        },
      ],
    },
    fields: [{ key: "logos", label: "Logos", type: "logos-list" }],
    render: () => "Logos",
  },
  stats: {
    label: "Stats",
    defaultProps: {
      items: [
        { title: "1,000", description: "Stat" },
      ],
    },
    fields: [
      { key: "items", label: "Показатели", type: "stats-list" },
    ],
    render: () => "Stats",
  },
  template: {
    label: "Template",
    defaultProps: {
      template: "example_1",
      children: [],
      layout: {},
    },
    fields: [
      {
        key: "template",
        label: "Template",
        type: "select",
        options: [
          { label: "Blank", value: "blank" },
          { label: "Example 1", value: "example_1" },
          { label: "Example 2", value: "example_2" },
        ],
      },
      {
        key: "layout",
        label: "Layout",
        type: "object",
        objectFields: [
          {
            key: "padding",
            label: "Vertical Padding",
            type: "select",
            options: GRID_LAYOUT_VERTICAL_PADDING_OPTIONS,
          },
        ],
      },
    ],
    render: (props) => String(props.template ?? ""),
  },
  header: {
    label: "Header",
    defaultProps: {
      logoText: "Logo",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Home", href: "/", variant: "primary" },
        { label: "Docs", href: "#", variant: "secondary" },
      ],
      behavior: "static",
      backgroundColor: "",
      textColor: "",
      ctaLabel: "",
      ctaHref: "",
      alignNav: "end",
      showMobileMenu: true,
    },
    fields: [
      { key: "logoText", label: "Logo text", type: "text" },
      { key: "logoImageUrl", label: "Logo image URL", type: "text", placeholder: "https://..." },
      { key: "logoHref", label: "Logo link", type: "text", placeholder: "/" },
      { key: "navItems", label: "Nav items", type: "button-list" },
      {
        key: "behavior",
        label: "Behavior",
        type: "radio",
        options: [
          { value: "static", label: "Static" },
          { value: "sticky", label: "Sticky" },
        ],
      },
      { key: "ctaLabel", label: "CTA label", type: "text" },
      { key: "ctaHref", label: "CTA link", type: "text" },
      {
        key: "alignNav",
        label: "Align nav",
        type: "radio",
        options: [
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "end", label: "End" },
        ],
      },
      { key: "showMobileMenu", label: "Mobile menu", type: "toggle" },
    ],
    render: (props) => String(props.logoText ?? ""),
  },
  footer: {
    label: "Footer",
    defaultProps: {
      columns: [
        { title: "Product", description: "Overview, pricing" },
        { title: "Company", description: "About, careers" },
      ],
      copyright: "© 2026",
      backgroundColor: "",
      textColor: "",
      paddingY: "48px",
      socialLinks: [{ label: "Twitter", href: "#", variant: "secondary" }],
      newsletter: false,
      newsletterPlaceholder: "Email address",
    },
    fields: [
      { key: "columns", label: "Columns", type: "stats-list" },
      { key: "copyright", label: "Copyright", type: "text" },
      {
        key: "paddingY",
        label: "Vertical padding",
        type: "select",
        options: [
          { label: "32px", value: "32px" },
          { label: "48px", value: "48px" },
          { label: "64px", value: "64px" },
          { label: "80px", value: "80px" },
        ],
      },
      { key: "socialLinks", label: "Social links", type: "button-list" },
      { key: "newsletter", label: "Newsletter", type: "toggle" },
      {
        key: "newsletterPlaceholder",
        label: "Newsletter placeholder",
        type: "text",
        visibleWhen: { key: "newsletter", values: ["true"] },
      },
    ],
    render: (props) => String(props.copyright ?? ""),
  },
};

export const BLOCK_CATEGORIES = [
  {
    id: "chrome",
    label: "Chrome",
    blocks: [
      { id: "header", label: "Header", defaultProps: PUCK_COMPONENTS.header.defaultProps },
      { id: "footer", label: "Footer", defaultProps: PUCK_COMPONENTS.footer.defaultProps },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    blocks: [
      { id: "grid", label: "Grid", defaultProps: PUCK_COMPONENTS.grid.defaultProps },
      { id: "flex", label: "Flex", defaultProps: PUCK_COMPONENTS.flex.defaultProps },
      { id: "space", label: "Space", defaultProps: PUCK_COMPONENTS.space.defaultProps },
    ],
  },
  {
    id: "typography",
    label: "Typography",
    blocks: [
      { id: "heading", label: "Heading", defaultProps: PUCK_COMPONENTS.heading.defaultProps },
      { id: "text", label: "Text", defaultProps: PUCK_COMPONENTS.text.defaultProps },
      { id: "richtext", label: "RichText", defaultProps: PUCK_COMPONENTS.richtext.defaultProps },
    ],
  },
  {
    id: "interactive",
    label: "Actions",
    blocks: [{ id: "button", label: "Button", defaultProps: PUCK_COMPONENTS.button.defaultProps }],
  },
  {
    id: "other",
    label: "Other",
    blocks: [
      { id: "card", label: "Card", defaultProps: PUCK_COMPONENTS.card.defaultProps },
      { id: "hero", label: "Hero", defaultProps: PUCK_COMPONENTS.hero.defaultProps },
      { id: "logos", label: "Logos", defaultProps: PUCK_COMPONENTS.logos.defaultProps },
      { id: "stats", label: "Stats", defaultProps: PUCK_COMPONENTS.stats.defaultProps },
      { id: "template", label: "Template", defaultProps: PUCK_COMPONENTS.template.defaultProps },
    ],
  },
] as const;

export function getBlockLabel(typeId: string): string {
  return PUCK_COMPONENTS[typeId]?.label ?? typeId;
}

export function getDefaultProps(typeId: string): Record<string, unknown> {
  const entry = PUCK_COMPONENTS[typeId];
  return entry ? JSON.parse(JSON.stringify(entry.defaultProps)) : {};
}

export function getBlockInspectorSchema(
  typeId: string,
  _options?: { variant?: string },
): BlockInspectorSchema | null {
  void _options;
  const entry = PUCK_COMPONENTS[typeId];
  return entry ? { fields: entry.fields } : null;
}

export function createBlock(typeId: string): CanvasBlock {
  const id = `${typeId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { id, type: typeId, props: getDefaultProps(typeId) };
}

export function getAllBlockTypeIds(): string[] {
  return Object.keys(PUCK_COMPONENTS);
}

