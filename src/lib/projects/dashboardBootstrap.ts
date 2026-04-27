import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectListItem } from "@/lib/actions/projects";
import { normalizeBlocksFromDb } from "@/lib/projects/normalizeBlocksFromDb";
import { coerceProjectIdForFilter } from "@/lib/projects/projectId";

/**
 * List + first project (by updated_at) for the dashboard, avoiding a client
 * waterfall: loadProjects → loadProject (and duplicate calls in dev Strict Mode).
 */
export type DashboardProjectBootstrap = {
  projects: ProjectListItem[];
  activeProject: {
    id: string;
    blocks: unknown[];
    spec: string | null;
  } | null;
};

export async function getDashboardProjectBootstrap(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardProjectBootstrap> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getDashboardProjectBootstrap (list):", error);
    return { projects: [], activeProject: null };
  }

  const projects: ProjectListItem[] = (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name ?? "Без названия",
    updated_at: row.updated_at ?? new Date().toISOString(),
  }));

  if (projects.length === 0) {
    return { projects, activeProject: null };
  }

  const firstId = projects[0].id;
  const idFilter = coerceProjectIdForFilter(firstId);

  const { data: row, error: rowError } = await supabase
    .from("projects")
    .select("blocks, spec")
    .eq("id", idFilter)
    .eq("user_id", userId)
    .single();

  if (rowError) {
    console.warn("getDashboardProjectBootstrap (blocks,spec) fallback:", rowError);

    const { data: blocksData, error: blocksError } = await supabase
      .from("projects")
      .select("blocks")
      .eq("id", idFilter)
      .eq("user_id", userId)
      .single();

    if (blocksError) {
      console.error("getDashboardProjectBootstrap (blocks):", blocksError);
      return { projects, activeProject: null };
    }

    return {
      projects,
      activeProject: {
        id: firstId,
        blocks: normalizeBlocksFromDb(blocksData?.blocks),
        spec: null,
      },
    };
  }

  if (!row) {
    return { projects, activeProject: null };
  }

  return {
    projects,
    activeProject: {
      id: firstId,
      blocks: normalizeBlocksFromDb(row.blocks),
      spec: (row.spec as string | null) ?? null,
    },
  };
}
