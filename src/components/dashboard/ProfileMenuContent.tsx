"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type ProjectListItem } from "@/lib/actions/projects";
import { logoutAction } from "@/lib/actions/auth";

type ProfileMenuContentProps = {
  userEmail: string;
  projectsMenuOpen: boolean;
  setProjectsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectsLoading: boolean;
  projectsList: ProjectListItem[];
  currentProjectId: string | null;
  handleSelectProject: (projectId: string) => void;
  openNewProjectDialog: () => void;
  handleSaveClick: () => void;
  handleDeleteProject: () => void;
  deleteError: string | null;
  setFeedbackModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logoutFormRef: React.RefObject<HTMLFormElement | null>;
  handleLogout: () => void;
};

export function ProfileMenuContent({
  userEmail,
  projectsMenuOpen,
  setProjectsMenuOpen,
  projectsLoading,
  projectsList,
  currentProjectId,
  handleSelectProject,
  openNewProjectDialog,
  handleSaveClick,
  handleDeleteProject,
  deleteError,
  setFeedbackModalOpen,
  logoutFormRef,
  handleLogout,
}: ProfileMenuContentProps) {
  return (
    <div className="absolute left-2 right-2 top-12 z-50 rounded-lg border border-border bg-background p-2 shadow-md">
      <div className="space-y-3">
        <section className="space-y-1 border-b border-border/70 pb-2">
          <p className="truncate px-2 text-xs text-muted-foreground">{userEmail}</p>
        </section>

        <section className="space-y-2 border-b border-border/70 pb-2">
          <button
            type="button"
            onClick={() => setProjectsMenuOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            aria-expanded={projectsMenuOpen}
          >
            <span>Проекты</span>
            {projectsMenuOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </button>
          {projectsMenuOpen && (
            <div className="space-y-2 px-1">
              {projectsLoading ? (
                <p className="px-1 text-[11px] text-muted-foreground">Загрузка...</p>
              ) : projectsList.length === 0 ? (
                <p className="px-1 text-[11px] text-muted-foreground">Нет проектов</p>
              ) : (
                <ul className="max-h-28 space-y-1 overflow-y-auto">
                  {projectsList.map((proj) => (
                    <li key={proj.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectProject(proj.id)}
                        className={`w-full truncate rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted ${
                          currentProjectId === proj.id ? "bg-muted font-medium" : ""
                        }`}
                      >
                        {proj.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={openNewProjectDialog}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  Создать проект
                </button>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  Сохранить проект
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  disabled={!currentProjectId}
                  className="w-full rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-xs text-destructive transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-destructive/40 disabled:hover:text-destructive"
                >
                  Удалить проект
                </button>
              </div>
              {deleteError && <p className="px-1 text-[11px] text-red-600">{deleteError}</p>}
            </div>
          )}
        </section>

        <section className="space-y-1">
          <button
            type="button"
            onClick={() => setFeedbackModalOpen(true)}
            className="w-full rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
          >
            Обратная связь
          </button>
          <form ref={logoutFormRef} action={logoutAction}>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              Выход
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

