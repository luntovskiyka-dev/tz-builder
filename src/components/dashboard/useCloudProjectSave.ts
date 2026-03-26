import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { saveProjectAction, type ProjectListItem } from "@/lib/actions/projects";
import { clearProjectFromStorage } from "@/utils/storage";
import type { CanvasBlock } from "@/lib/blockTypes";

export type SavedStatus = "saved" | "saving" | "error";
type ProjectDialogMode = "new" | "rename" | null;

type UseCloudProjectSaveParams = {
  canvasBlocks: CanvasBlock[];
  currentProjectId: string | null;
  projectsList: ProjectListItem[];
  newProjectName: string;
  setCanvasBlocks: Dispatch<SetStateAction<CanvasBlock[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  setCurrentProjectId: Dispatch<SetStateAction<string | null>>;
  setCurrentProjectSpec: Dispatch<SetStateAction<string | null>>;
  setProjectsList: Dispatch<SetStateAction<ProjectListItem[]>>;
  setCloudSaveStatus: Dispatch<SetStateAction<SavedStatus>>;
  setProjectNameDialogMode: Dispatch<SetStateAction<ProjectDialogMode>>;
  setNewProjectName: Dispatch<SetStateAction<string>>;
  requestLogoutSubmit: () => void;
};

export function useCloudProjectSave({
  canvasBlocks,
  currentProjectId,
  projectsList,
  newProjectName,
  setCanvasBlocks,
  setSelectedId,
  setCurrentProjectId,
  setCurrentProjectSpec,
  setProjectsList,
  setCloudSaveStatus,
  setProjectNameDialogMode,
  setNewProjectName,
  requestLogoutSubmit,
}: UseCloudProjectSaveParams) {
  const cloudSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueuedSignatureRef = useRef<string>("");
  const lastSavedSignatureRef = useRef<string>("");

  const cancelPendingSave = useCallback(() => {
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
      cloudSaveTimeoutRef.current = null;
    }
  }, []);

  const saveToCloud = useCallback(
    async (blocks: CanvasBlock[], projectId: string | null, name?: string) => {
      setCloudSaveStatus("saving");
      const formData = new FormData();
      formData.set("blocks", JSON.stringify(blocks));
      if (projectId) formData.set("projectId", projectId);
      formData.set("name", name?.trim() || "Без названия");
      const result = await saveProjectAction(null, formData);
      if (result.error) {
        setCloudSaveStatus("error");
        return result;
      }
      if (result.projectId && !projectId) {
        const projectName = name?.trim() || "Без названия";
        setCurrentProjectId(result.projectId);
        setProjectsList((prev) => [
          { id: result.projectId!, name: projectName, updated_at: new Date().toISOString() },
          ...prev,
        ]);
      }
      setCloudSaveStatus("saved");
      return result;
    },
    [setCloudSaveStatus, setCurrentProjectId, setProjectsList],
  );

  useEffect(() => {
    const signature = JSON.stringify(canvasBlocks);
    if (!lastQueuedSignatureRef.current) {
      lastQueuedSignatureRef.current = signature;
    }
    if (!lastSavedSignatureRef.current) {
      lastSavedSignatureRef.current = signature;
    }

    cancelPendingSave();
    if (!currentProjectId) return;
    if (signature === lastSavedSignatureRef.current) return;
    if (signature === lastQueuedSignatureRef.current) return;

    lastQueuedSignatureRef.current = signature;
    const currentName = projectsList.find((p) => p.id === currentProjectId)?.name;
    cloudSaveTimeoutRef.current = setTimeout(() => {
      cloudSaveTimeoutRef.current = null;
      saveToCloud(canvasBlocks, currentProjectId, currentName).then((result) => {
        if (!result?.error) {
          const savedSignature = JSON.stringify(canvasBlocks);
          lastSavedSignatureRef.current = savedSignature;
          lastQueuedSignatureRef.current = savedSignature;
        }
      });
    }, 2000);
    return cancelPendingSave;
  }, [canvasBlocks, currentProjectId, projectsList, saveToCloud, cancelPendingSave]);

  const handleSaveClick = useCallback(() => {
    cancelPendingSave();
    const currentName = currentProjectId
      ? projectsList.find((p) => p.id === currentProjectId)?.name ?? ""
      : "";
    if (currentProjectId && (!currentName.trim() || currentName === "Без названия")) {
      setNewProjectName(currentName || "Без названия");
      setProjectNameDialogMode("rename");
      return;
    }
    saveToCloud(canvasBlocks, currentProjectId, currentName.trim() || undefined);
  }, [
    cancelPendingSave,
    currentProjectId,
    projectsList,
    setNewProjectName,
    setProjectNameDialogMode,
    saveToCloud,
    canvasBlocks,
  ]);

  const handleCreateNewProject = useCallback(async () => {
    const name = newProjectName.trim() || "Без названия";
    setProjectNameDialogMode(null);
    setCanvasBlocks([]);
    setSelectedId(null);
    clearProjectFromStorage();
    setCurrentProjectSpec(null);
    setCloudSaveStatus("saving");
    const formData = new FormData();
    formData.set("blocks", JSON.stringify([]));
    formData.set("name", name);
    const result = await saveProjectAction(null, formData);
    if (result.projectId) {
      setCurrentProjectId(result.projectId);
      setProjectsList((prev) => [
        { id: result.projectId!, name, updated_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    setCloudSaveStatus("saved");
  }, [
    newProjectName,
    setProjectNameDialogMode,
    setCanvasBlocks,
    setSelectedId,
    setCurrentProjectSpec,
    setCloudSaveStatus,
    setCurrentProjectId,
    setProjectsList,
  ]);

  const handleSaveWithName = useCallback(async () => {
    if (!currentProjectId) return;
    const name = newProjectName.trim() || "Без названия";
    setProjectNameDialogMode(null);
    cancelPendingSave();
    const formData = new FormData();
    formData.set("blocks", JSON.stringify(canvasBlocks));
    formData.set("projectId", currentProjectId);
    formData.set("name", name);
    setCloudSaveStatus("saving");
    const result = await saveProjectAction(null, formData);
    if (result.error) {
      setCloudSaveStatus("error");
      return;
    }
    setCloudSaveStatus("saved");
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === currentProjectId ? { ...p, name, updated_at: new Date().toISOString() } : p,
      ),
    );
  }, [
    currentProjectId,
    newProjectName,
    setProjectNameDialogMode,
    cancelPendingSave,
    canvasBlocks,
    setCloudSaveStatus,
    setProjectsList,
  ]);

  const handleLogout = useCallback(async () => {
    cancelPendingSave();
    await saveToCloud(canvasBlocks, currentProjectId);
    requestLogoutSubmit();
  }, [cancelPendingSave, saveToCloud, canvasBlocks, currentProjectId, requestLogoutSubmit]);

  return {
    cancelPendingSave,
    saveToCloud,
    handleSaveClick,
    handleCreateNewProject,
    handleSaveWithName,
    handleLogout,
  };
}

