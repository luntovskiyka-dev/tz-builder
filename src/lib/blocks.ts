/**
 * Block registry: categories, block types, default props.
 * Used by palette, createBlock, inspector, and canvas preview.
 */

export const BLOCK_CATEGORIES = [
  {
    id: "header",
    label: "Шапка",
    blocks: [
      {
        id: "header",
        label: "Шапка",
        defaultProps: {
          logoText: "Логотип",
          showLogoImage: false,
          showLogoText: true,
          menuItems: ["Главная", "О нас", "Контакты"],
          showMenuItems: true,
          buttons: [],
          showButtons: true,
        },
      },
    ],
  },
  {
    id: "hero",
    label: "Первый экран",
    blocks: [
      {
        id: "hero",
        label: "Первый экран",
        defaultProps: {
          title: "Заголовок",
          subtitle: "Подзаголовок",
          text: "",
          buttons: [],
          mediaUrl: "",
          mediaType: "photo",
          showTitle: true,
          showSubtitle: true,
          showText: true,
          showButtons: true,
          showMedia: true,
        },
      },
    ],
  },
  {
    id: "text",
    label: "Текст",
    blocks: [
      {
        id: "text",
        label: "Текст",
        defaultProps: {
          variant: "title-paragraph",
          title: "Заголовок",
          content: "Текст абзаца...",
          column1Title: "Колонка 1",
          column1Text: "Текст...",
          column2Title: "Колонка 2",
          column2Text: "Текст...",
          column3Title: "Колонка 3",
          column3Text: "Текст...",
          column4Title: "Колонка 4",
          column4Text: "Текст...",
          quote: "Цитата",
          author: "Автор",
          authorTitle: "Должность",
          showPhoto: false,
          listType: "bullet",
          items: ["Элемент 1", "Элемент 2", "Элемент 3"],
          text: "Описание или основной текст секции.",
          imageRight: false,
          showTitle: true,
          showContent: true,
          showColumn1Title: true,
          showColumn1Text: true,
          showColumn2Title: true,
          showColumn2Text: true,
          showColumn3Title: true,
          showColumn3Text: true,
          showColumn4Title: true,
          showColumn4Text: true,
          showText: true,
          showImage: true,
        },
      },
    ],
  },
  {
    id: "media",
    label: "Медиа",
    blocks: [
      {
        id: "media",
        label: "Медиа",
        defaultProps: {
          mediaType: "image-single",
          imageUrl: "",
          caption: "",
          alignment: "center",
          images: [],
          columns: 3,
          lightbox: true,
          autoplay: false,
          interval: 3000,
          videoUrl: "",
        },
      },
    ],
  },
  {
    id: "cards",
    label: "Карточки",
    blocks: [
      {
        id: "cards",
        label: "Карточки",
        defaultProps: {
          variant: "products",
          sectionTitle: "Карточки",
          columns: 3,
          showPrice: true,
          showButton: true,
          cards: [],
        },
      },
    ],
  },
  {
    id: "forms",
    label: "Формы",
    blocks: [
      {
        id: "form",
        label: "Форма",
        defaultProps: {
          variant: "contact",
          title: "Обратная связь",
          fields: ["name", "email", "message"],
          buttonText: "Отправить",
          showTitle: true,
          showButton: true,
        },
      },
    ],
  },
  {
    id: "testimonials",
    label: "Отзывы",
    blocks: [
      {
        id: "testimonials",
        label: "Отзывы",
        defaultProps: {
          variant: "grid",
          sectionTitle: "Отзывы",
          columns: 2,
          items: [],
          autoplay: false,
          quote: "Текст отзыва",
          author: "Имя",
          authorTitle: "Должность",
          showPhoto: false,
          showSectionTitle: true,
          showQuote: true,
          showAuthor: true,
          showAuthorTitle: true,
        },
      },
    ],
  },
  {
    id: "pricing",
    label: "Тарифы",
    blocks: [
      {
        id: "pricing-table",
        label: "Таблица тарифов",
        defaultProps: {
          sectionTitle: "Тарифы",
          showSectionTitle: true,
          columns: 3,
          highlightPopular: false,
          currency: "₽",
          plans: [],
        },
      },
    ],
  },
  {
    id: "faq",
    label: "Вопросы и ответы",
    blocks: [
      {
        id: "faq-accordion",
        label: "Вопросы и ответы",
        defaultProps: {
          sectionTitle: "Часто задаваемые вопросы",
          showSectionTitle: true,
          showIcon: true,
          items: [],
        },
      },
    ],
  },
  {
    id: "contacts",
    label: "Контакты",
    blocks: [
      {
        id: "contacts",
        label: "Контакты",
        defaultProps: {
          sectionTitle: "Контакты",
          showSectionTitle: true,
          address: "Адрес",
          phones: ["+7..."],
          emails: ["info@..."],
          socialLinks: {},
          mapUrl: "",
          hours: ["Пн–Пт: 9:00–18:00", "Сб: 10:00–16:00"],
          showAddress: true,
          showPhones: true,
          showEmails: true,
          showSocial: false,
          showMap: false,
          showHours: true,
        },
      },
    ],
  },
  {
    id: "footer",
    label: "Подвал",
    blocks: [
      {
        id: "footer",
        label: "Подвал",
        defaultProps: {
          variant: "simple",
          copyright: "© 2026 ProtoSpec",
          showSocial: false,
          socialLinks: {},
          columns: [],
          title: "Подпишитесь на новости",
          buttonText: "Подписаться",
          placeholder: "Ваш email",
        },
      },
    ],
  },
] as const;

export type BlockTypeId = (typeof BLOCK_CATEGORIES)[number]["blocks"][number]["id"];

export interface CanvasBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

const blockRegistry = new Map<string, { label: string; defaultProps: Record<string, unknown> }>();
for (const cat of BLOCK_CATEGORIES) {
  for (const b of cat.blocks) {
    blockRegistry.set(b.id, { label: b.label, defaultProps: { ...b.defaultProps } });
  }
}

// Legacy footer blocks — not shown in palette, but kept in registry for backward-compat
const LEGACY_FOOTER: Array<{ id: string; label: string; defaultProps: Record<string, unknown> }> = [
  { id: "footer-simple", label: "Простой подвал (legacy)", defaultProps: { copyright: "© 2026 ProtoSpec", socialLinks: {} } },
  { id: "footer-menu", label: "Подвал с меню (legacy)", defaultProps: { columns: [] } },
  { id: "footer-subscribe", label: "Подвал с подпиской (legacy)", defaultProps: { title: "Подписка", buttonText: "Подписаться" } },
  { id: "Footer", label: "Подвал (legacy)", defaultProps: { copyright: "© 2024 Компания", showSocial: true } },
];
for (const b of LEGACY_FOOTER) {
  if (!blockRegistry.has(b.id)) {
    blockRegistry.set(b.id, { label: b.label, defaultProps: { ...b.defaultProps } });
  }
}

// Legacy contacts blocks — not shown in palette, but kept in registry for backward-compat
const LEGACY_CONTACTS: Array<{ id: string; label: string; defaultProps: Record<string, unknown> }> = [
  { id: "map-embed", label: "Карта", defaultProps: { mapUrl: "", address: "" } },
  { id: "hours", label: "Режим работы", defaultProps: { hours: [] } },
];
for (const b of LEGACY_CONTACTS) {
  if (!blockRegistry.has(b.id)) {
    blockRegistry.set(b.id, { label: b.label, defaultProps: { ...b.defaultProps } });
  }
}

// Legacy form blocks — not shown in palette, but kept in registry for backward-compat
const LEGACY_FORMS: Array<{ id: string; label: string; defaultProps: Record<string, unknown> }> = [
  { id: "form-contact", label: "Форма обратной связи", defaultProps: { title: "Обратная связь", fields: ["name", "email", "message"], buttonText: "Отправить" } },
  { id: "form-subscribe", label: "Подписка", defaultProps: { title: "Подписка", fields: ["email"], buttonText: "Подписаться" } },
  { id: "form-order", label: "Форма заказа", defaultProps: { title: "Заказ", fields: ["name", "phone", "email", "comment"], buttonText: "Заказать" } },
  { id: "Форма", label: "Форма (legacy)", defaultProps: { title: "Свяжитесь с нами", showPhone: true } },
];
for (const b of LEGACY_FORMS) {
  if (!blockRegistry.has(b.id)) {
    blockRegistry.set(b.id, { label: b.label, defaultProps: { ...b.defaultProps } });
  }
}

// Legacy FAQ block — not shown in palette, but kept in registry for backward-compat
const LEGACY_FAQ: Array<{ id: string; label: string; defaultProps: Record<string, unknown> }> = [
  { id: "FAQ", label: "FAQ (legacy)", defaultProps: { title: "Частые вопросы", showIcon: true } },
];
for (const b of LEGACY_FAQ) {
  if (!blockRegistry.has(b.id)) {
    blockRegistry.set(b.id, { label: b.label, defaultProps: { ...b.defaultProps } });
  }
}

// Legacy testimonials blocks — not shown in palette, but kept in registry for backward-compat
const LEGACY_TESTIMONIALS: Array<{ id: string; label: string; defaultProps: Record<string, unknown> }> = [
  { id: "testimonials-grid", label: "Отзывы (сетка)", defaultProps: { sectionTitle: "Отзывы", columns: 2, items: [] } },
  { id: "testimonials-slider", label: "Отзывы (слайдер)", defaultProps: { sectionTitle: "Отзывы", items: [], autoplay: false } },
  { id: "testimonial-single", label: "Один отзыв", defaultProps: { quote: "Текст отзыва", author: "Имя", authorTitle: "Должность", photo: false } },
  { id: "Отзывы", label: "Отзывы (legacy)", defaultProps: { title: "Отзывы клиентов", displayType: "grid" } },
];
for (const b of LEGACY_TESTIMONIALS) {
  if (!blockRegistry.has(b.id)) {
    blockRegistry.set(b.id, { label: b.label, defaultProps: { ...b.defaultProps } });
  }
}

// Legacy cards blocks — not shown in palette, but kept in registry for backward-compat
const LEGACY_CARDS: Array<{ id: string; label: string; defaultProps: Record<string, unknown> }> = [
  { id: "cards-products", label: "Товары", defaultProps: { sectionTitle: "Товары", columns: 3, showPrice: true, showButton: true, cards: [] } },
  { id: "cards-team", label: "Команда", defaultProps: { sectionTitle: "Команда", columns: 4, cards: [] } },
  { id: "cards-benefits", label: "Преимущества", defaultProps: { sectionTitle: "Преимущества", columns: 3, cards: [] } },
  { id: "cards-blog", label: "Блог", defaultProps: { sectionTitle: "Блог", columns: 3, cards: [] } },
  { id: "Карточки товаров", label: "Карточки товаров", defaultProps: { sectionTitle: "Карточки товаров", columns: 3 } },
];
for (const b of LEGACY_CARDS) {
  if (!blockRegistry.has(b.id)) {
    blockRegistry.set(b.id, { label: b.label, defaultProps: { ...b.defaultProps } });
  }
}

export function getBlockLabel(typeId: string): string {
  return blockRegistry.get(typeId)?.label ?? typeId;
}

export function getDefaultProps(typeId: string): Record<string, unknown> {
  const entry = blockRegistry.get(typeId);
  if (!entry) return {};
  return JSON.parse(JSON.stringify(entry.defaultProps));
}

export function createBlock(typeId: string): CanvasBlock {
  const id = `${typeId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const defaultProps = getDefaultProps(typeId);
  return { id, type: typeId, props: { ...defaultProps } };
}

export function getAllBlockTypeIds(): string[] {
  return BLOCK_CATEGORIES.flatMap((c) => c.blocks.map((b) => b.id));
}
