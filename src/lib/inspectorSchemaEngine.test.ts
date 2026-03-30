import { describe, expect, it } from "vitest";
import type { InspectorFieldDefinition } from "@/lib/blockTypes";
import { getBlockInspectorSchema } from "@/lib/puckBlocks";
import {
  applyVariantPresets,
  getListAppendItem,
  isFieldVisible,
} from "@/lib/inspectorSchemaEngine";

describe("inspector schema engine", () => {
  it("respects visibleWhen for conditional fields", () => {
    const schema = getBlockInspectorSchema("hero");
    const imageField = schema?.fields.find((f) => f.key === "image");
    expect(imageField).toBeTruthy();
    expect(isFieldVisible(imageField!, { align: "left" })).toBe(true);
    expect(isFieldVisible(imageField!, { align: "center" })).toBe(false);
  });

  it("respects visibilityKey hide/show toggles", () => {
    const field: InspectorFieldDefinition = {
      key: "text",
      label: "Text",
      type: "textarea",
      visibilityKey: "showText",
    };
    expect(isFieldVisible(field, { showText: true })).toBe(true);
    expect(isFieldVisible(field, { showText: false })).toBe(false);
  });

  it("applies form variant presets", () => {
    const result = applyVariantPresets("form", "variant", "subscribe", { variant: "subscribe" });
    expect(result.title).toBe("Подписка");
    expect(result.buttonText).toBe("Подписаться");
    expect(result.fields).toEqual(["email"]);
  });

  it("applies cards and text variant presets", () => {
    const cards = applyVariantPresets("cards", "variant", "team", { variant: "team" });
    expect(cards.sectionTitle).toBe("Команда");

    const text = applyVariantPresets("text", "variant", "two-columns", { variant: "two-columns" });
    expect(text.column1Title).toBe("Колонка 1");
    expect(text.column2Text).toBe("Текст...");
  });

  it("returns correct append items for list field types", () => {
    expect(getListAppendItem("string-list")).toBe("");
    expect(getListAppendItem("button-list")).toEqual({ text: "", url: "" });
    expect(getListAppendItem("stats-list")).toEqual({ title: "", description: "" });
  });
});

