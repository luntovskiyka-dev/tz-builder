export const STORAGE_KEY = "protospec-project";

export const initialProject = {
  version: "1.0",
  updatedAt: null,
  blocks: [],
};

export function saveProjectToStorage(blocks) {
  if (typeof window === "undefined") return true;

  try {
    const payload = {
      ...initialProject,
      blocks,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Failed to save project to localStorage", error);
    return false;
  }
}

export function loadProjectFromStorage() {
  if (typeof window === "undefined") return initialProject;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProject;

    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.blocks)) {
      return initialProject;
    }

    return {
      version:
        typeof parsed.version === "string"
          ? parsed.version
          : initialProject.version,
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      blocks: parsed.blocks,
    };
  } catch (error) {
    console.error("Failed to load project from localStorage", error);
    return initialProject;
  }
}

export function clearProjectFromStorage() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear project from localStorage", error);
  }
}

