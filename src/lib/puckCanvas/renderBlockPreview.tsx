import type { ReactNode } from "react";
import { getBlockLabel } from "@/lib/puckBlocks";
import type { PuckSlotComponent } from "@/lib/puckCanvas/dropZone";
import { renderTextSummary } from "@/lib/puckCanvas/utils";
import { renderFooterBlock, renderHeaderBlock } from "@/lib/puckCanvas/blocks/chrome";
import {
  renderCardBlock,
  renderHeroBlock,
  renderLogosBlock,
  renderStatsBlock,
  renderTemplateBlock,
} from "@/lib/puckCanvas/blocks/content";
import { renderFlexBlock, renderGridBlock, renderSpaceBlock } from "@/lib/puckCanvas/blocks/layout";
import {
  renderButtonBlock,
  renderHeadingBlock,
  renderRichTextBlock,
  renderTextBlock,
} from "@/lib/puckCanvas/blocks/typography";

function asPuckSlot(value: unknown): PuckSlotComponent | undefined {
  return typeof value === "function" ? (value as PuckSlotComponent) : undefined;
}

export function renderBlockPreview(typeId: string, props: Record<string, unknown>): ReactNode {
  if (typeId === "heading") {
    return renderHeadingBlock(props);
  }

  if (typeId === "text") {
    return renderTextBlock(props);
  }

  if (typeId === "richtext") {
    return renderRichTextBlock(props);
  }

  if (typeId === "button") {
    return renderButtonBlock(props);
  }

  if (typeId === "hero") {
    return renderHeroBlock(props);
  }

  if (typeId === "flex") {
    return renderFlexBlock(props, asPuckSlot(props.children));
  }

  if (typeId === "grid") {
    return renderGridBlock(props, asPuckSlot(props.items));
  }

  if (typeId === "logos") {
    return renderLogosBlock(props);
  }

  if (typeId === "stats") {
    return renderStatsBlock(props);
  }

  if (typeId === "card") {
    return renderCardBlock(props);
  }

  if (typeId === "template") {
    return renderTemplateBlock(props, asPuckSlot(props.children));
  }

  if (typeId === "header") {
    return renderHeaderBlock(props);
  }

  if (typeId === "footer") {
    return renderFooterBlock(props);
  }

  if (typeId === "space") {
    return renderSpaceBlock(props);
  }

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-foreground">{getBlockLabel(typeId)}</div>
      <div className="text-[11px] text-muted-foreground line-clamp-2">{renderTextSummary(props)}</div>
    </div>
  );
}
