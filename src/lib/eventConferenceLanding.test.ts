import { describe, expect, it } from "vitest";
import { EVENT_CONFERENCE_LANDING_BLOCKS, EVENT_CONFERENCE_PUCK_DATA } from "@/lib/eventConferenceLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("eventConferenceLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = EVENT_CONFERENCE_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(EVENT_CONFERENCE_PUCK_DATA);
    expect(back.length).toBe(EVENT_CONFERENCE_LANDING_BLOCKS.length);

    const byId = Object.fromEntries(back.map((b) => [b.id, b]));
    expect(byId["ev-t-venue-slot"]?.props.__zone).toBe("image.content");

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(EVENT_CONFERENCE_PUCK_DATA.content?.length);
  });
});
