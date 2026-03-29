"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loadProjectsAction,
  loadProjectAction,
  saveProjectAction,
  deleteProjectAction,
  type ProjectListItem,
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
import {
  canvasBlocksToPuckData,
  normalizePuckData,
  puckConfig,
  puckDataToCanvasBlocks,
  puckOverrides,
} from "@/lib/puckEditor";
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
  const [puckData, setPuckData] = useState<Partial<Data>>({ content: [], root: { props: { title: "" } } });
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
  /** Puck keeps only the first `data` it sees; bump key when hydrating from API so the editor remounts. */
  const [puckHydrationKey, setPuckHydrationKey] = useState(0);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const logoutFormRef = useRef<HTMLFormElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const localSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const autosaveQueuedRef = useRef(false);
  const latestSignatureRef = useRef("[]");
  const lastSavedSignatureRef = useRef("[]");
  const latestBlocksRef = useRef<CanvasBlock[]>([]);
  const userName = user?.name?.trim() || "Пользователь";
  const userEmail = user?.email?.trim() || "no-email@example.com";
  const avatarUrl = user?.avatarUrl?.trim() || "/images/avatar-placeholder.svg";

  useEffect(() => {
    let cancelled = false;
    loadProjectsAction()
      .then((result) => {
        if (cancelled) return;
        if (result.error) {
          setDeleteError(result.error);
          return;
        }
        setProjectsList(result.projects ?? []);
        if (result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          return loadProjectAction(mostRecent.id).then((projectResult) => {
            if (cancelled) return;
            if (projectResult.error) {
              setDeleteError(projectResult.error);
              return;
            }
            if (projectResult.blocks != null && Array.isArray(projectResult.blocks)) {
              const loadedBlocks = projectResult.blocks as CanvasBlock[];
              setCanvasBlocks(loadedBlocks);
              setPuckData(canvasBlocksToPuckData(loadedBlocks));
              latestBlocksRef.current = loadedBlocks;
              const signature = JSON.stringify(loadedBlocks);
              latestSignatureRef.current = signature;
              lastSavedSignatureRef.current = signature;
              setCurrentProjectId(String(mostRecent.id));
              setCurrentProjectSpec(typeof projectResult.spec === "string" ? projectResult.spec : null);
              setPuckHydrationKey((k) => k + 1);
            }
          });
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
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const projectNameForSave = useCallback(() => {
    if (!currentProjectId) return "Без названия";
    return (
      projectsList.find((p) => String(p.id) === String(currentProjectId))?.name?.trim() ||
      "Без названия"
    );
  }, [currentProjectId, projectsList]);

  const runAutosave = useCallback(async () => {
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
      const formData = new FormData();
      formData.set("name", projectNameForSave());
      formData.set("blocks", JSON.stringify(latestBlocksRef.current));
      formData.set("projectId", String(currentProjectId));
      const result = await saveProjectAction(null, formData);
      if (result.error) {
        setCloudSaveStatus("error");
        setDeleteError(result.error);
      } else {
        lastSavedSignatureRef.current = signature;
        setCloudSaveStatus("saved");
        setDeleteError(null);
        setProjectsList((prev) =>
          prev.map((p) =>
            String(p.id) === String(currentProjectId)
              ? { ...p, updated_at: new Date().toISOString() }
              : p,
          ),
        );
      }
    } finally {
      saveInFlightRef.current = false;
      if (autosaveQueuedRef.current) {
        autosaveQueuedRef.current = false;
        void runAutosave();
      }
    }
  }, [currentProjectId, projectNameForSave]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => {
      autosaveTimeoutRef.current = null;
      void runAutosave();
    }, 2200);
  }, [runAutosave]);

  const handleSelectProject = useCallback(async (projectId: string) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
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
      setCurrentProjectId(String(projectId));
      setCurrentProjectSpec(typeof result.spec === "string" ? result.spec : null);
      setIsProfileMenuOpen(false);
      setCloudSaveStatus("saved");
      setPuckHydrationKey((k) => k + 1);
    }
  }, []);

  const openNewProjectDialog = useCallback(() => {
    setNewProjectName("");
    setProjectNameDialogOpen(true);
  }, []);

  const handleCreateNewProject = useCallback(async () => {
    const name = newProjectName.trim() || "Без названия";
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    setPuckHydrationKey((k) => k + 1);
    setCurrentProjectId(null);
    setCanvasBlocks([]);
    setPuckData({ content: [], root: { props: { title: "" } } });
    setCurrentProjectSpec(null);
    latestBlocksRef.current = [];
    latestSignatureRef.current = "[]";
    lastSavedSignatureRef.current = "[]";
    setDeleteError(null);
    setCloudSaveStatus("saving");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("blocks", JSON.stringify([]));
    const result = await saveProjectAction(null, formData);
    if (result.error || result.projectId == null) {
      setCloudSaveStatus("error");
      setDeleteError(result.error ?? "Не удалось создать проект");
      return;
    }
    const id = String(result.projectId);
    setCurrentProjectId(id);
    setProjectsList((prev) => [
      { id, name, updated_at: new Date().toISOString() },
      ...prev.filter((p) => String(p.id) !== id),
    ]);
    setCloudSaveStatus("saved");
    setProjectNameDialogOpen(false);
    setIsProfileMenuOpen(false);
  }, [newProjectName]);

  const handleSaveClick = useCallback(async () => {
    setCloudSaveStatus("saving");
    const formData = new FormData();
    formData.set("name", projectNameForSave());
    formData.set("blocks", JSON.stringify(latestBlocksRef.current));
    if (currentProjectId) formData.set("projectId", String(currentProjectId));
    const result = await saveProjectAction(null, formData);
    if (result.error || result.projectId == null) {
      setCloudSaveStatus("error");
      setDeleteError(result.error ?? "Ошибка при сохранении проекта");
      return;
    }
    const savedId = String(result.projectId);
    lastSavedSignatureRef.current = latestSignatureRef.current;
    setCloudSaveStatus("saved");
    setDeleteError(null);
    if (!currentProjectId) {
      const name = projectNameForSave();
      setCurrentProjectId(savedId);
      setProjectsList((prev) => [
        { id: savedId, name, updated_at: new Date().toISOString() },
        ...prev.filter((p) => String(p.id) !== savedId),
      ]);
    } else {
      setProjectsList((prev) =>
        prev.map((p) =>
          String(p.id) === savedId ? { ...p, updated_at: new Date().toISOString() } : p,
        ),
      );
    }
  }, [currentProjectId, projectNameForSave]);

  const handleDeleteProject = useCallback(async () => {
    if (!currentProjectId) return;
    setDeleteError(null);
    const result = await deleteProjectAction(currentProjectId);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setProjectsList((prev) => prev.filter((p) => String(p.id) !== String(currentProjectId)));
    setCurrentProjectId(null);
    setCurrentProjectSpec(null);
    setCanvasBlocks([]);
    setPuckData({ content: [], root: { props: { title: "" } } });
    latestBlocksRef.current = [];
    latestSignatureRef.current = "[]";
    lastSavedSignatureRef.current = "[]";
    setCloudSaveStatus("saved");
    setPuckHydrationKey((k) => k + 1);
  }, [currentProjectId]);

  const handleLogout = useCallback(async () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    if (currentProjectId && latestSignatureRef.current !== lastSavedSignatureRef.current) {
      const formData = new FormData();
      formData.set("name", projectNameForSave());
      formData.set("blocks", JSON.stringify(latestBlocksRef.current));
      formData.set("projectId", String(currentProjectId));
      const result = await saveProjectAction(null, formData);
      if (!result.error) {
        lastSavedSignatureRef.current = latestSignatureRef.current;
      }
    }
    logoutFormRef.current?.requestSubmit();
  }, [currentProjectId, projectNameForSave]);

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
    const normalized = normalizePuckData(data);
    setPuckData(normalized);
    const nextBlocks = puckDataToCanvasBlocks(normalized);
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
    <Puck
      key={puckHydrationKey}
      config={puckConfig}
      data={puckData}
      onChange={handlePuckChange}
      overrides={puckOverrides}
      iframe={{ enabled: false }}
    >
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
          const id = String(projectId);
          setCurrentProjectId((prev) => prev ?? id);
          setCurrentProjectSpec(spec);
          lastSavedSignatureRef.current = latestSignatureRef.current;
          setProjectsList((prev) =>
            prev.some((p) => String(p.id) === id)
              ? prev
              : [{ id, name: "Без названия", updated_at: new Date().toISOString() }, ...prev],
          );
        }}
      />
    </Puck>
  );
}

