import { describe, expect, it } from "vitest";
import {
  ECOMMERCE_PRODUCT_LANDING_BLOCKS,
  ECOMMERCE_PRODUCT_PUCK_DATA,
} from "@/lib/ecommerceProductLanding";
import { canvasBlocksToPuckData, normalizePuckData, puckDataToCanvasBlocks } from "@/lib/puckEditor";

describe("ecommerceProductLanding", () => {
  it("round-trips puck data and has no template block", () => {
    const types = ECOMMERCE_PRODUCT_LANDING_BLOCKS.map((b) => b.type);
    expect(types.includes("template")).toBe(false);

    const back = puckDataToCanvasBlocks(ECOMMERCE_PRODUCT_PUCK_DATA);
    expect(back.length).toBe(ECOMMERCE_PRODUCT_LANDING_BLOCKS.length);

    const again = normalizePuckData(canvasBlocksToPuckData(back));
    expect(again.content?.length).toBe(ECOMMERCE_PRODUCT_PUCK_DATA.content?.length);
  });
});
