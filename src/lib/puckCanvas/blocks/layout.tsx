import type { CSSProperties, ReactNode } from "react";
import type { RenderDropZoneFn } from "@/lib/puckCanvas/dropZone";
import {
  asString,
  getGridColumnCount,
  migrateSpaceDirection,
  parseNumeric,
} from "@/lib/puckCanvas/utils";

export function renderFlexBlock(props: Record<string, unknown>, renderDropZone: RenderDropZoneFn): ReactNode {
  const layoutObj =
    props.layout && typeof props.layout === "object" && !Array.isArray(props.layout)
      ? (props.layout as Record<string, unknown>)
      : {};
  const verticalPadding = asString(layoutObj.padding, "0px");
  const direction = asString(props.direction, "row");
  const justifyContent = asString(props.justifyContent, "start");
  const wrap = asString(props.wrap, "wrap");
  const gapPx = Math.max(0, Math.round(parseNumeric(props.gap, 24)));

  const justifyMap: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
  };
  const justify = justifyMap[justifyContent] ?? "flex-start";

  const flexStyle: CSSProperties = {
    display: "flex",
    flexDirection: direction === "column" ? "column" : "row",
    flexWrap: wrap === "nowrap" ? "nowrap" : "wrap",
    justifyContent: justify,
    gap: gapPx,
    width: "100%",
    boxSizing: "border-box",
    height: "100%",
  };

  /** Section-like shell: demo Section horizontal padding + centered inner max width. */
  const sectionShell = (
    <div className="h-full min-h-0 w-full px-4 md:px-6">
      <div className="mx-auto h-full min-h-0 w-full max-w-[1280px]">
        {renderDropZone("children", undefined, {
          disallow: ["hero", "stats"],
          style: flexStyle,
          zoneClassName: "flex h-full min-h-0 w-full",
          minEmptyHeight: 48,
          omitOuterWrapper: true,
        })}
      </div>
    </div>
  );

  if (!verticalPadding || verticalPadding === "0px") {
    return sectionShell;
  }
  return (
    <div className="w-full" style={{ paddingTop: verticalPadding, paddingBottom: verticalPadding }}>
      {sectionShell}
    </div>
  );
}

export function renderGridBlock(props: Record<string, unknown>, renderDropZone: RenderDropZoneFn): ReactNode {
  const count = getGridColumnCount(props.numColumns);
  const gapPx = Math.max(0, Math.round(parseNumeric(props.gap, 24)));
  const cols = `repeat(${count}, 1fr)`;
  const layoutObj =
    props.layout && typeof props.layout === "object" && !Array.isArray(props.layout)
      ? (props.layout as Record<string, unknown>)
      : {};
  const verticalPadding = asString(layoutObj.padding, "0px");
  const gridSlotStyle: CSSProperties = {
    gridTemplateColumns: cols,
    gap: gapPx,
    width: "100%",
    boxSizing: "border-box",
  };
  const slot = renderDropZone("items", undefined, {
    disallow: ["hero", "stats"],
    style: gridSlotStyle,
    zoneClassName:
      "flex w-full min-h-0 flex-col md:grid md:auto-rows-fr md:items-stretch [&>*]:min-h-0",
    omitOuterWrapper: true,
  });
  if (!verticalPadding || verticalPadding === "0px") {
    return slot;
  }
  return (
    <div className="w-full" style={{ paddingTop: verticalPadding, paddingBottom: verticalPadding }}>
      {slot}
    </div>
  );
}

/** Spacer preview aligned with Puck demo Space: `--size` + vertical / horizontal / both (no border/chrome). */
export function renderSpaceBlock(props: Record<string, unknown>): ReactNode {
  let sizeStr = asString(props.size, "24px").trim();
  if (!sizeStr) sizeStr = "24px";
  const n = Number.parseInt(sizeStr, 10);
  if (Number.isFinite(n) && n <= 0) sizeStr = "1px";

  const dir = migrateSpaceDirection(props.direction);
  const cssVar = { ["--size" as string]: sizeStr } as CSSProperties;

  if (dir === "horizontal") {
    return (
      <div
        style={{
          ...cssVar,
          display: "block",
          width: "var(--size)",
          height: "100%",
          minHeight: 0,
        }}
      />
    );
  }
  if (dir === "vertical") {
    return (
      <div
        style={{
          ...cssVar,
          display: "block",
          height: "var(--size)",
          width: "100%",
        }}
      />
    );
  }
  return (
    <div
      style={{
        ...cssVar,
        display: "block",
        height: "var(--size)",
        width: "var(--size)",
      }}
    />
  );
}
