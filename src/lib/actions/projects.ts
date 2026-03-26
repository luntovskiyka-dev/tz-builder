"use server";

import { createServerClient } from "@/lib/supabase/server";

/**
 * Expected Supabase table "projects":
 * - id: uuid, primary key, default gen_random_uuid()
 * - user_id: uuid, references auth.users(id), not null
 * - name: text, not null, default 'Без названия'
 * - blocks: jsonb, default '[]'
 * - spec: text, nullable (markdown string with generated TZ)
 * - created_at: timestamptz, default now()
 * - updated_at: timestamptz, default now()
 * Enable RLS and add policy: users can only access their own rows (user_id = auth.uid()).
 */

export type ProjectListItem = {
  id: string;
  name: string;
  updated_at: string;
};

export type SaveProjectResult = {
  projectId?: string;
  error?: string;
};

export type LoadProjectResult = {
  blocks?: unknown;
  spec?: string | null;
  schemaVersion?: number;
  error?: string;
};

export type LoadProjectsResult = {
  projects?: ProjectListItem[];
  error?: string;
};

export type DeleteProjectResult = {
  error?: string;
};

/**
 * Saves a project. If projectId is provided, updates it; otherwise creates a new project.
 * FormData should contain: blocks (JSON string), optional projectId, optional name.
 */
export async function saveProjectAction(
  prevState: SaveProjectResult | null,
  formData: FormData,
): Promise<SaveProjectResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Войдите в аккаунт, чтобы сохранить проект" };
    }

    const blocksRaw = formData.get("blocks") as string | null;
    const projectId = (formData.get("projectId") as string)?.trim() || null;
    const name = (formData.get("name") as string)?.trim() || "Без названия";

    let blocks: unknown[] = [];
    if (blocksRaw) {
      try {
        const parsed = JSON.parse(blocksRaw) as unknown;
        blocks = Array.isArray(parsed) ? parsed : [];
      } catch {
        return { error: "Неверный формат данных блоков" };
      }
    }

    if (projectId) {
      const { error } = await supabase
        .from("projects")
        .update({
          blocks,
          name: name || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .eq("user_id", user.id);

      if (error) {
        console.error("saveProjectAction update error:", error);
        return { error: error.message };
      }
      return { projectId };
    }

    const { data: inserted, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        blocks,
      })
      .select("id")
      .single();

    if (error) {
      console.error("saveProjectAction insert error:", error);
      return { error: error.message };
    }
    if (!inserted?.id) {
      return { error: "Не удалось создать проект" };
    }
    return { projectId: inserted.id };
  } catch (err) {
    console.error("saveProjectAction:", err);
    return {
      error: err instanceof Error ? err.message : "Ошибка при сохранении проекта",
    };
  }
}

/**
 * Returns the list of the current user's projects (id, name, updated_at).
 */
export async function loadProjectsAction(): Promise<LoadProjectsResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Войдите в аккаунт, чтобы загрузить проекты" };
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("loadProjectsAction:", error);
      return { error: error.message };
    }
    return {
      projects: (data ?? []).map((row) => ({
        id: row.id,
        name: row.name ?? "Без названия",
        updated_at: row.updated_at ?? new Date().toISOString(),
      })),
    };
  } catch (err) {
    console.error("loadProjectsAction:", err);
    return {
      error: err instanceof Error ? err.message : "Ошибка при загрузке проектов",
    };
  }
}

/**
 * Loads a single project's blocks by id. Verifies the project belongs to the current user.
 */
export async function loadProjectAction(
  projectId: string,
): Promise<LoadProjectResult> {
  try {
    if (!projectId) {
      return { error: "Укажите идентификатор проекта" };
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Войдите в аккаунт, чтобы загрузить проект" };
    }

    const { data, error } = await supabase
      .from("projects")
      .select("blocks, spec")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      // Backward compatibility:
      // If DB schema isn't updated yet (column `spec` missing) or RLS denies `spec`,
      // we still want to load `blocks` so user doesn't lose their project.
      console.warn("loadProjectAction (blocks,spec) fallback:", error);

      const { data: blocksData, error: blocksError } = await supabase
        .from("projects")
        .select("blocks")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (blocksError) {
        console.error("loadProjectAction (blocks) error:", blocksError);
        return { error: blocksError.message };
      }

      return {
        blocks: Array.isArray(blocksData?.blocks) ? blocksData.blocks : [],
        spec: null,
        schemaVersion: 0,
      };
    }

    if (!data) {
      return { error: "Проект не найден" };
    }
    return {
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      spec: (data.spec as string | null) ?? null,
      schemaVersion: 0,
    };
  } catch (err) {
    console.error("loadProjectAction:", err);
    return {
      error: err instanceof Error ? err.message : "Ошибка при загрузке проекта",
    };
  }
}

export type SaveProjectSpecResult = {
  error?: string;
};

/**
 * Saves generated spec (markdown) for a project.
 * Does NOT touch `blocks` to avoid conflicts with debounced auto-save.
 */
export async function saveProjectSpecAction(
  projectId: string,
  spec: string,
): Promise<SaveProjectSpecResult> {
  try {
    if (!projectId) {
      return { error: "Укажите идентификатор проекта" };
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Войдите в аккаунт, чтобы сохранить ТЗ" };
    }

    const trimmed = spec?.trim() ?? "";

    const { error } = await supabase
      .from("projects")
      .update({
        spec: trimmed || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("saveProjectSpecAction update error:", error);
      return { error: error.message };
    }

    return {};
  } catch (err) {
    console.error("saveProjectSpecAction:", err);
    return {
      error: err instanceof Error ? err.message : "Ошибка при сохранении ТЗ",
    };
  }
}

/**
 * Deletes a project. Verifies the project belongs to the current user.
 */
export async function deleteProjectAction(
  projectId: string,
): Promise<DeleteProjectResult> {
  try {
    if (!projectId) {
      return { error: "Укажите идентификатор проекта" };
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Войдите в аккаунт, чтобы удалить проект" };
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) {
      console.error("deleteProjectAction:", error);
      return { error: error.message };
    }
    return {};
  } catch (err) {
    console.error("deleteProjectAction:", err);
    return {
      error: err instanceof Error ? err.message : "Ошибка при удалении проекта",
    };
  }
}
