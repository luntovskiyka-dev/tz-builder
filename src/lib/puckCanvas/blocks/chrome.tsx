/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { asButtonList, asStatsList, asString, isPuckEditing } from "@/lib/puckCanvas/utils";

export function renderHeaderBlock(props: Record<string, unknown>): ReactNode {
  const logoText = asString(props.logoText, "Logo");
  const logoImageUrl = asString(props.logoImageUrl);
  const logoHref = asString(props.logoHref, "/");
  const nav = asButtonList(props.navItems);
  const behavior = asString(props.behavior, "static");
  const bg = asString(props.backgroundColor);
  const fg = asString(props.textColor);
  const ctaLabel = asString(props.ctaLabel);
  const ctaHref = asString(props.ctaHref, "#");
  const alignNav = asString(props.alignNav, "end");
  const showMobile = props.showMobileMenu !== false;
  const editing = isPuckEditing(props);

  const navFlex =
    alignNav === "start"
      ? "justify-start"
      : alignNav === "center"
        ? "justify-center"
        : "justify-end";

  const stickyClass = behavior === "sticky" ? "sticky top-0 z-20" : "";

  return (
    <header
      className={`w-full rounded-xl border-b border-border/60 ${stickyClass}`}
      style={{
        ...(bg ? { backgroundColor: bg } : { backgroundColor: "var(--background)" }),
        ...(fg ? { color: fg } : {}),
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:gap-6 sm:py-4">
        <a
          href={editing ? "#" : logoHref}
          className="flex min-w-0 shrink-0 items-center gap-2 text-base font-semibold tracking-tight"
          tabIndex={editing ? -1 : undefined}
          onClick={editing ? (e) => e.preventDefault() : undefined}
        >
          {logoImageUrl ? (
            <span className="block h-8 w-auto max-w-[140px]">
              <img src={logoImageUrl} alt="" className="h-full w-full object-contain object-left" />
            </span>
          ) : (
            <span className="truncate">{logoText}</span>
          )}
        </a>

        <nav
          className={`order-3 flex w-full flex-wrap gap-x-6 gap-y-2 text-sm font-medium sm:order-none sm:flex-1 ${navFlex}`}
          aria-label="Primary"
        >
          {nav.slice(0, 8).map((item, i) => (
            <a
              key={`${item.url}-${i}`}
              href={editing ? "#" : item.url || "#"}
              className="text-foreground/90 underline-offset-4 hover:text-foreground hover:underline"
              tabIndex={editing ? -1 : undefined}
              onClick={editing ? (e) => e.preventDefault() : undefined}
            >
              {item.text || "Link"}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
          {ctaLabel ? (
            <a
              href={editing ? "#" : ctaHref}
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              tabIndex={editing ? -1 : undefined}
              onClick={editing ? (e) => e.preventDefault() : undefined}
            >
              {ctaLabel}
            </a>
          ) : null}
          {showMobile ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground sm:hidden">
              <span aria-hidden>☰</span>
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function renderFooterBlock(props: Record<string, unknown>): ReactNode {
  const columns = asStatsList(props.columns);
  const copyright = asString(props.copyright, "©");
  const bg = asString(props.backgroundColor);
  const fg = asString(props.textColor);
  const paddingY = asString(props.paddingY, "48px");
  const social = asButtonList(props.socialLinks);
  const newsletter = props.newsletter === true;
  const ph = asString(props.newsletterPlaceholder, "Email");
  const editing = isPuckEditing(props);

  return (
    <footer
      className="w-full rounded-xl border-t border-border/60"
      style={{
        ...(bg ? { backgroundColor: bg } : { backgroundColor: "var(--muted)" }),
        ...(fg ? { color: fg } : {}),
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.slice(0, 8).map((col, i) => (
            <div key={`${col.title}-${i}`} className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{col.title || "—"}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{col.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-border/50 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          {social.length > 0 ? (
            <div className="flex flex-wrap gap-4 text-sm">
              {social.slice(0, 8).map((s, i) => (
                <a
                  key={`${s.url}-${i}`}
                  href={editing ? "#" : s.url || "#"}
                  className="font-medium text-foreground/90 hover:text-foreground hover:underline"
                  tabIndex={editing ? -1 : undefined}
                  onClick={editing ? (e) => e.preventDefault() : undefined}
                >
                  {s.text || "Social"}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {newsletter ? (
          <div className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              readOnly
              placeholder={ph}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              tabIndex={-1}
            />
            <button
              type="button"
              className="h-10 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
              tabIndex={-1}
            >
              Subscribe
            </button>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
