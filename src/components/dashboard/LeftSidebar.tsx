"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useEditorProjectsLoading, useEditorSaveStatus } from "@/lib/editorChromeStore";
import { ProfileMenuContent } from "@/components/dashboard/ProfileMenuContent";

const PROFILE_MENU_PANEL_ID = "profile-menu-dropdown";

type LeftSidebarProps = {
  isLeftSidebarOpen: boolean;
  avatarUrl: string;
  userName: string;
  userEmail: string;
  setProjectsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTemplatesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFeedbackModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPricingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBillingSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logoutFormRef: React.RefObject<HTMLFormElement | null>;
  handleLogout: () => void;
  onExportClick: () => void;
  blockLibrary: React.ReactNode;
};

export function LeftSidebar({
  isLeftSidebarOpen,
  avatarUrl,
  userName,
  userEmail,
  setProjectsModalOpen,
  setTemplatesModalOpen,
  setFeedbackModalOpen,
  setPricingModalOpen,
  setBillingSettingsOpen,
  logoutFormRef,
  handleLogout,
  onExportClick,
  blockLibrary,
}: LeftSidebarProps) {
  const cloudSaveStatus = useEditorSaveStatus();
  const projectsLoading = useEditorProjectsLoading();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsProfileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isProfileMenuOpen, setIsProfileMenuOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[role="dialog"]') || target.closest('[data-slot="dialog-overlay"]')) return;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <aside
      className={`max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 flex h-full min-h-0 w-[260px] shrink-0 transform flex-col overflow-y-auto [scrollbar-gutter:stable] border-r border-border/70 bg-background/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-transform duration-200 md:relative md:translate-x-0 ${
        isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="mb-3 border-b border-border/70 pb-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-base font-semibold tracking-tight text-foreground">
            ProtoSpec<span className="opacity-30">.</span>
          </span>
        </div>
        <div className="relative flex items-center gap-3" ref={profileMenuRef}>
          <Image
            src={avatarUrl}
            className="h-10 w-10 rounded-full object-cover"
            alt="User avatar"
            width={40}
            height={40}
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">{userName}</span>
            <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  cloudSaveStatus === "saved"
                    ? "bg-emerald-500"
                    : cloudSaveStatus === "saving"
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
              />
              <span>
                {cloudSaveStatus === "saved" && "Сохранено"}
                {cloudSaveStatus === "saving" && "Автосохранение"}
                {cloudSaveStatus === "error" && "Ошибка облака"}
              </span>
            </span>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              id="profile-menu-button"
              onClick={() => setIsProfileMenuOpen((v) => !v)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Меню профиля"
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
              aria-controls={isProfileMenuOpen ? PROFILE_MENU_PANEL_ID : undefined}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {isProfileMenuOpen && (
            <div
              id={PROFILE_MENU_PANEL_ID}
              role="region"
              aria-labelledby="profile-menu-button"
              className="absolute left-2 right-2 top-full z-50 mt-1"
            >
              <ProfileMenuContent
                userEmail={userEmail}
                setProjectsModalOpen={setProjectsModalOpen}
                setTemplatesModalOpen={setTemplatesModalOpen}
                setFeedbackModalOpen={setFeedbackModalOpen}
                setPricingModalOpen={setPricingModalOpen}
                setBillingSettingsOpen={setBillingSettingsOpen}
                logoutFormRef={logoutFormRef}
                handleLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mb-3">
        <button
          type="button"
          onClick={onExportClick}
          disabled={projectsLoading}
          className={`w-full bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            projectsLoading ? "hover:bg-primary" : ""
          }`}
        >
          Сгенерировать ТЗ
        </button>
      </div>
      <div className="mb-3 space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Библиотека блоков
        </h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-border bg-background p-2 text-sm">
        {blockLibrary}
      </div>
    </aside>
  );
}

