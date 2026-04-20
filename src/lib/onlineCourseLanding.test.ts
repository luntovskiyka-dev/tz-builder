import { describe, expect, it } from "vitest";
import { ONLINE_COURSE_LANDING_BLOCKS, ONLINE_COURSE_PUCK_DATA } from "@/lib/onlineCourseLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("onlineCourseLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = ONLINE_COURSE_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(ONLINE_COURSE_PUCK_DATA);
    expect(back.length).toBe(ONLINE_COURSE_LANDING_BLOCKS.length);

    const byId = Object.fromEntries(back.map((b) => [b.id, b]));
    expect(byId["oc-t-webinar-slot"]?.props.__zone).toBe("image.content");

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(ONLINE_COURSE_PUCK_DATA.content?.length);
  });
});
