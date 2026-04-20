import { describe, expect, it } from "vitest";
import {
  MEDICAL_WELLNESS_LANDING_BLOCKS,
  MEDICAL_WELLNESS_PUCK_DATA,
} from "@/lib/medicalWellnessLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("medicalWellnessLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = MEDICAL_WELLNESS_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(MEDICAL_WELLNESS_PUCK_DATA);
    expect(back.length).toBe(MEDICAL_WELLNESS_LANDING_BLOCKS.length);

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(MEDICAL_WELLNESS_PUCK_DATA.content?.length);
  });
});
