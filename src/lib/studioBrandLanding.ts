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
      logoText: "Northframe",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Кейсы", href: "#work", variant: "secondary" },
        { label: "Услуги", href: "#services", variant: "secondary" },
        { label: "Пакеты", href: "#packages", variant: "secondary" },
        { label: "Процесс", href: "#process", variant: "secondary" },
        { label: "FAQ", href: "#faq", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Бриф за 5 минут",
      ctaHref: "#contact",
      alignNav: "center",
      showMobileMenu: true,
    },
  },

  { id: "sb-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },

  {
    id: "sb-hero-main",
    type: "hero",
    props: {
      title: "Делаем бренды и сайты, которые выглядят дорого и продают в первый экран",
      description:
        "<p>Northframe — студия брендинга и digital-дизайна для B2B и lifestyle-компаний. Собираем систему: позиционирование, айдентика, сайт и контент-носители в едином визуальном языке.</p><p>Запуск от 3 недель, прозрачный scope и понятные этапы.</p>",
      quote:
        "«После обновления бренда и сайта входящие лиды выросли на 37% за два месяца» — маркетинг-директор клиента",
      align: "left",
      buttons: [
        { label: "Смотреть кейсы", href: "#work", variant: "primary" },
        { label: "Открыть услуги", href: "#services", variant: "secondary" },
        { label: "Запросить оценку", href: "#contact", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "80px",
    },
  },

  { id: "sb-sp-2", type: "space", props: { size: "44px", direction: "both" } },

  {
    id: "sb-h-trust",
    type: "heading",
    props: {
      text: "Работали с продуктовыми командами и сервисными бизнесами",
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
          alt: "Northgrid",
          imageUrl: "https://placehold.co/200x48/0c0a09/e7e5e4/png?text=Northgrid",
        },
        {
          alt: "Pulse AI",
          imageUrl: "https://placehold.co/200x48/1c1917/d6d3d1/png?text=Pulse+AI",
        },
        {
          alt: "Atlas Pro",
          imageUrl: "https://placehold.co/200x48/292524/a8a29e/png?text=Atlas+Pro",
        },
        {
          alt: "Fieldone",
          imageUrl: "https://placehold.co/200x48/134e4a/99f6e4/png?text=Fieldone",
        },
      ],
    },
  },

  { id: "sb-sp-3", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "sb-stats",
    type: "stats",
    props: {
      items: [
        { title: "120+", description: "проектов за 6 лет" },
        { title: "3-8 недель", description: "средний цикл запуска" },
        { title: "4.9/5", description: "оценка клиентов по итогам проекта" },
        { title: "70%", description: "проектов приходят по рекомендации" },
      ],
    },
  },

  { id: "sb-sp-3b", type: "space", props: { size: "56px", direction: "vertical" } },

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
      text: "Работаем пакетно: можно взять отдельный модуль или полный цикл от стратегии до запуска.",
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
      title: "Бренд-стратегия",
      description:
        "Аудит рынка, позиционирование, архетип, tone of voice и смысловая платформа бренда.",
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
      title: "Айдентика и сайт",
      description:
        "Логотип, визуальная система, UI-kit, лендинг или многостраничный сайт с адаптивом.",
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
      title: "Контент и поддержка",
      description: "Шаблоны для маркетинга, презентации, дизайн-сопровождение и growth-креативы.",
      icon: "Megaphone",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "sb-grid-services",
      __zone: "items",
    },
  },

  { id: "sb-sp-4", type: "space", props: { size: "52px", direction: "horizontal" } },

  {
    id: "sb-h-packages",
    type: "heading",
    props: {
      text: "Пакеты",
      size: "xl",
      level: "h2",
      align: "center",
      layout: { padding: "8px" },
    },
  },
  {
    id: "sb-t-packages",
    type: "text",
    props: {
      text: "Прозрачные уровни сотрудничества для старта, роста и масштабирования.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "700px",
      layout: { padding: "8px" },
    },
  },
  {
    id: "sb-grid-packages",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 20,
      layout: { padding: "28px" },
    },
  },
  {
    id: "sb-card-pack-1",
    type: "card",
    props: {
      title: "Start",
      description: "Лендинг + базовая айдентика. Подходит для запуска нового продукта или услуги.",
      icon: "Flag",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "sb-grid-packages",
      __zone: "items",
    },
  },
  {
    id: "sb-card-pack-2",
    type: "card",
    props: {
      title: "Growth",
      description: "Бренд-система, сайт, шаблоны и дизайн-поддержка на 2-3 месяца.",
      icon: "TrendingUp",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "sb-grid-packages",
      __zone: "items",
    },
  },
  {
    id: "sb-card-pack-3",
    type: "card",
    props: {
      title: "Scale",
      description: "Полный ребрендинг, multi-page сайт и внедрение дизайн-процессов в команду.",
      icon: "Rocket",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "sb-grid-packages",
      __zone: "items",
    },
  },

  { id: "sb-sp-5", type: "space", props: { size: "56px", direction: "both" } },

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
      text: "Фиксируем scope заранее и показываем прогресс каждую неделю.",
      size: "s",
      align: "left",
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
<li><strong>Discovery</strong> — бриф, аудит текущих материалов и формулировка задач бизнеса.</li>
<li><strong>Концепция</strong> — 1-2 направления, визуальная гипотеза, согласование стиля.</li>
<li><strong>Production</strong> — дизайн ключевых экранов, тексты, верстка и адаптив.</li>
<li><strong>Launch</strong> — QA, передача ассетов, документация и рекомендации на рост.</li>
</ul>
<p>На каждом этапе: синхрон, дедлайны и список решений — без сюрпризов в финале.</p>`,
      layout: { padding: "32px" },
    },
  },

  { id: "sb-sp-6", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "sb-hero-case",
    type: "hero",
    props: {
      title: "Кейс: ребрендинг и сайт за 6 недель",
      description:
        "<p id='work'>Для B2B SaaS-компании обновили позиционирование и сайт. Результат: +41% входящих заявок и -18% стоимость лида через 2 месяца.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Посмотреть портфолио PDF", href: "#portfolio", variant: "primary" },
        { label: "Обсудить похожий проект", href: "#contact", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "sb-sp-7", type: "space", props: { size: "28px", direction: "vertical" } },

  {
    id: "sb-hero-custom",
    type: "hero",
    props: {
      title: "Слот для макета или превью",
      description:
        "<p>Оставили custom-слот для живого превью: сюда удобно вставить видео-кейс, интерактивный прототип или галерею экранов.</p>",
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
      text: "Используйте этот слот для реальных материалов: before/after, видео-демо или Figma embed.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "8px" },
      __parentId: "sb-hero-custom",
      __zone: "image.content",
    },
  },

  { id: "sb-sp-8", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "sb-h-faq",
    type: "heading",
    props: {
      text: "FAQ",
      size: "xl",
      level: "h2",
      align: "left",
      layout: { padding: "8px" },
    },
  },
  {
    id: "sb-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='faq'>Частые вопросы</h3><p><strong>Сколько длится проект?</strong> Обычно от 3 до 8 недель в зависимости от объема работ.</p><p><strong>Берете ли небольшие задачи?</strong> Да, есть стартовый пакет и формат дизайн-поддержки.</p><p><strong>Есть ли фиксированный бюджет?</strong> На базовые пакеты — да, для кастомных задач готовим детальную смету.</p><p><strong>Что нужно от клиента?</strong> Короткий бриф, доступ к текущим материалам и человек, принимающий решения.</p>",
      layout: { padding: "24px" },
    },
  },

  { id: "sb-sp-9", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "sb-hero-final",
    type: "hero",
    props: {
      title: "Готовы собрать бренд и сайт, которые можно запускать без бесконечных правок?",
      description:
        "<p id='contact'>Заполните короткий бриф, и мы предложим формат сотрудничества, сроки и бюджет под вашу задачу.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Заполнить бриф", href: "#contact", variant: "primary" },
        { label: "Написать в Telegram", href: "https://t.me", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "sb-sp-10", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "sb-flex-legal",
    type: "flex",
    props: {
      direction: "row",
      justifyContent: "start",
      gap: 16,
      wrap: "wrap",
      layout: { padding: "8px" },
    },
  },
  {
    id: "sb-t-legal",
    type: "text",
    props: {
      text: "Работаем по договору, с NDA по запросу и фиксированными этапами оплаты.",
      size: "s",
      align: "left",
      color: "muted",
      layout: { padding: "0px" },
      __parentId: "sb-flex-legal",
      __zone: "children",
    },
  },
  {
    id: "sb-btn-legal",
    type: "button",
    props: {
      label: "Запросить NDA",
      href: "#contact",
      variant: "secondary",
      layout: { padding: "0px" },
      __parentId: "sb-flex-legal",
      __zone: "children",
    },
  },

  { id: "sb-sp-11", type: "space", props: { size: "24px", direction: "vertical" } },

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
      text: "Northframe",
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
        { title: "Услуги", description: "Брендинг, сайты, дизайн-поддержка" },
        { title: "Кейсы", description: "B2B, SaaS, e-commerce, lifestyle" },
        { title: "Связь", description: "Бриф, email, Telegram, календарь" },
      ],
      copyright: "© 2026 Northframe Studio. Все права защищены.",
      paddingY: "64px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "Dribbble", href: "https://dribbble.com", variant: "secondary" },
        { label: "Почта", href: "mailto:team@northframe.studio", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для кейсов и свободных слотов",
    },
  },
];

export const STUDIO_BRAND_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(STUDIO_BRAND_LANDING_BLOCKS),
);
