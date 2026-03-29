"use client";

import React from "react";
import type { CanvasBlock } from "@/lib/blockTypes";
import { getBlockLabel } from "@/lib/puckBlocks";

function pickMainText(block: CanvasBlock): string {
  const p = block.props as Record<string, unknown>;
  if (typeof p.title === "string" && p.title) return p.title;
  if (typeof p.templateName === "string" && p.templateName) return p.templateName;
  if (typeof p.text === "string" && p.text) return p.text;
  if (typeof p.url === "string" && p.url) return p.url;
  if (typeof p.copyright === "string" && p.copyright) return p.copyright;
  return getBlockLabel(block.type);
}

function pickMeta(block: CanvasBlock): string | null {
  const p = block.props as Record<string, unknown>;
  if (block.type === "grid") return `${String(p.numColumns ?? 4)} колонки`;
  if (block.type === "stats" && Array.isArray(p.items)) return `${p.items.length} показателей`;
  return null;
}

export function BlockPreview({ block }: { block: CanvasBlock }) {
  const main = pickMainText(block);
  const meta = pickMeta(block);

  return (
    <div className="flex h-full min-h-0 flex-col justify-center px-3 text-xs">
      <div className="truncate text-[12px] font-medium text-gray-800">{main}</div>
      {meta && <div className="mt-1 truncate text-[10px] text-gray-500">{meta}</div>}
    </div>
  );
}

