"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { SavedStatus } from "@/components/dashboard/useCloudProjectSave";

type LeftSidebarProps = {
  isLeftSidebarOpen: boolean;
  profileMenuRef: React.RefObject<HTMLDivElement | null>;
  avatarUrl: string;
  userName: string;
  cloudSaveStatus: SavedStatus;
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  profileMenuContent: React.ReactNode;
  onExportClick: () => void;
  projectsLoading: boolean;
  blockLibrary: React.ReactNode;
};

export function LeftSidebar({
  isLeftSidebarOpen,
  profileMenuRef,
  avatarUrl,
  userName,
  cloudSaveStatus,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  profileMenuContent,
  onExportClick,
  projectsLoading,
  blockLibrary,
}: LeftSidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] transform flex-col overflow-y-auto border-r border-border/70 bg-background/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-transform duration-200 md:sticky md:translate-x-0 ${
        isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((v) => !v)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {isProfileMenuOpen && profileMenuContent}
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
          Сгенерировать ТЗ с AI
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

