"use client";

import React, { useState } from "react";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createOneTimePaymentAction,
  createSubscriptionAction,
} from "@/lib/actions/payments";
import { cn } from "@/lib/utils";

// =====================================================
// TYPES
// =====================================================
interface PricingPageProps {
  user: {
    email: string;
    currentPlan: string;
    subscriptionStatus: string;
  };
}

interface Plan {
  id: string;
  slug: string;
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  ctaLabel: string;
  ctaVariant?: "default" | "outline" | "destructive";
}

// =====================================================
// PLANS DATA
// =====================================================
const PLANS: Plan[] = [
  {
    id: "starter",
    slug: "starter",
    name: "Starter",
    price: "0 ₽",
    priceLabel: "Бесплатно",
    description: "Бесплатно: один проект, ТЗ для команды",
    features: [
      "1 генерация ТЗ «Для человека» в сутки",
      "Режим «Для ИИ» — только на платных тарифах",
      "1 активный проект в облаке",
      "12+ базовых блоков",
      "Облачное хранение",
    ],
    ctaLabel: "Текущий план",
    ctaVariant: "outline",
  },
  {
    id: "project",
    slug: "project",
    name: "Project",
    price: "290 ₽",
    priceLabel: "Разовый платеж",
    description: "Разово: ТЗ, промпт для ИИ по странице",
    features: [
      "ТЗ для людей и структурированное ТЗ для ИИ-агента",
      "Промпт для Cursor и других ассистентов по блокам страницы",
      "Безлимит блоков в редакторе",
      "Облачное хранение проекта",
      "Один платёж — без ежемесячной подписки",
    ],
    ctaLabel: "Купить Project",
    ctaVariant: "default",
  },
  {
    id: "pro",
    slug: "pro",
    name: "Pro",
    price: "990 ₽",
    priceLabel: "/месяц",
    description: "Оба формата ТЗ, безлимит проектов",
    features: [
      "До 10 генераций в сутки и до 30 в месяц на каждый формат ТЗ",
      "Безлимит проектов",
      "Приоритетная обработка запросов",
      "PDF/Word экспорт (в разработке)",
      "ИИ ассистент (в разработке)",
    ],
    highlight: true,
    badge: "Популярный",
    ctaLabel: "14 дней бесплатно",
    ctaVariant: "default",
  },
  {
    id: "studio",
    slug: "studio",
    name: "Studio",
    price: "4 990 ₽",
    priceLabel: "/месяц",
    description: "Для команд: выше лимиты и места",
    features: [
      "До 20 генераций в сутки и до 50 в месяц на каждый формат ТЗ",
      "10 мест в команде",
      "Общие шаблоны",
      "Приоритетная поддержка",
      "Командная работа",
      "Все возможности Pro",
    ],
    badge: "В разработке",
    ctaLabel: "14 дней бесплатно",
    ctaVariant: "default",
  },
];

// =====================================================
// COMPONENT
// =====================================================
export function PricingPage({ user }: PricingPageProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentPlan = user.currentPlan;
  const isTrialing = user.subscriptionStatus === "trialing";
  const isActive = user.subscriptionStatus === "active";

  const handlePlanSelect = async (planSlug: string) => {
    setLoadingPlan(planSlug);
    setError(null);
    setSuccess(null);

    try {
      let result;

      if (planSlug === "project") {
        // Разовый платеж
        result = await createOneTimePaymentAction(planSlug);
      } else {
        // Подписка (pro, studio) — активирует триал
        result = await createSubscriptionAction(planSlug);
      }

      if (result.success) {
        if (result.confirmation_url) {
          // Редирект на страницу оплаты ЮKassa
          window.location.href = result.confirmation_url;
        } else {
          setSuccess(result.error || "Готово!");
        }
      } else {
        setError(result.error || "Произошла ошибка");
      }
    } catch (err) {
      console.error("Plan selection error:", err);
      setError("Не удалось обработать запрос. Попробуйте ещё раз.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад в дашборд
          </Link>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Тарифные планы
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Выберите план: на Starter — одна генерация ТЗ для команды в сутки;
            режим «Для ИИ» и расширенные лимиты — на платных тарифах и в
            подписках Pro и Studio.
          </p>
          {isTrialing && (
            <p className="mt-3 text-sm font-medium text-amber-600">
              У вас активен пробный период!
            </p>
          )}
          {isActive && (
            <p className="mt-3 text-sm font-medium text-emerald-600">
              У вас активная подписка: {currentPlan.toUpperCase()}
            </p>
          )}
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            {success}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.slug;
            const isLoading = loadingPlan === plan.slug;
            const isDisabled = plan.slug === "studio"; // Studio в разработке

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-background p-6 shadow-sm transition-all hover:shadow-md",
                  plan.highlight
                    ? "border-primary/50 ring-2 ring-primary/20"
                    : "border-border/70"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -right-2 -top-2">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        plan.highlight
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-1 min-h-[2.75rem] text-sm leading-snug text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Price: column so amount + label fit narrow cards */}
                <div className="mb-4 flex min-w-0 flex-col items-start gap-0.5">
                  <span className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums whitespace-nowrap">
                    {plan.price}
                  </span>
                  <span className="text-sm leading-snug text-muted-foreground">
                    {plan.priceLabel}
                  </span>
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelect(plan.slug)}
                  disabled={isLoading || isCurrentPlan || isDisabled}
                  variant={plan.ctaVariant as any}
                  className={cn(
                    "w-full",
                    isCurrentPlan && "opacity-70",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          fill="currentColor"
                          className="opacity-75"
                        />
                      </svg>
                      Обработка...
                    </span>
                  ) : isCurrentPlan ? (
                    "Текущий план"
                  ) : isDisabled ? (
                    "Скоро"
                  ) : (
                    plan.ctaLabel
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ / Notes */}
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Частые вопросы
          </h2>
          <div className="space-y-4 text-left text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">
                Как работает пробный период?
              </p>
              <p>
                14 дней бесплатного доступа к лимитам и функциям Pro или Studio
                (включая генерацию ТЗ «Для ИИ»). Карта не требуется.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">
                Что такое Project?
              </p>
              <p>
                Разовый платёж 290 ₽: тариф Project — генерация ТЗ и готовый
                промпт для ИИ-разработки по структуре ваших блоков, без
                подписки.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">
                Можно ли сменить план?
              </p>
              <p>
                Да, вы можете перейти на другой план в любое время. Изменения
                вступят в силу немедленно.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
