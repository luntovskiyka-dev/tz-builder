/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { CardLucidePreview } from "@/lib/puckCanvas/CardLucidePreview";
import type { RenderDropZoneFn } from "@/lib/puckCanvas/dropZone";
import {
  asButtonList,
  asLogosList,
  asStatsList,
  asString,
  isPuckEditing,
} from "@/lib/puckCanvas/utils";
import { DEFAULT_CARD_ICON } from "@/lib/cardLucideIcons";

const HERO_SUBTITLE =
  "[&_p]:mb-3 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_a]:text-primary [&_a]:underline";

export function renderHeroBlock(props: Record<string, unknown>): ReactNode {
  const title = asString(props.title, "Hero title");
  const descriptionHtml = asString(props.description, "<p>Supporting copy for your hero.</p>");
  const quote = asString(props.quote, "");
  const align = asString(props.align, "left");
  const padding = asString(props.padding, "64px");
  const editing = isPuckEditing(props);

  const imageObj = props.image && typeof props.image === "object" ? (props.image as Record<string, unknown>) : {};
  const imageUrl = asString(imageObj.url);
  const imageMode = asString(imageObj.mode, "inline");
  const SlotContent = imageObj.content as ((args?: Record<string, unknown>) => ReactNode) | undefined;

  const rawButtons = Array.isArray(props.buttons) ? (props.buttons as Record<string, unknown>[]) : [];
  const primaryBtn =
    "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium transition-colors";
  const primaryClass = "bg-primary text-primary-foreground hover:bg-primary/90";
  const secondaryClass =
    "border border-border bg-background text-foreground hover:bg-muted";

  const actions = (
    <div
      className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : "justify-start"}`}
    >
      {rawButtons.slice(0, 4).map((row, i) => {
        const btn = asButtonList([row])[0];
        const variant = asString(row?.variant, "primary");
        const vClass = variant === "secondary" ? secondaryClass : primaryClass;
        const href = editing ? "#" : btn.url || "#";
        return (
          <a
            key={`${btn.text}-${i}`}
            href={href}
            className={`${primaryBtn} ${vClass}`}
            tabIndex={editing ? -1 : undefined}
            onClick={editing ? (e) => e.preventDefault() : undefined}
          >
            {btn.text || "Button"}
          </a>
        );
      })}
    </div>
  );

  const titleBlock = (
    <h1
      className={`text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {title}
    </h1>
  );

  const subtitle = (
    <div
      className={`mt-4 max-w-xl ${HERO_SUBTITLE} ${align === "center" ? "mx-auto text-center" : ""}`}
      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
    />
  );

  const quoteBlock = quote ? (
    <blockquote
      className={`mt-6 border-l-4 border-primary/30 pl-4 text-sm italic text-muted-foreground ${
        align === "center" ? "mx-auto max-w-lg text-center" : ""
      }`}
    >
      {quote}
    </blockquote>
  ) : null;

  const imageInline =
    imageUrl && imageMode === "inline" ? (
      <div
        className="relative mt-8 w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-sm sm:mt-0 sm:min-h-[280px] lg:min-h-[320px]"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        role="img"
        aria-label=""
      />
    ) : null;

  const imageCustom =
    imageMode === "custom" && typeof SlotContent === "function" ? (
      <div className="relative mt-8 min-h-[280px] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20 sm:mt-0 lg:min-h-[320px]">
        {SlotContent({
          style: { height: "100%", minHeight: 280 },
        })}
      </div>
    ) : imageMode === "custom" ? (
      <div className="mt-8 flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/15 text-sm text-muted-foreground sm:mt-0">
        Custom image slot
      </div>
    ) : null;

  const showImageColumn =
    align !== "center" &&
    (imageMode === "custom" || (Boolean(imageUrl) && imageMode === "inline"));

  const inner =
    align === "center" ? (
      <div className="relative z-[1] mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        {titleBlock}
        {subtitle}
        {quoteBlock}
        <div className="mt-8 w-full">{actions}</div>
      </div>
    ) : showImageColumn ? (
      <div className="relative z-[1] mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          {titleBlock}
          {subtitle}
          {quoteBlock}
          <div className="mt-8">{actions}</div>
        </div>
        <div className="min-w-0">{imageInline ?? imageCustom}</div>
      </div>
    ) : (
      <div className="relative z-[1] mx-auto max-w-3xl px-4">
        {titleBlock}
        {subtitle}
        {quoteBlock}
        <div className="mt-8">{actions}</div>
      </div>
    );

  const bgLayer =
    imageUrl && imageMode === "background" ? (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </>
    ) : null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/20"
      style={{ paddingTop: padding, paddingBottom: padding }}
    >
      {bgLayer}
      {inner}
    </section>
  );
}

export function renderLogosBlock(props: Record<string, unknown>): ReactNode {
  const logos = asLogosList(props.logos);
  return (
    <section className="w-full py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-6 px-4 opacity-90 grayscale transition-opacity hover:opacity-100 hover:grayscale-0 sm:gap-x-14">
        {logos.slice(0, 12).map((logo, i) => (
          <div
            key={`${logo.imageUrl}-${i}`}
            className="flex h-10 max-w-[120px] items-center justify-center sm:h-12"
            title={logo.alt || "Partner logo"}
          >
            {logo.imageUrl ? (
              <img
                src={logo.imageUrl}
                alt={logo.alt || ""}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">{logo.alt || "Logo"}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function renderStatsBlock(props: Record<string, unknown>): ReactNode {
  const stats = asStatsList(props.items);
  return (
    <section className="w-full py-10">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-2 md:gap-12 lg:grid-cols-4">
        {stats.slice(0, 8).map((item, i) => (
          <div key={`${item.title}-${item.description}-${i}`} className="text-center md:text-left">
            <div className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {item.title || "—"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{item.description || ""}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function renderCardBlock(props: Record<string, unknown>): ReactNode {
  const title = asString(props.title, "Title");
  const description = asString(props.description, "Description");
  const iconName = asString(props.icon, DEFAULT_CARD_ICON);
  const mode = asString(props.mode, "flat");
  const isCard = mode === "card";
  const iconClass = isCard
    ? "h-7 w-7 shrink-0 text-primary"
    : "h-7 w-7 shrink-0 text-muted-foreground";
  return (
    <div
      className={`flex h-full min-h-0 flex-col items-center text-center ${
        isCard
          ? "rounded-2xl border border-border/70 bg-card p-6 shadow-sm ring-1 ring-black/[0.04] transition-[box-shadow,transform] duration-200 hover:shadow-md hover:ring-black/[0.06] dark:ring-white/[0.06] dark:hover:ring-white/10"
          : "rounded-2xl border border-border/50 bg-muted/30 p-6 ring-1 ring-border/30"
      }`}
    >
      <div
        className={`mb-5 flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full ${
          isCard
            ? "bg-gradient-to-br from-primary/25 via-primary/10 to-muted/80 shadow-inner"
            : "bg-background/90 ring-1 ring-border/60"
        }`}
      >
        <CardLucidePreview name={iconName} className={iconClass} />
      </div>
      <h3 className="text-pretty text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.05rem]">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function renderTemplateBlock(
  props: Record<string, unknown>,
  renderDropZone: RenderDropZoneFn,
): ReactNode {
  const ChildrenSlot = (props as { children?: ((args?: Record<string, unknown>) => ReactNode) | unknown }).children;
  return (
    <section className="rounded-2xl border border-dashed border-border/80 bg-muted/15 p-6">
      <div className="min-h-[120px] rounded-xl border border-dashed border-primary/25 bg-background/70 p-4">
        {typeof ChildrenSlot === "function" ? ChildrenSlot() : renderDropZone("children")}
      </div>
    </section>
  );
}
