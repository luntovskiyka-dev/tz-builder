"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CanvasBlock } from "@/lib/blockTypes";
import { getBlockInspectorSchema, getBlockLabel } from "@/lib/puckBlocks";
import { FieldAlignmentControls, renderInspectorField } from "@/components/dashboard/inspector/renderInspectorField";

const PROP_LABELS_RU: Record<string, string> = {
  title: "Заголовок",
  subtitle: "Подзаголовок",
  sectionTitle: "Заголовок секции",
  content: "Текст",
  text: "Текст",
  logoText: "Текст логотипа",
  buttonText: "Текст кнопки",
  buttonLink: "Ссылка кнопки",
  quote: "Цитата",
  author: "Автор",
  authorTitle: "Должность",
  copyright: "Копирайт",
  showButton: "Показывать кнопку",
  showPhone: "Показывать телефон",
  showSocial: "Показывать соцсети",
  showIcon: "Отображать иконку",
  showPhoto: "Показывать фото",
  showPrice: "Показывать цену",
  imageRight: "Изображение справа",
  imageUrl: "URL изображения",
  videoUrl: "URL видео",
  caption: "Подпись",
  alignment: "Выравнивание",
  columns: "Количество колонок",
  menuItems: "Пункты меню",
  formFields: "Поля формы",
  items: "Элементы",
  cards: "Карточки",
  plans: "Тарифы",
  logos: "Логотипы",
  hours: "Режим работы",
  address: "Адрес",
  phones: "Телефоны",
  emails: "Email",
  socialLinks: "Соцсети",
  backgroundImage: "Фоновое изображение",
  overlay: "Затемнение (%)",
  autoplay: "Автозапуск",
  interval: "Интервал (мс)",
  lightbox: "Лайтбокс",
  listType: "Тип списка",
  column1Title: "Заголовок колонки 1",
  column1Text: "Текст колонки 1",
  column2Title: "Заголовок колонки 2",
  column2Text: "Текст колонки 2",
  displayType: "Тип отображения",
  highlightPopular: "Выделить популярный",
  currency: "Валюта",
  targetDate: "Дата",
  message: "Сообщение",
  link: "Ссылка",
  style: "Стиль",
  mapUrl: "URL карты",
  phone: "Телефон",
  sticky: "Липкий",
  fields: "Поля",
};

const INSPECTOR_INPUT_CLASS =
  "rounded-lg text-sm text-foreground placeholder:text-muted-foreground border-border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
const INSPECTOR_CHECKBOX_CLASS =
  "border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary";
const INSPECTOR_LABEL_CLASS = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1";
const INSPECTOR_PANEL_CLASS =
  "rounded-xl border border-border/70 bg-background/95 p-4 shadow-sm supports-[backdrop-filter]:bg-background/90";

function GenericBlockFields({
  block,
  onChange,
}: {
  block: CanvasBlock;
  onChange: (block: CanvasBlock) => void;
}) {
  const props = block.props as Record<string, unknown>;
  const entries = Object.entries(props).filter(([key]) => key !== "style" && key !== "_fieldAlignments");

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        const label = PROP_LABELS_RU[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        if (typeof value === "string") {
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className={INSPECTOR_LABEL_CLASS}>{label}</Label>
                <FieldAlignmentControls fieldKey={key} block={block} onChange={onChange} />
              </div>
              {value.length > 80 ? (
                <Textarea
                  value={value}
                  onChange={(e) => onChange({ ...block, props: { ...block.props, [key]: e.target.value } })}
                  rows={3}
                  className={INSPECTOR_INPUT_CLASS}
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => onChange({ ...block, props: { ...block.props, [key]: e.target.value } })}
                  className={INSPECTOR_INPUT_CLASS}
                />
              )}
            </div>
          );
        }
        if (typeof value === "boolean") {
          return (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                checked={value}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, [key]: Boolean(checked) } })
                }
                className={INSPECTOR_CHECKBOX_CLASS}
              />
              <Label className={INSPECTOR_LABEL_CLASS}>{label}</Label>
            </div>
          );
        }
        if (typeof value === "number") {
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className={INSPECTOR_LABEL_CLASS}>{label}</Label>
                <FieldAlignmentControls fieldKey={key} block={block} onChange={onChange} />
              </div>
              <Input
                type="number"
                value={value}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, [key]: Number(e.target.value) || 0 } })
                }
                className={`text-sm ${INSPECTOR_INPUT_CLASS}`}
              />
            </div>
          );
        }
        if (Array.isArray(value)) {
          const arr = value as unknown[];
          const isStringArray = arr.every((x) => typeof x === "string");
          if (isStringArray) {
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className={INSPECTOR_LABEL_CLASS}>{label}</Label>
                  <FieldAlignmentControls fieldKey={key} block={block} onChange={onChange} />
                </div>
                {arr.map((item, i) => (
                  <div key={i} className="flex gap-1">
                    <Input
                      value={String(item)}
                      onChange={(e) => {
                        const next = [...arr];
                        next[i] = e.target.value;
                        onChange({ ...block, props: { ...block.props, [key]: next } });
                      }}
                      className="text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = arr.filter((_, j) => j !== i);
                        onChange({ ...block, props: { ...block.props, [key]: next } });
                      }}
                      className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const next = [...arr, ""];
                    onChange({ ...block, props: { ...block.props, [key]: next } });
                  }}
                  className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  + Добавить
                </button>
              </div>
            );
          }
        }
        return null;
      })}
    </div>
  );
}

export function PropertiesInspector({
  block,
  onChange,
}: {
  block: CanvasBlock | undefined;
  onChange: (block: CanvasBlock) => void;
}) {
  if (!block) {
    return (
      <div className={`${INSPECTOR_PANEL_CLASS} flex h-full flex-col items-center justify-center gap-3 px-4 text-center`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/20">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-muted-foreground"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Выберите блок на канвасе
          <br />
          чтобы настроить его параметры
        </p>
      </div>
    );
  }

  const blockSpecificContent = (() => {
    const declarativeSchema = getBlockInspectorSchema(block.type, {
      variant:
        typeof (block.props as Record<string, unknown>).variant === "string"
          ? ((block.props as Record<string, unknown>).variant as string)
          : undefined,
    });
    if (declarativeSchema) {
      return (
        <div className="space-y-4">
          {declarativeSchema.fields.map((field) => renderInspectorField(block, onChange, field))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <GenericBlockFields block={block} onChange={onChange} />
      </div>
    );
  })();

  return (
    <div className={INSPECTOR_PANEL_CLASS}>
      <div className="mb-4 border-b border-border/70 pb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Настройки блока</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{getBlockLabel(block.type)}</p>
      </div>
      {blockSpecificContent}
    </div>
  );
}

