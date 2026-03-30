import { useSyncExternalStore } from "react";
import type { SavedStatus } from "@/components/dashboard/useCloudProjectSave";

/**
 * UI-only state for the editor chrome (save indicator, projects loading).
 * Lives outside React state so updating it does not re-render {@link DashboardLayout}
 * or remount Puck — avoids canvas flicker on autosave and loading toggles.
 */

let saveStatus: SavedStatus = "saved";
const saveListeners = new Set<() => void>();

export function getEditorSaveStatus(): SavedStatus {
  return saveStatus;
}

export function setEditorSaveStatus(next: SavedStatus): void {
  if (saveStatus === next) return;
  saveStatus = next;
  saveListeners.forEach((l) => l());
}

function subscribeEditorSaveStatus(onStoreChange: () => void): () => void {
  saveListeners.add(onStoreChange);
  return () => saveListeners.delete(onStoreChange);
}

export function useEditorSaveStatus(): SavedStatus {
  return useSyncExternalStore(subscribeEditorSaveStatus, getEditorSaveStatus, getEditorSaveStatus);
}

let projectsLoading = true;
const projectsLoadingListeners = new Set<() => void>();

export function getEditorProjectsLoading(): boolean {
  return projectsLoading;
}

export function setEditorProjectsLoading(next: boolean): void {
  if (projectsLoading === next) return;
  projectsLoading = next;
  projectsLoadingListeners.forEach((l) => l());
}

function subscribeEditorProjectsLoading(onStoreChange: () => void): () => void {
  projectsLoadingListeners.add(onStoreChange);
  return () => projectsLoadingListeners.delete(onStoreChange);
}

export function useEditorProjectsLoading(): boolean {
  return useSyncExternalStore(
    subscribeEditorProjectsLoading,
    getEditorProjectsLoading,
    getEditorProjectsLoading,
  );
}
