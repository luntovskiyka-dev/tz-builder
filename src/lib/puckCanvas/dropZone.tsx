import type { CSSProperties, ReactNode } from "react";
import { asString } from "@/lib/puckCanvas/utils";

export type RenderDropZoneOptions = {
  disallow?: string[];
  style?: CSSProperties;
  /** Passed to Puck `DropZone` (grid/flex container), not the outer wrapper div. */
  zoneClassName?: string;
  minEmptyHeight?: CSSProperties["minHeight"] | number;
  /**
   * When true, Puck's zone is returned without an extra wrapping `div`.
   * Use for Grid/Flex slots so editor chrome comes only from Puck's DropZone, not a double frame.
   */
  omitOuterWrapper?: boolean;
};

export type RenderDropZoneFn = (
  name: string,
  className?: string,
  options?: RenderDropZoneOptions,
) => ReactNode;

/**
 * Puck scopes zones by context `areaId` (this block's id). Pass only the slot name, e.g. "items" / "children"
 * — not `${id}:${name}`, or the compound key becomes `${areaId}:${id}:${name}` and breaks the slot + updates.
 */
export function createRenderDropZone(props: Record<string, unknown>): RenderDropZoneFn {
  const puckCtx = (props as { puck?: { renderDropZone?: (args: { zone: string }) => ReactNode } }).puck;
  const blockId = asString((props as { id?: unknown }).id);

  function renderDropZone(
    name: string,
    /**
     * Classes on the outer wrapper `div` (ignored when `options.omitOuterWrapper` is true).
     * Default decorative frame applies when this argument is omitted or explicitly `undefined`.
     */
    className = "rounded border border-dashed border-border/70 bg-muted/10 p-2 text-xs",
    options?: RenderDropZoneOptions,
  ): ReactNode {
    if (!puckCtx || typeof puckCtx.renderDropZone !== "function" || !blockId) return null;
    const zone = puckCtx.renderDropZone({
      zone: name,
      ...(options?.disallow && options.disallow.length > 0 ? { disallow: options.disallow } : {}),
      ...(options?.style ? { style: options.style } : {}),
      ...(options?.zoneClassName ? { className: options.zoneClassName } : {}),
      ...(options?.minEmptyHeight !== undefined ? { minEmptyHeight: options.minEmptyHeight } : {}),
    });
    if (options?.omitOuterWrapper) {
      return zone;
    }
    return <div className={className}>{zone}</div>;
  }

  return renderDropZone;
}
