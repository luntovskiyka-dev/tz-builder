import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Универсальный лендинг «Онлайн-курс / Школа / Вебинар». */
export const ONLINE_COURSE_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "oc-hdr",
    type: "header",
    props: {
      logoText: "SkillSprint",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Программа", href: "#program", variant: "secondary" },
        { label: "Преподаватель", href: "#mentor", variant: "secondary" },
        { label: "Тарифы", href: "#pricing", variant: "secondary" },
        { label: "Отзывы", href: "#reviews", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Записаться",
      ctaHref: "#enroll",
      alignNav: "center",
      showMobileMenu: true,
    },
  },

  { id: "oc-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },

  {
    id: "oc-hero-main",
    type: "hero",
    props: {
      title: "Практический курс по запуску и росту digital-продуктов",
      description:
        "<p><strong>8 недель, онлайн</strong> с живыми разборами и обратной связью. Подходит PM, маркетологам и фаундерам.</p><p>На выходе: стратегия, метрики, roadmap экспериментов и набор рабочих шаблонов.</p>",
      quote:
        "«После курса собрали воронку, которая дала +22% к активации за 6 недель» — выпускник потока",
      align: "left",
      buttons: [
        { label: "Записаться на поток", href: "#enroll", variant: "primary" },
        { label: "Посмотреть программу", href: "#program", variant: "secondary" },
        { label: "Получить консультацию", href: "#contact", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "80px",
    },
  },

  { id: "oc-sp-2", type: "space", props: { size: "28px", direction: "vertical" } },

  {
    id: "oc-stats",
    type: "stats",
    props: {
      items: [
        { title: "8 недель", description: "длительность программы" },
        { title: "16 занятий", description: "лекции и воркшопы" },
        { title: "500+", description: "выпускников" },
        { title: "4.9/5", description: "средняя оценка курса" },
      ],
    },
  },

  { id: "oc-sp-3", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "oc-h-program",
    type: "heading",
    props: {
      text: "Программа курса",
      size: "xxl",
      level: "h2",
      align: "center",
      layout: { padding: "12px" },
    },
  },
  {
    id: "oc-t-program",
    type: "text",
    props: {
      text: "Каждый модуль построен как практический шаг: от гипотез до внедрения в продукт.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "720px",
      layout: { padding: "8px" },
    },
  },
  {
    id: "oc-grid-program",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 24,
      layout: { padding: "24px" },
    },
  },
  {
    id: "oc-card-mod-1",
    type: "card",
    props: {
      title: "Модуль 1: Диагностика",
      description: "Цели, сегменты, unit-экономика и выбор ключевых метрик роста.",
      icon: "Lightbulb",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "oc-grid-program",
      __zone: "items",
    },
  },
  {
    id: "oc-card-mod-2",
    type: "card",
    props: {
      title: "Модуль 2: Эксперименты",
      description: "Приоритизация гипотез, дизайн экспериментов, интерпретация результатов.",
      icon: "Zap",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "oc-grid-program",
      __zone: "items",
    },
  },
  {
    id: "oc-card-mod-3",
    type: "card",
    props: {
      title: "Модуль 3: Масштаб",
      description: "Систематизация процессов, dashboard, план на 90 дней после обучения.",
      icon: "Rocket",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "oc-grid-program",
      __zone: "items",
    },
  },

  { id: "oc-sp-4", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "oc-h-mentor",
    type: "heading",
    props: {
      text: "Преподаватель",
      size: "xl",
      level: "h2",
      align: "left",
      layout: { padding: "8px" },
    },
  },
  {
    id: "oc-hero-mentor",
    type: "hero",
    props: {
      title: "Анна Романова",
      description:
        "<p id='mentor'>Ex-Head of Growth в SaaS-компании и ментор продуктовых команд. 10+ лет в продуктовой аналитике и росте.</p><p>На курсе разбираем реальные кейсы участников и адаптируем инструменты под вашу нишу.</p>",
      quote: "«Без воды: только рабочие подходы, которые можно применять уже на следующей неделе.»",
      align: "left",
      buttons: [{ label: "Задать вопрос до старта", href: "#contact", variant: "secondary" }],
      image: {
        url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=80",
        mode: "inline",
        content: [],
      },
      padding: "48px",
    },
  },

  { id: "oc-sp-5", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "oc-h-pricing",
    type: "heading",
    props: {
      text: "Тарифы",
      size: "xl",
      level: "h2",
      align: "center",
      layout: { padding: "8px" },
    },
  },
  {
    id: "oc-grid-pricing",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 20,
      layout: { padding: "24px" },
    },
  },
  {
    id: "oc-card-price-1",
    type: "card",
    props: {
      title: "Starter",
      description: "Записи уроков, материалы и домашние задания с проверкой.",
      icon: "LayoutGrid",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "oc-grid-pricing",
      __zone: "items",
    },
  },
  {
    id: "oc-card-price-2",
    type: "card",
    props: {
      title: "Pro",
      description: "Все из Starter + живые сессии, Q&A, разбор вашего кейса и чат.",
      icon: "Users",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "oc-grid-pricing",
      __zone: "items",
    },
  },
  {
    id: "oc-card-price-3",
    type: "card",
    props: {
      title: "Team",
      description: "Доступ для команды, воркшоп под компанию и итоговая стратегия внедрения.",
      icon: "Cpu",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "oc-grid-pricing",
      __zone: "items",
    },
  },

  { id: "oc-sp-6", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "oc-h-reviews",
    type: "heading",
    props: {
      text: "Отзывы участников",
      size: "xl",
      level: "h2",
      align: "left",
      layout: { padding: "8px" },
    },
  },
  {
    id: "oc-rt-reviews",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='reviews'>Что говорят выпускники</h3><p><strong>Марина, Product Manager:</strong> «Собрала прозрачную систему метрик и приоритизации. Команда перестала спорить “по ощущениям”.»</p><p><strong>Илья, Founder:</strong> «Внедрили 3 эксперимента из курса и получили рост платящих пользователей уже в первый месяц.»</p><p><strong>Ольга, Growth Lead:</strong> «Полезно, что дают фреймворки и сразу показывают, где обычно ошибаются команды.»</p>",
      layout: { padding: "24px" },
    },
  },

  { id: "oc-sp-7", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "oc-hero-webinar",
    type: "hero",
    props: {
      title: "Открытый вводный вебинар",
      description:
        "<p>Перед стартом потока проводим бесплатный вебинар: покажем структуру обучения, разберём 2 практических кейса и ответим на вопросы.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Записаться на вебинар", href: "#enroll", variant: "primary" }],
      image: {
        url: "",
        mode: "custom",
        content: [],
      },
      padding: "48px",
    },
  },
  {
    id: "oc-t-webinar-slot",
    type: "text",
    props: {
      text: "Слот для видео-превью вебинара, таймера до старта или embed формы регистрации.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "8px" },
      __parentId: "oc-hero-webinar",
      __zone: "image.content",
    },
  },

  { id: "oc-sp-8", type: "space", props: { size: "36px", direction: "vertical" } },

  {
    id: "oc-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3>FAQ</h3><p><strong>Нужен ли опыт?</strong> Базовый опыт в продукте/маркетинге желателен, но не обязателен.</p><p><strong>Будут ли записи?</strong> Да, записи всех занятий доступны на 3 месяца.</p><p><strong>Есть ли сертификат?</strong> Да, после выполнения итогового проекта.</p><p><strong>Можно ли оплатить от юрлица?</strong> Да, доступна оплата по счету.</p>",
      layout: { padding: "24px" },
    },
  },

  { id: "oc-sp-9", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "oc-hero-final",
    type: "hero",
    props: {
      title: "Старт следующего потока — 14 октября",
      description:
        "<p id='enroll'>Оставьте заявку, и мы поможем выбрать тариф под вашу роль и цели команды.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Записаться на курс", href: "#enroll", variant: "primary" },
        { label: "Получить консультацию", href: "#contact", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "oc-sp-10", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "oc-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Курс", description: "Программа, формат, требования" },
        { title: "Участникам", description: "Тарифы, FAQ, даты запуска" },
        { title: "Контакты", description: "Поддержка, документы, партнёры" },
      ],
      copyright: "© 2026 SkillSprint. Все права защищены.",
      paddingY: "64px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "YouTube", href: "https://youtube.com", variant: "secondary" },
        { label: "Почта", href: "mailto:team@skillsprint.io", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для материалов и анонсов",
    },
  },
];

export const ONLINE_COURSE_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(ONLINE_COURSE_LANDING_BLOCKS),
);
