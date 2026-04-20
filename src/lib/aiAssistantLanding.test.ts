import { describe, expect, it } from "vitest";
import { AI_ASSISTANT_LANDING_BLOCKS, AI_ASSISTANT_PUCK_DATA } from "@/lib/aiAssistantLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("aiAssistantLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = AI_ASSISTANT_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(AI_ASSISTANT_PUCK_DATA);
    expect(back.length).toBe(AI_ASSISTANT_LANDING_BLOCKS.length);

    const byId = Object.fromEntries(back.map((b) => [b.id, b]));
    expect(byId["ai-t-demo-slot"]?.props.__zone).toBe("image.content");

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(AI_ASSISTANT_PUCK_DATA.content?.length);
  });
});
