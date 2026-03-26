export interface CanvasBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export type InspectorFieldType =
  | "toggle"
  | "text"
  | "textarea"
  | "radio"
  | "number"
  | "date"
  | "string-list"
  | "button-list"
  | "stats-list";

export interface InspectorFieldOption {
  value: string;
  label: string;
}

export interface InspectorFieldDefinition {
  key: string;
  label: string;
  type: InspectorFieldType;
  visibilityKey?: string;
  visibleWhen?: { key: string; values: string[] };
  alignKey?: string;
  placeholder?: string;
  rows?: number;
  options?: InspectorFieldOption[];
}

export interface BlockInspectorSchema {
  fields: InspectorFieldDefinition[];
}

