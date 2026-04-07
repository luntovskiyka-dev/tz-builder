"use client";

import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  createOneTimePaymentAction,
  createSubscriptionAction,
} from "@/lib/actions/payments";
import { cn } from "@/lib/utils";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const PLANS: Plan[] = [
  {
    id: "starter",
    slug: "starter",
    name: "Starter",
    price: "0 ₽",
    priceLabel: "Бесплатно",
    description: "Для знакомства с платформой",
    features: [
      "2 AI генерации/день",
      "1 активный проект",
      "12 базовых блоков",
      "Облачное хранение",
    ],
    ctaLabel: "Текущий план",
    ctaVariant: "outline",
  },
  {
    id: "project",
    slug: "project",
    name: "Project",
    price: "490 ₽",
    priceLabel: "Разовый платеж",
    description: "Одно полное ТЗ с правками",
    features: [
      "1 полное ТЗ",
      "7 дней правок",
      "PDF экспорт",
      "Cursor prompt",
      "Безлимит блоков",
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
    description: "Для профессиональных разработчиков",
    features: [
      "30 AI генераций/мес",
      "Безлимит проектов",
      "Приоритетный AI",
      "PDF/Word экспорт",
      "Все блоки",
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
    description: "Для команд и студий",
    features: [
      "50 AI генераций/мес",
      "10 мест в команде",
      "Общие шаблоны",
      "Приоритетная поддержка",
      "Командная работа",
      "Все фичи Pro",
    ],
    badge: "В разработке",
    ctaLabel: "14 дней бесплатно",
    ctaVariant: "default",
  },
];

export function PricingModal({ isOpen, onClose, user }: PricingModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentPlan = user.currentPlan;
  const isTrialing = user.subscriptionStatus === "trialing";
  const isActive = user.subscriptionStatus === "active";

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setError(null);
      setSuccess(null);
      setLoadingPlan(null);
    }, 300);
  };

  const handlePlanSelect = async (planSlug: string) => {
    setLoadingPlan(planSlug);
    setError(null);
    setSuccess(null);

    try {
      let result;

      if (planSlug === "project") {
        result = await createOneTimePaymentAction(planSlug);
      } else {
        result = await createSubscriptionAction(planSlug);
      }

      if (result.success) {
        if (result.confirmation_url) {
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Тарифные планы
          </DialogTitle>
        </DialogHeader>

        {/* Error / Success messages */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            {success}
          </div>
        )}

        {/* Status indicators */}
        {isTrialing && (
          <p className="text-sm font-medium text-amber-600">
            У вас активен пробный период!
          </p>
        )}
        {isActive && (
          <p className="text-sm font-medium text-emerald-600">
            У вас активная подписка: {currentPlan.toUpperCase()}
          </p>
        )}

        {/* Plans Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.slug;
            const isLoading = loadingPlan === plan.slug;
            const isDisabled = plan.slug === "studio";

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-xl border bg-background p-5 shadow-sm transition-all hover:shadow-md",
                  plan.highlight
                    ? "border-primary/50 ring-2 ring-primary/20"
                    : "border-border/70"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -right-1 -top-1">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
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
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {plan.priceLabel}
                  </span>
                </div>

                {/* Features */}
                <ul className="mb-4 flex-1 space-y-1.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelect(plan.slug)}
                  disabled={isLoading || isCurrentPlan || isDisabled}
                  variant={plan.ctaVariant as any}
                  size="sm"
                  className={cn(
                    "w-full text-sm",
                    isCurrentPlan && "opacity-70",
                    isDisabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-3 w-3 animate-spin"
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

        {/* FAQ */}
        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Частые вопросы
          </h3>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">
                Как работает пробный период?
              </p>
              <p>
                14 дней бесплатного использования всех функций плана Pro или
                Studio. Карта не требуется.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">
                Что такое Project?
              </p>
              <p>
                Разовый платеж 490₽ за создание одного полного ТЗ с 7 днями
                правок.
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
      </DialogContent>
    </Dialog>
  );
}
