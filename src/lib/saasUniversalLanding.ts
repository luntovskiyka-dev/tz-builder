import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Универсальный лендинг SaaS для пресета «Продукт». */
export const SAAS_UNIVERSAL_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "hdr-1",
    type: "header",
    props: {
      logoText: "Nimbus",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Продукт", href: "#product", variant: "secondary" },
        { label: "Тарифы", href: "#pricing", variant: "secondary" },
        { label: "Документация", href: "https://example.com/docs", variant: "secondary" },
        { label: "Блог", href: "#blog", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Начать бесплатно",
      ctaHref: "#signup",
      alignNav: "end",
      showMobileMenu: true,
    },
  },

  { id: "sp-1", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "hero-1",
    type: "hero",
    props: {
      title: "Одна платформа для командной работы и аналитики",
      description:
        "<p>Сократите цикл от идеи до релиза. Интеграции, роли и отчёты — без лишней суеты.</p><p><strong>14 дней</strong> полного доступа, карта не требуется.</p>",
      quote: "«Лучший переход с таблиц за три года» — отзыв команды из FinTech, 120 человек.",
      align: "left",
      buttons: [
        { label: "Начать бесплатно", href: "#signup", variant: "primary" },
        { label: "Смотреть демо", href: "#demo", variant: "secondary" },
        { label: "Связаться с продажами", href: "#sales", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
        mode: "inline",
        content: [],
      },
      padding: "80px",
    },
  },

  { id: "sp-2", type: "space", props: { size: "56px", direction: "both" } },

  {
    id: "h-trust",
    type: "heading",
    props: {
      text: "С нами работают команды из 40+ стран",
      size: "s",
      level: "h4",
      align: "center",
      layout: { padding: "8px" },
    },
  },

  {
    id: "logos-1",
    type: "logos",
    props: {
      logos: [
        {
          alt: "Acme",
          imageUrl: "https://placehold.co/200x48/0f172a/94a3b8/png?text=Acme",
        },
        {
          alt: "Globex",
          imageUrl: "https://placehold.co/200x48/1e293b/cbd5e1/png?text=Globex",
        },
        {
          alt: "Umbrella",
          imageUrl: "https://placehold.co/200x48/334155/e2e8f0/png?text=Umbrella",
        },
        {
          alt: "Stark",
          imageUrl: "https://placehold.co/200x48/0c4a6e/7dd3fc/png?text=Stark",
        },
      ],
    },
  },

  { id: "sp-3", type: "space", props: { size: "48px", direction: "horizontal" } },

  {
    id: "stats-1",
    type: "stats",
    props: {
      items: [
        { title: "99,9%", description: "SLA аптайма" },
        { title: "4,8", description: "Средняя оценка в G2" },
        { title: "12k+", description: "Команд на платформе" },
        { title: "<200ms", description: "p95 API" },
      ],
    },
  },

  { id: "sp-4", type: "space", props: { size: "64px", direction: "vertical" } },

  {
    id: "h-1",
    type: "heading",
    props: {
      text: "Почему команды выбирают Nimbus",
      size: "xxl",
      level: "h2",
      align: "center",
      layout: { padding: "24px" },
    },
  },
  {
    id: "t-1",
    type: "text",
    props: {
      text: "Единый источник правды для продукта, маркетинга и поддержки. Гибкие роли, аудит действий и прозрачная тарификация.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "640px",
      layout: { padding: "16px" },
    },
  },
  {
    id: "t-2",
    type: "text",
    props: {
      text: "Детали для технических лидов: экспорт в CSV, webhooks и SSO на корпоративном тарифе.",
      size: "s",
      align: "right",
      color: "default",
      layout: { padding: "8px" },
    },
  },

  {
    id: "grid-1",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 32,
      layout: { padding: "40px" },
    },
  },
  {
    id: "card-1",
    type: "card",
    props: {
      title: "Интеграции",
      description: "Подключите CRM, биллинг и чат за несколько минут — готовые коннекторы и Open API.",
      icon: "Zap",
      mode: "card",
      layout: { spanCol: 1, spanRow: 1, padding: "16px" },
      __parentId: "grid-1",
      __zone: "items",
    },
  },
  {
    id: "card-2",
    type: "card",
    props: {
      title: "Безопасность",
      description: "Шифрование в покое и в транзите, SOC2-ready процессы и журнал аудита.",
      icon: "Shield",
      mode: "flat",
      layout: { spanCol: 1, padding: "24px" },
      __parentId: "grid-1",
      __zone: "items",
    },
  },
  {
    id: "card-3",
    type: "card",
    props: {
      title: "Масштаб",
      description: "От стартапа до enterprise: изоляция данных, лимиты по API и приоритетная поддержка.",
      icon: "Rocket",
      mode: "card",
      layout: { spanCol: 1, padding: "32px" },
      __parentId: "grid-1",
      __zone: "items",
    },
  },

  { id: "sp-5", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "rt-1",
    type: "richtext",
    props: {
      richtext:
        "<h3>Как это работает</h3><ol><li>Подключите рабочее пространство и пригласите команду.</li><li>Настройте воронки и отчёты под ваш процесс.</li><li>Запускайте релизы с контролем версий и согласований.</li></ol><p>Нужна миграция? Мы помогаем с импортом из Notion, Confluence и Google Sheets.</p>",
      layout: { padding: "48px" },
    },
  },

  {
    id: "hero-2",
    type: "hero",
    props: {
      title: "Готовы сократить время согласований вдвое?",
      description: "<p>Забронируйте 30-минутный созвон — покажем сценарии под вашу отрасль.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Записаться на демо", href: "#demo", variant: "primary" }],
      image: {
        url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "sp-6", type: "space", props: { size: "24px", direction: "vertical" } },

  {
    id: "hero-3",
    type: "hero",
    props: {
      title: "Соберите свой предпросмотр",
      description: "<p>Ниже — произвольный слот вместо статичного изображения (режим custom).</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Документация", href: "#docs", variant: "secondary" }],
      image: {
        url: "",
        mode: "custom",
        content: [],
      },
      padding: "48px",
    },
  },
  {
    id: "t-slot-1",
    type: "text",
    props: {
      text: "Здесь может быть макет продукта, Lottie или встроенный виджет — всё через слот изображения.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "16px" },
      __parentId: "hero-3",
      __zone: "image.content",
    },
  },

  { id: "sp-7", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "hero-4",
    type: "hero",
    props: {
      title: "Присоединяйтесь к тысячам команд",
      description: "<p>Никаких обязательств на этапе теста. Отмена в один клик.</p>",
      quote: "«Внедрили за выходные» — Head of Operations",
      align: "center",
      buttons: [
        { label: "Создать аккаунт", href: "#signup", variant: "primary" },
        { label: "Сравнить тарифы", href: "#pricing", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "64px",
    },
  },

  { id: "sp-8", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "flex-1",
    type: "flex",
    props: {
      direction: "row",
      justifyContent: "start",
      gap: 20,
      wrap: "nowrap",
      layout: { padding: "32px" },
    },
  },
  {
    id: "t-flex",
    type: "text",
    props: {
      text: "Гибкие тарифы и перенос данных под ключ.",
      size: "m",
      align: "left",
      color: "muted",
      layout: { grow: 1, padding: "0px" },
      __parentId: "flex-1",
      __zone: "children",
    },
  },
  {
    id: "btn-1",
    type: "button",
    props: {
      label: "Смотреть тарифы",
      href: "#pricing",
      variant: "primary",
      __parentId: "flex-1",
      __zone: "children",
    },
  },
  {
    id: "btn-2",
    type: "button",
    props: {
      label: "Связаться",
      href: "#contact",
      variant: "secondary",
      __parentId: "flex-1",
      __zone: "children",
    },
  },

  { id: "sp-9", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "h-prefooter",
    type: "heading",
    props: {
      text: "Остались вопросы?",
      size: "m",
      level: "h5",
      align: "right",
      layout: { padding: "8px" },
    },
  },

  {
    id: "h-brand",
    type: "heading",
    props: {
      text: "Nimbus",
      size: "xxxl",
      level: "",
      align: "center",
      layout: { padding: "16px" },
    },
  },

  {
    id: "ft-1",
    type: "footer",
    props: {
      columns: [
        { title: "Продукт", description: "Обзор, Changelog, Roadmap" },
        { title: "Компания", description: "О нас, Карьера, Пресс" },
        { title: "Ресурсы", description: "Документация, API, Статус" },
        { title: "Юридическое", description: "Условия, Конфиденциальность, DPA" },
      ],
      copyright: "© 2026 Nimbus Inc. Все права защищены.",
      paddingY: "80px",
      socialLinks: [
        { label: "Twitter", href: "https://twitter.com", variant: "secondary" },
        { label: "LinkedIn", href: "https://linkedin.com", variant: "secondary" },
        { label: "GitHub", href: "https://github.com", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Рабочий email",
    },
  },
];

export const SAAS_UNIVERSAL_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(SAAS_UNIVERSAL_LANDING_BLOCKS),
);
