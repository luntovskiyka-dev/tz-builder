"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  loadProjectFromStorage,
  saveProjectToStorage,
  clearProjectFromStorage,
} from "@/utils/storage";
import { logoutAction } from "@/lib/actions/auth";
import {
  loadProjectsAction,
  loadProjectAction,
  saveProjectAction,
  deleteProjectAction,
  type ProjectListItem,
} from "@/lib/actions/projects";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronRight,
  Layout,
  Menu,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  FileInput,
  MessageSquare,
  CreditCard,
  HelpCircle,
  MapPin,
  PanelBottom,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import {
  BLOCK_CATEGORIES,
  createBlock,
  getBlockLabel,
  type CanvasBlock,
} from "@/lib/blocks";
import { BlockPreview } from "@/components/blocks/BlockPreview";
import { ExportModal } from "@/components/export/ExportModal";
import { FeedbackModal } from "@/components/FeedbackModal";

type SavedStatus = "saved" | "saving" | "error";
type DashboardLayoutUser = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  plan?: string | null;
};

type DragData =
  | { type: "palette"; blockType: string }
  | { type: "canvas"; blockId: string };

/** Russian labels for block prop keys (generic inspector) */
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
const INSPECTOR_LABEL_CLASS =
  "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1";
const INSPECTOR_SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground";
const INSPECTOR_SUBTLE_TEXT_CLASS = "text-xs text-muted-foreground leading-relaxed";
const INSPECTOR_PANEL_CLASS =
  "rounded-xl border border-border/70 bg-background/95 p-4 shadow-sm supports-[backdrop-filter]:bg-background/90";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  header: Layout,
  hero: ImageIcon,
  text: Type,
  media: ImageIcon,
  cards: LayoutGrid,
  forms: FileInput,
  testimonials: MessageSquare,
  pricing: CreditCard,
  faq: HelpCircle,
  contacts: MapPin,
  footer: PanelBottom,
};

function PaletteItem({
  blockType,
  label,
  icon: Icon,
}: {
  blockType: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${blockType}`,
      data: { type: "palette", blockType } satisfies DragData,
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.7 : 1,
      }
    : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex h-full w-full cursor-grab items-center gap-1.5 rounded-lg px-3 py-0 text-sm text-foreground text-left active:cursor-grabbing"
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      {label}
    </li>
  );
}

function CanvasBlockItem({
  block,
  selected,
  onSelect,
  onDelete,
}: {
  block: CanvasBlock;
  selected?: boolean;
  onSelect: () => void;
  onDelete: (blockId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: block.id,
      data: {
        type: "canvas",
        blockId: block.id,
      } satisfies DragData,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="cursor-move">
      <div
        className={`
          relative group
          w-full
          transition-all duration-150
          cursor-pointer
          overflow-hidden
          border-b border-border
          ${block.type === "header" || block.type === "footer" ? "min-h-0" : "min-h-[40px]"}
          ${selected
            ? "bg-background border-l-2 border-l-primary"
            : "bg-muted/40 hover:bg-muted/55"
          }
        `}
      >
        <button
          type="button"
          aria-label="Удалить блок"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(block.id);
          }}
          className="
            absolute top-1 right-1
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150
            w-5 h-5
            bg-background border border-border
            rounded
            flex items-center justify-center
            hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive
            text-muted-foreground
            z-20
            shadow-sm
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div
          {...attributes}
          {...listeners}
          className="h-full overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <div className="pointer-events-none select-none">
            <BlockPreview block={block} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasArea({
  blocks,
  children,
  onDeselect,
}: {
  blocks: CanvasBlock[];
  children: React.ReactNode;
  onDeselect: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <main
      className="flex-1 bg-muted/30 overflow-y-auto p-8"
      onClick={onDeselect}
    >
      <div
        ref={setNodeRef}
        className={`max-w-[900px] mx-auto bg-background shadow-sm min-h-screen ${
          isOver ? "ring-2 ring-primary ring-dashed" : ""
        }`}
      >
        {blocks.length === 0 ? (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              Начните с добавления блока
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Перетащите любой блок из библиотеки слева на эту область
            </p>
          </div>
        ) : (
          <div className="flex flex-col w-full">{children}</div>
        )}
      </div>
    </main>
  );
}

function FieldAlignmentControls({
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
          −
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

function PropertiesInspector({
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
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
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
  if (block.type === "header") {
    const p = block.props as { logoText?: string; showLogoImage?: boolean; showLogoText?: boolean; menuItems?: string[]; showMenuItems?: boolean; buttons?: unknown[]; showButtons?: boolean };
    const showLogoImage = p.showLogoImage ?? false;
    const showLogoText  = p.showLogoText !== false;
    const showMenuItems = p.showMenuItems !== false;
    const showButtons   = p.showButtons !== false;
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Шапка</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                className={INSPECTOR_CHECKBOX_CLASS}
                checked={showLogoImage}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showLogoImage: Boolean(checked) } })
                }
              />
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Логотип (изображение)
              </Label>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                className={INSPECTOR_CHECKBOX_CLASS}
                checked={showLogoText}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showLogoText: Boolean(checked) } })
                }
              />
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Текст логотипа
              </Label>
            </div>
            <FieldAlignmentControls fieldKey="logoText" block={block} onChange={onChange} />
          </div>
          {showLogoText && (
            <Input
              value={p.logoText ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, logoText: e.target.value } })
              }
              className={INSPECTOR_INPUT_CLASS}
            />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                className={INSPECTOR_CHECKBOX_CLASS}
                checked={showMenuItems}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showMenuItems: Boolean(checked) } })
                }
              />
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Пункты меню
              </Label>
            </div>
            <FieldAlignmentControls fieldKey="menuItems" block={block} onChange={onChange} />
          </div>
          {showMenuItems && (
            <>
              {(Array.isArray(p.menuItems) ? p.menuItems : []).map((item, i) => (
                <div key={i} className="flex gap-1">
                  <Input
                    value={String(item)}
                    onChange={(e) => {
                      const arr = [...(p.menuItems ?? [])];
                      arr[i] = e.target.value;
                      onChange({ ...block, props: { ...block.props, menuItems: arr } });
                    }}
                    className={`text-sm flex-1 ${INSPECTOR_INPUT_CLASS}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = (p.menuItems ?? []).filter((_, j) => j !== i);
                      onChange({ ...block, props: { ...block.props, menuItems: arr } });
                    }}
                    className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(p.menuItems ?? []), ""];
                  onChange({ ...block, props: { ...block.props, menuItems: arr } });
                }}
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                + Добавить
              </button>
            </>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showButtons}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showButtons: Boolean(checked) } })
                }
                className={INSPECTOR_CHECKBOX_CLASS}
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Кнопки</Label>
            </div>
            <FieldAlignmentControls fieldKey="buttons" block={block} onChange={onChange} />
          </div>
          {showButtons && (
            <>
              {(Array.isArray(p.buttons) ? p.buttons : []).map((item, i) => {
                const btn = normalizeButton(item);
                return (
                  <HeaderButtonRow
                    key={i}
                    btn={btn}
                    onUpdate={(updated) => {
                      const arr = [...(p.buttons ?? [])];
                      arr[i] = updated;
                      onChange({ ...block, props: { ...block.props, buttons: arr } });
                    }}
                    onDelete={() => {
                      const arr = (p.buttons ?? []).filter((_, j) => j !== i);
                      onChange({ ...block, props: { ...block.props, buttons: arr } });
                    }}
                  />
                );
              })}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(p.buttons ?? []), { text: "", url: "" }];
                  onChange({ ...block, props: { ...block.props, buttons: arr } });
                }}
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                + Добавить
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "hero") {
    const p = block.props as { title?: string; subtitle?: string; text?: string; buttons?: unknown[]; mediaUrl?: string; mediaType?: string; showTitle?: boolean; showSubtitle?: boolean; showText?: boolean; showButtons?: boolean; showMedia?: boolean };
    const showTitle = p.showTitle !== false;
    const showSubtitle = p.showSubtitle !== false;
    const showText = p.showText !== false;
    const showButtons = p.showButtons !== false;
    const showMedia = p.showMedia !== false;
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Первый экран</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showTitle}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showTitle: Boolean(checked) } })
                }
                className={INSPECTOR_CHECKBOX_CLASS}
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
            </div>
            <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
          </div>
          {showTitle && (
            <Input
              value={p.title ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, title: e.target.value } })
              }
              className={INSPECTOR_INPUT_CLASS}
            />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showSubtitle}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showSubtitle: Boolean(checked) } })
                }
                className={INSPECTOR_CHECKBOX_CLASS}
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Подзаголовок</Label>
            </div>
            <FieldAlignmentControls fieldKey="subtitle" block={block} onChange={onChange} />
          </div>
          {showSubtitle && (
            <Input
              value={p.subtitle ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, subtitle: e.target.value } })
              }
              className={INSPECTOR_INPUT_CLASS}
            />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showText}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showText: Boolean(checked) } })
                }
                className={INSPECTOR_CHECKBOX_CLASS}
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Текст</Label>
            </div>
            <FieldAlignmentControls fieldKey="text" block={block} onChange={onChange} />
          </div>
          {showText && (
            <Textarea
              value={p.text ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, text: e.target.value } })
              }
              rows={6}
              placeholder="Основной текст первого экрана..."
              className={`${INSPECTOR_INPUT_CLASS} text-sm resize-y`}
            />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showButtons}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showButtons: Boolean(checked) } })
                }
                className={INSPECTOR_CHECKBOX_CLASS}
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Кнопки</Label>
            </div>
            <FieldAlignmentControls fieldKey="buttons" block={block} onChange={onChange} />
          </div>
          {showButtons && (
            <>
              {(Array.isArray(p.buttons) ? p.buttons : []).map((item, i) => {
                const btn = normalizeButton(item);
                return (
                  <HeaderButtonRow
                    key={i}
                    btn={btn}
                    onUpdate={(updated) => {
                      const arr = [...(p.buttons ?? [])];
                      arr[i] = updated;
                      onChange({ ...block, props: { ...block.props, buttons: arr } });
                    }}
                    onDelete={() => {
                      const arr = (p.buttons ?? []).filter((_, j) => j !== i);
                      onChange({ ...block, props: { ...block.props, buttons: arr } });
                    }}
                  />
                );
              })}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(p.buttons ?? []), { text: "", url: "" }];
                  onChange({ ...block, props: { ...block.props, buttons: arr } });
                }}
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                + Добавить
              </button>
            </>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showMedia}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showMedia: Boolean(checked) } })
                }
                className={INSPECTOR_CHECKBOX_CLASS}
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Медиа (фото / видео)</Label>
            </div>
            <FieldAlignmentControls fieldKey="mediaUrl" block={block} onChange={onChange} />
          </div>
          {showMedia && (
            <>
              <Input
                value={p.mediaUrl ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, mediaUrl: e.target.value } })
                }
                placeholder="URL фото или видео"
                className={INSPECTOR_INPUT_CLASS}
              />
              <RadioGroup
                value={p.mediaType ?? "photo"}
                onValueChange={(value) =>
                  onChange({ ...block, props: { ...block.props, mediaType: value } })
                }
                className="flex gap-3 pt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="photo" id="hero-media-photo" />
                  <Label htmlFor="hero-media-photo" className="text-xs">Фото</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="hero-media-video" />
                  <Label htmlFor="hero-media-video" className="text-xs">Видео</Label>
                </div>
              </RadioGroup>
            </>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "text") {
    const p = block.props as {
      variant?: string;
      title?: string;
      content?: string;
      column1Title?: string;
      column1Text?: string;
      column2Title?: string;
      column2Text?: string;
      column3Title?: string;
      column3Text?: string;
      column4Title?: string;
      column4Text?: string;
      quote?: string;
      author?: string;
      authorTitle?: string;
      showPhoto?: boolean;
      listType?: string;
      items?: string[];
      text?: string;
      imageRight?: boolean;
      showTitle?: boolean;
      showContent?: boolean;
      showColumn1Title?: boolean;
      showColumn1Text?: boolean;
      showColumn2Title?: boolean;
      showColumn2Text?: boolean;
      showColumn3Title?: boolean;
      showColumn3Text?: boolean;
      showColumn4Title?: boolean;
      showColumn4Text?: boolean;
      showText?: boolean;
      showImage?: boolean;
    };
    const variant = p.variant ?? "title-paragraph";
    const showTitle        = p.showTitle        !== false;
    const showContent      = p.showContent      !== false;
    const showColumn1Title = p.showColumn1Title !== false;
    const showColumn1Text  = p.showColumn1Text  !== false;
    const showColumn2Title = p.showColumn2Title !== false;
    const showColumn2Text  = p.showColumn2Text  !== false;
    const showText         = p.showText         !== false;
    const showImage        = p.showImage        !== false;
    const setVariant = (v: string) => {
      const extra: Record<string, unknown> = {};
      const count = v === "two-columns" ? 2 : v === "three-columns" ? 3 : v === "four-columns" ? 4 : 0;
      for (let n = 1; n <= count; n++) {
        if (!block.props[`column${n}Title`]) extra[`column${n}Title`] = `Колонка ${n}`;
        if (!block.props[`column${n}Text`])  extra[`column${n}Text`]  = "Текст...";
      }
      onChange({ ...block, props: { ...block.props, ...extra, variant: v } });
    };

    const VARIANTS = [
      { value: "title-paragraph", label: "Заголовок и абзац" },
      { value: "two-columns",     label: "Две колонки" },
      { value: "three-columns",   label: "Три колонки" },
      { value: "four-columns",    label: "Четыре колонки" },
      { value: "text-image",      label: "Текст и изображение" },
    ];

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Текст</h3>

        {/* Variant selector */}
        <div className="space-y-1.5">
          <Label className={INSPECTOR_LABEL_CLASS}>Тип секции</Label>
          <RadioGroup
            value={variant}
            onValueChange={setVariant}
            className="space-y-1"
          >
            {VARIANTS.map((v) => (
              <div key={v.value} className="flex items-center space-x-2">
                <RadioGroupItem value={v.value} id={`text-variant-${v.value}`} />
                <Label htmlFor={`text-variant-${v.value}`} className="text-xs font-normal">
                  {v.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Заголовок и абзац */}
        {variant === "title-paragraph" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showTitle}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showTitle: Boolean(checked) } })
                    }
                    className={INSPECTOR_CHECKBOX_CLASS}
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
                </div>
                <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
              </div>
              {showTitle && (
                <Input
                  value={p.title ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, title: e.target.value } })
                  }
                  className={INSPECTOR_INPUT_CLASS}
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showContent}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showContent: Boolean(checked) } })
                    }
                    className={INSPECTOR_CHECKBOX_CLASS}
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Текст абзаца</Label>
                </div>
                <FieldAlignmentControls fieldKey="content" block={block} onChange={onChange} />
              </div>
              {showContent && (
                <Textarea
                  value={p.content ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, content: e.target.value } })
                  }
                  rows={4}
                  className={`${INSPECTOR_INPUT_CLASS} text-sm resize-y`}
                />
              )}
            </div>
          </>
        )}

        {/* Две колонки */}
        {variant === "two-columns" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showColumn1Title}
                  onCheckedChange={(checked) =>
                    onChange({ ...block, props: { ...block.props, showColumn1Title: Boolean(checked) } })
                  }
                  className={INSPECTOR_CHECKBOX_CLASS}
                />
                <Label className={INSPECTOR_LABEL_CLASS}>Заголовок колонки 1</Label>
              </div>
              {showColumn1Title && (
                <Input
                  value={p.column1Title ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, column1Title: e.target.value } })
                  }
                  className={INSPECTOR_INPUT_CLASS}
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showColumn1Text}
                  onCheckedChange={(checked) =>
                    onChange({ ...block, props: { ...block.props, showColumn1Text: Boolean(checked) } })
                  }
                  className={INSPECTOR_CHECKBOX_CLASS}
                />
                <Label className={INSPECTOR_LABEL_CLASS}>Текст колонки 1</Label>
              </div>
              {showColumn1Text && (
                <Textarea
                  value={p.column1Text ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, column1Text: e.target.value } })
                  }
                  rows={3}
                  className={`${INSPECTOR_INPUT_CLASS} text-sm resize-y`}
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showColumn2Title}
                  onCheckedChange={(checked) =>
                    onChange({ ...block, props: { ...block.props, showColumn2Title: Boolean(checked) } })
                  }
                  className={INSPECTOR_CHECKBOX_CLASS}
                />
                <Label className={INSPECTOR_LABEL_CLASS}>Заголовок колонки 2</Label>
              </div>
              {showColumn2Title && (
                <Input
                  value={p.column2Title ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, column2Title: e.target.value } })
                  }
                  className={INSPECTOR_INPUT_CLASS}
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showColumn2Text}
                  onCheckedChange={(checked) =>
                    onChange({ ...block, props: { ...block.props, showColumn2Text: Boolean(checked) } })
                  }
                  className={INSPECTOR_CHECKBOX_CLASS}
                />
                <Label className={INSPECTOR_LABEL_CLASS}>Текст колонки 2</Label>
              </div>
              {showColumn2Text && (
                <Textarea
                  value={p.column2Text ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, column2Text: e.target.value } })
                  }
                  rows={3}
                  className={`${INSPECTOR_INPUT_CLASS} text-sm resize-y`}
                />
              )}
            </div>
          </>
        )}

        {/* Три колонки */}
        {variant === "three-columns" && (
          <>
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={block.props[`showColumn${n}Title`] !== false}
                      onCheckedChange={(checked) =>
                        onChange({ ...block, props: { ...block.props, [`showColumn${n}Title`]: Boolean(checked) } })
                      }
                      className={INSPECTOR_CHECKBOX_CLASS}
                    />
                    <Label className={INSPECTOR_LABEL_CLASS}>Заголовок колонки {n}</Label>
                  </div>
                  {block.props[`showColumn${n}Title`] !== false && (
                    <Input
                      value={(p[`column${n}Title` as keyof typeof p] as string) ?? ""}
                      onChange={(e) =>
                        onChange({ ...block, props: { ...block.props, [`column${n}Title`]: e.target.value } })
                      }
                      className={INSPECTOR_INPUT_CLASS}
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={block.props[`showColumn${n}Text`] !== false}
                      onCheckedChange={(checked) =>
                        onChange({ ...block, props: { ...block.props, [`showColumn${n}Text`]: Boolean(checked) } })
                      }
                    />
                    <Label className={INSPECTOR_LABEL_CLASS}>Текст колонки {n}</Label>
                  </div>
                  {block.props[`showColumn${n}Text`] !== false && (
                    <Textarea
                      value={(p[`column${n}Text` as keyof typeof p] as string) ?? ""}
                      onChange={(e) =>
                        onChange({ ...block, props: { ...block.props, [`column${n}Text`]: e.target.value } })
                      }
                      rows={3}
                      className="text-sm resize-y"
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
          </>
        )}

        {/* Четыре колонки */}
        {variant === "four-columns" && (
          <>
            {[1, 2, 3, 4].map((n) => (
              <React.Fragment key={n}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={block.props[`showColumn${n}Title`] !== false}
                      onCheckedChange={(checked) =>
                        onChange({ ...block, props: { ...block.props, [`showColumn${n}Title`]: Boolean(checked) } })
                      }
                    />
                    <Label className={INSPECTOR_LABEL_CLASS}>Заголовок колонки {n}</Label>
                  </div>
                  {block.props[`showColumn${n}Title`] !== false && (
                    <Input
                      value={(p[`column${n}Title` as keyof typeof p] as string) ?? ""}
                      onChange={(e) =>
                        onChange({ ...block, props: { ...block.props, [`column${n}Title`]: e.target.value } })
                      }
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={block.props[`showColumn${n}Text`] !== false}
                      onCheckedChange={(checked) =>
                        onChange({ ...block, props: { ...block.props, [`showColumn${n}Text`]: Boolean(checked) } })
                      }
                    />
                    <Label className={INSPECTOR_LABEL_CLASS}>Текст колонки {n}</Label>
                  </div>
                  {block.props[`showColumn${n}Text`] !== false && (
                    <Textarea
                      value={(p[`column${n}Text` as keyof typeof p] as string) ?? ""}
                      onChange={(e) =>
                        onChange({ ...block, props: { ...block.props, [`column${n}Text`]: e.target.value } })
                      }
                      rows={3}
                      className="text-sm resize-y"
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
          </>
        )}

        {/* Текст и изображение */}
        {variant === "text-image" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showTitle}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showTitle: Boolean(checked) } })
                    }
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
                </div>
                <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
              </div>
              {showTitle && (
                <Input
                  value={p.title ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, title: e.target.value } })
                  }
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showText}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showText: Boolean(checked) } })
                    }
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Текст</Label>
                </div>
                <FieldAlignmentControls fieldKey="text" block={block} onChange={onChange} />
              </div>
              {showText && (
                <Textarea
                  value={p.text ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, text: e.target.value } })
                  }
                  rows={4}
                  className="text-sm resize-y"
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showImage}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showImage: Boolean(checked) } })
                    }
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Изображение</Label>
                </div>
                <FieldAlignmentControls fieldKey="imageRight" block={block} onChange={onChange} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (block.type === "media") {
    const p = block.props as {
      mediaType?: string;
      imageUrl?: string;
      caption?: string;
      alignment?: string;
      columns?: number;
      lightbox?: boolean;
      autoplay?: boolean;
      interval?: number;
      videoUrl?: string;
    };
    const mediaType = p.mediaType ?? "image-single";

    const MEDIA_TYPES = [
      { value: "image-single", label: "Одно изображение" },
      { value: "image-gallery", label: "Галерея изображений" },
      { value: "image-slider", label: "Слайдер изображений" },
      { value: "video", label: "Видео" },
    ];

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Медиа</h3>

        <div className="space-y-1.5">
          <Label className={INSPECTOR_LABEL_CLASS}>Тип медиа</Label>
          <RadioGroup
            value={mediaType}
            onValueChange={(value) =>
              onChange({ ...block, props: { ...block.props, mediaType: value } })
            }
            className="space-y-1"
          >
            {MEDIA_TYPES.map((t) => (
              <div key={t.value} className="flex items-center space-x-2">
                <RadioGroupItem value={t.value} id={`media-type-${t.value}`} />
                <Label htmlFor={`media-type-${t.value}`} className="text-xs font-normal">
                  {t.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {mediaType === "image-single" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className={INSPECTOR_LABEL_CLASS}>URL изображения</Label>
                <FieldAlignmentControls fieldKey="imageUrl" block={block} onChange={onChange} />
              </div>
              <Input
                value={p.imageUrl ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, imageUrl: e.target.value } })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className={INSPECTOR_LABEL_CLASS}>Подпись</Label>
                <FieldAlignmentControls fieldKey="caption" block={block} onChange={onChange} />
              </div>
              <Input
                value={p.caption ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, caption: e.target.value } })
                }
                placeholder="Подпись к изображению"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={INSPECTOR_LABEL_CLASS}>Выравнивание</Label>
              <RadioGroup
                value={p.alignment ?? "center"}
                onValueChange={(value) =>
                  onChange({ ...block, props: { ...block.props, alignment: value } })
                }
                className="flex gap-3"
              >
                {[
                  { v: "left", l: "Слева" },
                  { v: "center", l: "По центру" },
                  { v: "right", l: "Справа" },
                ].map(({ v, l }) => (
                  <div key={v} className="flex items-center space-x-2">
                    <RadioGroupItem value={v} id={`media-align-${v}`} />
                    <Label htmlFor={`media-align-${v}`} className="text-xs">{l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </>
        )}

        {mediaType === "image-gallery" && (
          <>
            <div className="space-y-2">
              <Label className={INSPECTOR_LABEL_CLASS}>Количество колонок</Label>
              <RadioGroup
                value={String(p.columns ?? 3)}
                onValueChange={(value) =>
                  onChange({ ...block, props: { ...block.props, columns: Number(value) } })
                }
                className="flex gap-3"
              >
                {[2, 3, 4].map((c) => (
                  <div key={c} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(c)} id={`media-cols-${c}`} />
                    <Label htmlFor={`media-cols-${c}`} className="text-xs">{c}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </>
        )}


        {mediaType === "video" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className={INSPECTOR_LABEL_CLASS}>URL видео</Label>
                <FieldAlignmentControls fieldKey="videoUrl" block={block} onChange={onChange} />
              </div>
              <Input
                value={p.videoUrl ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, videoUrl: e.target.value } })
                }
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className={INSPECTOR_LABEL_CLASS}>Подпись</Label>
                <FieldAlignmentControls fieldKey="caption" block={block} onChange={onChange} />
              </div>
              <Input
                value={p.caption ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, caption: e.target.value } })
                }
                placeholder="Подпись к видео"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  if (block.type === "cards") {
    const p = block.props as {
      variant?: string;
      sectionTitle?: string;
      columns?: number;
      showPrice?: boolean;
      showButton?: boolean;
      cards?: unknown[];
    };
    const variant = p.variant ?? "products";

    const CARD_VARIANTS = [
      { value: "products",  label: "Товары" },
      { value: "team",      label: "Команда" },
      { value: "benefits",  label: "Преимущества" },
      { value: "blog",      label: "Блог" },
    ];

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Карточки</h3>

        {/* Заголовок секции = тип карточек */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Заголовок секции</Label>
            <FieldAlignmentControls fieldKey="sectionTitle" block={block} onChange={onChange} />
          </div>
          <RadioGroup
            value={variant}
            onValueChange={(v) => {
              const label = CARD_VARIANTS.find((c) => c.value === v)?.label ?? v;
              onChange({ ...block, props: { ...block.props, variant: v, sectionTitle: label } });
            }}
            className="space-y-1"
          >
            {CARD_VARIANTS.map((v) => (
              <div key={v.value} className="flex items-center space-x-2">
                <RadioGroupItem value={v.value} id={`cards-variant-${v.value}`} />
                <Label htmlFor={`cards-variant-${v.value}`} className="text-xs font-medium">
                  {v.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Количество колонок */}
        <div className="space-y-2">
          <Label className={INSPECTOR_LABEL_CLASS}>Количество колонок</Label>
          <RadioGroup
            value={String(p.columns ?? 3)}
            onValueChange={(v) =>
              onChange({ ...block, props: { ...block.props, columns: Number(v) } })
            }
            className="flex gap-3"
          >
            {[2, 3, 4].map((c) => (
              <div key={c} className="flex items-center space-x-2">
                <RadioGroupItem value={String(c)} id={`cards-cols-${c}`} />
                <Label htmlFor={`cards-cols-${c}`} className="text-xs">{c}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

      </div>
    );
  }

  if (block.type === "form") {
    const p = block.props as {
      variant?: string;
      title?: string;
      fields?: string[];
      buttonText?: string;
      showTitle?: boolean;
      showButton?: boolean;
    };
    const variant = p.variant ?? "contact";
    const showTitle = p.showTitle !== false;
    const showButton = p.showButton !== false;
    const currentFields = Array.isArray(p.fields) ? p.fields : [];

    const FORM_VARIANTS = [
      { value: "contact",   label: "Обратная связь" },
      { value: "subscribe", label: "Подписка" },
      { value: "order",     label: "Форма заказа" },
    ];

    const VARIANT_DEFAULTS: Record<string, { title: string; fields: string[]; buttonText: string }> = {
      contact:   { title: "Обратная связь", fields: ["name", "email", "message"], buttonText: "Отправить" },
      subscribe: { title: "Подписка",       fields: ["email"],                    buttonText: "Подписаться" },
      order:     { title: "Форма заказа",   fields: ["name", "phone", "email", "comment"], buttonText: "Заказать" },
    };

    const FIELD_OPTIONS = [
      { value: "name",    label: "Имя" },
      { value: "email",   label: "Email" },
      { value: "phone",   label: "Телефон" },
      { value: "message", label: "Сообщение" },
      { value: "comment", label: "Комментарий" },
    ];

    const setVariant = (v: string) => {
      const defaults = VARIANT_DEFAULTS[v] ?? VARIANT_DEFAULTS.contact;
      onChange({ ...block, props: { ...block.props, variant: v, title: defaults.title, fields: defaults.fields, buttonText: defaults.buttonText } });
    };

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Форма</h3>

        <div className="space-y-1.5">
          <Label className={INSPECTOR_LABEL_CLASS}>Тип формы</Label>
          <RadioGroup value={variant} onValueChange={setVariant} className="space-y-1">
            {FORM_VARIANTS.map((v) => (
              <div key={v.value} className="flex items-center space-x-2">
                <RadioGroupItem value={v.value} id={`form-variant-${v.value}`} />
                <Label htmlFor={`form-variant-${v.value}`} className="text-xs font-normal">
                  {v.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showTitle}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showTitle: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
            </div>
            <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
          </div>
          {showTitle && (
            <Input
              value={p.title ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, title: e.target.value } })
              }
            />
          )}
        </div>

        <div className="space-y-1.5">
          <Label className={INSPECTOR_LABEL_CLASS}>Поля формы</Label>
          <div className="space-y-1">
            {FIELD_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  checked={currentFields.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const nextFields = checked
                      ? [...currentFields, opt.value]
                      : currentFields.filter((f) => f !== opt.value);
                    onChange({ ...block, props: { ...block.props, fields: nextFields } });
                  }}
                />
                <Label className={INSPECTOR_LABEL_CLASS}>{opt.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={showButton}
              onCheckedChange={(checked) =>
                onChange({ ...block, props: { ...block.props, showButton: Boolean(checked) } })
              }
            />
            <Label className={INSPECTOR_LABEL_CLASS}>Кнопка</Label>
          </div>
          {showButton && (
            <Input
              value={p.buttonText ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, buttonText: e.target.value } })
              }
              placeholder="Текст кнопки"
            />
          )}
        </div>
      </div>
    );
  }

  if (block.type === "Карточки товаров") {
    const p = block.props as { sectionTitle?: string; columns?: number };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Карточки товаров</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Заголовок секции</Label>
            <FieldAlignmentControls fieldKey="sectionTitle" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.sectionTitle ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, sectionTitle: e.target.value } })
            }
          />
        </div>
        <div className="space-y-2">
          <Label className={INSPECTOR_LABEL_CLASS}>Количество колонок</Label>
          <RadioGroup
            value={String(p.columns ?? 3)}
            onValueChange={(value) =>
              onChange({
                ...block,
                props: { ...block.props, columns: Number(value) as 2 | 3 | 4 },
              })
            }
            className="flex gap-3"
          >
            {[2, 3, 4].map((c) => (
              <div key={c} className="flex items-center space-x-2">
                <RadioGroupItem value={String(c)} id={`cols-${c}`} />
                <Label htmlFor={`cols-${c}`} className="text-xs">
                  {c}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    );
  }

  if (block.type === "Текст+Изображение") {
    const p = block.props as { title?: string; text?: string; imageRight?: boolean };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Текст + Изображение</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
            <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.title ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, title: e.target.value } })
            }
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Текст</Label>
            <FieldAlignmentControls fieldKey="text" block={block} onChange={onChange} />
          </div>
          <Textarea
            value={p.text ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, text: e.target.value } })
            }
            rows={4}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={p.imageRight ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...block, props: { ...block.props, imageRight: Boolean(checked) } })
            }
          />
          <Label className={INSPECTOR_LABEL_CLASS}>Изображение справа</Label>
        </div>
      </div>
    );
  }

  if (block.type === "Форма") {
    const p = block.props as { title?: string; showPhone?: boolean };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Форма</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Заголовок формы</Label>
            <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.title ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, title: e.target.value } })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={p.showPhone ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...block, props: { ...block.props, showPhone: Boolean(checked) } })
            }
          />
          <Label className={INSPECTOR_LABEL_CLASS}>Показывать телефон</Label>
        </div>
      </div>
    );
  }

  if (block.type === "pricing-table") {
    const p = block.props as {
      sectionTitle?: string;
      showSectionTitle?: boolean;
      columns?: number;
      highlightPopular?: boolean;
      currency?: string;
    };
    const showSectionTitle = p.showSectionTitle !== false;

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Тарифы</h3>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showSectionTitle}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showSectionTitle: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Заголовок секции</Label>
            </div>
            <FieldAlignmentControls fieldKey="sectionTitle" block={block} onChange={onChange} />
          </div>
          {showSectionTitle && (
            <Input
              value={p.sectionTitle ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, sectionTitle: e.target.value } })
              }
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className={INSPECTOR_LABEL_CLASS}>Количество колонок</Label>
          <RadioGroup
            value={String(p.columns ?? 3)}
            onValueChange={(v) =>
              onChange({ ...block, props: { ...block.props, columns: Number(v) } })
            }
            className="flex gap-3"
          >
            {[2, 3, 4].map((c) => (
              <div key={c} className="flex items-center space-x-2">
                <RadioGroupItem value={String(c)} id={`pricing-cols-${c}`} />
                <Label htmlFor={`pricing-cols-${c}`} className="text-xs">{c}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={p.highlightPopular === true}
            onCheckedChange={(checked) =>
              onChange({ ...block, props: { ...block.props, highlightPopular: Boolean(checked) } })
            }
          />
          <Label className={INSPECTOR_LABEL_CLASS}>Выделить популярный тариф</Label>
        </div>
      </div>
    );
  }

  if (block.type === "testimonials") {
    const p = block.props as {
      variant?: string;
      sectionTitle?: string;
      columns?: number;
      items?: unknown[];
      autoplay?: boolean;
      quote?: string;
      author?: string;
      authorTitle?: string;
      showPhoto?: boolean;
      showSectionTitle?: boolean;
      showQuote?: boolean;
      showAuthor?: boolean;
      showAuthorTitle?: boolean;
    };
    const variant = p.variant ?? "grid";
    const showSectionTitle = p.showSectionTitle !== false;
    const showQuote = p.showQuote !== false;
    const showAuthor = p.showAuthor !== false;
    const showAuthorTitle = p.showAuthorTitle !== false;

    const TESTIMONIALS_VARIANTS = [
      { value: "grid",   label: "Сетка" },
      { value: "slider", label: "Слайдер" },
      { value: "single", label: "Один отзыв" },
    ];

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Отзывы</h3>

        <div className="space-y-1.5">
          <Label className={INSPECTOR_LABEL_CLASS}>Тип блока</Label>
          <RadioGroup
            value={variant}
            onValueChange={(v) => onChange({ ...block, props: { ...block.props, variant: v } })}
            className="space-y-1"
          >
            {TESTIMONIALS_VARIANTS.map((v) => (
              <div key={v.value} className="flex items-center space-x-2">
                <RadioGroupItem value={v.value} id={`testimonials-variant-${v.value}`} />
                <Label htmlFor={`testimonials-variant-${v.value}`} className="text-xs font-normal">
                  {v.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {(variant === "grid" || variant === "slider") && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showSectionTitle}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showSectionTitle: Boolean(checked) } })
                    }
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Заголовок секции</Label>
                </div>
                <FieldAlignmentControls fieldKey="sectionTitle" block={block} onChange={onChange} />
              </div>
              {showSectionTitle && (
                <Input
                  value={p.sectionTitle ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, sectionTitle: e.target.value } })
                  }
                />
              )}
            </div>

            {variant === "grid" && (
              <div className="space-y-2">
                <Label className={INSPECTOR_LABEL_CLASS}>Количество колонок</Label>
                <RadioGroup
                  value={String(p.columns ?? 2)}
                  onValueChange={(v) =>
                    onChange({ ...block, props: { ...block.props, columns: Number(v) } })
                  }
                  className="flex gap-3"
                >
                  {[2, 3].map((c) => (
                    <div key={c} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(c)} id={`testimonials-cols-${c}`} />
                      <Label htmlFor={`testimonials-cols-${c}`} className="text-xs">{c}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {variant === "slider" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={p.autoplay === true}
                  onCheckedChange={(checked) =>
                    onChange({ ...block, props: { ...block.props, autoplay: Boolean(checked) } })
                  }
                />
                <Label className={INSPECTOR_LABEL_CLASS}>Автозапуск</Label>
              </div>
            )}
          </>
        )}

        {variant === "single" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showQuote}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showQuote: Boolean(checked) } })
                    }
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Текст отзыва</Label>
                </div>
                <FieldAlignmentControls fieldKey="quote" block={block} onChange={onChange} />
              </div>
              {showQuote && (
                <Textarea
                  value={p.quote ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, quote: e.target.value } })
                  }
                  rows={3}
                  className="text-sm resize-y"
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showAuthor}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showAuthor: Boolean(checked) } })
                    }
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Автор</Label>
                </div>
                <FieldAlignmentControls fieldKey="author" block={block} onChange={onChange} />
              </div>
              {showAuthor && (
                <Input
                  value={p.author ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, author: e.target.value } })
                  }
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={showAuthorTitle}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, props: { ...block.props, showAuthorTitle: Boolean(checked) } })
                    }
                  />
                  <Label className={INSPECTOR_LABEL_CLASS}>Должность</Label>
                </div>
              </div>
              {showAuthorTitle && (
                <Input
                  value={p.authorTitle ?? ""}
                  onChange={(e) =>
                    onChange({ ...block, props: { ...block.props, authorTitle: e.target.value } })
                  }
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={p.showPhoto === true}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showPhoto: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Показывать фото</Label>
            </div>
          </>
        )}
      </div>
    );
  }

  if (block.type === "Отзывы") {
    const p = block.props as { title?: string; displayType?: string };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Отзывы</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
            <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.title ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, title: e.target.value } })
            }
          />
        </div>
        <div className="space-y-2">
          <Label className={INSPECTOR_LABEL_CLASS}>Тип отображения</Label>
          <RadioGroup
            value={p.displayType ?? "grid"}
            onValueChange={(value) =>
              onChange({
                ...block,
                props: { ...block.props, displayType: value as "grid" | "carousel" },
              })
            }
            className="flex gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="grid" id="reviews-grid" />
              <Label htmlFor="reviews-grid" className="text-xs">Сетка</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="carousel" id="reviews-carousel" />
              <Label htmlFor="reviews-carousel" className="text-xs">Карусель</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    );
  }

  if (block.type === "faq-accordion") {
    const p = block.props as {
      sectionTitle?: string;
      showSectionTitle?: boolean;
      showIcon?: boolean;
      items?: unknown[];
    };
    const showSectionTitle = p.showSectionTitle !== false;
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Вопросы и ответы</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showSectionTitle}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showSectionTitle: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Заголовок секции</Label>
            </div>
            <FieldAlignmentControls fieldKey="sectionTitle" block={block} onChange={onChange} />
          </div>
          {showSectionTitle && (
            <Input
              value={p.sectionTitle ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, sectionTitle: e.target.value } })
              }
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={p.showIcon !== false}
            onCheckedChange={(checked) =>
              onChange({ ...block, props: { ...block.props, showIcon: Boolean(checked) } })
            }
          />
          <Label className={INSPECTOR_LABEL_CLASS}>Отображать иконку</Label>
        </div>
      </div>
    );
  }

  if (block.type === "FAQ") {
    const p = block.props as { title?: string; showIcon?: boolean };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Вопросы и ответы</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
            <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.title ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, title: e.target.value } })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={p.showIcon ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...block, props: { ...block.props, showIcon: Boolean(checked) } })
            }
          />
          <Label className={INSPECTOR_LABEL_CLASS}>Отображать иконку</Label>
        </div>
      </div>
    );
  }

  if (block.type === "footer") {
    const p = block.props as {
      variant?: string;
      copyright?: string;
      showSocial?: boolean;
      socialLinks?: Record<string, string>;
      title?: string;
      buttonText?: string;
      placeholder?: string;
    };
    const variant = p.variant ?? "simple";

    const FOOTER_VARIANTS = [
      { value: "simple", label: "Простой" },
      { value: "menu", label: "С меню" },
      { value: "subscribe", label: "С подпиской" },
    ];

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Подвал</h3>

        {/* Variant selector */}
        <div className="space-y-1.5">
          <Label className={INSPECTOR_LABEL_CLASS}>Тип подвала</Label>
          <RadioGroup
            value={variant}
            onValueChange={(v) =>
              onChange({ ...block, props: { ...block.props, variant: v } })
            }
            className="space-y-1"
          >
            {FOOTER_VARIANTS.map((v) => (
              <div key={v.value} className="flex items-center space-x-2">
                <RadioGroupItem value={v.value} id={`footer-variant-${v.value}`} />
                <Label htmlFor={`footer-variant-${v.value}`} className="text-xs font-normal">
                  {v.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Copyright — common to all variants */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Копирайт</Label>
            <FieldAlignmentControls fieldKey="copyright" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.copyright ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, copyright: e.target.value } })
            }
            placeholder="© 2026 Компания"
          />
        </div>

        {/* Social links — simple and menu variants */}
        {(variant === "simple" || variant === "menu") && (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={p.showSocial ?? false}
              onCheckedChange={(checked) =>
                onChange({ ...block, props: { ...block.props, showSocial: Boolean(checked) } })
              }
            />
            <Label className={INSPECTOR_LABEL_CLASS}>Показывать соцсети</Label>
          </div>
        )}

        {/* Subscribe fields — subscribe variant */}
        {variant === "subscribe" && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className={INSPECTOR_LABEL_CLASS}>Заголовок</Label>
                <FieldAlignmentControls fieldKey="title" block={block} onChange={onChange} />
              </div>
              <Input
                value={p.title ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, title: e.target.value } })
                }
                placeholder="Подпишитесь на новости"
              />
            </div>
            <div className="space-y-1">
              <Label className={INSPECTOR_LABEL_CLASS}>Плейсхолдер поля</Label>
              <Input
                value={p.placeholder ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, placeholder: e.target.value } })
                }
                placeholder="Ваш email"
              />
            </div>
            <div className="space-y-1">
              <Label className={INSPECTOR_LABEL_CLASS}>Текст кнопки</Label>
              <Input
                value={p.buttonText ?? ""}
                onChange={(e) =>
                  onChange({ ...block, props: { ...block.props, buttonText: e.target.value } })
                }
                placeholder="Подписаться"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  if (block.type === "Footer") {
    const p = block.props as { copyright?: string; showSocial?: boolean };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Подвал</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Копирайт</Label>
            <FieldAlignmentControls fieldKey="copyright" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.copyright ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, copyright: e.target.value } })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={p.showSocial ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...block, props: { ...block.props, showSocial: Boolean(checked) } })
            }
          />
          <Label className={INSPECTOR_LABEL_CLASS}>Показывать соцсети</Label>
        </div>
      </div>
    );
  }

  if (block.type === "contacts") {
    const p = block.props as {
      sectionTitle?: string;
      showSectionTitle?: boolean;
      address?: string;
      phones?: string[];
      emails?: string[];
      socialLinks?: Record<string, string>;
      mapUrl?: string;
      hours?: string[];
      showAddress?: boolean;
      showPhones?: boolean;
      showEmails?: boolean;
      showSocial?: boolean;
      showMap?: boolean;
      showHours?: boolean;
    };
    const showSectionTitle = p.showSectionTitle !== false;
    const showAddress = p.showAddress !== false;
    const showPhones  = p.showPhones  !== false;
    const showEmails  = p.showEmails  !== false;
    const showSocial  = p.showSocial  === true;
    const showMap     = p.showMap     === true;
    const showHours   = p.showHours   === true;

    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Контакты</h3>

        {/* Section title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showSectionTitle}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showSectionTitle: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Заголовок секции</Label>
            </div>
            <FieldAlignmentControls fieldKey="sectionTitle" block={block} onChange={onChange} />
          </div>
          {showSectionTitle && (
            <Input
              value={p.sectionTitle ?? "Контакты"}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, sectionTitle: e.target.value } })
              }
            />
          )}
        </div>

        {/* Address */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showAddress}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showAddress: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Адрес</Label>
            </div>
            <FieldAlignmentControls fieldKey="address" block={block} onChange={onChange} />
          </div>
          {showAddress && (
            <Input
              value={p.address ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...block.props, address: e.target.value } })
              }
              placeholder="Введите адрес"
            />
          )}
        </div>

        {/* Phones */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showPhones}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showPhones: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Телефоны</Label>
            </div>
            <FieldAlignmentControls fieldKey="phones" block={block} onChange={onChange} />
          </div>
          {showPhones && (
            <>
              {(p.phones ?? []).map((ph, i) => (
                <div key={i} className="flex gap-1">
                  <Input
                    value={ph}
                    onChange={(e) => {
                      const arr = [...(p.phones ?? [])];
                      arr[i] = e.target.value;
                      onChange({ ...block, props: { ...block.props, phones: arr } });
                    }}
                    className="text-sm flex-1"
                    placeholder="+7..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = (p.phones ?? []).filter((_, j) => j !== i);
                      onChange({ ...block, props: { ...block.props, phones: arr } });
                    }}
                    className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(p.phones ?? []), ""];
                  onChange({ ...block, props: { ...block.props, phones: arr } });
                }}
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                + Добавить
              </button>
            </>
          )}
        </div>

        {/* Emails */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showEmails}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showEmails: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Email</Label>
            </div>
            <FieldAlignmentControls fieldKey="emails" block={block} onChange={onChange} />
          </div>
          {showEmails && (
            <>
              {(p.emails ?? []).map((em, i) => (
                <div key={i} className="flex gap-1">
                  <Input
                    value={em}
                    onChange={(e) => {
                      const arr = [...(p.emails ?? [])];
                      arr[i] = e.target.value;
                      onChange({ ...block, props: { ...block.props, emails: arr } });
                    }}
                    className="text-sm flex-1"
                    placeholder="info@..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = (p.emails ?? []).filter((_, j) => j !== i);
                      onChange({ ...block, props: { ...block.props, emails: arr } });
                    }}
                    className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(p.emails ?? []), ""];
                  onChange({ ...block, props: { ...block.props, emails: arr } });
                }}
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                + Добавить
              </button>
            </>
          )}
        </div>

        {/* Social */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={showSocial}
              onCheckedChange={(checked) =>
                onChange({ ...block, props: { ...block.props, showSocial: Boolean(checked) } })
              }
            />
            <Label className={INSPECTOR_LABEL_CLASS}>Соцсети</Label>
          </div>
          <FieldAlignmentControls fieldKey="socialLinks" block={block} onChange={onChange} />
        </div>

        {/* Map */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showMap}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showMap: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Карта</Label>
            </div>
            <FieldAlignmentControls fieldKey="mapUrl" block={block} onChange={onChange} />
          </div>
        </div>

        {/* Hours */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={showHours}
                onCheckedChange={(checked) =>
                  onChange({ ...block, props: { ...block.props, showHours: Boolean(checked) } })
                }
              />
              <Label className={INSPECTOR_LABEL_CLASS}>Режим работы</Label>
            </div>
            <FieldAlignmentControls fieldKey="hours" block={block} onChange={onChange} />
          </div>
          {showHours && (
            <>
              {(p.hours ?? []).map((h, i) => (
                <div key={i} className="flex gap-1">
                  <Input
                    value={String(h)}
                    onChange={(e) => {
                      const arr = [...(p.hours ?? [])];
                      arr[i] = e.target.value;
                      onChange({ ...block, props: { ...block.props, hours: arr } });
                    }}
                    className="text-sm flex-1"
                    placeholder="Пн–Пт: 9:00–18:00"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = (p.hours ?? []).filter((_, j) => j !== i);
                      onChange({ ...block, props: { ...block.props, hours: arr } });
                    }}
                    className="rounded border border-gray-300 px-2 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(p.hours ?? []), ""];
                  onChange({ ...block, props: { ...block.props, hours: arr } });
                }}
                className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                + Добавить
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "partners") {
    const p = block.props as { sectionTitle?: string; logos?: string[] };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Партнёры</h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={INSPECTOR_LABEL_CLASS}>Заголовок секции</Label>
            <FieldAlignmentControls fieldKey="sectionTitle" block={block} onChange={onChange} />
          </div>
          <Input
            value={p.sectionTitle ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, sectionTitle: e.target.value } })
            }
            placeholder="Партнёры"
          />
        </div>
        <div className="space-y-1">
          <Label className={INSPECTOR_LABEL_CLASS}>Логотипы (URL)</Label>
          {(Array.isArray(p.logos) ? p.logos : []).map((logo, i) => (
            <div key={i} className="flex gap-1">
              <Input
                value={String(logo)}
                onChange={(e) => {
                  const arr = [...(p.logos ?? [])];
                  arr[i] = e.target.value;
                  onChange({ ...block, props: { ...block.props, logos: arr } });
                }}
                placeholder="https://..."
                className="text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  const arr = (p.logos ?? []).filter((_, j) => j !== i);
                  onChange({ ...block, props: { ...block.props, logos: arr } });
                }}
                className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                −
              </button>
            </div>
          ))}
        <button
          type="button"
          onClick={() => {
            const arr = [...(p.logos ?? []), ""];
            onChange({ ...block, props: { ...block.props, logos: arr } });
          }}
          className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          + Добавить
        </button>
        </div>
      </div>
    );
  }

  if (block.type === "stats") {
    const p = block.props as { items?: Array<{ value?: string; label?: string } | string> };
    const items = Array.isArray(p.items) ? p.items : [];
    const normalizeStatItem = (item: unknown): { value: string; label: string } => {
      if (typeof item === "object" && item !== null) {
        const obj = item as { value?: string; label?: string };
        return { value: obj.value ?? "", label: obj.label ?? "" };
      }
      return { value: String(item), label: "" };
    };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Статистика</h3>
        <div className="space-y-2">
          <Label className={INSPECTOR_LABEL_CLASS}>Показатели</Label>
          {items.map((item, i) => {
            const stat = normalizeStatItem(item);
            return (
              <div key={i} className="space-y-1 rounded border border-border bg-muted/30 p-2">
                <div className="flex items-center gap-1">
                  <Input
                    value={stat.value}
                    onChange={(e) => {
                      const arr = [...items];
                      arr[i] = { ...normalizeStatItem(arr[i]), value: e.target.value };
                      onChange({ ...block, props: { ...block.props, items: arr } });
                    }}
                    placeholder="100+"
                    className="text-sm flex-1"
                  />
                <button
                  type="button"
                  onClick={() => {
                    const arr = items.filter((_, j) => j !== i);
                    onChange({ ...block, props: { ...block.props, items: arr } });
                  }}
                  className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  −
                </button>
                </div>
                <Input
                  value={stat.label}
                  onChange={(e) => {
                    const arr = [...items];
                    arr[i] = { ...normalizeStatItem(arr[i]), label: e.target.value };
                    onChange({ ...block, props: { ...block.props, items: arr } });
                  }}
                  placeholder="Клиентов"
                  className="text-sm"
                />
              </div>
            );
          })}
        <button
          type="button"
          onClick={() => {
            const arr = [...items, { value: "", label: "" }];
            onChange({ ...block, props: { ...block.props, items: arr } });
          }}
          className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          + Добавить
        </button>
        </div>
      </div>
    );
  }

  if (block.type === "countdown") {
    const p = block.props as { targetDate?: string; message?: string };
    return (
      <div className="space-y-4">
        <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>Обратный отсчёт</h3>
        <div className="space-y-1">
          <Label className={INSPECTOR_LABEL_CLASS}>Дата завершения</Label>
          <Input
            type="date"
            value={p.targetDate ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, targetDate: e.target.value } })
            }
            className={INSPECTOR_INPUT_CLASS}
          />
        </div>
        <div className="space-y-1">
          <Label className={INSPECTOR_LABEL_CLASS}>Сообщение после завершения</Label>
          <Input
            value={p.message ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...block.props, message: e.target.value } })
            }
            placeholder="Акция завершена"
            className={INSPECTOR_INPUT_CLASS}
          />
        </div>
      </div>
    );
  }

  // Generic inspector for all other block types (new registry blocks)
  return (
    <div className="space-y-4">
      <h3 className={INSPECTOR_SECTION_TITLE_CLASS}>{getBlockLabel(block.type)}</h3>
      <GenericBlockFields block={block} onChange={onChange} />
    </div>
  );
  })();

  return (
    <div className={INSPECTOR_PANEL_CLASS}>
      <div className="mb-4 border-b border-border/70 pb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Настройки блока
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5">
          {getBlockLabel(block.type)}
        </p>
      </div>
      {blockSpecificContent}
    </div>
  );
}

function GenericBlockFields({
  block,
  onChange,
}: {
  block: CanvasBlock;
  onChange: (block: CanvasBlock) => void;
}) {
  const props = block.props as Record<string, unknown>;
  const entries = Object.entries(props).filter(
    ([key]) => key !== "style" && key !== "_fieldAlignments",
  );

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        const label =
          PROP_LABELS_RU[key] ??
          key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
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
                  onChange={(e) =>
                    onChange({
                      ...block,
                      props: { ...block.props, [key]: e.target.value },
                    })
                  }
                  rows={3}
                  className={INSPECTOR_INPUT_CLASS}
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      props: { ...block.props, [key]: e.target.value },
                    })
                  }
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
                  onChange({
                    ...block,
                    props: { ...block.props, [key]: Boolean(checked) },
                  })
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
                  onChange({
                    ...block,
                    props: { ...block.props, [key]: Number(e.target.value) || 0 },
                  })
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
                        onChange({
                          ...block,
                          props: { ...block.props, [key]: next },
                        });
                      }}
                      className="text-sm flex-1"
                    />
                  <button
                    type="button"
                    onClick={() => {
                      const next = arr.filter((_, j) => j !== i);
                      onChange({
                        ...block,
                        props: { ...block.props, [key]: next },
                      });
                    }}
                    className="rounded border border-border px-2 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  >
                    −
                  </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const next = [...arr, ""];
                    onChange({
                      ...block,
                      props: { ...block.props, [key]: next },
                    });
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

export function DashboardLayout({
  user,
}: {
  user?: DashboardLayoutUser;
}) {
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectSpec, setCurrentProjectSpec] = useState<string | null>(
    null,
  );
  const [projectsList, setProjectsList] = useState<ProjectListItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<SavedStatus>("saved");
  const logoutFormRef = useRef<HTMLFormElement>(null);
  const cloudSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [projectNameDialogMode, setProjectNameDialogMode] = useState<
    "new" | "rename" | null
  >(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [blockCategoriesOpen, setBlockCategoriesOpen] = useState<Set<string>>(
    () => new Set()
  );
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const userName = user?.name?.trim() || "Пользователь";
  const userEmail = user?.email?.trim() || "no-email@example.com";
  const currentProjectName =
    projectsList.find((project) => project.id === currentProjectId)?.name ?? "Не выбран";
  const avatarUrl =
    user?.avatarUrl?.trim() ||
    "/images/avatar-placeholder.svg";
  const toggleBlockCategory = useCallback((catId: string) => {
    setBlockCategoriesOpen((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  // On mount: load user's projects; if any, load most recent; else fallback to localStorage
  useEffect(() => {
    let cancelled = false;
    setProjectsLoading(true);
    loadProjectsAction()
      .then((result) => {
        if (cancelled) return;
        setProjectsList(result.projects ?? []);
        if (result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          return loadProjectAction(mostRecent.id).then((projectResult) => {
            if (cancelled) return;
            if (projectResult.blocks != null && Array.isArray(projectResult.blocks)) {
              setCanvasBlocks(projectResult.blocks as CanvasBlock[]);
              setCurrentProjectId(mostRecent.id);
              setCurrentProjectSpec(
                typeof projectResult.spec === "string" ? projectResult.spec : null,
              );
            }
          });
        }
        const local = loadProjectFromStorage();
        if (local?.blocks && Array.isArray(local.blocks)) {
          setCanvasBlocks(local.blocks as CanvasBlock[]);
        }
        if (!result.projects || result.projects.length === 0) {
          setProjectNameDialogMode("new");
          setNewProjectName("");
          setCurrentProjectSpec(null);
        }
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // When opening ExportModal, refresh currently selected project's saved spec.
  // This avoids stale `currentProjectSpec` if spec was generated just now.
  useEffect(() => {
    if (!exportModalOpen) return;
    if (!currentProjectId) return;

    loadProjectAction(currentProjectId)
      .then((projectResult) => {
        setCurrentProjectSpec(
          typeof projectResult.spec === "string" ? projectResult.spec : null,
        );
      })
      .catch((err) => {
        console.error("Failed to refresh project spec:", err);
        setCurrentProjectSpec(null);
      });
  }, [exportModalOpen, currentProjectId]);

  useEffect(() => {
    saveProjectToStorage(canvasBlocks);
  }, [canvasBlocks]);

  const saveToCloud = useCallback(
    async (
      blocks: CanvasBlock[],
      projectId: string | null,
      name?: string,
    ) => {
      setCloudSaveStatus("saving");
      const formData = new FormData();
      formData.set("blocks", JSON.stringify(blocks));
      if (projectId) formData.set("projectId", projectId);
      formData.set("name", name?.trim() || "Без названия");
      const result = await saveProjectAction(null, formData);
      if (result.error) {
        setCloudSaveStatus("error");
        return result;
      }
      if (result.projectId && !projectId) {
        const projectName = name?.trim() || "Без названия";
        setCurrentProjectId(result.projectId);
        setProjectsList((prev) => [
          { id: result.projectId!, name: projectName, updated_at: new Date().toISOString() },
          ...prev,
        ]);
      }
      setCloudSaveStatus("saved");
      return result;
    },
    [],
  );

  // Debounced auto-save to cloud (2s after last change). Only update existing project; do not create new one.
  useEffect(() => {
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
      cloudSaveTimeoutRef.current = null;
    }
    if (!currentProjectId) return;
    const currentName = projectsList.find((p) => p.id === currentProjectId)?.name;
    cloudSaveTimeoutRef.current = setTimeout(() => {
      cloudSaveTimeoutRef.current = null;
      saveToCloud(canvasBlocks, currentProjectId, currentName);
    }, 2000);
    return () => {
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [canvasBlocks, currentProjectId, projectsList, saveToCloud]);

  const handleSaveClick = useCallback(() => {
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
      cloudSaveTimeoutRef.current = null;
    }
    const currentName = currentProjectId
      ? projectsList.find((p) => p.id === currentProjectId)?.name ?? ""
      : "";
    if (currentProjectId && (!currentName.trim() || currentName === "Без названия")) {
      setNewProjectName(currentName || "Без названия");
      setProjectNameDialogMode("rename");
      return;
    }
    saveToCloud(canvasBlocks, currentProjectId, currentName.trim() || undefined);
  }, [canvasBlocks, currentProjectId, projectsList, saveToCloud]);

  const openNewProjectDialog = useCallback(() => {
    setNewProjectName("");
    setProjectNameDialogMode("new");
  }, []);

  const handleCreateNewProject = useCallback(async () => {
    const name = newProjectName.trim() || "Без названия";
    setProjectNameDialogMode(null);
    setCanvasBlocks([]);
    setSelectedId(null);
    clearProjectFromStorage();
    setCurrentProjectSpec(null);
    setCloudSaveStatus("saving");
    const formData = new FormData();
    formData.set("blocks", JSON.stringify([]));
    formData.set("name", name);
    const result = await saveProjectAction(null, formData);
    if (result.projectId) {
      setCurrentProjectId(result.projectId);
      setProjectsList((prev) => [
        { id: result.projectId!, name, updated_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    setCloudSaveStatus("saved");
  }, [newProjectName]);

  const handleSelectProject = useCallback(async (projectId: string) => {
    setProjectsLoading(true);
    setDeleteError(null);
    const result = await loadProjectAction(projectId);
    setProjectsLoading(false);
    if (result.error) return;
    if (result.blocks != null && Array.isArray(result.blocks)) {
      setCanvasBlocks(result.blocks as CanvasBlock[]);
      setCurrentProjectId(projectId);
      setCurrentProjectSpec(
        typeof result.spec === "string" ? result.spec : null,
      );
      setSelectedId(null);
    }
  }, []);

  const handleDeleteProject = useCallback(async () => {
    if (!currentProjectId) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Удалить текущий проект? Это действие нельзя отменить.")
    ) {
      return;
    }
    setDeleteError(null);
    const result = await deleteProjectAction(currentProjectId);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setProjectsList((prev) => prev.filter((p) => p.id !== currentProjectId));
    setCanvasBlocks([]);
    setSelectedId(null);
    setCurrentProjectId(null);
    setCurrentProjectSpec(null);
    clearProjectFromStorage();
    setCloudSaveStatus("saved");
    const remaining = projectsList.filter((p) => p.id !== currentProjectId);
    if (remaining.length > 0) {
      const next = remaining[0];
      const loadResult = await loadProjectAction(next.id);
      if (loadResult.blocks != null && Array.isArray(loadResult.blocks)) {
        setCanvasBlocks(loadResult.blocks as CanvasBlock[]);
        setCurrentProjectId(next.id);
        setCurrentProjectSpec(
          typeof loadResult.spec === "string" ? loadResult.spec : null,
        );
      }
    } else {
      setProjectNameDialogMode("new");
      setNewProjectName("");
    }
  }, [currentProjectId, projectsList]);

  const handleSaveWithName = useCallback(async () => {
    if (!currentProjectId) return;
    const name = newProjectName.trim() || "Без названия";
    setProjectNameDialogMode(null);
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
      cloudSaveTimeoutRef.current = null;
    }
    const formData = new FormData();
    formData.set("blocks", JSON.stringify(canvasBlocks));
    formData.set("projectId", currentProjectId);
    formData.set("name", name);
    setCloudSaveStatus("saving");
    const result = await saveProjectAction(null, formData);
    if (result.error) {
      setCloudSaveStatus("error");
      return;
    }
    setCloudSaveStatus("saved");
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === currentProjectId ? { ...p, name, updated_at: new Date().toISOString() } : p,
      ),
    );
  }, [currentProjectId, newProjectName, canvasBlocks]);

  const handleLogout = useCallback(async () => {
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
      cloudSaveTimeoutRef.current = null;
    }
    await saveToCloud(canvasBlocks, currentProjectId);
    logoutFormRef.current?.requestSubmit();
  }, [canvasBlocks, currentProjectId, saveToCloud]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as DragData | undefined;
    if (!data) return;

    if (data.type === "palette") {
      const newBlock = createBlock(data.blockType as string);
      setCanvasBlocks((prev) => [...prev, newBlock]);
      setSelectedId(newBlock.id);
      return;
    }

    if (data.type === "canvas") {
      const activeId = active.id;
      const overId = over.id;
      if (activeId === overId) return;

      setCanvasBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === activeId);
        const newIndex = items.findIndex((item) => item.id === overId);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const selectedBlock = canvasBlocks.find((b) => b.id === selectedId);

  const handleUpdateBlock = (updated: CanvasBlock) => {
    setCanvasBlocks((blocks) =>
      blocks.map((b) => (b.id === updated.id ? updated : b)),
    );
  };

  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );


  const handleDeleteBlock = useCallback((blockId: string) => {
    setCanvasBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setSelectedId((id) => (id === blockId ? null : id));
  }, []);

  const ProfileMenuContent = () => (
    <div className="absolute left-2 right-2 top-12 z-50 rounded-lg border border-border bg-background p-2 shadow-md">
      <div className="space-y-3">
        <section className="space-y-1 border-b border-border/70 pb-2">
          <p className="truncate px-2 text-xs text-muted-foreground">{userEmail}</p>
        </section>

        <section className="space-y-2 border-b border-border/70 pb-2">
          <button
            type="button"
            onClick={() => setProjectsMenuOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            aria-expanded={projectsMenuOpen}
          >
            <span>Проекты</span>
            {projectsMenuOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </button>
          {projectsMenuOpen && (
            <div className="space-y-2 px-1">
              {projectsLoading ? (
                <p className="px-1 text-[11px] text-muted-foreground">Загрузка...</p>
              ) : projectsList.length === 0 ? (
                <p className="px-1 text-[11px] text-muted-foreground">Нет проектов</p>
              ) : (
                <ul className="max-h-28 space-y-1 overflow-y-auto">
                  {projectsList.map((proj) => (
                    <li key={proj.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectProject(proj.id)}
                        className={`w-full truncate rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted ${
                          currentProjectId === proj.id ? "bg-muted font-medium" : ""
                        }`}
                      >
                        {proj.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={openNewProjectDialog}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  Новый проект
                </button>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={!currentProjectId}
                  className="w-full rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-xs text-destructive transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-destructive/40 disabled:hover:text-destructive"
                >
                  Удалить проект
                </button>
              </div>
              {deleteError && <p className="px-1 text-[11px] text-red-600">{deleteError}</p>}
            </div>
          )}
        </section>

        <section className="space-y-1">
          <button
            type="button"
            onClick={() => setFeedbackModalOpen(true)}
            className="w-full rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
          >
            Обратная связь
          </button>
          <form ref={logoutFormRef} action={logoutAction}>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              Выход
            </button>
          </form>
        </section>
      </div>
    </div>
  );

  return (
    <DndContext sensors={dndSensors} onDragEnd={handleDragEnd}>
      <Dialog
        open={projectNameDialogMode !== null}
        onOpenChange={(open) => !open && setProjectNameDialogMode(null)}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>
              {projectNameDialogMode === "rename" ? "Название проекта" : "Новый проект"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {projectNameDialogMode === "rename"
                ? "Введите название проекта для сохранения."
                : "Введите название проекта. Текущая схема будет очищена."}
            </p>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-project-name">Название</Label>
            <Input
              id="new-project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Без названия"
              className="border-border focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (projectNameDialogMode === "rename") handleSaveWithName();
                  else handleCreateNewProject();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setProjectNameDialogMode(null)}
              className="border border-border bg-background text-foreground rounded-lg px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={
                projectNameDialogMode === "rename" ? handleSaveWithName : handleCreateNewProject
              }
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {projectNameDialogMode === "rename" ? "Сохранить" : "Создать"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ExportModal
        blocks={canvasBlocks}
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        projectId={currentProjectId}
        initialSpec={currentProjectSpec ?? undefined}
        onSpecSaved={({ projectId, spec }) => {
          setCurrentProjectSpec(spec);
          setCurrentProjectId((prev) => (prev ? prev : projectId));
          setProjectsList((prev) => {
            const exists = prev.some((p) => p.id === projectId);
            const nowIso = new Date().toISOString();
            if (exists) {
              return prev.map((p) =>
                p.id === projectId ? { ...p, updated_at: nowIso } : p,
              );
            }
            return [
              {
                id: projectId,
                name: "Без названия",
                updated_at: nowIso,
              },
              ...prev,
            ];
          });
        }}
      />
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
      <div className="flex min-h-screen bg-background">
        <button
          type="button"
          onClick={() => setIsLeftSidebarOpen((v) => !v)}
          className="fixed left-4 top-4 z-50 rounded-md border border-border bg-background p-2 text-foreground shadow-sm md:hidden"
          aria-label="Toggle sidebar"
          aria-expanded={isLeftSidebarOpen}
        >
          {isLeftSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {isLeftSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setIsLeftSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Left sidebar */}
        <aside
          className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] transform flex-col overflow-y-auto border-r border-border/70 bg-background/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-transform duration-200 md:sticky md:translate-x-0 ${
            isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-3 border-b border-border/70 pb-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-base font-semibold tracking-tight text-foreground">
                ProtoSpec<span className="opacity-30">.</span>
              </span>
            </div>
            <div className="relative flex items-center gap-3" ref={profileMenuRef}>
              <img src={avatarUrl} className="h-10 w-10 rounded-full object-cover" alt="User avatar" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{userName}</span>
                <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      cloudSaveStatus === "saved"
                        ? "bg-emerald-500"
                        : cloudSaveStatus === "saving"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span>
                    {cloudSaveStatus === "saved" && "Сохранено"}
                    {cloudSaveStatus === "saving" && "Автосохранение"}
                    {cloudSaveStatus === "error" && "Ошибка облака"}
                  </span>
                </span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
              {isProfileMenuOpen && <ProfileMenuContent />}
            </div>
          </div>
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              disabled={projectsLoading}
              className={`w-full bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                projectsLoading ? "hover:bg-primary" : ""
              }`}
            >
              Сгенерировать ТЗ с AI
            </button>
          </div>
          <div className="mb-3 space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Библиотека блоков
            </h2>
          </div>
          <div className="flex-1 min-h-0 space-y-1 overflow-y-auto text-sm">
            {BLOCK_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];

              // Single-block category: render as a direct draggable item (no dropdown)
              if (cat.blocks.length === 1) {
                const b = cat.blocks[0];
                return (
                  <div
                    key={cat.id}
                    className="h-10 bg-background border border-border rounded-lg px-3 py-0 text-sm text-foreground hover:border-ring/40 hover:bg-muted/40 transition-colors cursor-grab flex items-center"
                  >
                    <PaletteItem blockType={b.id} label={cat.label} icon={Icon} />
                  </div>
                );
              }

              const isOpen = blockCategoriesOpen.has(cat.id);
              return (
                <div key={cat.id} className="bg-background border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleBlockCategory(cat.id)}
                    className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                    <span className="truncate">{cat.label}</span>
                  </button>
                  {isOpen && (
                    <ul className="space-y-1 border-t border-border px-2 py-1">
                      {cat.blocks.map((b) => (
                        <li
                          key={b.id}
                          className="h-10 bg-background border border-border rounded-lg hover:border-ring/40 hover:bg-muted/40 transition-colors cursor-grab list-none flex items-center"
                        >
                          <PaletteItem
                            blockType={b.id}
                            label={b.label}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Canvas */}
        <CanvasArea
          blocks={canvasBlocks}
          onDeselect={() => setSelectedId(null)}
        >
          <SortableContext items={canvasBlocks.map((b) => b.id)}>
            {canvasBlocks.map((block) => (
              <CanvasBlockItem
                key={block.id}
                block={block}
                selected={selectedId === block.id}
                onSelect={() => setSelectedId(block.id)}
                onDelete={handleDeleteBlock}
              />
            ))}
          </SortableContext>
        </CanvasArea>

        {/* Right sidebar */}
        <aside className="hidden w-[300px] border-l border-border/70 bg-background/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
          <PropertiesInspector
            block={selectedBlock}
            onChange={handleUpdateBlock}
          />
        </aside>
      </div>
    </DndContext>
  );
}

