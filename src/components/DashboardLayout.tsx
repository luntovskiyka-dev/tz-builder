"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Puck, usePuck, type Data, type Plugin, type UiState } from "@puckeditor/core";
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
import { EVENT_CONFERENCE_PUCK_DATA } from "@/lib/eventConferenceLanding";
import { SAAS_UNIVERSAL_PUCK_DATA } from "@/lib/saasUniversalLanding";
import { STUDIO_BRAND_PUCK_DATA } from "@/lib/studioBrandLanding";
import {
  EVENT_CONFERENCE_TEMPLATE_PROJECT_NAME,
  PORTFOLIO_SERVICES_TEMPLATE_PROJECT_NAME,
  SAAS_TEMPLATE_PROJECT_NAME,
} from "@/lib/saasTemplateMeta";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import {
  setEditorProjectsLoading,
  setEditorSaveStatus,
} from "@/lib/editorChromeStore";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ExportModal } from "@/components/export/ExportModal";
import { Button } from "@/components/ui/button";

/**
 * Hide Puck’s Blocks/Outline side nav (`Puck--hidePlugins`) and the built-in left drawer;
 * blocks live in {@link LeftSidebar} via `<Puck.Components />`.
 */
const PUCK_DASHBOARD_UI: Partial<UiState> = { leftSideBarVisible: false };

/** Registers `legacy-side-bar` so Puck collapses the vertical Blocks/Outline rail without rendering duplicate library UI. */
const PUCK_HIDE_SIDE_NAV_PLUGINS: Plugin[] = [
  { name: "legacy-side-bar", render: () => <></> },
];

/** Marks the editor when no block is selected so CSS can hide the inspector title row (“Page”). */
function PuckSelectionShell({ children }: { children: React.ReactNode }) {
  const { selectedItem } = usePuck();
  return (
    <div
      id="main-editor"
      tabIndex={-1}
      className="min-h-0 min-w-0 flex-1 outline-none"
      data-tz-puck-no-selection={selectedItem == null ? true : undefined}
    >
      {children}
    </div>
  );
}

/** Hide Puck header row in dashboard editor. */
function DashboardPuckHeader() {
  return <></>;
}

type DashboardLayoutUser = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  plan?: string | null;
};

export function DashboardLayout({ user }: { user?: DashboardLayoutUser }) {
  const [canvasBlocks, setCanvasBlocks] = useState<CanvasBlock[]>([]);
  const [puckData, setPuckData] = useState<Partial<Data>>({ content: [], root: { props: { title: "" } } });
  const [isInitialHydrationDone, setIsInitialHydrationDone] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectSpec, setCurrentProjectSpec] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectListItem[]>([]);
  const [projectNameDialogOpen, setProjectNameDialogOpen] = useState(false);
  const [projectNameDialogMode, setProjectNameDialogMode] = useState<"create" | "rename">("create");
  const [newProjectName, setNewProjectName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  /** Puck keeps only the first `data` it sees; bump key when hydrating from API so the editor remounts. */
  const [puckHydrationKey, setPuckHydrationKey] = useState(0);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const logoutFormRef = useRef<HTMLFormElement>(null);
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
        if (!cancelled) {
          setEditorProjectsLoading(false);
          setIsInitialHydrationDone(true);
        }
      });
    return () => {
      cancelled = true;
    };
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
    setEditorSaveStatus("saving");
    try {
      const formData = new FormData();
      formData.set("name", projectNameForSave());
      formData.set("blocks", JSON.stringify(latestBlocksRef.current));
      formData.set("projectId", String(currentProjectId));
      const result = await saveProjectAction(null, formData);
      if (result.error) {
        setEditorSaveStatus("error");
        setDeleteError(result.error);
      } else {
        lastSavedSignatureRef.current = signature;
        setEditorSaveStatus("saved");
        setDeleteError(null);
        // Intentionally do not update projectsList here: it would change profileMenuContent,
        // invalidate Puck overrides, and flash the canvas on every autosave.
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
    setEditorProjectsLoading(true);
    setDeleteError(null);
    const result = await loadProjectAction(projectId);
    setEditorProjectsLoading(false);
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
      setIsLeftSidebarOpen(false);
      setEditorSaveStatus("saved");
      setPuckHydrationKey((k) => k + 1);
    }
  }, []);

  const openNewProjectDialog = useCallback(() => {
    setProjectNameDialogMode("create");
    setNewProjectName("");
    setProjectNameDialogOpen(true);
  }, []);

  const openRenameProjectDialog = useCallback(() => {
    if (!currentProjectId) return;
    setProjectNameDialogMode("rename");
    setNewProjectName(projectNameForSave());
    setProjectNameDialogOpen(true);
  }, [currentProjectId, projectNameForSave]);

  const onProjectNameDialogOpenChange = useCallback((open: boolean) => {
    setProjectNameDialogOpen(open);
    if (!open) setProjectNameDialogMode("create");
  }, []);

  const handleRenameProject = useCallback(async () => {
    if (!currentProjectId) return;
    const name = newProjectName.trim() || "Без названия";
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    setEditorSaveStatus("saving");
    const formData = new FormData();
    formData.set("name", name);
    formData.set("blocks", JSON.stringify(latestBlocksRef.current));
    formData.set("projectId", String(currentProjectId));
    const result = await saveProjectAction(null, formData);
    if (result.error) {
      setEditorSaveStatus("error");
      setDeleteError(result.error);
      return;
    }
    lastSavedSignatureRef.current = latestSignatureRef.current;
    setEditorSaveStatus("saved");
    setDeleteError(null);
    setProjectsList((prev) =>
      prev.map((p) =>
        String(p.id) === String(currentProjectId)
          ? { ...p, name, updated_at: new Date().toISOString() }
          : p,
      ),
    );
    setProjectNameDialogOpen(false);
    setProjectNameDialogMode("create");
  }, [currentProjectId, newProjectName]);

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
    setEditorSaveStatus("saving");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("blocks", JSON.stringify([]));
    const result = await saveProjectAction(null, formData);
    if (result.error || result.projectId == null) {
      setEditorSaveStatus("error");
      setDeleteError(result.error ?? "Не удалось создать проект");
      return;
    }
    const id = String(result.projectId);
    setCurrentProjectId(id);
    setProjectsList((prev) => [
      { id, name, updated_at: new Date().toISOString() },
      ...prev.filter((p) => String(p.id) !== id),
    ]);
    setEditorSaveStatus("saved");
    setProjectNameDialogOpen(false);
  }, [newProjectName]);

  const handleSaveClick = useCallback(async () => {
    setEditorSaveStatus("saving");
    const formData = new FormData();
    formData.set("name", projectNameForSave());
    formData.set("blocks", JSON.stringify(latestBlocksRef.current));
    if (currentProjectId) formData.set("projectId", String(currentProjectId));
    const result = await saveProjectAction(null, formData);
    if (result.error || result.projectId == null) {
      setEditorSaveStatus("error");
      setDeleteError(result.error ?? "Ошибка при сохранении проекта");
      return;
    }
    const savedId = String(result.projectId);
    lastSavedSignatureRef.current = latestSignatureRef.current;
    setEditorSaveStatus("saved");
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
    setEditorSaveStatus("saved");
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

  const handleExportClick = useCallback(() => {
    setExportModalOpen(true);
  }, []);

  const applyProjectTemplate = useCallback(
    async (projectName: string, templatePuckData: Data) => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }

      if (currentProjectId) {
        setEditorSaveStatus("saving");
        const formData = new FormData();
        formData.set("name", projectNameForSave());
        formData.set("blocks", JSON.stringify(latestBlocksRef.current));
        formData.set("projectId", String(currentProjectId));
        const saveResult = await saveProjectAction(null, formData);
        if (saveResult.error) {
          setEditorSaveStatus("error");
          setDeleteError(saveResult.error);
          return;
        }
        lastSavedSignatureRef.current = latestSignatureRef.current;
        setProjectsList((prev) =>
          prev.map((p) =>
            String(p.id) === String(currentProjectId)
              ? { ...p, updated_at: new Date().toISOString() }
              : p,
          ),
        );
        setDeleteError(null);
      }

      const data = normalizePuckData(
        JSON.parse(JSON.stringify(templatePuckData)) as Data,
      );
      const blocks = puckDataToCanvasBlocks(data);
      const signature = JSON.stringify(blocks);

      setEditorSaveStatus("saving");
      const createFd = new FormData();
      createFd.set("name", projectName);
      createFd.set("blocks", JSON.stringify(blocks));
      const createResult = await saveProjectAction(null, createFd);
      if (createResult.error || createResult.projectId == null) {
        setEditorSaveStatus("error");
        setDeleteError(createResult.error ?? "Не удалось создать проект из шаблона");
        return;
      }

      const newId = String(createResult.projectId);
      setPuckData(data);
      latestBlocksRef.current = blocks;
      latestSignatureRef.current = signature;
      lastSavedSignatureRef.current = signature;
      setCanvasBlocks(blocks);
      setCurrentProjectId(newId);
      setCurrentProjectSpec(null);
      setProjectsList((prev) => [
        { id: newId, name: projectName, updated_at: new Date().toISOString() },
        ...prev.filter((p) => String(p.id) !== newId),
      ]);
      setPuckHydrationKey((k) => k + 1);
      setEditorSaveStatus("saved");
    },
    [currentProjectId, projectNameForSave],
  );

  const handleApplySaaSTemplate = useCallback(async () => {
    await applyProjectTemplate(SAAS_TEMPLATE_PROJECT_NAME, SAAS_UNIVERSAL_PUCK_DATA);
  }, [applyProjectTemplate]);

  const handleApplyEventConferenceTemplate = useCallback(async () => {
    await applyProjectTemplate(
      EVENT_CONFERENCE_TEMPLATE_PROJECT_NAME,
      EVENT_CONFERENCE_PUCK_DATA,
    );
  }, [applyProjectTemplate]);

  const handleApplyPortfolioServicesTemplate = useCallback(async () => {
    await applyProjectTemplate(PORTFOLIO_SERVICES_TEMPLATE_PROJECT_NAME, STUDIO_BRAND_PUCK_DATA);
  }, [applyProjectTemplate]);

  const dashboardOverrides = useMemo(
    () => ({
      ...puckOverrides,
      header: () => <DashboardPuckHeader />,
      puck: ({ children }: { children?: React.ReactNode }) => (
        <div className="flex h-full min-h-0 w-full">
          <LeftSidebar
            isLeftSidebarOpen={isLeftSidebarOpen}
            avatarUrl={avatarUrl}
            userName={userName}
            userEmail={userEmail}
            projectsList={projectsList}
            currentProjectId={currentProjectId}
            handleSelectProject={handleSelectProject}
            openNewProjectDialog={openNewProjectDialog}
            openRenameProjectDialog={openRenameProjectDialog}
            handleSaveClick={handleSaveClick}
            handleDeleteProject={handleDeleteProject}
            deleteError={deleteError}
            setFeedbackModalOpen={setFeedbackModalOpen}
            logoutFormRef={logoutFormRef}
            handleLogout={handleLogout}
            onExportClick={handleExportClick}
            onApplySaaSTemplate={handleApplySaaSTemplate}
            onApplyEventConferenceTemplate={handleApplyEventConferenceTemplate}
            onApplyPortfolioServicesTemplate={handleApplyPortfolioServicesTemplate}
            blockLibrary={<Puck.Components />}
          />
          <PuckSelectionShell>{children}</PuckSelectionShell>
        </div>
      ),
    }),
    [
      avatarUrl,
      currentProjectId,
      deleteError,
      handleApplyEventConferenceTemplate,
      handleApplyPortfolioServicesTemplate,
      handleApplySaaSTemplate,
      handleDeleteProject,
      handleLogout,
      handleExportClick,
      handleSaveClick,
      handleSelectProject,
      isLeftSidebarOpen,
      openNewProjectDialog,
      openRenameProjectDialog,
      projectsList,
      projectNameForSave,
      userEmail,
      userName,
    ],
  );

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
    <>
      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
        <a
          href="#main-editor"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          К редактору
        </a>
        <button
          type="button"
          onClick={() => setIsLeftSidebarOpen((v) => !v)}
          className="fixed left-4 top-4 z-50 rounded-md border border-border bg-background p-2 text-foreground shadow-sm md:hidden"
          aria-label="Toggle sidebar"
          aria-expanded={isLeftSidebarOpen}
        >
          {isLeftSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {isLeftSidebarOpen && (
          <div
            role="presentation"
            aria-hidden="true"
            className="fixed inset-0 z-[35] bg-background/80 md:hidden"
            onClick={() => setIsLeftSidebarOpen(false)}
          />
        )}

        {isInitialHydrationDone ? (
          <Puck
            key={puckHydrationKey}
            config={puckConfig}
            data={puckData}
            onChange={handlePuckChange}
            overrides={dashboardOverrides}
            ui={PUCK_DASHBOARD_UI}
            plugins={PUCK_HIDE_SIDE_NAV_PLUGINS}
            height="100%"
            headerTitle={projectNameForSave()}
          />
        ) : (
          <div className="h-full w-full bg-background" aria-hidden="true">
            <div className="mx-auto flex h-full w-full max-w-6xl items-stretch gap-5 px-6 py-6">
              <div className="hidden w-72 shrink-0 md:block">
                <div className="h-full rounded-xl border border-border/60 bg-muted/[0.12] p-4">
                  <div className="mb-5 h-5 w-24 animate-pulse rounded bg-muted/50" />
                  <div className="space-y-2.5">
                    <div className="h-9 w-full animate-pulse rounded-md bg-muted/45" />
                    <div className="h-9 w-full animate-pulse rounded-md bg-muted/45" />
                    <div className="h-9 w-5/6 animate-pulse rounded-md bg-muted/45" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-background p-6">
                <div className="space-y-3.5">
                  <div className="h-7 w-44 animate-pulse rounded-md bg-muted/45" />
                  <div className="h-24 w-full animate-pulse rounded-lg bg-muted/40" />
                  <div className="h-14 w-3/4 animate-pulse rounded-lg bg-muted/40" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={projectNameDialogOpen} onOpenChange={onProjectNameDialogOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>
              {projectNameDialogMode === "rename" ? "Переименовать проект" : "Создать проект"}
            </DialogTitle>
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
            <Button type="button" variant="outline" onClick={() => onProjectNameDialogOpenChange(false)}>
              Отмена
            </Button>
            <Button
              type="button"
              onClick={
                projectNameDialogMode === "rename" ? handleRenameProject : handleCreateNewProject
              }
            >
              {projectNameDialogMode === "rename" ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
}

