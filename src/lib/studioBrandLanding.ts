import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/**
 * Универсальный лендинг «Небольшой бренд / студия»: портфолио, услуги, контакты.
 * Отличается от SaaS: креативная подача, нет продуктовых тарифов/триалов/SLA; без блока Template.
 * В данных только публичные поля инспектора из `puckBlocks` + служебные `__parentId` / `__zone` для вложенности.
 */
export const STUDIO_BRAND_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "sb-hdr",
    type: "header",
    props: {
      logoText: "Объём",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Работы", href: "#work", variant: "secondary" },
        { label: "Услуги", href: "#services", variant: "secondary" },
        { label: "Процесс", href: "#process", variant: "secondary" },
        { label: "Контакты", href: "#contact", variant: "secondary" },
      ],
      behavior: "static",
      ctaLabel: "Обсудить проект",
      ctaHref: "#contact",
      alignNav: "center",
      showMobileMenu: true,
    },
  },

  { id: "sb-sp-1", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "sb-hero-center",
    type: "hero",
    props: {
      title: "Студия визуальных решений для брендов с характером",
      description:
        "<p>Стратегия, айдентика, сайты и презентации. Работаем с командами основателей и маркетинга — от первого брифа до гайдлайна.</p><p>Фокус на узнаваемости и спокойной премиальности, без визуального шума.</p>",
      quote:
        "«Каждый проект — это голос бренда, который считывается в первые секунды.» — креативный директор студии",
      align: "center",
      buttons: [
        { label: "Смотреть работы", href: "#work", variant: "primary" },
        { label: "Услуги", href: "#services", variant: "secondary" },
        { label: "Связаться", href: "#contact", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "80px",
    },
  },

  { id: "sb-sp-2", type: "space", props: { size: "48px", direction: "both" } },

  {
    id: "sb-h-brand-xl",
    type: "heading",
    props: {
      text: "Объём",
      size: "xxxl",
      level: "",
      align: "center",
      layout: { padding: "16px" },
    },
  },
  {
    id: "sb-t-lead",
    type: "text",
    props: {
      text: "Небольшая команда, короткие сроки, внимание к деталям. Не делаем «универсальные шаблоны» — собираем систему под ваш контекст.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "640px",
      layout: { padding: "8px" },
    },
  },

  { id: "sb-sp-3", type: "space", props: { size: "64px", direction: "vertical" } },

  {
    id: "sb-h-services",
    type: "heading",
    props: {
      text: "Услуги",
      size: "xxl",
      level: "h1",
      align: "center",
      layout: { padding: "24px" },
    },
  },
  {
    id: "sb-t-services-lead",
    type: "text",
    props: {
      text: "Три типовых направления — их можно комбинировать или взять точечно.",
      size: "s",
      align: "center",
      color: "default",
      maxWidth: "560px",
      layout: { padding: "8px" },
    },
  },

  {
    id: "sb-grid-services",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 28,
      layout: { padding: "40px" },
    },
  },
  {
    id: "sb-card-svc-1",
    type: "card",
    props: {
      title: "Стратегия и позиционирование",
      description:
        "Исследование аудитории, конкурентный ландшафт, платформа бренда и тон коммуникации.",
      icon: "Lightbulb",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "sb-grid-services",
      __zone: "items",
    },
  },
  {
    id: "sb-card-svc-2",
    type: "card",
    props: {
      title: "Визуальная система и сайт",
      description:
        "Логотип, типографика, UI-кит, адаптивный сайт и материалы для соцсетей.",
      icon: "Sparkles",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "sb-grid-services",
      __zone: "items",
    },
  },
  {
    id: "sb-card-svc-3",
    type: "card",
    props: {
      title: "Контент и презентации",
      description: "Сценарии, копирайт, кейсы для инвесторов и питч-деки под ключ.",
      icon: "LayoutGrid",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "sb-grid-services",
      __zone: "items",
    },
  },

  { id: "sb-sp-4", type: "space", props: { size: "48px", direction: "horizontal" } },

  {
    id: "sb-h-logos",
    type: "heading",
    props: {
      text: "Работали с командами и брендами",
      size: "s",
      level: "h4",
      align: "center",
      layout: { padding: "8px" },
    },
  },

  {
    id: "sb-logos",
    type: "logos",
    props: {
      logos: [
        {
          alt: "North",
          imageUrl: "https://placehold.co/200x48/0c0a09/e7e5e4/png?text=North",
        },
        {
          alt: "Field",
          imageUrl: "https://placehold.co/200x48/1c1917/d6d3d1/png?text=Field",
        },
        {
          alt: "Mono",
          imageUrl: "https://placehold.co/200x48/292524/a8a29e/png?text=Mono",
        },
        {
          alt: "Atlas",
          imageUrl: "https://placehold.co/200x48/134e4a/99f6e4/png?text=Atlas",
        },
      ],
    },
  },

  { id: "sb-sp-5", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "sb-stats",
    type: "stats",
    props: {
      items: [
        { title: "12+", description: "Лет в индустрии" },
        { title: "180+", description: "Запусков и релизов" },
        { title: "24", description: "Наград и отборов" },
        { title: "8", description: "Стран и часовых поясов" },
      ],
    },
  },

  { id: "sb-sp-6", type: "space", props: { size: "40px", direction: "both" } },

  {
    id: "sb-h-process",
    type: "heading",
    props: {
      text: "Процесс",
      size: "xl",
      level: "h2",
      align: "left",
      layout: { padding: "16px" },
    },
  },
  {
    id: "sb-t-process-aside",
    type: "text",
    props: {
      text: "Прозрачные этапы и синхронные созвоны — без «чёрного ящика».",
      size: "s",
      align: "right",
      color: "muted",
      layout: { padding: "8px" },
    },
  },

  {
    id: "sb-rt-process",
    type: "richtext",
    props: {
      richtext: `<h3 id="process">Как мы ведём проект</h3>
<ul>
<li><strong>Бриф и референсы</strong> — фиксируем цели, ограничения и визуальные ориентиры.</li>
<li><strong>Концепция</strong> — 1–2 направления, созвон с обоснованием.</li>
<li><strong>Продакшн</strong> — итерации с промежуточными сдачами; финальные файлы и гайдлайн.</li>
</ul>
<p>Дополнительно: сопровождение запуска и обучение команды работе с системой.</p>`,
      layout: { padding: "32px" },
    },
  },

  { id: "sb-sp-7", type: "space", props: { size: "24px", direction: "vertical" } },

  {
    id: "sb-hero-bg",
    type: "hero",
    props: {
      title: "Атмосфера студии — часть результата",
      description:
        "<p>Мы сознательно ограничиваем число параллельных проектов, чтобы оставаться в контексте и не терять нюансы.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Записаться на созвон", href: "#contact", variant: "primary" },
        { label: "Портфолио PDF", href: "#work", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "sb-sp-8", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "sb-hero-custom",
    type: "hero",
    props: {
      title: "Слот для макета или превью",
      description:
        "<p>Режим custom: сюда можно положить макет из Figma, видео или статичный кадр — без привязки к одному изображению.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Запросить примеры", href: "#contact", variant: "secondary" }],
      image: {
        url: "",
        mode: "custom",
        content: [],
      },
      padding: "48px",
    },
  },
  {
    id: "sb-t-hero-slot",
    type: "text",
    props: {
      text: "Здесь может быть превью кейса, сетка обложек или встроенный виджет — всё через слот изображения.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "8px" },
      __parentId: "sb-hero-custom",
      __zone: "image.content",
    },
  },

  { id: "sb-sp-9", type: "space", props: { size: "16px", direction: "vertical" } },

  {
    id: "sb-hero-inline",
    type: "hero",
    props: {
      title: "Соберите первый визуальный прототип",
      description: "<p>Короткий спринт: мудборд, структура сайта и черновой UI. Подходит перед инвестиционным раундом или ребрендингом.</p>",
      quote: "«За две недели получили понятный фронт для питча» — основатель B2B-стартапа",
      align: "left",
      buttons: [
        { label: "Запросить смету", href: "#contact", variant: "primary" },
        { label: "Письмо на почту", href: "mailto:hello@example.com", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1558655146-6c990e8a0e4f?w=1400&q=80",
        mode: "inline",
        content: [],
      },
      padding: "32px",
    },
  },

  { id: "sb-sp-10", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "sb-flex-row",
    type: "flex",
    props: {
      direction: "row",
      justifyContent: "center",
      gap: 24,
      wrap: "wrap",
      layout: { padding: "32px" },
    },
  },
  {
    id: "sb-t-flex",
    type: "text",
    props: {
      text: "Нужен паспорт бренда или только сайт? Напишите — предложим состав и сроки.",
      size: "m",
      align: "left",
      color: "muted",
      layout: { padding: "0px" },
      __parentId: "sb-flex-row",
      __zone: "children",
    },
  },
  {
    id: "sb-btn-flex-1",
    type: "button",
    props: {
      label: "Смотреть услуги",
      href: "#services",
      variant: "primary",
      __parentId: "sb-flex-row",
      __zone: "children",
    },
  },
  {
    id: "sb-btn-flex-2",
    type: "button",
    props: {
      label: "Контакты",
      href: "#contact",
      variant: "secondary",
      __parentId: "sb-flex-row",
      __zone: "children",
    },
  },

  { id: "sb-sp-11", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "sb-flex-col",
    type: "flex",
    props: {
      direction: "column",
      justifyContent: "start",
      gap: 20,
      wrap: "nowrap",
      layout: { padding: "24px" },
    },
  },
  {
    id: "sb-h-flex-col",
    type: "heading",
    props: {
      text: "Быстрый старт",
      size: "l",
      level: "h3",
      align: "left",
      layout: { padding: "0px" },
      __parentId: "sb-flex-col",
      __zone: "children",
    },
  },
  {
    id: "sb-t-flex-col",
    type: "text",
    props: {
      text: "Ответим в течение 1–2 рабочих дней. Можно приложить ссылку на бриф или референсы.",
      size: "m",
      align: "left",
      color: "default",
      layout: { padding: "0px" },
      __parentId: "sb-flex-col",
      __zone: "children",
    },
  },
  {
    id: "sb-btn-standalone",
    type: "button",
    props: {
      label: "Написать в Telegram",
      href: "https://t.me",
      variant: "secondary",
      __parentId: "sb-flex-col",
      __zone: "children",
    },
  },

  { id: "sb-sp-12", type: "space", props: { size: "72px", direction: "vertical" } },

  {
    id: "sb-grid-two",
    type: "grid",
    props: {
      numColumns: 2,
      gap: 32,
      layout: { padding: "48px" },
    },
  },
  {
    id: "sb-card-grid-1",
    type: "card",
    props: {
      title: "Малый бренд",
      description: "Пакет для старта: логотип, базовые носители и лендинг до 5 экранов.",
      icon: "Heart",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "sb-grid-two",
      __zone: "items",
    },
  },
  {
    id: "sb-card-grid-2",
    type: "card",
    props: {
      title: "Рост и масштаб",
      description: "Расширение системы, многостраничный сайт и шаблоны для команды.",
      icon: "Rocket",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "sb-grid-two",
      __zone: "items",
    },
  },

  { id: "sb-sp-13", type: "space", props: { size: "32px", direction: "horizontal" } },

  {
    id: "sb-flex-start",
    type: "flex",
    props: {
      direction: "row",
      justifyContent: "start",
      gap: 20,
      wrap: "nowrap",
      layout: { padding: "16px" },
    },
  },
  {
    id: "sb-t-flex-start",
    type: "text",
    props: {
      text: "Договор и NDA — по запросу до старта работ.",
      size: "s",
      align: "left",
      color: "muted",
      layout: { padding: "0px" },
      __parentId: "sb-flex-start",
      __zone: "children",
    },
  },
  {
    id: "sb-btn-nda",
    type: "button",
    props: {
      label: "Запросить пример договора",
      href: "#contact",
      variant: "secondary",
      __parentId: "sb-flex-start",
      __zone: "children",
    },
  },

  {
    id: "sb-h-xs",
    type: "heading",
    props: {
      text: "Работаем по предоплате и этапам — без сюрпризов в конце.",
      size: "xs",
      level: "h6",
      align: "center",
      layout: { padding: "8px" },
    },
  },

  {
    id: "sb-flex-end",
    type: "flex",
    props: {
      direction: "row",
      justifyContent: "end",
      gap: 16,
      wrap: "wrap",
      layout: { padding: "8px" },
    },
  },
  {
    id: "sb-btn-end",
    type: "button",
    props: {
      label: "В начало",
      href: "#",
      variant: "primary",
      __parentId: "sb-flex-end",
      __zone: "children",
    },
  },

  { id: "sb-sp-14", type: "space", props: { size: "24px", direction: "vertical" } },

  {
    id: "sb-h-prefooter",
    type: "heading",
    props: {
      text: "Контакты",
      size: "m",
      level: "h5",
      align: "right",
      layout: { padding: "8px" },
    },
  },
  {
    id: "sb-h-signoff",
    type: "heading",
    props: {
      text: "Объём",
      size: "xxxl",
      level: "",
      align: "center",
      layout: { padding: "16px" },
    },
  },

  {
    id: "sb-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Студия", description: "О команде, подход, вакансии" },
        { title: "Работы", description: "Кейсы, отрасли, форматы" },
        { title: "Связь", description: "Почта, календарь, соцсети" },
      ],
      copyright: "© 2026 Студия «Объём». Все права защищены.",
      paddingY: "64px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "Behance", href: "https://behance.net", variant: "secondary" },
        { label: "Почта", href: "mailto:hello@example.com", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для рассылки и портфолио в PDF",
    },
  },
];

export const STUDIO_BRAND_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(STUDIO_BRAND_LANDING_BLOCKS),
);
