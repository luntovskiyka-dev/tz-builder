"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Save, Pencil, Trash2 } from "lucide-react";
import { type ProjectListItem } from "@/lib/actions/projects";
import { useEditorProjectsLoading } from "@/lib/editorChromeStore";

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectsList: ProjectListItem[];
  currentProjectId: string | null;
  handleSelectProject: (projectId: string) => void;
  openNewProjectDialog: () => void;
  openRenameProjectDialog: () => void;
  handleSaveClick: () => void;
  handleDeleteProject: () => void;
  deleteError: string | null;
}

export function ProjectsModal({
  isOpen,
  onClose,
  projectsList,
  currentProjectId,
  handleSelectProject,
  openNewProjectDialog,
  openRenameProjectDialog,
  handleSaveClick,
  handleDeleteProject,
  deleteError,
}: ProjectsModalProps) {
  const projectsLoading = useEditorProjectsLoading();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const currentProjectName =
    projectsList.find((project) => String(project.id) === String(currentProjectId))?.name?.trim() ||
    "Без названия";

  const handleDeleteClick = () => {
    if (!currentProjectId) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    handleDeleteProject();
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              Проекты
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Projects List */}
            <div className="space-y-2">
              {projectsLoading ? (
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              ) : projectsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет проектов</p>
              ) : (
                <ul className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-border/60 p-2">
                  {projectsList.map((proj) => (
                    <li key={proj.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectProject(proj.id)}
                        className={`w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                          currentProjectId === proj.id
                            ? "bg-muted font-medium text-foreground"
                            : "font-normal text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {proj.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 border-t border-border/70 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openNewProjectDialog();
                    onClose();
                  }}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Создать проект
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveClick}
                  className="w-full justify-start gap-2"
                >
                  <Save className="h-4 w-4" />
                  Сохранить проект
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openRenameProjectDialog();
                    onClose();
                  }}
                  disabled={!currentProjectId}
                  className="w-full justify-start gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />
                  Переименовать
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={!currentProjectId}
                  className="w-full justify-start gap-2 border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </Button>
              </div>
              {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить проект?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Проект "{currentProjectName}" будет удален без возможности восстановления.
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Удалить навсегда
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
