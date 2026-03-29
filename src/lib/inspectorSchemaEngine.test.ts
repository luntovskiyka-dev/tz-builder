import { describe, expect, it } from "vitest";
import { getBlockInspectorSchema } from "@/lib/puckBlocks";
import {
  applyVariantPresets,
  getListAppendItem,
  isFieldVisible,
} from "@/lib/inspectorSchemaEngine";

describe("inspector schema engine", () => {
  it("respects visibleWhen for conditional fields", () => {
    const schema = getBlockInspectorSchema("columns");
    const titleField = schema?.fields.find((f) => f.key === "column3Title");
    expect(titleField).toBeTruthy();
    expect(isFieldVisible(titleField!, { variant: "3" })).toBe(true);
    expect(isFieldVisible(titleField!, { variant: "2" })).toBe(false);
  });

  it("respects visibilityKey hide/show toggles", () => {
    const schema = getBlockInspectorSchema("heading");
    const titleField = schema?.fields.find((f) => f.key === "text");
    expect(titleField).toBeTruthy();
    expect(isFieldVisible(titleField!, { showText: true })).toBe(true);
    expect(isFieldVisible(titleField!, { showText: false })).toBe(false);
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

