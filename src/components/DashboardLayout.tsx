"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loadProjectFromStorage,
  saveProjectToStorage,
} from "@/utils/storage";
import {
  loadProjectsAction,
  loadProjectAction,
  saveProjectAction,
  deleteProjectAction,
  type ProjectListItem
} from "@/lib/actions/projects";
import { Menu, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type CanvasBlock } from "@/lib/blockTypes";
import { canvasBlocksToPuckData, puckConfig, puckDataToCanvasBlocks } from "@/lib/puckEditor";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import type { SavedStatus } from "@/components/dashboard/useCloudProjectSave";
import { ProfileMenuContent } from "@/components/dashboard/ProfileMenuContent";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ExportModal } from "@/components/export/ExportModal";

type DashboardLayoutUser = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  plan?: string | null;
};

export function DashboardLayout({ user }: { user?: DashboardLayoutUser }) {
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([]);
  const [puckData, setPuckData] = useState<Partial<Data>>({ content: [], root: { props: {} } });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectSpec, setCurrentProjectSpec] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectListItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<SavedStatus>("saved");
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(true);
  const [projectNameDialogOpen, setProjectNameDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const logoutFormRef = useRef<HTMLFormElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const localSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const autosaveQueuedRef = useRef(false);
  const lastSavedSignatureRef = useRef("[]");
  const latestSignatureRef = useRef("[]");
  const latestBlocksRef = useRef<CanvasBlock[]>([]);
  const userName = user?.name?.trim() || "Пользователь";
  const userEmail = user?.email?.trim() || "no-email@example.com";
  const avatarUrl = user?.avatarUrl?.trim() || "/images/avatar-placeholder.svg";

  useEffect(() => {
    let cancelled = false;
    loadProjectsAction()
      .then((result) => {
        if (cancelled) return;
        setProjectsList(result.projects ?? []);
        if (result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          return loadProjectAction(mostRecent.id).then((projectResult) => {
            if (cancelled) return;
            if (projectResult.blocks != null && Array.isArray(projectResult.blocks)) {
              const loadedBlocks = projectResult.blocks as CanvasBlock[];
              setCanvasBlocks(loadedBlocks);
              setPuckData(canvasBlocksToPuckData(loadedBlocks));
              latestBlocksRef.current = loadedBlocks;
              const signature = JSON.stringify(loadedBlocks);
              latestSignatureRef.current = signature;
              lastSavedSignatureRef.current = signature;
              setCurrentProjectId(mostRecent.id);
              setCurrentProjectSpec(typeof projectResult.spec === "string" ? projectResult.spec : null);
            }
          });
        }
        const local = loadProjectFromStorage();
        if (local?.blocks && Array.isArray(local.blocks)) {
          const loadedBlocks = local.blocks as CanvasBlock[];
          setCanvasBlocks(loadedBlocks);
          setPuckData(canvasBlocksToPuckData(loadedBlocks));
          latestBlocksRef.current = loadedBlocks;
          const signature = JSON.stringify(loadedBlocks);
          latestSignatureRef.current = signature;
          lastSavedSignatureRef.current = signature;
        }
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveProjectToStorage(canvasBlocks);
  }, [canvasBlocks]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const runAutosave = useCallback(async () => {
    // Autosave updates only existing cloud projects.
    // New project creation remains explicit via "Сохранить"/"Новый проект".
    if (!currentProjectId) return;
    const signature = latestSignatureRef.current;
    if (!signature || signature === lastSavedSignatureRef.current) return;
    if (saveInFlightRef.current) {
      autosaveQueuedRef.current = true;
      return;
    }

    saveInFlightRef.current = true;
    setCloudSaveStatus("saving");
    try {
      const currentName = projectsList.find((p) => p.id === currentProjectId)?.name ?? "Без названия";
      const formData = new FormData();
      formData.set("name", currentName);
      formData.set("blocks", JSON.stringify(latestBlocksRef.current));
      formData.set("projectId", currentProjectId);
      const result = await saveProjectAction(null, formData);
      if (result.error) {
        setCloudSaveStatus("error");
        setDeleteError(result.error);
      } else {
        lastSavedSignatureRef.current = signature;
        setCloudSaveStatus("saved");
        setDeleteError(null);
      }
    } finally {
      saveInFlightRef.current = false;
      if (autosaveQueuedRef.current) {
        autosaveQueuedRef.current = false;
        void runAutosave();
      }
    }
  }, [currentProjectId, projectsList]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => {
      autosaveTimeoutRef.current = null;
      void runAutosave();
    }, 2200);
  }, [runAutosave]);

  const handleSelectProject = useCallback(async (projectId: string) => {
    setProjectsLoading(true);
    setDeleteError(null);
    const result = await loadProjectAction(projectId);
    setProjectsLoading(false);
    if (result.error) return;
    if (result.blocks != null && Array.isArray(result.blocks)) {
      const loadedBlocks = result.blocks as CanvasBlock[];
      setCanvasBlocks(loadedBlocks);
      setPuckData(canvasBlocksToPuckData(loadedBlocks));
      latestBlocksRef.current = loadedBlocks;
      const signature = JSON.stringify(loadedBlocks);
      latestSignatureRef.current = signature;
      lastSavedSignatureRef.current = signature;
      setCurrentProjectId(projectId);
      setCurrentProjectSpec(typeof result.spec === "string" ? result.spec : null);
      setIsProfileMenuOpen(false);
      setCloudSaveStatus("saved");
    }
  }, []);

  const openNewProjectDialog = useCallback(() => {
    setNewProjectName("");
    setProjectNameDialogOpen(true);
  }, []);

  const handleCreateNewProject = useCallback(async () => {
    const projectName = newProjectName.trim() || "Без названия";

    // Always create a new local draft immediately.
    setCanvasBlocks([]);
    setPuckData({ content: [], root: { props: {} } });
    setCurrentProjectId(null);
    setCurrentProjectSpec(null);
    latestBlocksRef.current = [];
    latestSignatureRef.current = "[]";
    lastSavedSignatureRef.current = "[]";
    setCloudSaveStatus("saved");
    setDeleteError(null);

    const formData = new FormData();
    formData.set("name", projectName);
    formData.set("blocks", JSON.stringify([]));
    const result = await saveProjectAction(null, formData);
    if (result.projectId) {
      setCurrentProjectId(result.projectId);
      setProjectsList((prev) => [
        { id: result.projectId!, name: projectName, updated_at: new Date().toISOString() },
        ...prev.filter((p) => p.id !== result.projectId),
      ]);
      setDeleteError(null);
    } else if (result.error) {
      setDeleteError(result.error);
      setCloudSaveStatus("error");
    }
    setProjectNameDialogOpen(false);
    setIsProfileMenuOpen(false);
  }, [newProjectName]);

  const handleSaveClick = useCallback(async () => {
    const formData = new FormData();
    formData.set("name", "Без названия");
    formData.set("blocks", JSON.stringify(latestBlocksRef.current));
    if (currentProjectId) formData.set("projectId", currentProjectId);
    setCloudSaveStatus("saving");
    const result = await saveProjectAction(null, formData);
    if (!result.projectId) {
      setCloudSaveStatus("error");
      setDeleteError(result.error ?? "Ошибка при сохранении проекта");
      return;
    }
    lastSavedSignatureRef.current = latestSignatureRef.current;
    setCloudSaveStatus("saved");
    setDeleteError(null);
    if (!currentProjectId) {
      setCurrentProjectId(result.projectId);
      setProjectsList((prev) => [
        { id: result.projectId!, name: "Без названия", updated_at: new Date().toISOString() },
        ...prev,
      ]);
    }
  }, [currentProjectId]);

  const handleDeleteProject = useCallback(async () => {
    if (!currentProjectId) return;
    setDeleteError(null);
    const result = await deleteProjectAction(currentProjectId);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setProjectsList((prev) => prev.filter((p) => p.id !== currentProjectId));
    setCurrentProjectId(null);
    setCurrentProjectSpec(null);
    setCanvasBlocks([]);
    setPuckData({ content: [], root: { props: {} } });
    latestBlocksRef.current = [];
    latestSignatureRef.current = "[]";
    lastSavedSignatureRef.current = "[]";
    setCloudSaveStatus("saved");
  }, [currentProjectId]);

  const handleLogout = useCallback(() => {
    logoutFormRef.current?.requestSubmit();
  }, []);

  const profileMenuContent = (
    <ProfileMenuContent
      userEmail={userEmail}
      projectsMenuOpen={projectsMenuOpen}
      setProjectsMenuOpen={setProjectsMenuOpen}
      projectsLoading={projectsLoading}
      projectsList={projectsList}
      currentProjectId={currentProjectId}
      handleSelectProject={handleSelectProject}
      openNewProjectDialog={openNewProjectDialog}
      handleSaveClick={handleSaveClick}
      handleDeleteProject={handleDeleteProject}
      deleteError={deleteError}
      setFeedbackModalOpen={setFeedbackModalOpen}
      logoutFormRef={logoutFormRef}
      handleLogout={handleLogout}
    />
  );
  const handleExportClick = useCallback(() => {
    setExportModalOpen(true);
  }, []);

  const handlePuckChange = useCallback((data: Data) => {
    setPuckData(data);
    const nextBlocks = puckDataToCanvasBlocks(data);
    latestBlocksRef.current = nextBlocks;
    latestSignatureRef.current = JSON.stringify(nextBlocks);

    if (localSyncTimeoutRef.current) clearTimeout(localSyncTimeoutRef.current);
    localSyncTimeoutRef.current = setTimeout(() => {
      localSyncTimeoutRef.current = null;
      setCanvasBlocks(nextBlocks);
    }, 250);

    if (currentProjectId) scheduleAutosave();
  }, [currentProjectId, scheduleAutosave]);

  useEffect(() => {
    return () => {
      if (localSyncTimeoutRef.current) clearTimeout(localSyncTimeoutRef.current);
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, []);

  return (
    <Puck config={puckConfig} data={puckData} onChange={handlePuckChange}>
      <Dialog open={projectNameDialogOpen} onOpenChange={setProjectNameDialogOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Создать проект</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-project-name">Название</Label>
            <Input
              id="new-project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Без названия"
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setProjectNameDialogOpen(false)}
              className="border border-border rounded-lg px-4 py-2 text-sm"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleCreateNewProject}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
            >
              Создать
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen bg-background">
        <button
          type="button"
          onClick={() => setIsLeftSidebarOpen((v) => !v)}
          className="fixed left-4 top-4 z-50 rounded-md border border-border bg-background p-2 text-foreground shadow-sm md:hidden"
          aria-label="Toggle sidebar"
          aria-expanded={isLeftSidebarOpen}
        >
          {isLeftSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <LeftSidebar
          isLeftSidebarOpen={isLeftSidebarOpen}
          profileMenuRef={profileMenuRef}
          avatarUrl={avatarUrl}
          userName={userName}
          cloudSaveStatus={cloudSaveStatus}
          isProfileMenuOpen={isProfileMenuOpen}
          setIsProfileMenuOpen={setIsProfileMenuOpen}
          profileMenuContent={profileMenuContent}
          onExportClick={handleExportClick}
          projectsLoading={projectsLoading}
          blockLibrary={<Puck.Components />}
        />

        <main className="flex-1 bg-muted/30 overflow-y-auto p-8">
          <div className="mx-auto min-h-screen max-w-[900px] bg-background shadow-sm">
            <Puck.Preview />
          </div>
        </main>

        <aside className="hidden w-[300px] border-l border-border/70 bg-background/80 p-4 md:block md:h-screen md:overflow-y-auto">
          <Puck.Fields />
        </aside>
      </div>
      <FeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
      <ExportModal
        blocks={canvasBlocks}
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        projectId={currentProjectId}
        initialSpec={currentProjectSpec}
        onSpecSaved={({ projectId, spec }) => {
          setCurrentProjectId((prev) => prev ?? projectId);
          setCurrentProjectSpec(spec);
        }}
      />
    </Puck>
  );
}

