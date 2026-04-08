"use client";

import React from "react";
import { Settings, CreditCard, MessageSquare, LogOut, FolderOpen, LayoutTemplate } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

type ProfileMenuContentProps = {
  userEmail: string;
  setProjectsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTemplatesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFeedbackModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPricingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBillingSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logoutFormRef: React.RefObject<HTMLFormElement | null>;
  handleLogout: () => void;
};

export function ProfileMenuContent({
  userEmail,
  setProjectsModalOpen,
  setTemplatesModalOpen,
  setFeedbackModalOpen,
  setPricingModalOpen,
  setBillingSettingsOpen,
  logoutFormRef,
  handleLogout,
}: ProfileMenuContentProps) {

  return (
    <>
      <div className="rounded-lg border border-border bg-background p-2 shadow-md">
        <div className="space-y-3">
          <section className="space-y-1 border-b border-border/70 pb-2">
            <p className="truncate px-2 text-xs text-muted-foreground">{userEmail}</p>
          </section>

          <section className="space-y-1 border-b border-border/70 pb-2">
            <button
              type="button"
              onClick={() => setProjectsModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Проекты
            </button>
            <button
              type="button"
              onClick={() => setTemplatesModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              Шаблоны
            </button>
          </section>

          <section className="space-y-1">
            <button
              type="button"
              onClick={() => setBillingSettingsOpen(true)}
              className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Настройки
            </button>
            <button
              type="button"
              onClick={() => setPricingModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Тарифы
            </button>
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Обратная связь
            </button>
            <form ref={logoutFormRef} action={logoutAction}>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                Выход
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
