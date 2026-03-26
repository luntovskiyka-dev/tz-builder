"use client";

import React from "react";
import { AlignCenter, AlignLeft, AlignRight, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { CanvasBlock, InspectorFieldDefinition } from "@/lib/blockTypes";
import { applyVariantPresets, getListAppendItem, isFieldVisible } from "@/lib/inspectorSchemaEngine";

const INSPECTOR_INPUT_CLASS =
  "rounded-lg text-sm text-foreground placeholder:text-muted-foreground border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
const INSPECTOR_CHECKBOX_CLASS =
  "border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary";
const INSPECTOR_LABEL_CLASS = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1";

export function FieldAlignmentControls({
  fieldKey,
  block,
  onChange,
}: {
  fieldKey: string;
  block: CanvasBlock;
  onChange: (block: CanvasBlock) => void;
}) {
  const alignments = (block.props._fieldAlignments as Record<string, string>) ?? {};
  const current = alignments[fieldKey] ?? "left";

  const setAlignment = (value: "left" | "center" | "right") => {
    onChange({
      ...block,
      props: {
        ...block.props,
        _fieldAlignments: { ...alignments, [fieldKey]: value },
      },
    });
  };

  return (
    <div className="flex gap-0.5">
      {(
        [
          { value: "left", Icon: AlignLeft, title: "Слева" },
          { value: "center", Icon: AlignCenter, title: "По середине" },
          { value: "right", Icon: AlignRight, title: "Справа" },
        ] as const
      ).map(({ value, Icon, title }) => (
        <button
          key={value}
          type="button"
          title={title}
          onClick={() => setAlignment(value)}
          className={`rounded p-0.5 transition-colors ${
            current === value
              ? "bg-muted/50 text-foreground"
              : "text-muted-foreground/60 hover:text-foreground"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

type HeaderButton = { text: string; url: string };

function normalizeButton(v: unknown): HeaderButton {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    return { text: String(o.text ?? ""), url: String(o.url ?? "") };
  }
  return { text: String(v ?? ""), url: "" };
}

function HeaderButtonRow({
  btn,
  onUpdate,
  onDelete,
}: {
  btn: HeaderButton;
  onUpdate: (updated: HeaderButton) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <div className="flex items-center gap-1">
        <Input
          value={btn.text}
          onChange={(e) => onUpdate({ ...btn, text: e.target.value })}
          className="text-sm flex-1 h-7"
          placeholder="Текст кнопки"
        />
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 text-muted-foreground/70 hover:text-foreground transition-colors"
          aria-label="Развернуть"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {open && (
        <div className="pt-1.5 pb-1 space-y-1">
          <Label className="text-[10px] text-muted-foreground">URL</Label>
          <Input
            value={btn.url}
            onChange={(e) => onUpdate({ ...btn, url: e.target.value })}
            className="text-sm h-7"
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}

export function renderInspectorField(
  block: CanvasBlock,
  onChange: (block: CanvasBlock) => void,
  field: InspectorFieldDefinition,
) {
  const props = block.props as Record<string, unknown>;
  const visible = isFieldVisible(field, props);
  const rawValue = props[field.key];
  const value = typeof rawValue === "string" ? rawValue : "";
  const valueAsList = Array.isArray(rawValue)
    ? rawValue.filter((v): v is string => typeof v === "string")
    : [];

  const setProp = (key: string, next: unknown) => {
    const nextProps: Record<string, unknown> = { ...block.props, [key]: next };
    const withPresets = applyVariantPresets(block.type, key, next, nextProps);
    onChange({ ...block, props: withPresets });
  };

  return (
    <div key={field.key} className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {field.visibilityKey ? (
            <Checkbox
              checked={visible}
              onCheckedChange={(checked) => setProp(field.visibilityKey!, Boolean(checked))}
              className={INSPECTOR_CHECKBOX_CLASS}
            />
          ) : null}
          <Label className={INSPECTOR_LABEL_CLASS}>{field.label}</Label>
        </div>
        {field.alignKey ? (
          <FieldAlignmentControls fieldKey={field.alignKey} block={block} onChange={onChange} />
        ) : null}
      </div>

      {visible &&
        (field.type === "toggle" ? (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={Boolean(rawValue)}
              onCheckedChange={(checked) => setProp(field.key, Boolean(checked))}
              className={INSPECTOR_CHECKBOX_CLASS}
            />
            <Label className={INSPECTOR_LABEL_CLASS}>{field.label}</Label>
          </div>
        ) : field.type === "textarea" ? (
          <Textarea
            value={value}
            onChange={(e) => setProp(field.key, e.target.value)}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            className={`${INSPECTOR_INPUT_CLASS} text-sm resize-y`}
          />
        ) : field.type === "radio" ? (
          <RadioGroup
            value={value || field.options?.[0]?.value || ""}
            onValueChange={(next) => setProp(field.key, typeof rawValue === "number" ? Number(next) : next)}
            className="flex gap-3 pt-1"
          >
            {(field.options ?? []).map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${block.id}-${field.key}-${option.value}`} />
                <Label htmlFor={`${block.id}-${field.key}-${option.value}`} className="text-xs">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : field.type === "number" ? (
          <Input
            type="number"
            value={typeof rawValue === "number" ? rawValue : 0}
            onChange={(e) => setProp(field.key, Number(e.target.value) || 0)}
            className={INSPECTOR_INPUT_CLASS}
          />
        ) : field.type === "date" ? (
          <Input
            type="date"
            value={value}
            onChange={(e) => setProp(field.key, e.target.value)}
            className={INSPECTOR_INPUT_CLASS}
          />
        ) : field.type === "string-list" ? (
          <div className="space-y-1">
            {valueAsList.map((item, i) => (
              <div key={`${field.key}-${i}`} className="flex gap-1">
                <Input
                  value={item}
                  onChange={(e) => {
                    const arr = [...valueAsList];
                    arr[i] = e.target.value;
                    setProp(field.key, arr);
                  }}
                  className="text-sm flex-1"
                  placeholder={field.placeholder}
                />
                <button
                  type="button"
                  onClick={() => setProp(field.key, valueAsList.filter((_, j) => j !== i))}
                  className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setProp(field.key, [...valueAsList, getListAppendItem(field.type)])}
              className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              + Добавить
            </button>
          </div>
        ) : field.type === "button-list" ? (
          <div className="space-y-1">
            {(Array.isArray(rawValue) ? rawValue : []).map((item, i) => {
              const btn = normalizeButton(item);
              return (
                <HeaderButtonRow
                  key={`${field.key}-${i}`}
                  btn={btn}
                  onUpdate={(updated) => {
                    const arr = [...(Array.isArray(rawValue) ? rawValue : [])];
                    arr[i] = updated;
                    setProp(field.key, arr);
                  }}
                  onDelete={() =>
                    setProp(
                      field.key,
                      (Array.isArray(rawValue) ? rawValue : []).filter((_, j) => j !== i),
                    )
                  }
                />
              );
            })}
            <button
              type="button"
              onClick={() =>
                setProp(field.key, [...(Array.isArray(rawValue) ? rawValue : []), getListAppendItem(field.type)])
              }
              className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              + Добавить
            </button>
          </div>
        ) : field.type === "stats-list" ? (
          <div className="space-y-2">
            {(Array.isArray(rawValue) ? rawValue : []).map((item, i) => {
              const parsed =
                item && typeof item === "object" && !Array.isArray(item)
                  ? (item as { value?: string; label?: string })
                  : { value: String(item ?? ""), label: "" };
              const valueText = parsed.value ?? "";
              const labelText = parsed.label ?? "";
              return (
                <div
                  key={`${field.key}-stat-${i}`}
                  className="space-y-1 rounded border border-border bg-muted/30 p-2"
                >
                  <div className="flex items-center gap-1">
                    <Input
                      value={valueText}
                      onChange={(e) => {
                        const arr = Array.isArray(rawValue) ? [...rawValue] : [];
                        const current = arr[i];
                        const normalized =
                          current && typeof current === "object" && !Array.isArray(current)
                            ? (current as { value?: string; label?: string })
                            : { value: String(current ?? ""), label: "" };
                        arr[i] = { ...normalized, value: e.target.value };
                        setProp(field.key, arr);
                      }}
                      placeholder="100+"
                      className="text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProp(
                          field.key,
                          (Array.isArray(rawValue) ? rawValue : []).filter((_, j) => j !== i),
                        )
                      }
                      className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      -
                    </button>
                  </div>
                  <Input
                    value={labelText}
                    onChange={(e) => {
                      const arr = Array.isArray(rawValue) ? [...rawValue] : [];
                      const current = arr[i];
                      const normalized =
                        current && typeof current === "object" && !Array.isArray(current)
                          ? (current as { value?: string; label?: string })
                          : { value: String(current ?? ""), label: "" };
                      arr[i] = { ...normalized, label: e.target.value };
                      setProp(field.key, arr);
                    }}
                    placeholder="Клиентов"
                    className="text-sm"
                  />
                </div>
              );
            })}
            <button
              type="button"
              onClick={() =>
                setProp(field.key, [...(Array.isArray(rawValue) ? rawValue : []), getListAppendItem(field.type)])
              }
              className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              + Добавить
            </button>
          </div>
        ) : (
          <Input
            value={value}
            onChange={(e) => setProp(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={INSPECTOR_INPUT_CLASS}
          />
        ))}
    </div>
  );
}

