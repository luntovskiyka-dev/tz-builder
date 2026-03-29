import type { CanvasBlock } from "@/lib/blockTypes";

export type Block = CanvasBlock;

const BLOCK_LABELS: Record<string, string> = {
  heading: "Заголовок",
  text: "Текст",
  stats: "Показатели",
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

  if (block.type === "stats") {
    const items = arr(p.items);
    if (items.length) {
      lines.push("- Показатели:");
      for (const item of items) {
        const it = item as Record<string, unknown>;
        const title = str(it.title ?? it.value);
        const description = str(it.description ?? it.label);
        if (title || description) lines.push(`  - ${title}${description ? ` — ${description}` : ""}`);
      }
    }
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

