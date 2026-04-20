import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Универсальный лендинг SaaS для пресета «Продукт». */
export const SAAS_UNIVERSAL_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "saas-hdr",
    type: "header",
    props: {
      logoText: "FlowPilot",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Возможности", href: "#features", variant: "secondary" },
        { label: "Кейсы", href: "#use-cases", variant: "secondary" },
        { label: "Тарифы", href: "#pricing", variant: "secondary" },
        { label: "FAQ", href: "#faq", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Запросить демо",
      ctaHref: "#demo",
      alignNav: "center",
      showMobileMenu: true,
    },
  },

  { id: "saas-sp-1", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "saas-hero-main",
    type: "hero",
    props: {
      title: "Управляйте B2B-продажами в одном рабочем контуре",
      description:
        "<p>FlowPilot объединяет pipeline, коммуникацию и revenue-аналитику. Руководители видят прогнозы, менеджеры — следующий лучший шаг по каждой сделке.</p><p><strong>Запуск за 7 дней</strong> с импортом из таблиц и текущей CRM.</p>",
      quote:
        "«За первый квартал сократили цикл сделки на 23% без роста команды» — Head of Sales, B2B SaaS",
      align: "left",
      buttons: [
        { label: "Запросить демо", href: "#demo", variant: "primary" },
        { label: "Попробовать бесплатно", href: "#trial", variant: "secondary" },
        { label: "Посмотреть тарифы", href: "#pricing", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80",
        mode: "inline",
        content: [],
      },
      padding: "80px",
    },
  },

  { id: "saas-sp-2", type: "space", props: { size: "48px", direction: "both" } },

  {
    id: "saas-h-trust",
    type: "heading",
    props: {
      text: "Нам доверяют продуктовые и коммерческие команды",
      size: "s",
      level: "h4",
      align: "center",
      layout: { padding: "8px" },
    },
  },

  {
    id: "saas-logos",
    type: "logos",
    props: {
      logos: [
        {
          alt: "Northgrid",
          imageUrl: "https://placehold.co/200x48/0f172a/94a3b8/png?text=Northgrid",
        },
        {
          alt: "Atlas Cloud",
          imageUrl: "https://placehold.co/200x48/1e293b/cbd5e1/png?text=Atlas+Cloud",
        },
        {
          alt: "Peakline",
          imageUrl: "https://placehold.co/200x48/334155/e2e8f0/png?text=Peakline",
        },
        {
          alt: "Orbitex",
          imageUrl: "https://placehold.co/200x48/0c4a6e/7dd3fc/png?text=Orbitex",
        },
      ],
    },
  },

  { id: "saas-sp-3", type: "space", props: { size: "40px", direction: "horizontal" } },

  {
    id: "saas-stats-kpis",
    type: "stats",
    props: {
      items: [
        { title: "18%", description: "рост win-rate за 90 дней" },
        { title: "-27%", description: "меньше ручной рутины в CRM" },
        { title: "2.4x", description: "быстрее подготовка прогноза" },
        { title: "99.95%", description: "аптайм с SLA на Enterprise" },
      ],
    },
  },

  { id: "saas-sp-4", type: "space", props: { size: "64px", direction: "vertical" } },

  {
    id: "saas-h-pains",
    type: "heading",
    props: {
      text: "Что тормозит рост выручки",
      size: "xxl",
      level: "h2",
      align: "center",
      layout: { padding: "24px" },
    },
  },
  {
    id: "saas-t-pains",
    type: "text",
    props: {
      text: "Типичный стек продаж раздроблен: CRM, чаты, таблицы, отчеты и задачи живут отдельно. Из-за этого лиды теряются, прогнозы расходятся, а масштабирование упирается в ручные процессы.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "760px",
      layout: { padding: "16px" },
    },
  },

  {
    id: "saas-grid-solution",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 28,
      layout: { padding: "40px" },
    },
  },
  {
    id: "saas-card-sol-1",
    type: "card",
    props: {
      title: "Единая воронка и каналы",
      description: "Письма, звонки, встречи и задачи связываются с конкретной сделкой. Контекст не теряется при смене ответственного.",
      icon: "LayoutGrid",
      mode: "card",
      layout: { spanCol: 1, spanRow: 1, padding: "0px" },
      __parentId: "saas-grid-solution",
      __zone: "items",
    },
  },
  {
    id: "saas-card-sol-2",
    type: "card",
    props: {
      title: "Прогноз на основе фактов",
      description: "Система оценивает вероятность закрытия сделки по сигналам активности и историческим паттернам вашей команды.",
      icon: "BarChart3",
      mode: "flat",
      layout: { spanCol: 1, padding: "0px" },
      __parentId: "saas-grid-solution",
      __zone: "items",
    },
  },
  {
    id: "saas-card-sol-3",
    type: "card",
    props: {
      title: "Автоматизация без кода",
      description: "Триггеры и сценарии закрывают рутину: постановка задач, письма follow-up, уведомления и обновление стадий.",
      icon: "Bot",
      mode: "card",
      layout: { spanCol: 1, padding: "0px" },
      __parentId: "saas-grid-solution",
      __zone: "items",
    },
  },

  { id: "saas-sp-5", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "saas-rt-workflow",
    type: "richtext",
    props: {
      richtext:
        '<h3 id="features">Как устроена работа в FlowPilot</h3><ol><li><strong>Подключение источников</strong> — импортируйте данные из CRM, почты и календаря, чтобы быстро собрать чистую воронку.</li><li><strong>Настройка правил</strong> — задайте этапы, SLA и условия автоматизации для каждого сегмента клиентов.</li><li><strong>Запуск и масштаб</strong> — отслеживайте воронку, прогноз и узкие места в real-time дашбордах.</li></ol><p>Для крупных команд доступны роли, approval flow и аудит изменений.</p>',
      layout: { padding: "48px" },
    },
  },

  {
    id: "saas-h-use-cases",
    type: "heading",
    props: {
      text: "Кому подходит",
      size: "xl",
      level: "h2",
      align: "center",
      layout: { padding: "16px" },
    },
  },
  {
    id: "saas-grid-use-cases",
    type: "grid",
    props: {
      numColumns: 3,
      gap: 24,
      layout: { padding: "24px" },
    },
  },
  {
    id: "saas-card-case-1",
    type: "card",
    props: {
      title: "SaaS-команды продаж",
      description: "Сокращение времени от MQL до SQL и единая картина по активности в сделке.",
      icon: "Users",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "saas-grid-use-cases",
      __zone: "items",
    },
  },
  {
    id: "saas-card-case-2",
    type: "card",
    props: {
      title: "Revenue Operations",
      description: "Прозрачные данные по pipeline health, воронке и эффективности менеджеров.",
      icon: "Gauge",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "saas-grid-use-cases",
      __zone: "items",
    },
  },
  {
    id: "saas-card-case-3",
    type: "card",
    props: {
      title: "Founder-led продажи",
      description: "Быстрый запуск процесса до найма полной команды и переход на масштабируемую модель.",
      icon: "Rocket",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "saas-grid-use-cases",
      __zone: "items",
    },
  },

  { id: "saas-sp-6", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "saas-hero-integration",
    type: "hero",
    props: {
      title: "Интегрируется в текущий стек за один спринт",
      description:
        "<p>Подключение к HubSpot, Salesforce, Slack, Google Workspace и биллингу. Если нужной интеграции нет — используйте webhooks и API.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Посмотреть интеграции", href: "#integrations", variant: "primary" },
        { label: "API документация", href: "#api", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "saas-sp-7", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "hero-3",
    type: "hero",
    props: {
      title: "Вставьте ваш product-shot или видео-демо",
      description:
        "<p>Этот блок оставлен как рабочий custom-slot: можно быстро подложить скриншот интерфейса, короткий loom или интерактивный виджет.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Открыть live demo", href: "#demo", variant: "secondary" }],
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
      text: "Замените этот слот на запись интерфейса или embed с вашим реальным продуктом.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "12px" },
      __parentId: "hero-3",
      __zone: "image.content",
    },
  },

  { id: "saas-sp-7b", type: "space", props: { size: "32px", direction: "vertical" } },

  {
    id: "saas-h-security",
    type: "heading",
    props: {
      text: "Безопасность и соответствие требованиям",
      size: "xl",
      level: "h3",
      align: "left",
      layout: { padding: "8px" },
    },
  },
  {
    id: "saas-t-security",
    type: "text",
    props: {
      text: "Шифрование данных, SSO/SAML, роли и журнал аудита включены в зрелые тарифы. Для enterprise доступны DPA, изоляция окружений и приоритетный response SLA.",
      size: "s",
      align: "left",
      color: "muted",
      layout: { padding: "8px" },
    },
  },

  { id: "saas-sp-8", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "saas-h-pricing",
    type: "heading",
    props: {
      text: "Тарифы без скрытых ограничений",
      size: "xxl",
      level: "h2",
      align: "center",
      layout: { padding: "8px" },
    },
  },
  {
    id: "saas-t-pricing",
    type: "text",
    props: {
      text: "Starter для первых процессов, Growth для масштабируемой автоматизации, Enterprise для multi-team и compliance-стандартов.",
      size: "m",
      align: "center",
      color: "muted",
      maxWidth: "720px",
      layout: { padding: "8px" },
    },
  },

  {
    id: "saas-flex-pricing-cta",
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
    id: "saas-btn-pricing-1",
    type: "button",
    props: {
      label: "Сравнить тарифы",
      href: "#pricing",
      variant: "primary",
      __parentId: "saas-flex-pricing-cta",
      __zone: "children",
    },
  },
  {
    id: "saas-btn-pricing-2",
    type: "button",
    props: {
      label: "Калькулятор ROI",
      href: "#roi",
      variant: "secondary",
      __parentId: "saas-flex-pricing-cta",
      __zone: "children",
    },
  },

  { id: "saas-sp-9", type: "space", props: { size: "40px", direction: "vertical" } },

  {
    id: "saas-h-faq",
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
    id: "saas-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='faq'>Частые вопросы</h3><p><strong>Сколько длится внедрение?</strong> Обычно 1-2 недели, включая миграцию и обучение команды.</p><p><strong>Нужна ли карта для триала?</strong> Нет, 14 дней без привязки карты.</p><p><strong>Есть ли онбординг?</strong> Да, для Growth и Enterprise включены сессии с solution engineer.</p><p><strong>Можно ли подключить свои BI-отчеты?</strong> Да, через API и экспорт в хранилище.</p>",
      layout: { padding: "24px" },
    },
  },

  { id: "saas-sp-10", type: "space", props: { size: "48px", direction: "vertical" } },

  {
    id: "saas-hero-final-cta",
    type: "hero",
    props: {
      title: "Готовы перейти от хаотичных сделок к прогнозируемому росту?",
      description:
        "<p>Покажем в live-демо, как ваша воронка будет выглядеть в FlowPilot через 30 дней после запуска.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Запросить демо", href: "#demo", variant: "primary" },
        { label: "Начать бесплатный trial", href: "#trial", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },

  { id: "saas-sp-11", type: "space", props: { size: "56px", direction: "vertical" } },

  {
    id: "saas-h-prefooter",
    type: "heading",
    props: {
      text: "Нужен security review или кастомный договор?",
      size: "m",
      level: "h5",
      align: "right",
      layout: { padding: "8px" },
    },
  },

  {
    id: "saas-h-brand",
    type: "heading",
    props: {
      text: "FlowPilot",
      size: "xxxl",
      level: "",
      align: "center",
      layout: { padding: "16px" },
    },
  },

  {
    id: "saas-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Продукт", description: "Возможности, Интеграции, Roadmap" },
        { title: "Ресурсы", description: "Документация, API, Статус, ROI" },
        { title: "Компания", description: "О нас, Карьера, Партнёры" },
        { title: "Юридическое", description: "Условия, Privacy, DPA, SLA" },
      ],
      copyright: "© 2026 FlowPilot Inc. Все права защищены.",
      paddingY: "72px",
      socialLinks: [
        { label: "X", href: "https://x.com", variant: "secondary" },
        { label: "LinkedIn", href: "https://linkedin.com", variant: "secondary" },
        { label: "YouTube", href: "https://youtube.com", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Рабочий email для product-updates",
    },
  },
];

export const SAAS_UNIVERSAL_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(SAAS_UNIVERSAL_LANDING_BLOCKS),
);
