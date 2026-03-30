import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/**
 * Лендинг «Событие / конференция»: расписание, спикеры, регистрация, партнёры.
 * Отличается от SaaS: фокус на дате/площадке, программе, спикерах и партнёрах; без блока Template.
 * Поля инспектора — как в `puckBlocks` (без скрытых props вроде backgroundColor у header/footer).
 */
export const EVENT_CONFERENCE_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "ev-hdr",
    type: "header",
    props: {
      logoText: "Frontend Summit",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Расписание", href: "#schedule", variant: "secondary" },
        { label: "Спикеры", href: "#speakers", variant: "secondary" },
        { label: "Партнёры", href: "#partners", variant: "secondary" },
        { label: "Площадка", href: "#venue", variant: "secondary" },
      ],
      behavior: "static",
      ctaLabel: "Регистрация",
      ctaHref: "#register",
      alignNav: "center",
      showMobileMenu: true,
    },
  },

  { id: "ev-sp-1", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "ev-hero-open",
    type: "hero",
    props: {
      title: "Frontend Summit 2026",
      description:
        "<p><strong>12–13 июня</strong> · Москва, Центр дизайна ARTPLAY</p><p>Два дня докладов, воркшопов и нетворкинга для инженеров и продактов.</p>",
      quote: "«Главная инженерная конференция сезона» — программный комитет",
      align: "center",
      buttons: [
        { label: "Зарегистрироваться", href: "#register", variant: "primary" },
        { label: "Программа PDF", href: "#program", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "80px",
    },
  },

  { id: "ev-sp-2", type: "space", props: { size: "24px", direction: "vertical" } },

  {
    id: "ev-stats",
    type: "stats",
    props: {
      items: [
        { title: "2", description: "Дня программы" },
        { title: "40+", description: "Спикеров" },
        { title: "35", description: "Докладов и воркшопов" },
        { title: "25", description: "Стран участников" },
      ],
    },
  },

  { id: "ev-sp-3", type: "space", props: { size: "64px", direction: "both" } },

  {
    id: "ev-h-speakers",
    type: "heading",
    props: {
      text: "Спикеры",
      size: "xxl",
      level: "h2",
      align: "center",
      layout: { padding: "24px" },
    },
  },
  {
    id: "ev-t-speakers-lead",
    type: "text",
    props: {
      text: "Техлиды продуктовых компаний, создатели open source и исследователи производительности.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "720px",
      layout: { padding: "8px" },
    },
  },

  {
    id: "ev-grid-speakers",
    type: "grid",
    props: {
      numColumns: 4,
      gap: 24,
      layout: { padding: "40px" },
    },
  },
  {
    id: "ev-spk-1",
    type: "card",
    props: {
      title: "Анна Орлова",
      description: "Staff Engineer, платформенная команда. Тема: дизайн-системы в production.",
      icon: "Users",
      mode: "card",
      layout: { spanCol: 1, padding: "0px" },
      __parentId: "ev-grid-speakers",
      __zone: "items",
    },
  },
  {
    id: "ev-spk-2",
    type: "card",
    props: {
      title: "Михаил Волков",
      description: "Core contributor. Тема: WebAssembly и границы клиента.",
      icon: "Cpu",
      mode: "card",
      layout: { spanCol: 1, padding: "0px" },
      __parentId: "ev-grid-speakers",
      __zone: "items",
    },
  },
  {
    id: "ev-spk-3",
    type: "card",
    props: {
      title: "Елена Ким",
      description: "Lead UX Engineer. Тема: доступность и метрики в реальном времени.",
      icon: "Heart",
      mode: "card",
      layout: { spanCol: 1, padding: "0px" },
      __parentId: "ev-grid-speakers",
      __zone: "items",
    },
  },
  {
    id: "ev-spk-4",
    type: "card",
    props: {
      title: "Дмитрий Соколов",
      description: "Performance. Тема: Core Web Vitals и крупные бандлы.",
      icon: "Zap",
      mode: "card",
      layout: { spanCol: 1, padding: "0px" },
      __parentId: "ev-grid-speakers",
      __zone: "items",
    },
  },

  { id: "ev-sp-4", type: "space", props: { size: "48px", direction: "horizontal" } },

  {
    id: "ev-h-schedule",
    type: "heading",
    props: {
      text: "Расписание",
      size: "xl",
      level: "h2",
      align: "left",
      layout: { padding: "16px" },
    },
  },
  {
    id: "ev-rt-schedule",
    type: "richtext",
    props: {
      richtext: `<h3 id="schedule">День 1 — 12 июня</h3>
<table style="width:100%; border-collapse:collapse;">
<tr><td style="padding:8px; border-bottom:1px solid #444;">10:00</td><td style="padding:8px; border-bottom:1px solid #444;">Регистрация, кофе</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">11:00</td><td style="padding:8px; border-bottom:1px solid #444;">Открытие, приветствие программного комитета</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">12:30</td><td style="padding:8px; border-bottom:1px solid #444;">Доклады: блок «Платформы»</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">15:00</td><td style="padding:8px; border-bottom:1px solid #444;">Обед, нетворкинг</td></tr>
</table>
<h3>День 2 — 13 июня</h3>
<table style="width:100%; border-collapse:collapse;">
<tr><td style="padding:8px; border-bottom:1px solid #444;">10:00</td><td style="padding:8px; border-bottom:1px solid #444;">Воркшопы (по записям)</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">14:00</td><td style="padding:8px; border-bottom:1px solid #444;">Панель: будущее фронтенда</td></tr>
<tr><td style="padding:8px;">18:00</td><td style="padding:8px;">Закрытие, афтепати</td></tr>
</table>`,
      layout: { padding: "32px" },
    },
  },

  { id: "ev-sp-5", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "ev-h-partners",
    type: "heading",
    props: {
      text: "Партнёры и спонсоры",
      size: "l",
      level: "h3",
      align: "center",
      layout: { padding: "8px" },
    },
  },
  {
    id: "ev-t-partners",
    type: "text",
    props: {
      text: "Золотые и серебряные партнёры поддерживают сообщество и стипендии на билеты.",
      size: "s",
      align: "right",
      color: "default",
      layout: { padding: "4px" },
    },
  },
  {
    id: "ev-logos",
    type: "logos",
    props: {
      logos: [
        { alt: "TechCorp", imageUrl: "https://placehold.co/160x40/1a1a2e/eee/png?text=Partner+A" },
        { alt: "CloudScale", imageUrl: "https://placehold.co/160x40/16213e/94a3b8/png?text=Partner+B" },
        { alt: "DataFlow", imageUrl: "https://placehold.co/160x40/0f3460/e94560/png?text=Partner+C" },
        { alt: "OpenDev", imageUrl: "https://placehold.co/160x40/533483/fff/png?text=Partner+D" },
        { alt: "UXLab", imageUrl: "https://placehold.co/160x40/2d4059/f07b3f/png?text=Partner+E" },
      ],
    },
  },

  { id: "ev-sp-6", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "ev-hero-reg",
    type: "hero",
    props: {
      title: "Регистрация открыта",
      description:
        "<p>Билеты: Standard, Student и онлайн-трансляция. Групповые скидки от 5 человек.</p><p>После оплаты вы получите QR и доступ в личный кабинет.</p>",
      quote: "Ранние билеты до 1 мая — скидка 20%.",
      align: "left",
      buttons: [
        { label: "Купить билет", href: "#register", variant: "primary" },
        { label: "Партнёрский пакет", href: "#sponsor", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
        mode: "inline",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "ev-sp-7", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "ev-hero-early",
    type: "hero",
    props: {
      title: "Станьте партнёром",
      description: "<p>Брендинг на площадке, стенд в зоне expo и включение в рассылку на 15 000 подписчиков.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Запросить медиакит", href: "#sponsor-kit", variant: "primary" }],
      image: {
        url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "ev-sp-8", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "ev-hero-venue",
    type: "hero",
    props: {
      title: "Площадка",
      description: "<p>ARTPLAY — крытые залы и открытый двор для нетворкинга. Карта и парковка в подтверждении регистрации.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Как добраться", href: "#map", variant: "secondary" }],
      image: {
        url: "",
        mode: "custom",
        content: [],
      },
      padding: "48px",
    },
  },
  {
    id: "ev-t-venue-slot",
    type: "text",
    props: {
      text: "Слот для карты или схемы зала (режим custom у изображения героя).",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "12px" },
      __parentId: "ev-hero-venue",
      __zone: "image.content",
    },
  },

  { id: "ev-sp-9", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "ev-flex-cta",
    type: "flex",
    props: {
      direction: "row",
      justifyContent: "center",
      gap: 16,
      wrap: "wrap",
      layout: { padding: "24px" },
    },
  },
  {
    id: "ev-btn-1",
    type: "button",
    props: {
      label: "В календарь",
      href: "#calendar",
      variant: "primary",
      __parentId: "ev-flex-cta",
      __zone: "children",
    },
  },
  {
    id: "ev-btn-2",
    type: "button",
    props: {
      label: "Скачать программу",
      href: "#program",
      variant: "secondary",
      __parentId: "ev-flex-cta",
      __zone: "children",
    },
  },

  { id: "ev-sp-10", type: "space", props: { size: "24px", direction: "vertical" } },

  {
    id: "ev-flex-ticket",
    type: "flex",
    props: {
      direction: "row",
      justifyContent: "end",
      gap: 20,
      wrap: "nowrap",
      layout: { padding: "32px" },
    },
  },
  {
    id: "ev-t-ticket",
    type: "text",
    props: {
      text: "Есть вопросы по билетам и возвратам — напишите в поддержку.",
      size: "m",
      align: "left",
      color: "muted",
      layout: { grow: 1, padding: "0px" },
      __parentId: "ev-flex-ticket",
      __zone: "children",
    },
  },
  {
    id: "ev-btn-3",
    type: "button",
    props: {
      label: "support@frontend-summit.ru",
      href: "mailto:support@example.com",
      variant: "secondary",
      __parentId: "ev-flex-ticket",
      __zone: "children",
    },
  },

  { id: "ev-sp-11", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "ev-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3>Частые вопросы</h3><p><strong>Нужен ли английский?</strong> Основная программа на русском; отдельные доклады — с субтитрами.</p><p><strong>Онлайн?</strong> Да, для части потоков доступна трансляция.</p>",
      layout: { padding: "48px" },
    },
  },

  {
    id: "ev-h-micro",
    type: "heading",
    props: {
      text: "Почта оргкомитета",
      size: "xs",
      level: "h6",
      align: "right",
      layout: { padding: "4px" },
    },
  },
  {
    id: "ev-h-brand",
    type: "heading",
    props: {
      text: "Frontend Summit",
      size: "xxxl",
      level: "",
      align: "center",
      layout: { padding: "16px" },
    },
  },

  {
    id: "ev-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Программа", description: "Расписание, спикеры, воркшопы" },
        { title: "Участникам", description: "Билеты, трансляция, нетворкинг" },
        { title: "Партнёрам", description: "Спонсорство, стенд, рассылка" },
        { title: "Контакты", description: "Пресса, сотрудничество, доступность" },
      ],
      copyright: "© 2026 Frontend Summit. Все права защищены.",
      paddingY: "64px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "YouTube", href: "https://youtube.com", variant: "secondary" },
        { label: "VK", href: "https://vk.com", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для новостей о конференции",
    },
  },
];

export const EVENT_CONFERENCE_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(EVENT_CONFERENCE_LANDING_BLOCKS),
);
