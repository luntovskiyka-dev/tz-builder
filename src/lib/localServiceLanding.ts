import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Лендинг «Локальный сервисный бизнес». */
export const LOCAL_SERVICE_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "ls-hdr",
    type: "header",
    props: {
      logoText: "CleanPoint",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Услуги", href: "#services", variant: "secondary" },
        { label: "Цены", href: "#pricing", variant: "secondary" },
        { label: "Отзывы", href: "#reviews", variant: "secondary" },
        { label: "Районы", href: "#areas", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Получить расчет",
      ctaHref: "#quote",
      alignNav: "center",
      showMobileMenu: true,
    },
  },
  { id: "ls-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },
  {
    id: "ls-hero-main",
    type: "hero",
    props: {
      title: "Профессиональная уборка квартир и офисов в вашем районе",
      description:
        "<p>Выезжаем день в день, используем безопасные средства и работаем по фиксированному чек-листу.</p><p><strong>Расчет стоимости за 5 минут</strong> без скрытых доплат.</p>",
      quote: "4.9/5 по отзывам и 3 500+ выполненных заказов.",
      align: "left",
      buttons: [
        { label: "Рассчитать стоимость", href: "#quote", variant: "primary" },
        { label: "Посмотреть услуги", href: "#services", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "72px",
    },
  },
  { id: "ls-sp-2", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ls-grid-services",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "ls-svc-1",
    type: "card",
    props: {
      title: "Поддерживающая уборка",
      description: "Регулярная уборка квартир и домов по удобному графику.",
      icon: "Sparkles",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ls-grid-services",
      __zone: "items",
    },
  },
  {
    id: "ls-svc-2",
    type: "card",
    props: {
      title: "Генеральная уборка",
      description: "Глубокая очистка кухни, санузлов и труднодоступных зон.",
      icon: "Shield",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "ls-grid-services",
      __zone: "items",
    },
  },
  {
    id: "ls-svc-3",
    type: "card",
    props: {
      title: "Коммерческие помещения",
      description: "Офисы, салоны и магазины с отчетностью для юрлиц.",
      icon: "Building2",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ls-grid-services",
      __zone: "items",
    },
  },
  { id: "ls-sp-3", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "ls-h-pricing",
    type: "heading",
    props: { text: "Пакеты и цены", size: "xl", level: "h2", align: "center", layout: { padding: "8px" } },
  },
  {
    id: "ls-grid-pricing",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "ls-price-1",
    type: "card",
    props: {
      title: "Базовый",
      description: "Поддерживающая уборка квартиры от 2 500 руб.",
      icon: "Flag",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ls-grid-pricing",
      __zone: "items",
    },
  },
  {
    id: "ls-price-2",
    type: "card",
    props: {
      title: "Стандарт",
      description: "Генеральная уборка квартиры от 5 900 руб.",
      icon: "LayoutGrid",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "ls-grid-pricing",
      __zone: "items",
    },
  },
  {
    id: "ls-price-3",
    type: "card",
    props: {
      title: "Бизнес",
      description: "Коммерческие объекты с персональным графиком и отчетом.",
      icon: "Rocket",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ls-grid-pricing",
      __zone: "items",
    },
  },
  { id: "ls-sp-4", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ls-rt-reviews",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='reviews'>Отзывы клиентов</h3><p><strong>Марина:</strong> «Приехали вовремя, все сделали по чек-листу, без нареканий.»</p><p><strong>Игорь:</strong> «Заказываем уборку офиса каждую неделю, удобно и стабильно.»</p><p><strong>Елена:</strong> «Понравилось, что цена не изменилась после выезда.»</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "ls-sp-5", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ls-t-areas",
    type: "text",
    props: {
      text: "Работаем по районам: Центр, Север, Запад, Юг, Новая Москва. Выезд за МКАД обсуждается отдельно.",
      size: "m",
      align: "left",
      color: "muted",
      layout: { padding: "8px" },
    },
  },
  {
    id: "ls-flex-cta",
    type: "flex",
    props: { direction: "row", justifyContent: "start", gap: 16, wrap: "wrap", layout: { padding: "8px" } },
  },
  {
    id: "ls-btn-call",
    type: "button",
    props: {
      label: "Позвонить сейчас",
      href: "tel:+79990000000",
      variant: "primary",
      __parentId: "ls-flex-cta",
      __zone: "children",
    },
  },
  {
    id: "ls-btn-msg",
    type: "button",
    props: {
      label: "Написать в Telegram",
      href: "https://t.me",
      variant: "secondary",
      __parentId: "ls-flex-cta",
      __zone: "children",
    },
  },
  { id: "ls-sp-6", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ls-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3>FAQ</h3><p><strong>Сколько длится уборка?</strong> Обычно 2-5 часов в зависимости от площади.</p><p><strong>Нужно ли что-то подготовить?</strong> Нет, мы приезжаем со всем оборудованием.</p><p><strong>Можно оплатить по безналу?</strong> Да, для физлиц и юрлиц.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "ls-sp-7", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "ls-hero-final",
    type: "hero",
    props: {
      title: "Получите расчет стоимости за 5 минут",
      description: "<p id='quote'>Оставьте контакты и параметры объекта — мы пришлем точную смету и свободные окна.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Получить расчет", href: "#quote", variant: "primary" },
        { label: "Заказать звонок", href: "#quote", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },
  { id: "ls-sp-8", type: "space", props: { size: "32px", direction: "vertical" } },
  {
    id: "ls-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Услуги", description: "Квартиры, дома, офисы" },
        { title: "Клиентам", description: "Цены, районы, FAQ" },
        { title: "Контакты", description: "Телефон, Telegram, почта" },
      ],
      copyright: "© 2026 CleanPoint.",
      paddingY: "56px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "VK", href: "https://vk.com", variant: "secondary" },
        { label: "Почта", href: "mailto:hello@cleanpoint.ru", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для акций и напоминаний",
    },
  },
];

export const LOCAL_SERVICE_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(LOCAL_SERVICE_LANDING_BLOCKS),
);
