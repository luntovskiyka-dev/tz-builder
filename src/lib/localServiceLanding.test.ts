import { describe, expect, it } from "vitest";
import { LOCAL_SERVICE_LANDING_BLOCKS, LOCAL_SERVICE_PUCK_DATA } from "@/lib/localServiceLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("localServiceLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = LOCAL_SERVICE_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(LOCAL_SERVICE_PUCK_DATA);
    expect(back.length).toBe(LOCAL_SERVICE_LANDING_BLOCKS.length);

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(LOCAL_SERVICE_PUCK_DATA.content?.length);
  });
});
