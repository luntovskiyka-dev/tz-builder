"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CreditCard, BarChart3, Zap, CheckCircle, AlertTriangle, Clock, XCircle, RefreshCw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CancelSubscriptionDialog } from "@/components/settings/CancelSubscriptionDialog";
import { cancelSubscriptionWithYooKassaAction, getPaymentHistoryAction, getUserAIQuotaAction } from "@/lib/actions/payments";
import { cn } from "@/lib/utils";

interface BillingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email: string;
    currentPlan: string;
    planName: string;
    subscriptionStatus: string;
    trialEndsAt: string | null;
    subscriptionEndsAt: string | null;
    aiGenerationsPerDay: number;
    aiGenerationsPerMonth: number;
  };
  quota: {
    used_today: number;
    daily_limit: number;
    remaining_today: number;
    used_this_month: number;
    monthly_limit: number;
    remaining_this_month: number;
  };
}

interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  plan_name?: string;
}

type NotificationType = "success" | "error" | null;

interface Notification {
  type: NotificationType;
  message: string;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  none: { label: "Нет подписки", color: "text-muted-foreground", bgColor: "bg-muted", icon: <XCircle className="h-4 w-4" /> },
  trialing: { label: "Пробный период", color: "text-amber-600", bgColor: "bg-amber-100", icon: <Clock className="h-4 w-4" /> },
  active: { label: "Активна", color: "text-emerald-600", bgColor: "bg-emerald-100", icon: <CheckCircle className="h-4 w-4" /> },
  past_due: { label: "Просрочена", color: "text-orange-600", bgColor: "bg-orange-100", icon: <AlertTriangle className="h-4 w-4" /> },
  canceled: { label: "Отменена", color: "text-muted-foreground", bgColor: "bg-muted", icon: <XCircle className="h-4 w-4" /> },
  expired: { label: "Истекла", color: "text-red-600", bgColor: "bg-red-100", icon: <XCircle className="h-4 w-4" /> },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Ожидание", color: "text-amber-600", bgColor: "bg-amber-100" },
  succeeded: { label: "Успешно", color: "text-emerald-600", bgColor: "bg-emerald-100" },
  failed: { label: "Ошибка", color: "text-red-600", bgColor: "bg-red-100" },
  canceled: { label: "Отменен", color: "text-muted-foreground", bgColor: "bg-muted" },
  refunded: { label: "Возврат", color: "text-orange-600", bgColor: "bg-orange-100" },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function formatPaymentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatAmount(cents: number): string {
  return `${(cents / 100).toLocaleString("ru-RU")} ₽`;
}

// Skeleton loader for subscription section
function SubscriptionSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 rounded bg-muted" />
        <div className="h-5 w-20 rounded bg-muted" />
      </div>
      <div className="space-y-2 rounded-lg bg-background/50 p-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="h-8 w-36 rounded bg-muted" />
    </div>
  );
}

// Skeleton loader for usage section
function UsageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="h-1.5 w-full rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-1.5 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

// Notification banner with auto-dismiss
function NotificationBanner({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  if (!notification.type) return null;

  const isError = notification.type === "error";

  return (
    <div
      className={cn(
        "relative rounded-lg border px-4 py-3 text-sm transition-all",
        isError
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : "border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
      )}
      role="alert"
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <p className="flex-1">{notification.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Закрыть уведомление"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function BillingSettingsModal({ isOpen, onClose, user, quota: initialQuota }: BillingSettingsModalProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [quota, setQuota] = useState(initialQuota);
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [notification, setNotification] = useState<Notification>({ type: null, message: "" });
  const [refreshing, setRefreshing] = useState(false);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (!notification.type) return;

    const timer = setTimeout(() => {
      setNotification({ type: null, message: "" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    setNotification({ type, message });
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification({ type: null, message: "" });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      dismissNotification();
    }, 300);
  }, [onClose, dismissNotification]);

  const loadQuota = useCallback(async () => {
    setLoadingQuota(true);
    const result = await getUserAIQuotaAction();
    setLoadingQuota(false);

    if (result.success && result.quota) {
      setQuota({
        used_today: result.quota.used_today,
        daily_limit: result.quota.daily_limit,
        remaining_today: result.quota.remaining_today,
        used_this_month: result.quota.used_this_month,
        monthly_limit: result.quota.monthly_limit,
        remaining_this_month: result.quota.remaining_this_month,
      });
    }
  }, []);

  const loadPayments = useCallback(async () => {
    setLoadingPayments(true);
    setPaymentsError(null);
    const result = await getPaymentHistoryAction();
    setLoadingPayments(false);

    if (result.success && result.payments) {
      setPayments(result.payments);
    } else {
      setPaymentsError(result.error || "Ошибка загрузки истории платежей");
    }
  }, []);

  // Load data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    loadQuota();
    loadPayments();
  }, [isOpen, loadQuota, loadPayments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadQuota(), loadPayments()]);
    setRefreshing(false);
    showNotification("success", "Данные обновлены");
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    const result = await cancelSubscriptionWithYooKassaAction();
    setCanceling(false);

    if (result.success) {
      showNotification("success", "Подписка успешно отменена");
      setShowCancelDialog(false);
      // Reload data after cancellation
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showNotification("error", result.error || "Ошибка отмены подписки");
    }
  };

  const hasActiveSubscription = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
  const statusConfig = STATUS_CONFIG[user.subscriptionStatus] || STATUS_CONFIG.none;

  const dailyPercentage = quota.daily_limit > 0 ? Math.min((quota.used_today / quota.daily_limit) * 100, 100) : (quota.used_today > 0 ? 10 : 0);
  const monthlyPercentage = quota.monthly_limit > 0 ? Math.min((quota.used_this_month / quota.monthly_limit) * 100, 100) : Math.min((quota.used_this_month / 100) * 100, 100);
  const isDailyUnlimited = quota.daily_limit === 0;
  const isMonthlyUnlimited = quota.monthly_limit === 0;

  const infinitySym = "\u221E";
  const dailyUsageText = quota.daily_limit > 0 ? `${quota.used_today}/${quota.daily_limit}` : `${quota.used_today}/${infinitySym}`;
  const monthlyUsageText = quota.monthly_limit > 0 ? `${quota.used_this_month}/${quota.monthly_limit}` : `${quota.used_this_month}/${infinitySym}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Настройки подписки
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-7 w-7 p-0 text-muted-foreground"
              title="Обновить данные"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Notification */}
        {notification.type && (
          <NotificationBanner
            notification={notification}
            onDismiss={dismissNotification}
          />
        )}

        <div className="space-y-6">
          {/* Current Subscription */}
          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Текущая подписка</h3>
            </div>

            {loadingQuota ? (
              <SubscriptionSkeleton />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-foreground">{user.planName}</h4>
                  <Badge variant="secondary" className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}>
                    <span className="mr-1">{statusConfig.icon}</span>
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="space-y-1.5 rounded-lg bg-background/50 p-3 text-sm">
                  {user.subscriptionStatus === "trialing" && user.trialEndsAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Триал до:</span>
                      <span className="font-medium text-foreground">{formatDate(user.trialEndsAt)}</span>
                    </div>
                  )}
                  {user.subscriptionEndsAt && user.subscriptionStatus === "active" && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Следующее списание:</span>
                      <span className="font-medium text-foreground">{formatDate(user.subscriptionEndsAt)}</span>
                    </div>
                  )}
                  {user.currentPlan === "project" && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Тип доступа:</span>
                      <span className="font-medium text-emerald-600">Бессрочно</span>
                    </div>
                  )}
                </div>

                {hasActiveSubscription && user.currentPlan !== "project" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={canceling}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {canceling ? (
                      <>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Отмена...
                      </>
                    ) : (
                      "Отменить подписку"
                    )}
                  </Button>
                )}

                {user.subscriptionStatus === "trialing" && user.trialEndsAt && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                    <AlertTriangle className="mb-1 h-3 w-3" />
                    <p>По окончании пробного периода ({formatDate(user.trialEndsAt)}) вам будет предложено оформить подписку.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* AI Usage Dashboard */}
          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Использование AI</h3>
            </div>

            {loadingQuota ? (
              <UsageSkeleton />
            ) : (
              <div className="space-y-4">
                {/* Daily */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Сегодня</span>
                    <span className="text-muted-foreground">
                      {dailyUsageText}{" "}
                      {!isDailyUnlimited && (
                        <span className={quota.remaining_today <= 2 ? "text-red-600" : "text-emerald-600"}>
                          (осталось {quota.remaining_today})
                        </span>
                      )}
                    </span>
                  </div>
                  <Progress value={dailyPercentage} className={cn("h-1.5", isDailyUnlimited && "bg-emerald-100 [&>div]:bg-emerald-500")} />
                  {!isDailyUnlimited && (
                    <p className="text-[10px] text-muted-foreground">
                      {quota.remaining_today <= 0 ? "❌ Лимит исчерпан" : `Дневной лимит: ${quota.daily_limit} генераций`}
                    </p>
                  )}
                </div>

                {/* Monthly */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Этот месяц</span>
                    <span className="text-muted-foreground">
                      {monthlyUsageText}{" "}
                      {!isMonthlyUnlimited && (
                        <span className={quota.remaining_this_month <= 5 ? "text-red-600" : "text-emerald-600"}>
                          (осталось {quota.remaining_this_month})
                        </span>
                      )}
                    </span>
                  </div>
                  <Progress value={monthlyPercentage} className={cn("h-1.5", isMonthlyUnlimited && "bg-emerald-100 [&>div]:bg-emerald-500")} />
                  {!isMonthlyUnlimited && (
                    <p className="text-[10px] text-muted-foreground">
                      {quota.remaining_this_month <= 0 ? "❌ Месячный лимит исчерпан" : `Месячный лимит: ${quota.monthly_limit} генераций`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Payment History */}
          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">История платежей</h3>
            </div>

            {loadingPayments ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-2.5 animate-pulse">
                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="mt-1 h-3 w-24 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-16 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : paymentsError ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">{paymentsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPayments}
                  className="mt-2"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Повторить
                </Button>
              </div>
            ) : payments.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">История платежей пуста</div>
            ) : (
              <div className="space-y-2">
                {payments.slice(0, 5).map((payment) => {
                  const psc = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending;
                  return (
                    <div key={payment.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground">{payment.plan_name || payment.description}</p>
                          <Badge variant="secondary" className={cn("text-[10px]", psc.bgColor, psc.color)}>{psc.label}</Badge>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{formatPaymentDate(payment.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-foreground">{formatAmount(payment.amount_cents)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <CancelSubscriptionDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancelSubscription}
          canceling={canceling}
        />
      </DialogContent>
    </Dialog>
  );
}
