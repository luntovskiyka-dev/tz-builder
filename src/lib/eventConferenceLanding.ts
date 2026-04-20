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
      logoText: "Product Growth Forum",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Программа", href: "#agenda", variant: "secondary" },
        { label: "Спикеры", href: "#speakers", variant: "secondary" },
        { label: "Билеты", href: "#tickets", variant: "secondary" },
        { label: "Партнёры", href: "#partners", variant: "secondary" },
        { label: "Площадка", href: "#logistics", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Купить билет",
      ctaHref: "#register",
      alignNav: "center",
      showMobileMenu: true,
    },
  },

  { id: "ev-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },

  {
    id: "ev-hero-open",
    type: "hero",
    props: {
      title: "Product Growth Forum 2026",
      description:
        "<p><strong>24-25 сентября</strong> · Москва, кластер «Ломоносов» + онлайн-трансляция</p><p>Два дня практики по growth, product analytics и AI-автоматизации в B2B/SaaS. Реальные кейсы с цифрами, а не общие слайды.</p>",
      quote: "«Одна конференция, после которой команда возвращается с готовым планом на квартал»",
      align: "center",
      buttons: [
        { label: "Купить билет", href: "#register", variant: "primary" },
        { label: "Смотреть программу", href: "#agenda", variant: "secondary" },
        { label: "Стать партнёром", href: "#sponsor", variant: "secondary" },
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
        { title: "45+", description: "Спикеров-практиков" },
        { title: "30+", description: "Сессий и воркшопов" },
        { title: "1200+", description: "Участников офлайн/онлайн" },
      ],
    },
  },

  { id: "ev-sp-3", type: "space", props: { size: "56px", direction: "both" } },

  {
    id: "ev-h-value",
    type: "heading",
    props: {
      text: "Почему стоит приехать",
      size: "xl",
      level: "h2",
      align: "center",
      layout: { padding: "12px" },
    },
  },
  {
    id: "ev-grid-value",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 24,
      layout: { padding: "24px" },
    },
  },
  {
    id: "ev-value-1",
    type: "card",
    props: {
      title: "Практические playbooks",
      description: "Каждая сессия с конкретным фреймворком, метриками и шаблонами внедрения в продукт.",
      icon: "ClipboardList",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ev-grid-value",
      __zone: "items",
    },
  },
  {
    id: "ev-value-2",
    type: "card",
    props: {
      title: "Peer-to-peer нетворкинг",
      description: "Фаундеры, CPO, Growth и RevOps встречаются в форматах roundtable и speed networking.",
      icon: "Users",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "ev-grid-value",
      __zone: "items",
    },
  },
  {
    id: "ev-value-3",
    type: "card",
    props: {
      title: "Контент под разные роли",
      description: "От стратегий монетизации для лидеров до hands-on воркшопов для продуктовых команд.",
      icon: "Layers",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ev-grid-value",
      __zone: "items",
    },
  },

  { id: "ev-sp-3b", type: "space", props: { size: "48px", direction: "vertical" } },

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
      text: "Лидеры роста из B2B SaaS, AI-first продуктов и больших платформ. Каждый доклад с измеримыми результатами.",
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
      title: "Александра Лаврова",
      description: "CPO, ScaleUp Cloud. Тема: PLG + Sales motion в одной воронке.",
      icon: "TrendingUp",
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
      title: "Игорь Титов",
      description: "Head of Growth, Fintech Pro. Тема: эксперименты, которые дали +14% к активации.",
      icon: "LineChart",
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
      title: "Мария Нестерова",
      description: "VP Product, DataCore. Тема: как построить decision intelligence для PM-команды.",
      icon: "BrainCircuit",
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
      title: "Роман Беляев",
      description: "Founder, RevOps Lab. Тема: интеграция AI-агентов в коммерческие процессы.",
      icon: "Bot",
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
      text: "Программа",
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
      richtext: `<h3 id="agenda">День 1 — Product & Growth</h3>
<table style="width:100%; border-collapse:collapse;">
<tr><td style="padding:8px; border-bottom:1px solid #444;">09:30</td><td style="padding:8px; border-bottom:1px solid #444;">Регистрация, welcome coffee</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">10:30</td><td style="padding:8px; border-bottom:1px solid #444;">Открывающий keynote: состояние B2B рынка</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">12:00</td><td style="padding:8px; border-bottom:1px solid #444;">Трек Product: retention и монетизация</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">14:30</td><td style="padding:8px; border-bottom:1px solid #444;">Трек Growth: каналы, CAC и unit economics</td></tr>
<tr><td style="padding:8px;">18:00</td><td style="padding:8px;">Вечерний networking + AMA</td></tr>
</table>
<h3>День 2 — AI & Scale</h3>
<table style="width:100%; border-collapse:collapse;">
<tr><td style="padding:8px; border-bottom:1px solid #444;">10:00</td><td style="padding:8px; border-bottom:1px solid #444;">Hands-on воркшопы по AI в продукте</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">12:30</td><td style="padding:8px; border-bottom:1px solid #444;">Панель лидеров: scaling без потери скорости</td></tr>
<tr><td style="padding:8px; border-bottom:1px solid #444;">15:30</td><td style="padding:8px; border-bottom:1px solid #444;">Roundtables по ролям (CPO, Growth, RevOps)</td></tr>
<tr><td style="padding:8px;">17:30</td><td style="padding:8px;">Closing keynote + анонс 2027</td></tr>
</table>`,
      layout: { padding: "32px" },
    },
  },

  { id: "ev-sp-5", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "ev-h-tickets",
    type: "heading",
    props: {
      text: "Билеты",
      size: "xl",
      level: "h2",
      align: "center",
      layout: { padding: "8px" },
    },
  },
  {
    id: "ev-t-tickets",
    type: "text",
    props: {
      text: "Три формата участия: офлайн all-access, онлайн pass и командные пакеты для компаний.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "720px",
      layout: { padding: "8px" },
    },
  },
  {
    id: "ev-grid-tickets",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 20,
      layout: { padding: "24px" },
    },
  },
  {
    id: "ev-ticket-1",
    type: "card",
    props: {
      title: "Standard Pass",
      description: "2 дня офлайн, все треки, записи и networking. Оптимально для индивидуального участия.",
      icon: "Ticket",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ev-grid-tickets",
      __zone: "items",
    },
  },
  {
    id: "ev-ticket-2",
    type: "card",
    props: {
      title: "Team Pass",
      description: "5+ билетов для команды, отдельная регистрация и пост-ивент разбор с кураторами.",
      icon: "Building2",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "ev-grid-tickets",
      __zone: "items",
    },
  },
  {
    id: "ev-ticket-3",
    type: "card",
    props: {
      title: "Online Pass",
      description: "Трансляция ключевых сессий, доступ к записям и материалам на 30 дней.",
      icon: "MonitorPlay",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ev-grid-tickets",
      __zone: "items",
    },
  },

  { id: "ev-sp-5b", type: "space", props: { size: "32px", direction: "vertical" } },

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
      text: "Партнёры помогают делать практический контент, воркшопы и стипендии для early-stage команд.",
      size: "s",
      align: "center",
      color: "default",
      layout: { padding: "4px" },
    },
  },
  {
    id: "ev-logos",
    type: "logos",
    props: {
      logos: [
        { alt: "CloudScale", imageUrl: "https://placehold.co/160x40/1a1a2e/eee/png?text=CloudScale" },
        { alt: "MetricOne", imageUrl: "https://placehold.co/160x40/16213e/94a3b8/png?text=MetricOne" },
        { alt: "DataFlow", imageUrl: "https://placehold.co/160x40/0f3460/e94560/png?text=DataFlow" },
        { alt: "GrowthLab", imageUrl: "https://placehold.co/160x40/533483/fff/png?text=GrowthLab" },
        { alt: "RevStack", imageUrl: "https://placehold.co/160x40/2d4059/f07b3f/png?text=RevStack" },
      ],
    },
  },

  { id: "ev-sp-6", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "ev-hero-reg",
    type: "hero",
    props: {
      title: "Регистрация уже открыта",
      description:
        "<p id='register'>После покупки вы сразу получите доступ к личному кабинету участника, чату и материалам до старта события.</p><p>Early bird действует до 15 июля, далее цена повышается.</p>",
      quote: "Командным пакетам доступна постоплата и закрывающие документы.",
      align: "left",
      buttons: [
        { label: "Купить билет", href: "#register", variant: "primary" },
        { label: "Командный пакет", href: "#tickets", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
        mode: "inline",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "ev-sp-7", type: "space", props: { size: "28px", direction: "vertical" } },

  {
    id: "ev-hero-early",
    type: "hero",
    props: {
      title: "Станьте партнёром",
      description:
        "<p id='sponsor'>Партнёрские пакеты: стенд, интеграции в программу, warm intros и доступ к B2B-встрече с целевыми участниками.</p>",
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
      description:
        "<p id='logistics'>Кластер «Ломоносов»: 3 параллельных зала, expo-зона, быстрый check-in и комфортная инфраструктура для офлайн-участников.</p>",
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
      text: "Слот для схемы площадки, карты прохода, интерактивного floorplan или видео с venue.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "12px" },
      __parentId: "ev-hero-venue",
      __zone: "image.content",
    },
  },

  { id: "ev-sp-9", type: "space", props: { size: "36px", direction: "vertical" } },

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
      href: "#agenda",
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
      text: "Нужны документы, счёт на юрлицо или помощь с выбором билета? Ответим в течение рабочего дня.",
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
      label: "team@product-growth-forum.com",
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
        "<h3>FAQ</h3><p><strong>Кому подойдёт конференция?</strong> Product Manager, Growth, маркетинг, RevOps, фаундерам и лидерам B2B/SaaS-команд.</p><p><strong>Будет ли онлайн?</strong> Да, для части треков и ключевых выступлений.</p><p><strong>Вернём ли билет?</strong> Возврат возможен за 14 дней до старта, позже — перенос на следующую дату.</p><p><strong>Будут ли записи?</strong> Да, участники получают доступ к записям на 30 дней.</p>",
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
      text: "Product Growth Forum",
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
        { title: "Программа", description: "Треки, расписание, материалы" },
        { title: "Участникам", description: "Билеты, доступ, FAQ" },
        { title: "Партнёрам", description: "Пакеты, медиакит, заявка" },
        { title: "Оргкомитет", description: "Поддержка, пресса, документы" },
      ],
      copyright: "© 2026 Product Growth Forum. Все права защищены.",
      paddingY: "64px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "YouTube", href: "https://youtube.com", variant: "secondary" },
        { label: "LinkedIn", href: "https://linkedin.com", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для анонсов и early bird",
    },
  },
];

export const EVENT_CONFERENCE_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(EVENT_CONFERENCE_LANDING_BLOCKS),
);
