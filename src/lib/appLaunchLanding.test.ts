import { describe, expect, it } from "vitest";
import { APP_LAUNCH_LANDING_BLOCKS, APP_LAUNCH_PUCK_DATA } from "@/lib/appLaunchLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("appLaunchLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = APP_LAUNCH_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(APP_LAUNCH_PUCK_DATA);
    expect(back.length).toBe(APP_LAUNCH_LANDING_BLOCKS.length);

    const byId = Object.fromEntries(back.map((b) => [b.id, b]));
    expect(byId["app-t-demo-slot"]?.props.__zone).toBe("image.content");

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(APP_LAUNCH_PUCK_DATA.content?.length);
  });
});
