import type { Data } from "@puckeditor/core";
import type { CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, normalizePuckData } from "@/lib/puckEditor";

/** Лендинг «Медицинская / Wellness услуга». */
export const MEDICAL_WELLNESS_LANDING_BLOCKS: CanvasBlock[] = [
  {
    id: "mw-hdr",
    type: "header",
    props: {
      logoText: "Vita Clinic",
      logoImageUrl: "",
      logoHref: "/",
      navItems: [
        { label: "Услуги", href: "#services", variant: "secondary" },
        { label: "Врачи", href: "#doctors", variant: "secondary" },
        { label: "Как проходит", href: "#process", variant: "secondary" },
        { label: "FAQ", href: "#faq", variant: "secondary" },
      ],
      behavior: "sticky",
      ctaLabel: "Записаться на прием",
      ctaHref: "#booking",
      alignNav: "center",
      showMobileMenu: true,
    },
  },
  { id: "mw-sp-1", type: "space", props: { size: "28px", direction: "vertical" } },
  {
    id: "mw-hero-main",
    type: "hero",
    props: {
      title: "Персональная программа здоровья и энергии",
      description:
        "<p>Комплексный подход: диагностика, рекомендации, сопровождение врача и контроль динамики.</p><p><strong>Первичный прием 90 минут</strong> с подробным планом действий.</p>",
      quote: "Более 10 000 консультаций и 4.9/5 по отзывам пациентов.",
      align: "left",
      buttons: [
        { label: "Записаться на прием", href: "#booking", variant: "primary" },
        { label: "Узнать об услугах", href: "#services", variant: "secondary" },
      ],
      image: { url: "", mode: "inline", content: [] },
      padding: "72px",
    },
  },
  { id: "mw-sp-2", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "mw-grid-services",
    type: "grid",
    props: { numColumns: 3, gap: 20, layout: { padding: "24px" } },
  },
  {
    id: "mw-service-1",
    type: "card",
    props: {
      title: "Check-up программы",
      description: "Базовая и расширенная диагностика с интерпретацией результатов.",
      icon: "Heart",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "mw-grid-services",
      __zone: "items",
    },
  },
  {
    id: "mw-service-2",
    type: "card",
    props: {
      title: "Консультации специалистов",
      description: "Терапевт, эндокринолог, нутрициолог и смежные направления.",
      icon: "Users",
      mode: "flat",
      layout: { padding: "0px" },
      __parentId: "mw-grid-services",
      __zone: "items",
    },
  },
  {
    id: "mw-service-3",
    type: "card",
    props: {
      title: "Сопровождение",
      description: "Контроль динамики, корректировка плана и поддержка между визитами.",
      icon: "Shield",
      mode: "card",
      layout: { padding: "0px" },
      __parentId: "mw-grid-services",
      __zone: "items",
    },
  },
  { id: "mw-sp-3", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "mw-h-doctors",
    type: "heading",
    props: { text: "Врачи и экспертиза", size: "xl", level: "h2", align: "left", layout: { padding: "8px" } },
  },
  {
    id: "mw-rt-doctors",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='doctors'>Кто ведет пациентов</h3><p>Команда врачей с профильным клиническим опытом 8-15 лет, международными стажировками и регулярной практикой в превентивной медицине.</p><p><strong>Лицензия клиники</strong> и квалификация специалистов доступны по запросу и в договоре.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "mw-sp-4", type: "space", props: { size: "40px", direction: "vertical" } },
  {
    id: "mw-rt-process",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='process'>Как проходит работа</h3><ol><li>Первичный прием и сбор анамнеза.</li><li>Диагностика и анализ результатов.</li><li>План терапии/коррекции образа жизни.</li><li>Контрольный визит и обновление рекомендаций.</li></ol>",
      layout: { padding: "24px" },
    },
  },
  { id: "mw-sp-5", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "mw-stats",
    type: "stats",
    props: {
      items: [
        { title: "10k+", description: "консультаций" },
        { title: "4.9/5", description: "оценка пациентов" },
        { title: "90 мин", description: "первичный прием" },
        { title: "24ч", description: "средний ответ поддержки" },
      ],
    },
  },
  { id: "mw-sp-6", type: "space", props: { size: "36px", direction: "vertical" } },
  {
    id: "mw-rt-faq",
    type: "richtext",
    props: {
      richtext:
        "<h3 id='faq'>FAQ</h3><p><strong>Можно ли онлайн?</strong> Да, часть консультаций доступна онлайн.</p><p><strong>Что нужно на первый прием?</strong> Анализы за последние 6 месяцев и краткий анамнез.</p><p><strong>Есть противопоказания?</strong> Врач оценивает риски и подбирает безопасный план.</p><p><strong>Оплата от юрлица возможна?</strong> Да, доступна оплата по счету.</p>",
      layout: { padding: "24px" },
    },
  },
  { id: "mw-sp-7", type: "space", props: { size: "44px", direction: "vertical" } },
  {
    id: "mw-hero-final",
    type: "hero",
    props: {
      title: "Запишитесь на консультацию и получите персональный план",
      description: "<p id='booking'>Оставьте заявку, и администратор подберет удобное время приема.</p>",
      quote: "",
      align: "left",
      buttons: [
        { label: "Записаться сейчас", href: "#booking", variant: "primary" },
        { label: "Связаться с клиникой", href: "#contact", variant: "secondary" },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80",
        mode: "background",
        content: [],
      },
      padding: "64px",
    },
  },
  { id: "mw-sp-8", type: "space", props: { size: "32px", direction: "vertical" } },
  {
    id: "mw-footer",
    type: "footer",
    props: {
      columns: [
        { title: "Клиника", description: "Услуги, врачи, лицензия" },
        { title: "Пациентам", description: "FAQ, подготовка, документы" },
        { title: "Контакты", description: "Запись, поддержка, адрес" },
      ],
      copyright: "© 2026 Vita Clinic.",
      paddingY: "56px",
      socialLinks: [
        { label: "Telegram", href: "https://t.me", variant: "secondary" },
        { label: "VK", href: "https://vk.com", variant: "secondary" },
        { label: "Почта", href: "mailto:hello@vitaclinic.ru", variant: "primary" },
      ],
      newsletter: true,
      newsletterPlaceholder: "Email для напоминаний и рекомендаций",
    },
  },
];

export const MEDICAL_WELLNESS_PUCK_DATA: Data = normalizePuckData(
  canvasBlocksToPuckData(MEDICAL_WELLNESS_LANDING_BLOCKS),
);
