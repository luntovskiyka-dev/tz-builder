import { describe, expect, it } from "vitest";
import { REAL_ESTATE_LANDING_BLOCKS, REAL_ESTATE_PUCK_DATA } from "@/lib/realEstateLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("realEstateLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = REAL_ESTATE_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(REAL_ESTATE_PUCK_DATA);
    expect(back.length).toBe(REAL_ESTATE_LANDING_BLOCKS.length);

    const byId = Object.fromEntries(back.map((b) => [b.id, b]));
    expect(byId["re-t-location-slot"]?.props.__zone).toBe("image.content");

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(REAL_ESTATE_PUCK_DATA.content?.length);
  });
});
