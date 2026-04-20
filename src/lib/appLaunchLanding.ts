import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Лендинг «Мобильное приложение (App Launch)». */
export const APP_LAUNCH_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "app-hdr",
    type: "header",
    props: {
      logoText: "FocusFlow",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Функции", href: "#features", variant: "secondary" },
        { label: "Скриншоты", href: "#screens", variant: "secondary" },
        { label: "Отзывы", href: "#reviews", variant: "secondary" },
        { label: "Тарифы", href: "#pricing", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Скачать приложение",
      ctaHref: "#install",
      alignNav: "center",
      showMobileMenu: true,
    },
  },
  { id: "app-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },
  {
    id: "app-hero-main",
    type: "hero",
    props: {
      title: "Планируйте день и фокусируйтесь на важном",
      description:
        "<p>FocusFlow объединяет задачи, календарь и привычки в одном приложении. Меньше переключений, больше результата.</p><p><strong>iOS и Android</strong> с синхронизацией в реальном времени.</p>",
      quote: "Более 120 000 установок и 4.8 в сторах.",
      align: "left",
      buttons: [
        { label: "Скачать бесплатно", href: "#install", variant: "primary" },
        { label: "Смотреть демо", href: "#demo", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "72px",
    },
  },
  { id: "app-sp-2", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "app-grid-features",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "app-card-f1",
    type: "card",
    props: {
      title: "Умный планировщик",
      description: "Распределяет задачи по приоритету и свободным слотам.",
      icon: "Lightbulb",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "app-grid-features",
      __zone: "items",
    },
  },
  {
    id: "app-card-f2",
    type: "card",
    props: {
      title: "Таймер фокуса",
      description: "Сессии deep work по методике Pomodoro с аналитикой.",
      icon: "Zap",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "app-grid-features",
      __zone: "items",
    },
  },
  {
    id: "app-card-f3",
    type: "card",
    props: {
      title: "Синхронизация",
      description: "Интеграция с Google Calendar, Apple Calendar и Notion.",
      icon: "Cpu",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "app-grid-features",
      __zone: "items",
    },
  },
  { id: "app-sp-3", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "app-hero-demo",
    type: "hero",
    props: {
      title: "Демо интерфейса",
      description: "<p id='demo'>Покажите в этом блоке короткий walkthrough ключевых сценариев внутри приложения.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Попробовать демо", href: "#demo", variant: "secondary" }],
      image: { url: "", mode: "custom", content: [] },
      padding: "48px",
    },
  },
  {
    id: "app-t-demo-slot",
    type: "text",
    props: {
      text: "Слот для видео, gif или прототипа из Figma.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "8px" },
      __parentId: "app-hero-demo",
      __zone: "image.content",
    },
  },
  { id: "app-sp-4", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "app-stats",
    type: "stats",
    props: {
      items: [
        { title: "120k+", description: "установок" },
        { title: "4.8", description: "оценка в App Store" },
        { title: "42%", description: "рост weekly retention" },
        { title: "3мин", description: "средний онбординг" },
      ],
    },
  },
  { id: "app-sp-5", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "app-rt-reviews",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='reviews'>Отзывы пользователей</h3><p><strong>Антон:</strong> «Наконец-то все мои задачи и календарь в одном месте.»</p><p><strong>Мария:</strong> «Приложение помогло перестать проваливать дедлайны.»</p><p><strong>Денис:</strong> «Отличный баланс между простотой и функциональностью.»</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "app-sp-6", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "app-h-pricing",
    type: "heading",
    props: { text: "Тарифы", size: "xl", level: "h2", align: "center", layout: { padding: "8px" } },
  },
  {
    id: "app-grid-pricing",
    type: "grid",
    props: { numColumns: 2, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "app-card-price-1",
    type: "card",
    props: {
      title: "Free",
      description: "Основные функции, задачи, календарь и базовая аналитика.",
      icon: "LayoutGrid",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "app-grid-pricing",
      __zone: "items",
    },
  },
  {
    id: "app-card-price-2",
    type: "card",
    props: {
      title: "Pro",
      description: "Расширенная аналитика, AI-подсказки и командные пространства.",
      icon: "Rocket",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "app-grid-pricing",
      __zone: "items",
    },
  },
  { id: "app-sp-7", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "app-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3>FAQ</h3><p><strong>Есть Android и iOS?</strong> Да, приложение доступно на обеих платформах.</p><p><strong>Можно работать офлайн?</strong> Да, с последующей синхронизацией.</p><p><strong>Есть семейный/командный доступ?</strong> Да, на Pro тарифе.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "app-sp-8", type: "space", props: { size: "48px", direction: "vertical" } },
  {
    id: "app-hero-final",
    type: "hero",
    props: {
      title: "Скачайте FocusFlow и начните сегодня",
      description: "<p id='install'>Установите приложение и получите 14 дней Pro бесплатно.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Скачать в App Store", href: "#install", variant: "primary" },
        { label: "Скачать в Google Play", href: "#install", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "64px",
    },
  },
  { id: "app-sp-9", type: "space", props: { size: "32px", direction: "vertical" } },
  {
    id: "app-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Приложение", description: "Функции, интеграции, roadmap" },
        { title: "Пользователям", description: "Поддержка, FAQ, тарифы" },
        { title: "Компания", description: "О нас, контакты, политика" },
      ],
      copyright: "© 2026 FocusFlow App.",
      paddingY: "56px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "X", href: "https://x.com", variant: "secondary" },
        { label: "Почта", href: "mailto:team@focusflow.app", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для обновлений",
    },
  },
];

export const APP_LAUNCH_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(APP_LAUNCH_LANDING_BLOCKS),
);
