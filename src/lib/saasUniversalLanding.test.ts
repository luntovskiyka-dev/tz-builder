import { describe, expect, it } from "vitest";
import { SAAS_UNIVERSAL_LANDING_BLOCKS, SAAS_UNIVERSAL_PUCK_DATA } from "@/lib/saasUniversalLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("saasUniversalLanding", () => {
  it("round-trips puck data", () => {
    const back = puckDataToCanvasBlocks(SAAS_UNIVERSAL_PUCK_DATA);
    expect(back.length).toBe(SAAS_UNIVERSAL_LANDING_BLOCKS.length);
    const byId = Object.fromEntries(back.map((b) => [b.id, b]));
    expect(byId["t-slot-1"]?.props.__parentId).toBe("hero-3");
    expect(byId["t-slot-1"]?.props.__zone).toBe("image.content");
    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(SAAS_UNIVERSAL_PUCK_DATA.content?.length);
  });

  it("exposes hero image slot zone", () => {
    const zones = SAAS_UNIVERSAL_PUCK_DATA.zones as Record<string, unknown>;
    expect(Array.isArray(zones["hero-3:image.content"])).toBe(true);
    expect((zones["hero-3:image.content"] as { id?: string }[])[0]?.id).toBe("t-slot-1");
  });
});
