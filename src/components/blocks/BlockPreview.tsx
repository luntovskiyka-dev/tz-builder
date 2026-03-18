"use client";

import React from "react";
import { getBlockLabel } from "@/lib/blocks";
import type { CanvasBlock } from "@/lib/blocks";

// ── helpers ───────────────────────────────────────────────────────

function trunc(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

type FA = Record<string, string>;
type Zone = "left" | "center" | "right";

function getZone(fa: FA | undefined, key: string, defaultZone: Zone = "left"): Zone {
  const v = fa?.[key];
  if (v === "left" || v === "center" || v === "right") return v;
  return defaultZone;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Имя",
  email: "Email",
  phone: "Телефон",
  message: "Сообщение",
  comment: "Комментарий",
};

// ── Header preview ────────────────────────────────────────────────
//
// The header is rendered as a 3-column bar: [left | center | right].
// Each element (logo, menu, buttons) is placed into the column that
// matches its alignment setting.

function HeaderPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const logo =
    typeof p.logoText === "string" && p.logoText ? trunc(p.logoText, 16) : "Лого";
  const showLogoImage  = p.showLogoImage === true;
  const showLogoText   = p.showLogoText !== false;
  const showMenuItems  = p.showMenuItems !== false;
  const showButtons    = p.showButtons !== false;
  const menu = Array.isArray(p.menuItems)
    ? (p.menuItems as string[]).filter(Boolean)
    : [];
  const buttons = Array.isArray(p.buttons)
    ? (p.buttons as Array<string | { text: string; url?: string }>)
        .map((b) => (typeof b === "object" && b !== null ? b.text : String(b)))
        .filter(Boolean)
    : [];

  const logoZone    = getZone(fieldAlignments, "logoText",   "left");
  const menuZone    = getZone(fieldAlignments, "menuItems",  "left");
  const buttonsZone = getZone(fieldAlignments, "buttons",    "left");

  const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

  if (showLogoImage || showLogoText) {
    zones[logoZone].push(
      <div key="logo" className="flex shrink-0 items-center gap-1">
        {showLogoImage && (
          <div className="h-4 w-4 rounded-sm border border-gray-400 bg-gray-100" aria-label="Логотип-изображение">
            <svg viewBox="0 0 16 16" className="h-full w-full" aria-hidden>
              <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
              <polyline points="1,11 5,7 8,10 11,7 15,11" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
              <circle cx="11.5" cy="4.5" r="1.5" fill="#9ca3af" />
            </svg>
          </div>
        )}
        {showLogoText && (
          <span className="text-[10px] font-bold leading-none text-gray-800">{logo}</span>
        )}
      </div>
    );
  }

  if (showMenuItems && menu.length > 0) {
    const visibleMenu = menu.slice(0, 4);
    const hasMore = menu.length > 4;
    zones[menuZone].push(
      <div key="menu" className="flex shrink-0 items-center gap-1.5">
        <>
          {visibleMenu.map((item, i) => (
            <span key={i} className="text-[10px] text-gray-600">
              {trunc(String(item), 10)}
            </span>
          ))}
          {hasMore && <span className="text-[10px] text-gray-400">…</span>}
        </>
      </div>
    );
  }

  if (showButtons) {
    zones[buttonsZone].push(
      <div key="buttons" className="flex shrink-0 items-center gap-1">
        {buttons.length > 0 ? (
          buttons.slice(0, 3).map((btn, i) => (
            <div key={i} className="rounded border border-gray-400 px-1.5 py-0.5 text-[10px] text-gray-700">
              {trunc(String(btn), 10)}
            </div>
          ))
        ) : (
          <div className="h-4 w-10 rounded border border-dashed border-gray-300" aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
      {/* Left zone */}
      <div className="flex items-center gap-1.5 overflow-hidden">
        {zones.left}
      </div>
      {/* Center zone */}
      <div className="flex items-center justify-center gap-1.5 overflow-hidden">
        {zones.center}
      </div>
      {/* Right zone */}
      <div className="flex items-center justify-end gap-1.5 overflow-hidden">
        {zones.right}
      </div>
    </div>
  );
}

// ── Hero block preview ────────────────────────────────────────────
//
// Same 3-column bar layout as HeaderPreview:
// [title | subtitle | buttons]

function HeroBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const title = typeof p.title === "string" && p.title ? trunc(p.title, 20) : "Заголовок";
  const subtitle = typeof p.subtitle === "string" && p.subtitle ? trunc(p.subtitle, 24) : "";
  const text = typeof p.text === "string" ? p.text : "";
  const buttons = Array.isArray(p.buttons)
    ? (p.buttons as Array<string | { text: string; url?: string }>)
        .map((b) => (typeof b === "object" && b !== null ? b.text : String(b)))
        .filter(Boolean)
    : [];
  const mediaUrl = typeof p.mediaUrl === "string" ? p.mediaUrl : "";
  const mediaType = typeof p.mediaType === "string" ? p.mediaType : "photo";

  const showTitle    = p.showTitle !== false;
  const showSubtitle = p.showSubtitle !== false;
  const showText     = p.showText !== false;
  const showButtons  = p.showButtons !== false;
  const showMedia    = p.showMedia !== false;

  const titleZone    = getZone(fieldAlignments, "title",    "left");
  const subtitleZone = getZone(fieldAlignments, "subtitle", "center");
  const textZone     = getZone(fieldAlignments, "text",     "left");
  const buttonsZone  = getZone(fieldAlignments, "buttons",  "right");
  const mediaZone    = getZone(fieldAlignments, "mediaUrl", "right");

  const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

  if (showTitle) {
    zones[titleZone].push(
      <span key="title" className="truncate text-[10px] font-bold leading-none text-gray-800">
        {title}
      </span>
    );
  }

  if (showSubtitle && subtitle) {
    zones[subtitleZone].push(
      <span key="subtitle" className="truncate text-[10px] italic text-gray-500">
        {subtitle}
      </span>
    );
  }

  if (showText && text) {
    const textAlign =
      textZone === "center" ? "text-center" : textZone === "right" ? "text-right" : "text-left";
    zones[textZone].push(
      <p key="text" className={`line-clamp-6 text-[9px] leading-relaxed text-gray-500 ${textAlign}`}>
        {text}
      </p>
    );
  }

  if (showButtons && buttons.length > 0) {
    zones[buttonsZone].push(
      <div key="buttons" className="flex shrink-0 items-center gap-1">
        {buttons.slice(0, 3).map((btn, i) => (
          <div key={i} className="rounded border border-gray-400 px-1.5 py-0.5 text-[10px] text-gray-700">
            {trunc(String(btn), 10)}
          </div>
        ))}
      </div>
    );
  }

  if (showMedia) {
    zones[mediaZone].push(
      <div key="media" className="flex shrink-0 items-center gap-1" aria-label="Медиа">
        {mediaType === "video" ? (
          <div className="flex h-24 w-40 items-center justify-center rounded border border-gray-300 bg-gray-100">
            <svg viewBox="0 0 16 16" className="h-14 w-14" aria-hidden>
              <rect x="1" y="2" width="10" height="12" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
              <polygon points="12,5 15,8 12,11" fill="#9ca3af" />
            </svg>
          </div>
        ) : (
          <div className="flex h-24 w-40 items-center justify-center rounded border border-gray-300 bg-gray-100">
            <svg viewBox="0 0 16 16" className="h-14 w-14" aria-hidden>
              <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
              <polyline points="1,11 5,7 8,10 11,7 15,11" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
              <circle cx="11.5" cy="4.5" r="1.5" fill="#9ca3af" />
            </svg>
          </div>
        )}
        {mediaUrl && (
          <span className="max-w-[48px] truncate text-[9px] text-gray-400">{mediaUrl}</span>
        )}
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-3 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2">
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-start">
        {zones.left}
      </div>
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-center">
        {zones.center}
      </div>
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-end">
        {zones.right}
      </div>
    </div>
  );
}

// ── per-type preview renderers ────────────────────────────────────

function HeroPreview({ p }: { p: Record<string, unknown> }) {
  const title = typeof p.title === "string" ? p.title : "—";
  const subtitle = typeof p.subtitle === "string" ? p.subtitle : "";
  const btn = typeof p.buttonText === "string" ? p.buttonText : "";

  return (
    <div className="space-y-1">
      <div className="truncate text-[13px] font-semibold leading-tight text-gray-800">
        {trunc(title, 36)}
      </div>
      {subtitle && (
        <div className="truncate text-[11px] text-gray-500">
          {trunc(subtitle, 50)}
        </div>
      )}
      {btn && (
        <div className="mt-1 inline-block rounded border border-gray-300 px-2 py-0.5 text-[10px] text-gray-600">
          {trunc(btn, 22)}
        </div>
      )}
    </div>
  );
}

function CardsPreview({ p }: { p: Record<string, unknown> }) {
  const title =
    typeof p.sectionTitle === "string" && p.sectionTitle
      ? trunc(p.sectionTitle, 32)
      : "—";
  const cols = Math.min(Math.max(Number(p.columns) || 3, 1), 4);
  const cards = Array.isArray(p.cards) ? p.cards : [];

  return (
    <div className="space-y-1.5">
      <div className="truncate text-[12px] font-medium text-gray-800">{title}</div>
      <div className="text-[10px] text-gray-500">
        {cards.length > 0 ? `${cards.length} карт.` : "0 карт."} · {cols} кол.
      </div>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-5 flex-1 rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

// ── Cards block preview (unified "cards" type with variant) ───────

function CardsBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const variant = typeof p.variant === "string" ? p.variant : "products";
  const title =
    typeof p.sectionTitle === "string" && p.sectionTitle
      ? trunc(p.sectionTitle, 28)
      : "Карточки";
  const cols = Math.min(Math.max(Number(p.columns) || 3, 1), 4);
  const showPrice  = variant === "products" && p.showPrice  !== false;
  const showButton = variant === "products" && p.showButton !== false;

  const titleZone = getZone(fieldAlignments, "sectionTitle", "left");
  const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

  zones[titleZone].push(
    <span key="title" className="truncate text-[11px] font-semibold text-gray-800">
      {title}
    </span>
  );

  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      {/* Title row with zone alignment */}
      <div className="grid grid-cols-3">
        <div className="flex items-center gap-1 overflow-hidden">{zones.left}</div>
        <div className="flex items-center justify-center gap-1 overflow-hidden">{zones.center}</div>
        <div className="flex items-center justify-end gap-1 overflow-hidden">
          {zones.right}
        </div>
      </div>

      {/* Cards grid */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        aria-hidden
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 rounded border border-gray-200 bg-white p-1">
            <div className="h-8 rounded bg-gray-200" />
            <div className="h-2 w-3/4 rounded bg-gray-200" />
            {showPrice  && <div className="h-2 w-1/2 rounded bg-gray-300" />}
            {showButton && <div className="h-3 rounded bg-gray-300" />}
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Form block preview ────────────────────────────────────────────

function FormBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const title = typeof p.title === "string" && p.title ? trunc(p.title, 28) : "Форма";
  const showTitle  = p.showTitle  !== false;
  const showButton = p.showButton !== false;
  const buttonText = typeof p.buttonText === "string" && p.buttonText ? p.buttonText : "Отправить";
  const rawFields = Array.isArray(p.fields) ? (p.fields as string[]) : [];
  const fieldLabels = rawFields.map((f) => FIELD_LABELS[f] ?? f);

  const titleZone = getZone(fieldAlignments, "title", "left");
  const titleAlign =
    titleZone === "center" ? "text-center" : titleZone === "right" ? "text-right" : "text-left";

  return (
    <div className="flex h-full flex-col justify-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      {showTitle && (
        <div className={`truncate text-[11px] font-semibold text-gray-800 ${titleAlign}`}>
          {title}
        </div>
      )}
      <div className="flex flex-col gap-1" aria-hidden>
        {fieldLabels.slice(0, 5).map((fl, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-0.5"
          >
            <span className="shrink-0 text-[9px] text-gray-400">{fl}</span>
            <div className="h-2 flex-1 rounded bg-gray-100" />
          </div>
        ))}
        {fieldLabels.length > 5 && (
          <span className="text-[9px] text-gray-400">+ ещё {fieldLabels.length - 5}</span>
        )}
      </div>
      {showButton && (
        <div className="mt-0.5 inline-flex w-fit items-center rounded bg-gray-700 px-2.5 py-0.5 text-[9px] font-medium text-white">
          {trunc(buttonText, 18)}
        </div>
      )}
    </div>
  );
}

function FormPreview({ p }: { p: Record<string, unknown> }) {
  const title =
    typeof p.title === "string" && p.title ? trunc(p.title, 32) : "—";
  const rawFields = Array.isArray(p.fields)
    ? (p.fields as string[])
    : Array.isArray(p.formFields)
    ? (p.formFields as string[])
    : [];
  const fieldLabels = rawFields.map((f) => FIELD_LABELS[f] ?? f);
  const btn = typeof p.buttonText === "string" ? p.buttonText : "";

  return (
    <div className="space-y-1">
      <div className="truncate text-[12px] font-medium text-gray-800">{title}</div>
      {fieldLabels.length > 0 && (
        <div className="space-y-0.5" aria-hidden>
          {fieldLabels.slice(0, 3).map((fl, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm border border-gray-300 bg-white" />
              <span className="text-[10px] text-gray-500">{fl}</span>
            </div>
          ))}
          {fieldLabels.length > 3 && (
            <div className="text-[10px] text-gray-400">
              + ещё {fieldLabels.length - 3}
            </div>
          )}
        </div>
      )}
      {btn && (
        <div className="mt-1 inline-block rounded bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700">
          {trunc(btn, 22)}
        </div>
      )}
    </div>
  );
}

function FooterPreview({ p }: { p: Record<string, unknown> }) {
  const copy =
    typeof p.copyright === "string" && p.copyright
      ? trunc(p.copyright, 44)
      : "—";
  const hasSocial =
    p.socialLinks != null &&
    typeof p.socialLinks === "object" &&
    Object.keys(p.socialLinks as object).length > 0;
  const hasShowSocial = p.showSocial === true;

  return (
    <div className="space-y-0.5">
      <div className="truncate text-[11px] text-gray-700">{copy}</div>
      {(hasSocial || hasShowSocial) && (
        <div className="text-[10px] text-gray-400">Соцсети: есть</div>
      )}
      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200" aria-hidden />
    </div>
  );
}

// ── Footer block preview (unified "footer" type with variant) ─────

function FooterBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const variant = typeof p.variant === "string" ? p.variant : "simple";
  const copyright = typeof p.copyright === "string" && p.copyright ? trunc(p.copyright, 48) : "© 2026";
  const showSocial = p.showSocial === true;

  const copyZone = getZone(fieldAlignments, "copyright", "center");

  // ── subscribe variant ─────────────────────────────────────────────
  if (variant === "subscribe") {
    const title = typeof p.title === "string" && p.title ? trunc(p.title, 32) : "Подпишитесь на новости";
    const buttonText = typeof p.buttonText === "string" && p.buttonText ? trunc(p.buttonText, 16) : "Подписаться";
    const placeholder = typeof p.placeholder === "string" && p.placeholder ? p.placeholder : "Ваш email";

    return (
      <div className="flex flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div className="truncate text-center text-[10px] font-semibold text-gray-700">{title}</div>
        <div className="flex items-center gap-1" aria-hidden>
          <div className="flex flex-1 items-center rounded border border-gray-300 bg-white px-2 py-0.5">
            <span className="text-[9px] text-gray-400">{placeholder}</span>
          </div>
          <div className="shrink-0 rounded bg-gray-700 px-2 py-0.5 text-[9px] text-white">
            {buttonText}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-1">
          <div className={`text-[9px] text-gray-400 ${copyZone === "center" ? "text-center" : copyZone === "right" ? "text-right" : "text-left"}`}>
            {copyright}
          </div>
        </div>
      </div>
    );
  }

  // ── menu variant ──────────────────────────────────────────────────
  if (variant === "menu") {
    const columns = Array.isArray(p.columns) ? p.columns as Array<{ title?: string; links?: string[] }> : [];
    const colCount = Math.max(columns.length, 3);

    return (
      <div className="flex flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(colCount, 4)}, 1fr)` }}
          aria-hidden
        >
          {Array.from({ length: Math.min(colCount, 4) }).map((_, i) => {
            const col = columns[i];
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-2 w-3/4 rounded bg-gray-300" />
                <div className="h-1.5 w-full rounded bg-gray-200" />
                <div className="h-1.5 w-4/5 rounded bg-gray-200" />
                {col?.title && (
                  <span className="truncate text-[8px] font-medium text-gray-600">{trunc(col.title, 12)}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-200 pt-1 flex items-center justify-between">
          <div className={`text-[9px] text-gray-400 ${copyZone === "center" ? "flex-1 text-center" : copyZone === "right" ? "ml-auto" : ""}`}>
            {copyright}
          </div>
          {showSocial && (
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 w-3 rounded-full bg-gray-300" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── simple variant (default) ──────────────────────────────────────
  return (
    <div className="flex flex-col justify-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="h-px w-full bg-gray-200" aria-hidden />
      <div className="flex items-center justify-between">
        <div className={`text-[9px] text-gray-400 ${copyZone === "center" ? "flex-1 text-center" : copyZone === "right" ? "ml-auto" : ""}`}>
          {copyright}
        </div>
        {showSocial && (
          <div className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-3 rounded-full bg-gray-300" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Text block preview ────────────────────────────────────────────
//
// Same 3-column zone layout as Header / Hero. Content is placed into
// left / center / right based on _fieldAlignments (or sensible defaults).

function TextBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const variant = typeof p.variant === "string" ? p.variant : "title-paragraph";

  // ── two-columns: left col | spacer | right col ───────────────────
  if (variant === "two-columns") {
    const showC1T  = p.showColumn1Title !== false;
    const showC1Tx = p.showColumn1Text  !== false;
    const showC2T  = p.showColumn2Title !== false;
    const showC2Tx = p.showColumn2Text  !== false;
    const t1   = typeof p.column1Title === "string" ? trunc(p.column1Title, 14) : "Колонка 1";
    const t2   = typeof p.column2Title === "string" ? trunc(p.column2Title, 14) : "Колонка 2";
    const txt1 = typeof p.column1Text  === "string" ? p.column1Text : "";
    const txt2 = typeof p.column2Text  === "string" ? p.column2Text : "";
    return (
      <div className="grid h-full grid-cols-2 items-center gap-2 rounded border border-gray-200 bg-gray-50 px-2">
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden">
          {showC1T && <span className="truncate text-[10px] font-bold leading-none text-gray-800">{t1}</span>}
          {showC1Tx && txt1 && <p className="line-clamp-3 text-[9px] leading-relaxed text-gray-500">{txt1}</p>}
        </div>
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden">
          {showC2T && <span className="truncate text-[10px] font-bold leading-none text-gray-800">{t2}</span>}
          {showC2Tx && txt2 && <p className="line-clamp-3 text-[9px] leading-relaxed text-gray-500">{txt2}</p>}
        </div>
      </div>
    );
  }

  // ── three-columns ─────────────────────────────────────────────────
  if (variant === "three-columns") {
    const cols = [1, 2, 3].map((n) => ({
      title:     typeof p[`column${n}Title`] === "string" ? trunc(p[`column${n}Title`] as string, 12) : `Колонка ${n}`,
      text:      typeof p[`column${n}Text`]  === "string" ? p[`column${n}Text`] as string : "",
      showTitle: p[`showColumn${n}Title`] !== false,
      showText:  p[`showColumn${n}Text`]  !== false,
    }));
    return (
      <div className="grid h-full grid-cols-3 items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2">
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col justify-center gap-0.5 overflow-hidden">
            {col.showTitle && <span className="truncate text-[10px] font-bold leading-none text-gray-800">{col.title}</span>}
            {col.showText && col.text && <p className="line-clamp-3 text-[9px] leading-relaxed text-gray-500">{col.text}</p>}
          </div>
        ))}
      </div>
    );
  }

  // ── four-columns ──────────────────────────────────────────────────
  if (variant === "four-columns") {
    const cols = [1, 2, 3, 4].map((n) => ({
      title:     typeof p[`column${n}Title`] === "string" ? trunc(p[`column${n}Title`] as string, 10) : `Кол. ${n}`,
      text:      typeof p[`column${n}Text`]  === "string" ? p[`column${n}Text`] as string : "",
      showTitle: p[`showColumn${n}Title`] !== false,
      showText:  p[`showColumn${n}Text`]  !== false,
    }));
    return (
      <div className="grid h-full grid-cols-4 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2">
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col justify-center gap-0.5 overflow-hidden">
            {col.showTitle && <span className="truncate text-[10px] font-bold leading-none text-gray-800">{col.title}</span>}
            {col.showText && col.text && <p className="line-clamp-3 text-[9px] leading-relaxed text-gray-500">{col.text}</p>}
          </div>
        ))}
      </div>
    );
  }

  // ── text-image: text zone + image placeholder ────────────────────
  if (variant === "text-image") {
    const showTitleTI = p.showTitle !== false;
    const showTextTI  = p.showText  !== false;
    const showImageTI = p.showImage !== false;
    const title    = showTitleTI && typeof p.title === "string" && p.title ? trunc(p.title, 22) : "";
    const text     = showTextTI  && typeof p.text  === "string" ? p.text : "";
    const imgZone  = getZone(fieldAlignments, "imageRight", "right");
    const textSide: Zone = imgZone === "right" ? "left" : imgZone === "left" ? "right" : "center";

    const titleZone = getZone(fieldAlignments, "title", textSide);
    const textZone  = getZone(fieldAlignments, "text",  textSide);
    const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

    if (title) {
      zones[titleZone].push(
        <span key="title" className="truncate text-[10px] font-bold leading-none text-gray-800">
          {title}
        </span>
      );
    }
    if (text) {
      zones[textZone].push(
        <p key="text" className="line-clamp-3 text-[9px] leading-relaxed text-gray-500">{text}</p>
      );
    }

    const imgPlaceholder = (
      <div key="img" className="flex shrink-0 items-center justify-center">
        <div className="flex h-24 w-40 items-center justify-center rounded border border-gray-300 bg-gray-100">
          <svg viewBox="0 0 16 16" className="h-14 w-14" aria-hidden>
            <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
            <polyline points="1,11 5,7 8,10 11,7 15,11" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
            <circle cx="11.5" cy="4.5" r="1.5" fill="#9ca3af" />
          </svg>
        </div>
      </div>
    );

    if (showImageTI) {
      zones[imgZone].push(imgPlaceholder);
    }

    return (
      <div className="grid h-full grid-cols-3 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2">
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-start">{zones.left}</div>
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-center">{zones.center}</div>
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-end">{zones.right}</div>
      </div>
    );
  }

  // ── list ─────────────────────────────────────────────────────────
  if (variant === "list") {
    const items      = Array.isArray(p.items) ? (p.items as string[]) : [];
    const isNumbered = p.listType === "numbered";
    const listZone   = getZone(fieldAlignments, "items", "left");
    const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

    zones[listZone].push(
      <div key="list" className="flex flex-col gap-0.5">
        {items.slice(0, 4).map((item, i) => (
          <div key={i} className="flex gap-1 text-[9px] text-gray-600">
            <span className="shrink-0 text-gray-400">{isNumbered ? `${i + 1}.` : "•"}</span>
            <span className="truncate">{trunc(String(item), 30)}</span>
          </div>
        ))}
        {items.length > 4 && (
          <span className="text-[9px] text-gray-400">+ ещё {items.length - 4}</span>
        )}
      </div>
    );

    return (
      <div className="grid h-full grid-cols-3 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2">
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-start">{zones.left}</div>
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-center">{zones.center}</div>
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-end">{zones.right}</div>
      </div>
    );
  }

  // ── quote ─────────────────────────────────────────────────────────
  if (variant === "quote") {
    const quote  = typeof p.quote  === "string" ? p.quote  : "";
    const author = typeof p.author === "string" ? p.author : "";
    const quoteZone  = getZone(fieldAlignments, "quote",  "center");
    const authorZone = getZone(fieldAlignments, "author", "center");
    const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

    if (quote) {
      zones[quoteZone].push(
        <span key="quote" className="line-clamp-2 text-[10px] italic text-gray-600">
          &quot;{trunc(quote, 55)}&quot;
        </span>
      );
    }
    if (author) {
      zones[authorZone].push(
        <span key="author" className="truncate text-[9px] text-gray-400">— {trunc(author, 22)}</span>
      );
    }

    return (
      <div className="grid h-full grid-cols-3 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2">
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-start">{zones.left}</div>
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-center">{zones.center}</div>
        <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-end">{zones.right}</div>
      </div>
    );
  }

  // ── title-paragraph (default) ─────────────────────────────────────
  const showTitleTP   = p.showTitle   !== false;
  const showContentTP = p.showContent !== false;
  const title   = showTitleTP   && typeof p.title   === "string" && p.title   ? trunc(p.title, 28)   : "";
  const content = showContentTP && typeof p.content === "string" ? p.content : "";
  const titleZone   = getZone(fieldAlignments, "title",   "left");
  const contentZone = getZone(fieldAlignments, "content", "left");
  const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

  if (title) {
    zones[titleZone].push(
      <span key="title" className="truncate text-[10px] font-bold leading-none text-gray-800">
        {title}
      </span>
    );
  } else if (showTitleTP) {
    zones[titleZone].push(
      <span key="title" className="truncate text-[10px] font-bold leading-none text-gray-800">
        Заголовок
      </span>
    );
  }
  if (content) {
    zones[contentZone].push(
      <p key="content" className="line-clamp-3 text-[9px] leading-relaxed text-gray-500">
        {content}
      </p>
    );
  }

  return (
    <div className="grid h-full grid-cols-3 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2">
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-start">{zones.left}</div>
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-center">{zones.center}</div>
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-end">{zones.right}</div>
    </div>
  );
}

// ── Media block preview ───────────────────────────────────────────

function MediaBlockPreview({ p }: { p: Record<string, unknown> }) {
  const mediaType = typeof p.mediaType === "string" ? p.mediaType : "image-single";

  if (mediaType === "image-single") {
    const caption = typeof p.caption === "string" ? p.caption : "";
    const alignment = typeof p.alignment === "string" ? p.alignment : "center";
    const alignClass =
      alignment === "right"
        ? "items-end"
        : alignment === "center"
        ? "items-center"
        : "items-start";

    return (
      <div
        className={`flex h-full flex-col justify-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-3 py-2 ${alignClass}`}
      >
        <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-100">
          <svg viewBox="0 0 16 16" className="h-8 w-8" aria-hidden>
            <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
            <polyline points="1,11 5,7 8,10 11,7 15,11" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
            <circle cx="11.5" cy="4.5" r="1.5" fill="#9ca3af" />
          </svg>
        </div>
        {caption && (
          <span className="max-w-[160px] truncate text-[9px] italic text-gray-400">{caption}</span>
        )}
      </div>
    );
  }

  if (mediaType === "image-gallery") {
    const cols = Math.min(Math.max(Number(p.columns) || 3, 1), 4);
    return (
      <div className="flex h-full flex-col gap-1 rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div
          className="min-h-0 flex-1 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          aria-hidden
        >
          {Array.from({ length: cols }).map((_, i) => (
            <div
              key={i}
              className="flex h-full items-center justify-center rounded border border-gray-300 bg-gray-100"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
                <polyline points="1,11 5,7 8,10 11,7 15,11" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
                <circle cx="11.5" cy="4.5" r="1.5" fill="#9ca3af" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mediaType === "image-slider") {
    const autoplay = p.autoplay === true;
    const interval = typeof p.interval === "number" ? p.interval : 3000;

    return (
      <div className="flex h-full flex-col justify-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div className="relative flex h-24 items-center justify-center rounded border border-gray-300 bg-gray-100">
          <span className="absolute left-2 text-sm text-gray-400">‹</span>
          <svg viewBox="0 0 16 16" className="h-8 w-8" aria-hidden>
            <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
            <polyline points="1,11 5,7 8,10 11,7 15,11" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
            <circle cx="11.5" cy="4.5" r="1.5" fill="#9ca3af" />
          </svg>
          <span className="absolute right-2 text-sm text-gray-400">›</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full ${i === 0 ? "w-2.5 bg-gray-500" : "w-1.5 bg-gray-300"}`}
              />
            ))}
          </div>
          {autoplay && (
            <span className="text-[9px] text-gray-400">Авто · {interval} мс</span>
          )}
        </div>
      </div>
    );
  }

  // video
  const videoUrl = typeof p.videoUrl === "string" ? p.videoUrl : "";
  const caption = typeof p.caption === "string" ? p.caption : "";

  return (
    <div className="flex h-full flex-col justify-center items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-100">
        <svg viewBox="0 0 16 16" className="h-8 w-8" aria-hidden>
          <rect x="1" y="2" width="10" height="12" rx="1" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
          <polygon points="12,5 15,8 12,11" fill="#9ca3af" />
        </svg>
      </div>
      {(videoUrl || caption) && (
        <div className="flex flex-col gap-0.5 items-center">
          {videoUrl && <span className="max-w-[160px] truncate text-[9px] text-gray-400">{videoUrl}</span>}
          {caption && <span className="max-w-[160px] truncate text-[9px] italic text-gray-400">{caption}</span>}
        </div>
      )}
    </div>
  );
}

function TextTwoColumnsPreview({ p }: { p: Record<string, unknown> }) {
  const t1 =
    typeof p.column1Title === "string" ? trunc(p.column1Title, 18) : "Колонка 1";
  const t2 =
    typeof p.column2Title === "string" ? trunc(p.column2Title, 18) : "Колонка 2";
  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <div className="flex-1 truncate text-[10px] font-medium text-gray-600">{t1}</div>
        <div className="flex-1 truncate text-[10px] font-medium text-gray-600">{t2}</div>
      </div>
      <div className="flex gap-2" aria-hidden>
        <div className="h-8 flex-1 rounded bg-gray-200" />
        <div className="h-8 flex-1 rounded bg-gray-200" />
      </div>
    </div>
  );
}

function ImageGalleryPreview({ p }: { p: Record<string, unknown> }) {
  const cols = Math.min(Math.max(Number(p.columns) || 3, 1), 4);
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-gray-500">{cols} кол.</div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}
        aria-hidden
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="aspect-square rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function TestimonialsBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const variant = typeof p.variant === "string" ? p.variant : "grid";

  // ── grid / slider ──────────────────────────────────────────────────
  if (variant === "grid" || variant === "slider") {
    const showSectionTitle = p.showSectionTitle !== false;
    const sectionTitle =
      showSectionTitle && typeof p.sectionTitle === "string" && p.sectionTitle
        ? trunc(p.sectionTitle, 28)
        : "";
    const cols = Math.min(Math.max(Number(p.columns) || 2, 1), 3);
    const titleZone = getZone(fieldAlignments, "sectionTitle", "left");
    const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

    if (sectionTitle) {
      zones[titleZone].push(
        <span key="title" className="truncate text-[11px] font-semibold text-gray-800">
          {sectionTitle}
        </span>
      );
    }

    return (
      <div className="flex h-full flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div className="grid grid-cols-3">
          <div className="flex items-center gap-1 overflow-hidden">{zones.left}</div>
          <div className="flex items-center justify-center gap-1 overflow-hidden">{zones.center}</div>
          <div className="flex items-center justify-end gap-1 overflow-hidden">{zones.right}</div>
        </div>
        {variant === "grid" ? (
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            aria-hidden
          >
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="flex flex-col gap-0.5 rounded border border-gray-200 bg-white p-1">
                <div className="h-2 w-3/4 rounded bg-gray-200" />
                <div className="h-1.5 w-full rounded bg-gray-100" />
                <div className="h-1.5 w-1/2 rounded bg-gray-100" />
                <div className="mt-0.5 flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-gray-200" />
                  <div className="h-1.5 w-1/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative flex h-10 items-center justify-center rounded border border-gray-300 bg-white" aria-hidden>
            <span className="absolute left-1.5 text-[10px] text-gray-400">‹</span>
            <div className="flex flex-col items-center gap-0.5 px-6">
              <div className="h-1.5 w-24 rounded bg-gray-200" />
              <div className="h-1.5 w-16 rounded bg-gray-100" />
            </div>
            <span className="absolute right-1.5 text-[10px] text-gray-400">›</span>
          </div>
        )}
      </div>
    );
  }

  // ── single ─────────────────────────────────────────────────────────
  const showQuote       = p.showQuote       !== false;
  const showAuthor      = p.showAuthor      !== false;
  const showAuthorTitle = p.showAuthorTitle !== false;
  const showPhoto       = p.showPhoto       === true;
  const quote       = showQuote       && typeof p.quote       === "string" ? p.quote       : "";
  const author      = showAuthor      && typeof p.author      === "string" ? p.author      : "";
  const authorTitle = showAuthorTitle && typeof p.authorTitle === "string" ? p.authorTitle : "";

  const quoteZone  = getZone(fieldAlignments, "quote",  "center");
  const authorZone = getZone(fieldAlignments, "author", "center");
  const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

  if (quote) {
    zones[quoteZone].push(
      <span key="quote" className="line-clamp-2 text-[10px] italic text-gray-600">
        &quot;{trunc(quote, 55)}&quot;
      </span>
    );
  }

  if (author || authorTitle) {
    zones[authorZone].push(
      <div key="author" className="flex items-center gap-1">
        {showPhoto && <div className="h-4 w-4 rounded-full border border-gray-300 bg-gray-200 shrink-0" aria-hidden />}
        {author && (
          <span className="truncate text-[9px] font-medium text-gray-700">
            {trunc(author, 18)}
          </span>
        )}
        {authorTitle && (
          <span className="truncate text-[9px] text-gray-400">
            · {trunc(authorTitle, 14)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-3 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2">
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-start">{zones.left}</div>
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-center">{zones.center}</div>
      <div className="flex flex-col justify-center gap-0.5 overflow-hidden items-end">{zones.right}</div>
    </div>
  );
}

function TestimonialsPreview({ p }: { p: Record<string, unknown> }) {
  const title =
    typeof p.sectionTitle === "string" && p.sectionTitle
      ? trunc(p.sectionTitle, 30)
      : "—";
  const items = Array.isArray(p.items) ? p.items : [];
  return (
    <div className="space-y-1">
      <div className="truncate text-[12px] font-medium text-gray-800">{title}</div>
      <div className="text-[10px] text-gray-500">
        {items.length > 0 ? `${items.length} отзывов` : "Нет отзывов"}
      </div>
      <div className="mt-1 flex gap-1" aria-hidden>
        {[1, 2].map((i) => (
          <div key={i} className="h-5 flex-1 rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

// ── Pricing table block preview ───────────────────────────────────

function PricingTableBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const showSectionTitle = p.showSectionTitle !== false;
  const sectionTitle =
    showSectionTitle && typeof p.sectionTitle === "string" && p.sectionTitle
      ? trunc(p.sectionTitle, 28)
      : "";
  const cols = Math.min(Math.max(Number(p.columns) || 3, 1), 4);
  const highlightPopular = p.highlightPopular === true;
  const currency = typeof p.currency === "string" && p.currency ? p.currency : "₽";

  const titleZone = getZone(fieldAlignments, "sectionTitle", "center");
  const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

  if (sectionTitle) {
    zones[titleZone].push(
      <span key="title" className="truncate text-[11px] font-semibold text-gray-800">
        {sectionTitle}
      </span>
    );
  }

  const popularIndex = Math.floor((cols - 1) / 2);

  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="grid grid-cols-3">
        <div className="flex items-center gap-1 overflow-hidden">{zones.left}</div>
        <div className="flex items-center justify-center gap-1 overflow-hidden">{zones.center}</div>
        <div className="flex items-center justify-end gap-1 overflow-hidden">{zones.right}</div>
      </div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        aria-hidden
      >
        {Array.from({ length: cols }).map((_, i) => {
          const isPopular = highlightPopular && i === popularIndex;
          return (
            <div
              key={i}
              className={`flex flex-col gap-0.5 rounded border p-1 ${
                isPopular ? "border-gray-500 bg-gray-700" : "border-gray-200 bg-white"
              }`}
            >
              {isPopular && (
                <div className="mx-auto h-1.5 w-2/3 rounded bg-gray-400" />
              )}
              <div className={`h-2 w-3/4 rounded ${isPopular ? "bg-gray-400" : "bg-gray-200"}`} />
              <div className="flex items-baseline gap-0.5">
                <span className={`text-[8px] ${isPopular ? "text-gray-300" : "text-gray-400"}`}>
                  {currency}
                </span>
                <div className={`h-3 w-1/2 rounded ${isPopular ? "bg-gray-400" : "bg-gray-300"}`} />
              </div>
              <div className={`h-1.5 w-full rounded ${isPopular ? "bg-gray-600" : "bg-gray-100"}`} />
              <div className={`h-1.5 w-4/5 rounded ${isPopular ? "bg-gray-600" : "bg-gray-100"}`} />
              <div className={`mt-0.5 h-3 rounded ${isPopular ? "bg-gray-500" : "bg-gray-200"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── FAQ accordion block preview ───────────────────────────────────

function FaqBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const showSectionTitle = p.showSectionTitle !== false;
  const showIcon = p.showIcon !== false;
  const sectionTitle =
    showSectionTitle && typeof p.sectionTitle === "string" && p.sectionTitle
      ? trunc(p.sectionTitle, 32)
      : "";
  const titleZone = getZone(fieldAlignments, "sectionTitle", "left");
  const titleAlign =
    titleZone === "center" ? "text-center" : titleZone === "right" ? "text-right" : "text-left";

  const MOCK_ITEMS = [
    "Как это работает?",
    "Сколько стоит?",
    "Как с вами связаться?",
  ];

  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      {sectionTitle && (
        <div className={`truncate text-[11px] font-semibold text-gray-800 ${titleAlign}`}>
          {sectionTitle}
        </div>
      )}
      <div className="flex flex-col gap-1" aria-hidden>
        {MOCK_ITEMS.map((q, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-0.5"
          >
            {showIcon && (
              <div className="shrink-0 flex h-3 w-3 items-center justify-center rounded-full border border-gray-300 bg-gray-100">
                <span className="text-[7px] font-bold text-gray-500">?</span>
              </div>
            )}
            <span className="truncate text-[9px] text-gray-600">{q}</span>
            <span className="ml-auto shrink-0 text-[8px] text-gray-400">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Contacts block preview ────────────────────────────────────────

function ContactsBlockPreview({
  p,
  fieldAlignments,
}: {
  p: Record<string, unknown>;
  fieldAlignments: FA;
}) {
  const showAddress = p.showAddress !== false;
  const showPhones  = p.showPhones  !== false;
  const showEmails  = p.showEmails  !== false;
  const showSocial  = p.showSocial  === true;
  const showMap     = p.showMap     === true;
  const showHours   = p.showHours   === true;

  const address = showAddress && typeof p.address === "string" ? trunc(p.address, 32) : "";
  const phones  = showPhones  && Array.isArray(p.phones)  ? (p.phones  as string[]).filter(Boolean) : [];
  const emails  = showEmails  && Array.isArray(p.emails)  ? (p.emails  as string[]).filter(Boolean) : [];
  const hours   = showHours   && Array.isArray(p.hours)   ? (p.hours   as string[]).filter(Boolean) : [];
  const hasSocial = showSocial;

  const showSectionTitle = p.showSectionTitle !== false;
  const sectionTitle = showSectionTitle
    ? trunc(
        typeof p.sectionTitle === "string" && p.sectionTitle ? p.sectionTitle : "Контакты",
        32,
      )
    : "";
  const titleZone = getZone(fieldAlignments, "sectionTitle", "left");
  const titleAlign =
    titleZone === "center" ? "text-center" : titleZone === "right" ? "text-right" : "text-left";

  const hasAny = address || phones.length || emails.length || hasSocial || showMap || hours.length;

  if (!hasAny && !sectionTitle) {
    return (
      <div className="flex h-full items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50">
        <span className="text-[10px] text-gray-400">Контакты</span>
      </div>
    );
  }

  // Map each field to its alignment zone
  const addrZone   = getZone(fieldAlignments, "address",     "left");
  const phonesZone = getZone(fieldAlignments, "phones",      "left");
  const emailsZone = getZone(fieldAlignments, "emails",      "left");
  const socialZone = getZone(fieldAlignments, "socialLinks", "left");
  const mapZone    = getZone(fieldAlignments, "mapUrl",      "right");
  const hoursZone  = getZone(fieldAlignments, "hours",       "left");

  const zones: Record<Zone, React.ReactNode[]> = { left: [], center: [], right: [] };

  // Helper to get text alignment class from zone
  const alignClass = (zone: Zone) =>
    zone === "center" ? "items-center" : zone === "right" ? "items-end" : "items-start";

  if (address) {
    zones[addrZone].push(
      <div key="address" className={`flex items-start gap-1 min-w-0 ${alignClass(addrZone)}`}>
        <svg viewBox="0 0 16 16" className="mt-0.5 h-2.5 w-2.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.48-2.02-4.5-4.5-4.5Z" />
          <circle cx="8" cy="6" r="1.5" />
        </svg>
        <span className="min-w-0 truncate text-[9px] text-gray-600">{address}</span>
      </div>
    );
  }

  if (phones.length > 0) {
    zones[phonesZone].push(
      <div key="phones" className={`flex flex-col gap-0.5 ${alignClass(phonesZone)}`}>
        {phones.slice(0, 2).map((ph, i) => (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M3 2h3l1.5 3.5-1.75 1.25A8 8 0 0 0 10.25 10.25L11.5 8.5 15 10v3a1 1 0 0 1-1 1A13 13 0 0 1 2 3a1 1 0 0 1 1-1Z" />
            </svg>
            <span className="min-w-0 truncate text-[9px] text-gray-600">{trunc(ph, 18)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length > 0) {
    zones[emailsZone].push(
      <div key="emails" className={`flex flex-col gap-0.5 ${alignClass(emailsZone)}`}>
        {emails.slice(0, 2).map((em, i) => (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="1.5" y="3.5" width="13" height="9" rx="1" />
              <polyline points="1.5,3.5 8,9 14.5,3.5" />
            </svg>
            <span className="min-w-0 truncate text-[9px] text-gray-600">{trunc(em, 22)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (hasSocial) {
    zones[socialZone].push(
      <div key="social" className="flex items-center gap-1">
        <div className="h-2.5 w-2.5 rounded-full bg-gray-300 shrink-0" aria-hidden />
        <span className="text-[9px] text-gray-400">Соцсети</span>
      </div>
    );
  }

  if (showMap) {
    zones[mapZone].push(
      <div key="map" className="flex shrink-0 items-center justify-center">
        <div className="flex h-16 w-20 items-center justify-center rounded border border-gray-300 bg-gray-100">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 9m0-5v13" />
          </svg>
        </div>
      </div>
    );
  }

  if (hours.length > 0) {
    zones[hoursZone].push(
      <div key="hours" className={`flex flex-col gap-0.5 ${alignClass(hoursZone)}`}>
        {hours.slice(0, 3).map((h, i) => (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <circle cx="8" cy="8" r="6" />
              <polyline points="8,4 8,8 11,10" />
            </svg>
            <span className="min-w-0 truncate text-[9px] text-gray-600">{trunc(String(h), 22)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      {sectionTitle && (
        <div className={`shrink-0 truncate text-[11px] font-semibold text-gray-800 ${titleAlign}`}>
          {sectionTitle}
        </div>
      )}
      <div className="grid min-h-0 flex-1 grid-cols-3 items-center gap-2">
        <div className="flex flex-col justify-center gap-1.5 overflow-hidden items-start">{zones.left}</div>
        <div className="flex flex-col justify-center gap-1.5 overflow-hidden items-center">{zones.center}</div>
        <div className="flex flex-col justify-center gap-1.5 overflow-hidden items-end">{zones.right}</div>
      </div>
    </div>
  );
}

// ── Partners block preview ────────────────────────────────────────

function PartnersBlockPreview({ p }: { p: Record<string, unknown> }) {
  const sectionTitle =
    typeof p.sectionTitle === "string" && p.sectionTitle
      ? trunc(p.sectionTitle, 28)
      : "Партнёры";
  const logos = Array.isArray(p.logos) ? p.logos : [];

  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="truncate text-[11px] font-semibold text-gray-800">{sectionTitle}</div>
      <div className="flex flex-wrap gap-2" aria-hidden>
        {logos.length > 0
          ? logos.slice(0, 6).map((_, i) => (
              <div key={i} className="h-6 w-12 rounded border border-gray-200 bg-white" />
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-12 rounded border border-dashed border-gray-300 bg-gray-50" />
            ))}
      </div>
    </div>
  );
}

// ── Stats block preview ───────────────────────────────────────────

function StatsBlockPreview({ p }: { p: Record<string, unknown> }) {
  const items = Array.isArray(p.items) ? p.items : [];
  const normalize = (item: unknown): { value: string; label: string } => {
    if (typeof item === "object" && item !== null) {
      const obj = item as { value?: string; label?: string };
      return { value: obj.value ?? "—", label: obj.label ?? "" };
    }
    return { value: String(item), label: "" };
  };
  const display =
    items.length > 0
      ? items.slice(0, 4).map(normalize)
      : [
          { value: "100+", label: "Клиентов" },
          { value: "5", label: "Лет" },
          { value: "50", label: "Проектов" },
        ];

  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(display.length, 4)}, 1fr)` }}
        aria-hidden
      >
        {display.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[12px] font-bold text-gray-800">{trunc(item.value, 8)}</span>
            {item.label && (
              <span className="max-w-full truncate text-[9px] text-gray-500">
                {trunc(item.label, 12)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Countdown block preview ───────────────────────────────────────

function CountdownBlockPreview({ p }: { p: Record<string, unknown> }) {
  const targetDate = typeof p.targetDate === "string" ? p.targetDate : "";
  const message = typeof p.message === "string" ? p.message : "";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex gap-2" aria-hidden>
        {(["Д", "Ч", "М", "С"] as const).map((unit, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white">
              <span className="text-[12px] font-bold text-gray-700">00</span>
            </div>
            <span className="text-[8px] text-gray-400">{unit}</span>
          </div>
        ))}
      </div>
      {targetDate && (
        <span className="text-[9px] text-gray-400">{targetDate}</span>
      )}
      {message && (
        <span className="max-w-full truncate text-[9px] text-gray-500">
          {trunc(message, 28)}
        </span>
      )}
    </div>
  );
}

// ── GenericPreview ─────────────────────────────────────────────────

function GenericPreview({ block, p }: { block: CanvasBlock; p: Record<string, unknown> }) {
  let mainLine = getBlockLabel(block.type);
  if (typeof p.title === "string" && p.title) mainLine = p.title;
  else if (typeof p.sectionTitle === "string" && p.sectionTitle) mainLine = p.sectionTitle;
  else if (typeof p.logoText === "string" && p.logoText) mainLine = p.logoText;
  else if (typeof p.quote === "string" && p.quote) mainLine = p.quote;
  else if (typeof p.copyright === "string" && p.copyright) mainLine = p.copyright;
  else if (typeof p.content === "string" && p.content) mainLine = trunc(p.content, 40);

  return (
    <div className="space-y-1">
      <div className="truncate text-[12px] font-medium text-gray-800">
        {trunc(mainLine, 40)}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────

export function BlockPreview({ block }: { block: CanvasBlock }) {
  const p = block.props as Record<string, unknown>;
  const fieldAlignments = (p._fieldAlignments as FA | undefined) ?? {};

  let content: React.ReactNode;

  switch (block.type) {
    case "header":
      content = <HeaderPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "hero":
      content = <HeroBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "hero-classic":
    case "hero-with-form":
    case "hero-with-video":
    case "Hero":
      content = <HeroPreview p={p} />;
      break;

    case "cards":
      content = <CardsBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "cards-products":
    case "cards-team":
    case "cards-benefits":
    case "cards-blog":
    case "Карточки товаров":
      content = <CardsPreview p={p} />;
      break;

    case "form":
      content = <FormBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "form-contact":
    case "form-subscribe":
    case "form-order":
    case "Форма":
      content = <FormPreview p={p} />;
      break;

    case "footer":
      content = <FooterBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "footer-simple":
    case "footer-menu":
    case "footer-subscribe":
    case "Footer":
      content = <FooterPreview p={p} />;
      break;

    case "text":
      content = <TextBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "text-two-columns":
      content = <TextTwoColumnsPreview p={p} />;
      break;

    case "media":
      content = <MediaBlockPreview p={p} />;
      break;

    case "image-gallery":
    case "image-slider":
      content = <ImageGalleryPreview p={p} />;
      break;

    case "testimonials":
      content = <TestimonialsBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "pricing-table":
      content = <PricingTableBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "faq-accordion":
      content = <FaqBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "contacts":
      content = <ContactsBlockPreview p={p} fieldAlignments={fieldAlignments} />;
      break;

    case "partners":
      content = <PartnersBlockPreview p={p} />;
      break;

    case "stats":
      content = <StatsBlockPreview p={p} />;
      break;

    case "countdown":
      content = <CountdownBlockPreview p={p} />;
      break;

    case "testimonials-grid":
    case "testimonials-slider":
    case "testimonial-single":
    case "Отзывы":
      content = <TestimonialsPreview p={p} />;
      break;

    default:
      content = <GenericPreview block={block} p={p} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col px-3 text-xs">
      <div className="min-h-0 flex-1 overflow-hidden">{content}</div>
    </div>
  );
}
