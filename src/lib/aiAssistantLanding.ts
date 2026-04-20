import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Лендинг «AI-инструмент / AI-ассистент». */
export const AI_ASSISTANT_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "ai-hdr",
    type: "header",
    props: {
      logoText: "Copilot Desk",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Use-cases", href: "#use-cases", variant: "secondary" },
        { label: "Как работает", href: "#workflow", variant: "secondary" },
        { label: "Безопасность", href: "#security", variant: "secondary" },
        { label: "Тарифы", href: "#pricing", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Start free trial",
      ctaHref: "#trial",
      alignNav: "center",
      showMobileMenu: true,
    },
  },
  { id: "ai-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },
  {
    id: "ai-hero-main",
    type: "hero",
    props: {
      title: "AI-ассистент для повторяющихся задач команды",
      description:
        "<p>Copilot Desk помогает писать ответы, анализировать документы и автоматизировать рутины в поддержке, продажах и operations.</p><p><strong>Подключение за 1 день</strong> без сложной интеграции.</p>",
      quote: "Средняя экономия 11 часов в неделю на сотрудника.",
      align: "left",
      buttons: [
        { label: "Начать trial", href: "#trial", variant: "primary" },
        { label: "Запросить демо", href: "#demo", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "72px",
    },
  },
  { id: "ai-sp-2", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ai-grid-cases",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "ai-case-1",
    type: "card",
    props: {
      title: "Support",
      description: "Автоматически готовит черновики ответов на частые запросы.",
      icon: "Users",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ai-grid-cases",
      __zone: "items",
    },
  },
  {
    id: "ai-case-2",
    type: "card",
    props: {
      title: "Sales",
      description: "Генерирует follow-up письма и краткие summary созвонов.",
      icon: "TrendingUp",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "ai-grid-cases",
      __zone: "items",
    },
  },
  {
    id: "ai-case-3",
    type: "card",
    props: {
      title: "Operations",
      description: "Пишет SOP и извлекает действия из больших документов.",
      icon: "Bot",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ai-grid-cases",
      __zone: "items",
    },
  },
  { id: "ai-sp-3", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "ai-rt-workflow",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='workflow'>Как это работает</h3><ol><li>Подключите источники данных и чаты.</li><li>Настройте роли и правила для команд.</li><li>Запускайте ассистента в реальных процессах и отслеживайте KPI.</li></ol><p>Через 1-2 недели обычно видно ощутимое снижение времени на рутину.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "ai-sp-4", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "ai-hero-demo",
    type: "hero",
    props: {
      title: "Посмотрите ассистента в действии",
      description: "<p id='demo'>Этот блок можно использовать для видео-демо или интерактивного примера сценария.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Открыть live demo", href: "#demo", variant: "secondary" }],
      image: { url: "", mode: "custom", content: [] },
      padding: "48px",
    },
  },
  {
    id: "ai-t-demo-slot",
    type: "text",
    props: {
      text: "Слот для скринкаста, продукта или встроенного playground.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "8px" },
      __parentId: "ai-hero-demo",
      __zone: "image.content",
    },
  },
  { id: "ai-sp-5", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "ai-h-security",
    type: "heading",
    props: { text: "Безопасность и доверие", size: "xl", level: "h2", align: "left", layout: { padding: "8px" } },
  },
  {
    id: "ai-t-security",
    type: "text",
    props: {
      text: "Role-based доступ, аудит действий, шифрование данных и возможность отключить сохранение промптов.",
      size: "m",
      align: "left",
      color: "muted",
      layout: { padding: "8px" },
    },
  },
  {
    id: "ai-stats",
    type: "stats",
    props: {
      items: [
        { title: "99.95%", description: "аптайм" },
        { title: "SOC2-ready", description: "процессы безопасности" },
        { title: "<300ms", description: "средняя задержка ответа" },
        { title: "24/7", description: "мониторинг" },
      ],
    },
  },
  { id: "ai-sp-6", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ai-h-pricing",
    type: "heading",
    props: { text: "Тарифы", size: "xl", level: "h2", align: "center", layout: { padding: "8px" } },
  },
  {
    id: "ai-grid-pricing",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "ai-price-1",
    type: "card",
    props: {
      title: "Starter",
      description: "Для небольших команд и первых автоматизаций.",
      icon: "Flag",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ai-grid-pricing",
      __zone: "items",
    },
  },
  {
    id: "ai-price-2",
    type: "card",
    props: {
      title: "Growth",
      description: "Расширенные интеграции, аналитика и приоритетная поддержка.",
      icon: "Gauge",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "ai-grid-pricing",
      __zone: "items",
    },
  },
  {
    id: "ai-price-3",
    type: "card",
    props: {
      title: "Enterprise",
      description: "SAML SSO, кастомные политики и отдельный SLA.",
      icon: "Building2",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ai-grid-pricing",
      __zone: "items",
    },
  },
  { id: "ai-sp-7", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ai-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3>FAQ</h3><p><strong>Можно ли использовать свои данные?</strong> Да, через коннекторы и API.</p><p><strong>Есть on-prem?</strong> По запросу для enterprise.</p><p><strong>Сколько длится пилот?</strong> Обычно 2-4 недели.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "ai-sp-8", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "ai-hero-final",
    type: "hero",
    props: {
      title: "Запустите AI-ассистента в вашей команде за 7 дней",
      description: "<p id='trial'>Оставьте заявку и получите пошаговый план пилота.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Start free trial", href: "#trial", variant: "primary" },
        { label: "Связаться с sales", href: "#contact", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "64px",
    },
  },
  { id: "ai-sp-9", type: "space", props: { size: "32px", direction: "vertical" } },
  {
    id: "ai-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Продукт", description: "Use-cases, интеграции, API" },
        { title: "Безопасность", description: "Документация, SLA, статус" },
        { title: "Компания", description: "Контакты, партнеры, политика" },
      ],
      copyright: "© 2026 Copilot Desk.",
      paddingY: "56px",
      socialLinks: [
        { label: "LinkedIn", href: "https://linkedin.com", variant: "secondary" },
        { label: "X", href: "https://x.com", variant: "secondary" },
        { label: "Почта", href: "mailto:team@copilotdesk.ai", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для product updates",
    },
  },
];

export const AI_ASSISTANT_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(AI_ASSISTANT_LANDING_BLOCKS),
);
