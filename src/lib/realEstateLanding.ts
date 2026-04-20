import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Лендинг «Недвижимость / Девелопмент». */
export const REAL_ESTATE_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "re-hdr",
    type: "header",
    props: {
      logoText: "Parkline Residence",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Планировки", href: "#plans", variant: "secondary" },
        { label: "Инфраструктура", href: "#infrastructure", variant: "secondary" },
        { label: "Ипотека", href: "#mortgage", variant: "secondary" },
        { label: "Локация", href: "#location", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Оставить заявку",
      ctaHref: "#lead",
      alignNav: "center",
      showMobileMenu: true,
    },
  },
  { id: "re-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },
  {
    id: "re-hero-main",
    type: "hero",
    props: {
      title: "Жилой комплекс бизнес-класса в 10 минутах от центра",
      description:
        "<p><strong>Сдача: IV квартал 2026</strong>. Зеленый двор без машин, собственная инфраструктура и панорамные виды.</p><p>Квартиры от 37 до 128 м², подземный паркинг и консьерж-сервис.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Выбрать квартиру", href: "#plans", variant: "primary" },
        { label: "Получить презентацию", href: "#lead", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "72px",
    },
  },
  { id: "re-sp-2", type: "space", props: { size: "32px", direction: "vertical" } },
  {
    id: "re-stats",
    type: "stats",
    props: {
      items: [
        { title: "3", description: "жилых корпуса" },
        { title: "540", description: "квартир" },
        { title: "10 мин", description: "до метро" },
        { title: "24/7", description: "охрана и сервис" },
      ],
    },
  },
  { id: "re-sp-3", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "re-h-plans",
    type: "heading",
    props: { text: "Планировки", size: "xl", level: "h2", align: "center", layout: { padding: "8px" } },
  },
  {
    id: "re-grid-plans",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "re-plan-1",
    type: "card",
    props: {
      title: "1-комнатные",
      description: "От 37 м². Оптимально для жизни и инвестиций.",
      icon: "LayoutGrid",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "re-grid-plans",
      __zone: "items",
    },
  },
  {
    id: "re-plan-2",
    type: "card",
    props: {
      title: "2-комнатные",
      description: "От 58 м². Просторная кухня-гостиная и мастер-спальня.",
      icon: "Home",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "re-grid-plans",
      __zone: "items",
    },
  },
  {
    id: "re-plan-3",
    type: "card",
    props: {
      title: "3-комнатные",
      description: "От 89 м². Панорамные окна и виды на парк.",
      icon: "Building2",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "re-grid-plans",
      __zone: "items",
    },
  },
  { id: "re-sp-4", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "re-rt-infra",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='infrastructure'>Инфраструктура</h3><ul><li>Частный детский сад и фитнес-студия</li><li>Коммерческая галерея на первом этаже</li><li>Двор-парк с детскими и спортивными зонами</li><li>Подземный паркинг и кладовые помещения</li></ul>",
      layout: { padding: "24px" },
    },
  },
  { id: "re-sp-5", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "re-h-mortgage",
    type: "heading",
    props: { text: "Ипотека и условия", size: "xl", level: "h2", align: "left", layout: { padding: "8px" } },
  },
  {
    id: "re-t-mortgage",
    type: "text",
    props: {
      text: "Партнерские программы от ведущих банков: семейная ипотека, субсидированные ставки и рассрочка от застройщика.",
      size: "m",
      align: "left",
      color: "muted",
      layout: { padding: "8px" },
    },
  },
  {
    id: "re-flex-mortgage",
    type: "flex",
    props: { direction: "row", justifyContent: "start", gap: 16, wrap: "wrap", layout: { padding: "8px" } },
  },
  {
    id: "re-btn-mortgage-1",
    type: "button",
    props: {
      label: "Рассчитать ипотеку",
      href: "#mortgage",
      variant: "primary",
      __parentId: "re-flex-mortgage",
      __zone: "children",
    },
  },
  {
    id: "re-btn-mortgage-2",
    type: "button",
    props: {
      label: "Получить условия",
      href: "#lead",
      variant: "secondary",
      __parentId: "re-flex-mortgage",
      __zone: "children",
    },
  },
  { id: "re-sp-6", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "re-hero-location",
    type: "hero",
    props: {
      title: "Локация",
      description: "<p id='location'>Используйте этот блок для карты, схемы проезда и точек притяжения вокруг комплекса.</p>",
      quote: "",
      align: "left",
      buttons: [{ label: "Записаться на просмотр", href: "#lead", variant: "primary" }],
      image: { url: "", mode: "custom", content: [] },
      padding: "48px",
    },
  },
  {
    id: "re-t-location-slot",
    type: "text",
    props: {
      text: "Слот для карты, схемы корпуса или 3D-визуализации района.",
      size: "s",
      align: "center",
      color: "muted",
      layout: { padding: "8px" },
      __parentId: "re-hero-location",
      __zone: "image.content",
    },
  },
  { id: "re-sp-7", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "re-hero-final",
    type: "hero",
    props: {
      title: "Оставьте заявку и получите персональную подборку квартир",
      description: "<p id='lead'>Менеджер свяжется с вами, отправит актуальные планировки и условия покупки.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Оставить заявку", href: "#lead", variant: "primary" },
        { label: "Заказать звонок", href: "#lead", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },
  { id: "re-sp-8", type: "space", props: { size: "32px", direction: "vertical" } },
  {
    id: "re-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Проект", description: "Планировки, инфраструктура, документы" },
        { title: "Покупателям", description: "Ипотека, акции, ход строительства" },
        { title: "Контакты", description: "Офис продаж, поддержка, партнеры" },
      ],
      copyright: "© 2026 Parkline Residence.",
      paddingY: "56px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "VK", href: "https://vk.com", variant: "secondary" },
        { label: "Почта", href: "mailto:sales@parkline.ru", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для новостей проекта",
    },
  },
];

export const REAL_ESTATE_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(REAL_ESTATE_LANDING_BLOCKS),
);
