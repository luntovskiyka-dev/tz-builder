import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Лендинг «eCommerce продукт (one-product / capsule store)». */
export const ECOMMERCE_PRODUCT_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "ec-hdr",
    type: "header",
    props: {
      logoText: "Velto",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Преимущества", href: "#benefits", variant: "secondary" },
        { label: "Характеристики", href: "#specs", variant: "secondary" },
        { label: "Отзывы", href: "#reviews", variant: "secondary" },
        { label: "Доставка", href: "#shipping", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Купить сейчас",
      ctaHref: "#buy",
      alignNav: "center",
      showMobileMenu: true,
    },
  },
  { id: "ec-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },
  {
    id: "ec-hero-main",
    type: "hero",
    props: {
      title: "Velto Bottle — термобутылка для города и спорта",
      description:
        "<p>Держит тепло до 12 часов и холод до 24 часов. Легкий корпус, герметичная крышка и минималистичный дизайн.</p><p><strong>Бесплатная доставка</strong> при заказе от 2 штук.</p>",
      quote: "4.9 из 5 на основе 2 000+ отзывов покупателей.",
      align: "left",
      buttons: [
        { label: "Купить сейчас", href: "#buy", variant: "primary" },
        { label: "Смотреть отзывы", href: "#reviews", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "72px",
    },
  },
  { id: "ec-sp-2", type: "space", props: { size: "28px", direction: "vertical" } },
  {
    id: "ec-stats",
    type: "stats",
    props: {
      items: [
        { title: "12ч", description: "сохраняет тепло" },
        { title: "24ч", description: "сохраняет холод" },
        { title: "500мл", description: "оптимальный объем" },
        { title: "2 000+", description: "довольных покупателей" },
      ],
    },
  },
  { id: "ec-sp-3", type: "space", props: { size: "48px", direction: "vertical" } },
  {
    id: "ec-h-benefits",
    type: "heading",
    props: { text: "Почему выбирают Velto", size: "xl", level: "h2", align: "center", layout: { padding: "8px" } },
  },
  {
    id: "ec-grid-benefits",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "ec-card-ben-1",
    type: "card",
    props: {
      title: "Герметичность",
      description: "Надежная крышка без протечек в сумке и рюкзаке.",
      icon: "Shield",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ec-grid-benefits",
      __zone: "items",
    },
  },
  {
    id: "ec-card-ben-2",
    type: "card",
    props: {
      title: "Прочные материалы",
      description: "Пищевая сталь и покрытие, устойчивое к царапинам.",
      icon: "Cpu",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "ec-grid-benefits",
      __zone: "items",
    },
  },
  {
    id: "ec-card-ben-3",
    type: "card",
    props: {
      title: "Минималистичный дизайн",
      description: "Подходит для офиса, тренировок и путешествий.",
      icon: "Sparkles",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "ec-grid-benefits",
      __zone: "items",
    },
  },
  { id: "ec-sp-4", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "ec-rt-specs",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='specs'>Характеристики</h3><ul><li>Объем: 500 мл</li><li>Вес: 320 г</li><li>Материал: нержавеющая сталь 304</li><li>Покрытие: порошковая окраска</li><li>Гарантия: 1 год</li></ul><p>В комплекте: бутылка, сменная прокладка, инструкция.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "ec-sp-5", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ec-rt-reviews",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='reviews'>Отзывы</h3><p><strong>Екатерина:</strong> «Ношу каждый день, держит температуру идеально.»</p><p><strong>Алексей:</strong> «Пережила походы и поездки, крышка реально герметичная.»</p><p><strong>Ольга:</strong> «Выглядит аккуратно, приятно дарить.»</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "ec-sp-6", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ec-hero-shipping",
    type: "hero",
    props: {
      title: "Простая доставка и возврат",
      description:
        "<p id='shipping'>Отправка в день заказа, доставка по РФ 1-5 дней. Возврат в течение 14 дней без лишних вопросов.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Оформить заказ", href: "#buy", variant: "primary" }],
      image: {
        url: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "56px",
    },
  },
  { id: "ec-sp-7", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "ec-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3>FAQ</h3><p><strong>Можно мыть в посудомойке?</strong> Да, кроме крышки с силиконовой вставкой.</p><p><strong>Есть опт?</strong> Да, от 20 штук с брендированием.</p><p><strong>Есть ли международная доставка?</strong> По запросу через поддержку.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "ec-sp-8", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "ec-hero-final",
    type: "hero",
    props: {
      title: "Осталось 240 штук из текущей партии",
      description: "<p id='buy'>Оформите заказ сейчас и получите бесплатную доставку.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Купить сейчас", href: "#buy", variant: "primary" },
        { label: "Задать вопрос", href: "#contact", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "64px",
    },
  },
  { id: "ec-sp-9", type: "space", props: { size: "32px", direction: "vertical" } },
  {
    id: "ec-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Продукт", description: "Характеристики, отзывы, гарантия" },
        { title: "Покупка", description: "Доставка, оплата, возврат" },
        { title: "Контакты", description: "Поддержка, опт, партнерство" },
      ],
      copyright: "© 2026 Velto Store. Все права защищены.",
      paddingY: "56px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "VK", href: "https://vk.com", variant: "secondary" },
        { label: "Почта", href: "mailto:hello@velto.store", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для скидок и новинок",
    },
  },
];

export const ECOMMERCE_PRODUCT_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(ECOMMERCE_PRODUCT_LANDING_BLOCKS),
);
