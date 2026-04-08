import type { CSSProperties, ReactNode } from "react";
import { asString, isPuckEditing } from "@/lib/puckCanvas/utils";
import { sanitizeHtml } from "@/lib/sanitize";

function headingSizeClass(size: string): string {
  switch (size) {
    case "xxxl":
      return "text-4xl font-bold tracking-tight sm:text-5xl";
    case "xxl":
      return "text-3xl font-bold tracking-tight sm:text-4xl";
    case "xl":
      return "text-2xl font-semibold sm:text-3xl";
    case "l":
      return "text-xl font-semibold sm:text-2xl";
    case "m":
      return "text-lg font-semibold sm:text-xl";
    case "s":
      return "text-base font-medium sm:text-lg";
    case "xs":
      return "text-sm font-medium sm:text-base";
    default:
      return "text-lg font-semibold sm:text-xl";
  }
}

function textAlignClass(align: string): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function renderHeadingBlock(props: Record<string, unknown>): ReactNode {
  const text = asString(props.text, "Heading");
  const size = asString(props.size, "m");
  const level = asString(props.level, "");
  const align = asString(props.align, "left");
  const layoutObj =
    props.layout && typeof props.layout === "object" && !Array.isArray(props.layout)
      ? (props.layout as Record<string, unknown>)
      : {};
  const padding = asString(layoutObj.padding, "");
  const semantic = /^h[1-6]$/.test(level) ? level : null;
  const Tag = (semantic ?? "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const style: CSSProperties | undefined = padding ? { padding } : undefined;
  return (
    <div className={`w-full ${textAlignClass(align)}`} style={style}>
      <Tag className={`${headingSizeClass(size)} text-balance text-foreground`}>{text}</Tag>
    </div>
  );
}

export function renderTextBlock(props: Record<string, unknown>): ReactNode {
  const content = asString(props.text, "Body copy goes here.");
  const size = asString(props.size, "m");
  const align = asString(props.align, "left");
  const color = asString(props.color, "default");
  const maxWidth = asString(props.maxWidth, "");
  const layoutObj =
    props.layout && typeof props.layout === "object" && !Array.isArray(props.layout)
      ? (props.layout as Record<string, unknown>)
      : {};
  const padding = asString(layoutObj.padding, "");
  const sizeClass = size === "s" ? "text-sm leading-relaxed" : "text-base leading-relaxed";
  const colorClass = color === "muted" ? "text-muted-foreground" : "text-foreground";
  const style: CSSProperties = {};
  if (padding) style.padding = padding;
  style.maxWidth = maxWidth || "42rem";
  const blockAlign =
    align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "mr-auto";
  return (
    <p
      className={`block w-full ${blockAlign} ${textAlignClass(align)} ${sizeClass} ${colorClass}`}
      style={style}
    >
      {content}
    </p>
  );
}

const RICHTEXT_WRAPPER =
  "[&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-3 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5";

/**
 * In the Puck editor, `useRichtextProps` replaces `richtext` with a React tree (RichTextRender)
 * so the canvas stays in sync with the inspector. Outside the editor it remains an HTML string.
 */
export function renderRichTextBlock(props: Record<string, unknown>): ReactNode {
  const layoutObj =
    props.layout && typeof props.layout === "object" && !Array.isArray(props.layout)
      ? (props.layout as Record<string, unknown>)
      : {};
  const padding = asString(layoutObj.padding, "");
  const style: CSSProperties | undefined = padding ? { padding } : undefined;
  const rt = props.richtext;

  if (typeof rt === "string") {
    const html = rt.trim() === "" ? "<p>Rich text</p>" : sanitizeHtml(rt);
    return (
      <div
        className={`mx-auto w-full max-w-3xl text-foreground ${RICHTEXT_WRAPPER}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (rt != null) {
    return (
      <div className="mx-auto w-full max-w-3xl text-foreground" style={style}>
        {rt as ReactNode}
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-3xl text-foreground ${RICHTEXT_WRAPPER}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: "<p>Rich text</p>" }}
    />
  );
}

export function renderButtonBlock(props: Record<string, unknown>): ReactNode {
  const label = asString(props.label, "Button");
  const href = asString(props.href, "#");
  const variant = asString(props.variant, "primary");
  const editing = isPuckEditing(props);
  const resolvedHref = editing ? "#" : href;
  const base =
    "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium transition-colors";
  const variantClass =
    variant === "secondary"
      ? "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";
  return (
    <div className="w-full">
      <a
        href={resolvedHref}
        className={`${base} ${variantClass}`}
        tabIndex={editing ? -1 : undefined}
        onClick={editing ? (e) => e.preventDefault() : undefined}
      >
        {label}
      </a>
    </div>
  );
}
