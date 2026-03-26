import type {
  BlockInspectorSchema,
  CanvasBlock,
  InspectorFieldDefinition,
} from "@/lib/blockTypes";

type PuckComponentConfig = {
  label: string;
  defaultProps: Record<string, unknown>;
  fields: InspectorFieldDefinition[];
  render: (props: Record<string, unknown>) => string;
};

const PUCK_COMPONENTS: Record<string, PuckComponentConfig> = {
  grid: {
    label: "Grid",
    defaultProps: {
      columns: "3",
      gap: 16,
    },
    fields: [
      {
        key: "columns",
        label: "Колонки",
        type: "radio",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      { key: "gap", label: "Gap", type: "number" },
    ],
    render: (props) => String(props.columns ?? "3"),
  },
  flex: {
    label: "Flex",
    defaultProps: {
      direction: "row",
      align: "center",
      justify: "between",
      gap: 12,
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
        key: "align",
        label: "Align",
        type: "radio",
        options: [
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "end", label: "End" },
        ],
      },
      {
        key: "justify",
        label: "Justify",
        type: "radio",
        options: [
          { value: "start", label: "Start" },
          { value: "center", label: "Center" },
          { value: "between", label: "Between" },
          { value: "end", label: "End" },
        ],
      },
      { key: "gap", label: "Gap", type: "number" },
    ],
    render: (props) => `${String(props.direction ?? "row")} / ${String(props.justify ?? "between")}`,
  },
  space: {
    label: "Space",
    defaultProps: {
      size: 32,
    },
    fields: [{ key: "size", label: "Размер (px)", type: "number" }],
    render: (props) => `${String(props.size ?? 32)}px`,
  },
  heading: {
    label: "Heading",
    defaultProps: {
      text: "Заголовок секции",
      level: "h2",
      showText: true,
    },
    fields: [
      { key: "text", label: "Текст заголовка", type: "text", visibilityKey: "showText", alignKey: "text" },
      {
        key: "level",
        label: "Уровень",
        type: "radio",
        options: [
          { value: "h1", label: "H1" },
          { value: "h2", label: "H2" },
          { value: "h3", label: "H3" },
        ],
      },
    ],
    render: (props) => String(props.text ?? ""),
  },
  text: {
    label: "Text",
    defaultProps: {
      text: "Текстовый блок",
      showText: true,
    },
    fields: [
      {
        key: "text",
        label: "Текст",
        type: "textarea",
        rows: 5,
        visibilityKey: "showText",
        alignKey: "text",
      },
    ],
    render: (props) => String(props.text ?? ""),
  },
  richtext: {
    label: "RichText",
    defaultProps: {
      content: "<p>Rich text content</p>",
    },
    fields: [{ key: "content", label: "HTML", type: "textarea", rows: 6 }],
    render: (props) => String(props.content ?? ""),
  },
  image: {
    label: "Image",
    defaultProps: {
      url: "",
      alt: "",
      caption: "",
      showCaption: false,
    },
    fields: [
      { key: "url", label: "URL изображения", type: "text", placeholder: "https://..." },
      { key: "alt", label: "Alt", type: "text" },
      { key: "caption", label: "Подпись", type: "text", visibilityKey: "showCaption" },
    ],
    render: (props) => String(props.url ?? ""),
  },
  columns: {
    label: "Columns",
    defaultProps: {
      variant: "2",
      column1Title: "Колонка 1",
      column1Text: "Текст 1",
      column2Title: "Колонка 2",
      column2Text: "Текст 2",
      column3Title: "Колонка 3",
      column3Text: "Текст 3",
      column4Title: "Колонка 4",
      column4Text: "Текст 4",
    },
    fields: [
      {
        key: "variant",
        label: "Колонки",
        type: "radio",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      { key: "column1Title", label: "Заголовок 1", type: "text", visibleWhen: { key: "variant", values: ["2", "3", "4"] } },
      { key: "column1Text", label: "Текст 1", type: "textarea", rows: 3, visibleWhen: { key: "variant", values: ["2", "3", "4"] } },
      { key: "column2Title", label: "Заголовок 2", type: "text", visibleWhen: { key: "variant", values: ["2", "3", "4"] } },
      { key: "column2Text", label: "Текст 2", type: "textarea", rows: 3, visibleWhen: { key: "variant", values: ["2", "3", "4"] } },
      { key: "column3Title", label: "Заголовок 3", type: "text", visibleWhen: { key: "variant", values: ["3", "4"] } },
      { key: "column3Text", label: "Текст 3", type: "textarea", rows: 3, visibleWhen: { key: "variant", values: ["3", "4"] } },
      { key: "column4Title", label: "Заголовок 4", type: "text", visibleWhen: { key: "variant", values: ["4"] } },
      { key: "column4Text", label: "Текст 4", type: "textarea", rows: 3, visibleWhen: { key: "variant", values: ["4"] } },
    ],
    render: (props) => String(props.variant ?? "2"),
  },
  button: {
    label: "Button",
    defaultProps: {
      text: "Нажми меня",
      url: "",
      variant: "primary",
    },
    fields: [
      { key: "text", label: "Текст", type: "text" },
      { key: "url", label: "URL", type: "text", placeholder: "https://..." },
      {
        key: "variant",
        label: "Вариант",
        type: "radio",
        options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
          { value: "ghost", label: "Ghost" },
        ],
      },
    ],
    render: (props) => String(props.text ?? ""),
  },
  card: {
    label: "Card",
    defaultProps: {
      title: "Card title",
      text: "Card description",
      imageUrl: "",
      buttonText: "Подробнее",
      buttonUrl: "",
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "text", label: "Текст", type: "textarea", rows: 4 },
      { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
      { key: "buttonText", label: "Текст кнопки", type: "text" },
      { key: "buttonUrl", label: "URL кнопки", type: "text", placeholder: "https://..." },
    ],
    render: (props) => String(props.title ?? ""),
  },
  hero: {
    label: "Hero",
    defaultProps: {
      title: "Hero heading",
      text: "Hero description text",
      imageUrl: "",
      buttons: [{ text: "Начать", url: "" }],
      showButtons: true,
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text", alignKey: "title" },
      { key: "text", label: "Текст", type: "textarea", rows: 5, alignKey: "text" },
      { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
      { key: "buttons", label: "Кнопки", type: "button-list", visibilityKey: "showButtons", alignKey: "buttons" },
    ],
    render: (props) => String(props.title ?? ""),
  },
  logos: {
    label: "Logos",
    defaultProps: {
      title: "Нам доверяют",
      items: ["https://logo-1.svg", "https://logo-2.svg"],
      columns: "4",
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "items", label: "Логотипы (URL)", type: "string-list" },
      {
        key: "columns",
        label: "Колонки",
        type: "radio",
        options: [
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
        ],
      },
    ],
    render: (props) => String(props.title ?? ""),
  },
  cta: {
    label: "CTA",
    defaultProps: {
      title: "Готовы начать?",
      text: "Оставьте заявку и мы свяжемся с вами.",
      buttons: [{ text: "Связаться", url: "" }],
      showButtons: true,
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text", alignKey: "title" },
      { key: "text", label: "Текст", type: "textarea", rows: 4, alignKey: "text" },
      { key: "buttons", label: "Кнопки", type: "button-list", visibilityKey: "showButtons", alignKey: "buttons" },
    ],
    render: (props) => String(props.title ?? ""),
  },
  faq: {
    label: "FAQ",
    defaultProps: {
      title: "Часто задаваемые вопросы",
      items: ["Вопрос 1", "Вопрос 2"],
      showTitle: true,
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text", visibilityKey: "showTitle", alignKey: "title" },
      { key: "items", label: "Вопросы", type: "string-list" },
    ],
    render: (props) => String(props.title ?? ""),
  },
  footer: {
    label: "Footer",
    defaultProps: {
      copyright: "© 2026 ProtoSpec",
      links: ["Privacy", "Terms"],
      showLinks: true,
    },
    fields: [
      { key: "copyright", label: "Копирайт", type: "text", alignKey: "copyright" },
      { key: "links", label: "Ссылки", type: "string-list", visibilityKey: "showLinks" },
    ],
    render: (props) => String(props.copyright ?? ""),
  },
  stat: {
    label: "Stat",
    defaultProps: {
      title: "Наши показатели",
      items: [
        { value: "100+", label: "Клиентов" },
        { value: "12", label: "Лет опыта" },
      ],
    },
    fields: [
      { key: "title", label: "Заголовок", type: "text" },
      { key: "items", label: "Показатели", type: "stats-list" },
    ],
    render: (props) => String(props.title ?? ""),
  },
  template: {
    label: "Template",
    defaultProps: {
      templateName: "Landing v1",
      description: "Готовый шаблон секции",
      slots: ["header", "hero", "cta", "footer"],
    },
    fields: [
      { key: "templateName", label: "Имя шаблона", type: "text" },
      { key: "description", label: "Описание", type: "textarea", rows: 4 },
      { key: "slots", label: "Слоты", type: "string-list" },
    ],
    render: (props) => String(props.templateName ?? ""),
  },
};

export const BLOCK_CATEGORIES = [
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
    id: "actions",
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
      { id: "image", label: "Image", defaultProps: PUCK_COMPONENTS.image.defaultProps },
      { id: "columns", label: "Columns", defaultProps: PUCK_COMPONENTS.columns.defaultProps },
      { id: "cta", label: "CTA", defaultProps: PUCK_COMPONENTS.cta.defaultProps },
      { id: "faq", label: "FAQ", defaultProps: PUCK_COMPONENTS.faq.defaultProps },
      { id: "footer", label: "Footer", defaultProps: PUCK_COMPONENTS.footer.defaultProps },
      { id: "stat", label: "Stat", defaultProps: PUCK_COMPONENTS.stat.defaultProps },
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

