import { CanvasBlock } from "@/lib/blocks";

export type Block = CanvasBlock;

// ─── Helpers ────────────────────────────────────────────────────────────────

function str(val: unknown): string {
  return typeof val === "string" ? val : "";
}

function num(val: unknown): number | null {
  return typeof val === "number" ? val : null;
}

function bool(val: unknown): boolean {
  return val === true;
}

function arr(val: unknown): unknown[] {
  return Array.isArray(val) ? val : [];
}

// ─── Block type labels ───────────────────────────────────────────────────────

const BLOCK_LABELS: Record<string, string> = {
  header: "Шапка сайта",
  "header-logo-menu": "Шапка сайта",
  hero: "Первый экран (Hero)",
  "hero-classic": "Первый экран (Hero)",
  text: "Текстовый блок",
  "text-title-paragraph": "Текстовый блок",
  media: "Медиа",
  cards: "Карточки",
  "cards-products": "Карточки товаров",
  "cards-team": "Команда",
  "cards-benefits": "Преимущества",
  "cards-blog": "Блог",
  "Карточки товаров": "Карточки товаров",
  form: "Форма",
  "form-contact": "Форма обратной связи",
  "form-subscribe": "Форма подписки",
  "form-order": "Форма заказа",
  Форма: "Форма",
  "faq-accordion": "Вопросы и ответы",
  FAQ: "Вопросы и ответы",
  testimonials: "Отзывы",
  "testimonials-grid": "Отзывы (сетка)",
  "testimonials-slider": "Отзывы (слайдер)",
  "testimonial-single": "Один отзыв",
  Отзывы: "Отзывы",
  "pricing-table": "Таблица тарифов",
  contacts: "Контакты",
  footer: "Подвал",
  "footer-simple": "Простой подвал",
  "footer-menu": "Подвал с меню",
  "footer-subscribe": "Подвал с подпиской",
  Footer: "Подвал",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Имя",
  email: "Email",
  phone: "Телефон",
  message: "Сообщение",
  comment: "Комментарий",
};

function labelForField(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

// ─── Per-block generators ────────────────────────────────────────────────────

function generateHeaderBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];

  if (bool(props.showLogoImage) && str(props.logoImage)) {
    lines.push(`- Логотип (картинка): ${str(props.logoImage)}`);
  }
  if (bool(props.showLogoText) && str(props.logoText)) {
    lines.push(`- Логотип (текст): ${str(props.logoText)}`);
  }
  if (bool(props.showMenuItems)) {
    const items = arr(props.menuItems).filter(
      (i): i is string => typeof i === "string" && i.length > 0
    );
    if (items.length) {
      lines.push(`- Пункты меню: ${items.join(", ")}`);
    }
  }
  if (bool(props.showButtons)) {
    const buttons = arr(props.buttons);
    if (buttons.length) {
      lines.push("- Кнопки:");
      for (const btn of buttons) {
        const b = btn as Record<string, unknown>;
        const label = str(b.label) || str(b.text);
        const link = str(b.href) || str(b.link);
        if (label) {
          lines.push(`  - ${label}${link ? ` (ссылка: ${link})` : ""}`);
        }
      }
    }
  }

  return lines;
}

function generateHeroBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];

  if (bool(props.showTitle) && str(props.title)) {
    lines.push(`- Заголовок: ${str(props.title)}`);
  }
  if (bool(props.showSubtitle) && str(props.subtitle)) {
    lines.push(`- Подзаголовок: ${str(props.subtitle)}`);
  }
  if (bool(props.showText) && str(props.text)) {
    lines.push(`- Текст: ${str(props.text)}`);
  }

  if (bool(props.showButtons)) {
    const buttons = arr(props.buttons);
    buttons.forEach((btn, i) => {
      const b = btn as Record<string, unknown>;
      const label = str(b.label) || str(b.text);
      const link = str(b.href) || str(b.link);
      if (!label) return;
      const buttonName =
        i === 0 ? "Основная кнопка" : i === 1 ? "Вторая кнопка" : `Кнопка ${i + 1}`;
      lines.push(`- ${buttonName}: ${label}${link ? ` (ссылка: ${link})` : ""}`);
    });
  }

  if (bool(props.showMedia) && str(props.mediaUrl)) {
    const position = str(props.mediaPosition) || "справа";
    const mediaType = str(props.mediaType);
    const typeLabel = mediaType === "video" ? "Видео" : "Изображение";
    lines.push(`- ${typeLabel}: ${str(props.mediaUrl)} (${position})`);
  }

  return lines;
}

function generateTextBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const variant = str(props.variant) || "title-paragraph";

  lines.push(`- Вариант: ${variant}`);

  if (bool(props.showTitle) && str(props.title)) {
    lines.push(`- Заголовок: ${str(props.title)}`);
  }

  switch (variant) {
    case "title-paragraph":
    default:
      if (bool(props.showContent) && str(props.content)) {
        lines.push(`- Текст: ${str(props.content)}`);
      }
      break;

    case "two-columns":
    case "three-columns":
    case "four-columns": {
      const colCount =
        variant === "two-columns" ? 2 : variant === "three-columns" ? 3 : 4;
      for (let i = 1; i <= colCount; i++) {
        const titleVal = str(props[`column${i}Title`]);
        const textVal = str(props[`column${i}Text`]);
        const showTitle = bool(props[`showColumn${i}Title`]);
        const showText = bool(props[`showColumn${i}Text`]);
        if (showTitle && titleVal) lines.push(`- Колонка ${i} — заголовок: ${titleVal}`);
        if (showText && textVal) lines.push(`- Колонка ${i} — текст: ${textVal}`);
      }
      break;
    }

    case "quote":
      if (str(props.quote)) lines.push(`- Цитата: ${str(props.quote)}`);
      if (str(props.author)) lines.push(`- Автор: ${str(props.author)}`);
      if (str(props.authorTitle)) lines.push(`- Должность: ${str(props.authorTitle)}`);
      break;

    case "list": {
      const listType = str(props.listType) || "bullet";
      lines.push(`- Тип списка: ${listType === "bullet" ? "маркированный" : "нумерованный"}`);
      const items = arr(props.items).filter(
        (i): i is string => typeof i === "string" && i.length > 0
      );
      if (items.length) {
        lines.push("- Элементы:");
        for (const item of items) lines.push(`  - ${item}`);
      }
      break;
    }

    case "text-image":
      if (bool(props.showText) && str(props.text)) {
        lines.push(`- Текст: ${str(props.text)}`);
      }
      if (bool(props.showImage) && str(props.imageUrl)) {
        const side = bool(props.imageRight) ? "справа" : "слева";
        lines.push(`- Изображение: ${str(props.imageUrl)} (${side})`);
      }
      break;
  }

  return lines;
}

function generateCardsBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];

  if (str(props.sectionTitle)) {
    lines.push(`- Заголовок секции: ${str(props.sectionTitle)}`);
  }
  if (str(props.variant)) {
    lines.push(`- Вариант: ${str(props.variant)}`);
  }
  const columns = num(props.columns);
  if (columns !== null) {
    lines.push(`- Количество колонок: ${columns}`);
  }
  if (bool(props.showPrice)) lines.push("- Отображать цену: да");
  if (bool(props.showButton)) lines.push("- Отображать кнопку карточки: да");

  const cards = arr(props.cards);
  if (cards.length) {
    lines.push(`- Карточки (${cards.length} шт.):`);
    for (const card of cards) {
      const c = card as Record<string, unknown>;
      const title = str(c.title) || str(c.name);
      const price = str(c.price);
      const desc = str(c.description) || str(c.subtitle);
      const parts = [
        title,
        price && `цена: ${price}`,
        desc && `описание: ${desc}`,
      ].filter(Boolean);
      if (parts.length) lines.push(`  - ${parts.join(", ")}`);
    }
  }

  return lines;
}

function generateFormBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];

  if (str(props.variant)) lines.push(`- Вариант: ${str(props.variant)}`);

  if (bool(props.showTitle) && str(props.title)) {
    lines.push(`- Заголовок: ${str(props.title)}`);
  } else if (str(props.title)) {
    lines.push(`- Заголовок: ${str(props.title)}`);
  }

  const fields = arr(props.fields).filter(
    (f): f is string => typeof f === "string" && f.length > 0
  );
  if (fields.length) {
    lines.push(`- Поля формы: ${fields.map(labelForField).join(", ")}`);
  }

  const buttonText = str(props.buttonText);
  if (buttonText) {
    lines.push(`- Кнопка отправки: ${buttonText}`);
  }

  return lines;
}

function generateFaqBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];

  const title = str(props.sectionTitle) || str(props.title);
  if (title) lines.push(`- Заголовок секции: ${title}`);
  if (bool(props.showIcon)) lines.push("- Иконка развёртки: да");

  const items = arr(props.items);
  if (items.length) {
    lines.push(`- Вопросы и ответы (${items.length} шт.):`);
    for (const item of items) {
      const q = item as Record<string, unknown>;
      const question = str(q.question) || str(q.title);
      const answer = str(q.answer) || str(q.text);
      if (question) {
        lines.push(`  - В: ${question}`);
        if (answer) lines.push(`    О: ${answer}`);
      }
    }
  }

  return lines;
}

function generateFooterBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];

  if (str(props.variant)) lines.push(`- Вариант: ${str(props.variant)}`);
  if (str(props.copyright)) lines.push(`- Копирайт: ${str(props.copyright)}`);

  if (bool(props.showSocial)) {
    const links = props.socialLinks as Record<string, unknown> | undefined;
    const entries = Object.entries(links ?? {}).filter(
      ([, v]) => typeof v === "string" && v
    );
    if (entries.length) {
      const formatted = entries.map(([k, v]) => `${k}: ${v}`).join(", ");
      lines.push(`- Соцсети: ${formatted}`);
    } else {
      lines.push("- Соцсети: да");
    }
  }

  const columns = arr(props.columns);
  if (columns.length) {
    lines.push(`- Колонки подвала (${columns.length} шт.):`);
    for (const col of columns) {
      const c = col as Record<string, unknown>;
      const colTitle = str(c.title);
      if (colTitle) lines.push(`  - ${colTitle}`);
    }
  }

  if (str(props.title)) lines.push(`- Заголовок подписки: ${str(props.title)}`);
  if (str(props.buttonText)) lines.push(`- Кнопка подписки: ${str(props.buttonText)}`);

  return lines;
}

// Fallback for block types not yet covered — outputs any non-empty scalar props.
function generateGenericBlock(props: Record<string, unknown>): string[] {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (key === "style") continue;
    if (value === false || value === null || value === undefined || value === "") continue;
    if (typeof value === "string") {
      lines.push(`- ${key}: ${value}`);
    } else if (typeof value === "number" || typeof value === "boolean") {
      lines.push(`- ${key}: ${value}`);
    } else if (Array.isArray(value) && value.length > 0) {
      lines.push(`- ${key}: ${value.length} элем.`);
    }
  }
  return lines;
}

// ─── Block dispatcher ────────────────────────────────────────────────────────

function generateBlockLines(block: Block): string[] {
  const props = (block.props ?? {}) as Record<string, unknown>;

  switch (block.type) {
    case "header":
    case "header-logo-menu":
      return generateHeaderBlock(props);

    case "hero":
    case "hero-classic":
      return generateHeroBlock(props);

    case "text":
    case "text-title-paragraph":
      return generateTextBlock(props);

    case "cards":
    case "cards-products":
    case "cards-team":
    case "cards-benefits":
    case "cards-blog":
    case "Карточки товаров":
      return generateCardsBlock(props);

    case "form":
    case "form-contact":
    case "form-subscribe":
    case "form-order":
    case "Форма":
      return generateFormBlock(props);

    case "faq-accordion":
    case "FAQ":
      return generateFaqBlock(props);

    case "footer":
    case "footer-simple":
    case "footer-menu":
    case "footer-subscribe":
    case "Footer":
      return generateFooterBlock(props);

    default:
      return generateGenericBlock(props);
  }
}

function generateBlockSpec(block: Block, index: number): string {
  const heading = BLOCK_LABELS[block.type] ?? block.type;
  const contentLines = generateBlockLines(block);
  const body = contentLines.length > 0 ? contentLines : ["- (нет данных)"];
  return [`## Блок ${index}: ${heading}`, ...body].join("\n");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Converts a blocks array into a readable Markdown technical specification.
 * Each block gets a numbered heading and a bullet-point list of its properties.
 * Empty, false, or undefined values are omitted.
 */
export function generateTextSpec(blocks: Block[]): string {
  if (!blocks || blocks.length === 0) {
    return "Блоки не добавлены.";
  }
  return blocks.map((block, i) => generateBlockSpec(block, i + 1)).join("\n\n");
}
