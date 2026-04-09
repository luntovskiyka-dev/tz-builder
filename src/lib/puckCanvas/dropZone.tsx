import type { CSSProperties, ReactNode } from "react";

/**
 * Slot render fn from Puck `slot` fields — same surface as DropZone props minus `zone`.
 * @see https://www.puckeditor.com/docs/api-reference/fields/slot
 */
export type PuckSlotComponent = (props?: {
  disallow?: string[];
  allow?: string[];
  style?: CSSProperties;
  className?: string;
  minEmptyHeight?: number | string;
}) => ReactNode;
