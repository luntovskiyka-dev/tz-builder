import { describe, expect, it } from "vitest";
import { STUDIO_BRAND_LANDING_BLOCKS, STUDIO_BRAND_PUCK_DATA } from "@/lib/studioBrandLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("studioBrandLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = STUDIO_BRAND_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(STUDIO_BRAND_PUCK_DATA);
    expect(back.length).toBe(STUDIO_BRAND_LANDING_BLOCKS.length);

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(STUDIO_BRAND_PUCK_DATA.content?.length);
  });
});
