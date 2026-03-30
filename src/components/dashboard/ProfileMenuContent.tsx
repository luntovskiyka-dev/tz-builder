"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type ProjectListItem } from "@/lib/actions/projects";
import { logoutAction } from "@/lib/actions/auth";
import { useEditorProjectsLoading } from "@/lib/editorChromeStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  EVENT_CONFERENCE_TEMPLATE_PROJECT_NAME,
  PORTFOLIO_SERVICES_TEMPLATE_PROJECT_NAME,
  SAAS_TEMPLATE_PROJECT_NAME,
} from "@/lib/saasTemplateMeta";

type ProfileMenuContentProps = {
  userEmail: string;
  projectsMenuOpen: boolean;
  setProjectsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  templatesMenuOpen: boolean;
  setTemplatesMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectsList: ProjectListItem[];
  currentProjectId: string | null;
  handleSelectProject: (projectId: string) => void;
  openNewProjectDialog: () => void;
  openRenameProjectDialog: () => void;
  handleSaveClick: () => void;
  handleDeleteProject: () => void;
  deleteError: string | null;
  setFeedbackModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  logoutFormRef: React.RefObject<HTMLFormElement | null>;
  handleLogout: () => void;
  onApplySaaSTemplate: () => void;
  onApplyEventConferenceTemplate: () => void;
  onApplyPortfolioServicesTemplate: () => void;
};

export function ProfileMenuContent({
  userEmail,
  projectsMenuOpen,
  setProjectsMenuOpen,
  templatesMenuOpen,
  setTemplatesMenuOpen,
  projectsList,
  currentProjectId,
  handleSelectProject,
  openNewProjectDialog,
  openRenameProjectDialog,
  handleSaveClick,
  handleDeleteProject,
  deleteError,
  setFeedbackModalOpen,
  logoutFormRef,
  handleLogout,
  onApplySaaSTemplate,
  onApplyEventConferenceTemplate,
  onApplyPortfolioServicesTemplate,
}: ProfileMenuContentProps) {
  const projectsLoading = useEditorProjectsLoading();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const currentProjectName =
    projectsList.find((project) => String(project.id) === String(currentProjectId))?.name?.trim() ||
    "Без названия";

  const openDeleteConfirm = () => {
    if (!currentProjectId) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteProject = () => {
    handleDeleteProject();
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-background p-2 shadow-md">
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
                  <p className="px-1 text-xs text-muted-foreground">Загрузка...</p>
                ) : projectsList.length === 0 ? (
                  <p className="px-1 text-xs text-muted-foreground">Нет проектов</p>
                ) : (
                  <ul className="max-h-40 space-y-0.5 overflow-y-auto rounded-md border border-border/60 p-1">
                    {projectsList.map((proj) => (
                      <li key={proj.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectProject(proj.id)}
                          className={`w-full truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                            currentProjectId === proj.id
                              ? "font-medium text-foreground"
                              : "font-normal text-muted-foreground hover:text-foreground"
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
                    onClick={openRenameProjectDialog}
                    disabled={!currentProjectId}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Переименовать проект
                  </button>
                  <button
                    type="button"
                    onClick={openDeleteConfirm}
                    disabled={!currentProjectId}
                    className="w-full rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-xs text-destructive transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-destructive/40 disabled:hover:text-destructive"
                  >
                    Удалить проект
                  </button>
                </div>
                {deleteError && <p className="px-1 text-xs text-red-600">{deleteError}</p>}
              </div>
            )}
          </section>

          <section
            className="space-y-2 border-b border-border/70 pb-2"
            data-profile-section="templates"
          >
            <button
              type="button"
              onClick={() => setTemplatesMenuOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-md p-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              aria-expanded={templatesMenuOpen}
            >
              <span>Шаблоны</span>
              {templatesMenuOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {templatesMenuOpen && (
              <div className="px-1">
                <ul className="space-y-0.5 rounded-md border border-border/60 p-1">
                  <li>
                    <button
                      type="button"
                      onClick={onApplySaaSTemplate}
                      className="w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {SAAS_TEMPLATE_PROJECT_NAME}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onApplyEventConferenceTemplate}
                      className="w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {EVENT_CONFERENCE_TEMPLATE_PROJECT_NAME}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onApplyPortfolioServicesTemplate}
                      className="w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {PORTFOLIO_SERVICES_TEMPLATE_PROJECT_NAME}
                    </button>
                  </li>
                </ul>
                <p className="mt-2 px-1 text-[11px] leading-snug text-muted-foreground">
                  Сохраняет текущий проект и создаёт новый проект с выбранным лендингом.
                </p>
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

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить проект?</DialogTitle>
            <DialogDescription>
              Проект "{currentProjectName}" будет удален без возможности восстановления.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>
              Удалить навсегда
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
