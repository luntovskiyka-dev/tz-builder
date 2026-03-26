import type { CanvasBlock } from "@/lib/blockTypes";

export type Block = CanvasBlock;

const BLOCK_LABELS: Record<string, string> = {
  heading: "Заголовок",
  text: "Текст",
  image: "Изображение",
  columns: "Колонки",
  cta: "CTA секция",
  faq: "FAQ",
  footer: "Подвал",
};

function str(val: unknown): string {
  return typeof val === "string" ? val : "";
}

function arr(val: unknown): unknown[] {
  return Array.isArray(val) ? val : [];
}

function generateBlockLines(block: Block): string[] {
  const p = (block.props ?? {}) as Record<string, unknown>;
  const lines: string[] = [];

  if (str(p.title)) lines.push(`- Заголовок: ${str(p.title)}`);
  if (str(p.templateName)) lines.push(`- Шаблон: ${str(p.templateName)}`);
  if (str(p.text)) lines.push(`- Текст: ${str(p.text)}`);
  if (str(p.url)) lines.push(`- URL: ${str(p.url)}`);

  if (block.type === "columns") {
    lines.push(`- Колонок: ${String(p.variant ?? "2")}`);
    for (let i = 1; i <= 4; i++) {
      const t = str(p[`column${i}Title`]);
      const x = str(p[`column${i}Text`]);
      if (t) lines.push(`- Колонка ${i} заголовок: ${t}`);
      if (x) lines.push(`- Колонка ${i} текст: ${x}`);
    }
  }

  if (block.type === "faq") {
    const items = arr(p.items).filter((v): v is string => typeof v === "string" && v.length > 0);
    if (items.length) {
      lines.push("- Вопросы:");
      for (const item of items) lines.push(`  - ${item}`);
    }
  }

  if (block.type === "stat") {
    const items = arr(p.items);
    if (items.length) {
      lines.push("- Показатели:");
      for (const item of items) {
        const it = item as Record<string, unknown>;
        const value = str(it.value);
        const label = str(it.label);
        if (value || label) lines.push(`  - ${value}${label ? ` — ${label}` : ""}`);
      }
    }
  }

  if (block.type === "cta") {
    const buttons = arr(p.buttons);
    if (buttons.length) {
      lines.push("- Кнопки:");
      for (const btn of buttons) {
        const b = btn as Record<string, unknown>;
        const label = str(b.text) || str(b.label);
        const url = str(b.url) || str(b.link);
        if (label) lines.push(`  - ${label}${url ? ` (${url})` : ""}`);
      }
    }
  }

  if (block.type === "footer") {
    if (str(p.copyright)) lines.push(`- Копирайт: ${str(p.copyright)}`);
    const links = arr(p.links).filter((v): v is string => typeof v === "string" && v.length > 0);
    if (links.length) lines.push(`- Ссылки: ${links.join(", ")}`);
  }

  return lines.length ? lines : ["- (нет данных)"];
}

function generateBlockSpec(block: Block, index: number): string {
  const heading = BLOCK_LABELS[block.type] ?? block.type;
  return [`## Блок ${index}: ${heading}`, ...generateBlockLines(block)].join("\n");
}

export function generateTextSpec(blocks: Block[]): string {
  if (!blocks || blocks.length === 0) return "Блоки не добавлены.";
  return blocks.map((block, i) => generateBlockSpec(block, i + 1)).join("\n\n");
}

