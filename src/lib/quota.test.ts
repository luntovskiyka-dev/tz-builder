import { describe, it, expect, vi } from "vitest";
import { shouldBlockOnQuotaError } from "./quota";

describe("shouldBlockOnQuotaError", () => {
  it("возвращает blocked: true при ошибке с message", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = shouldBlockOnQuotaError({ message: "relation does not exist" });

    expect(result.blocked).toBe(true);
    expect(result.status).toBe(503);
    expect(result.message).toContain("недоступен");
    consoleSpy.mockRestore();
  });

  it("возвращает blocked: true при строковой ошибке", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = shouldBlockOnQuotaError("timeout");

    expect(result.blocked).toBe(true);
    expect(result.status).toBe(503);
    consoleSpy.mockRestore();
  });

  it("возвращает blocked: true при null", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = shouldBlockOnQuotaError(null);

    expect(result.blocked).toBe(true);
    expect(result.status).toBe(503);
    consoleSpy.mockRestore();
  });

  it("возвращает blocked: true при undefined", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = shouldBlockOnQuotaError(undefined);

    expect(result.blocked).toBe(true);
    expect(result.status).toBe(503);
    consoleSpy.mockRestore();
  });

  it("возвращает blocked: true при сложном объекте ошибки Supabase", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = shouldBlockOnQuotaError({
      message: "Could not find the function public.try_consume_spec_generation",
      details: null,
      hint: null,
      code: "PGRST202",
    });

    expect(result.blocked).toBe(true);
    expect(result.status).toBe(503);
    consoleSpy.mockRestore();
  });

  it("никогда не возвращает blocked: false (fail-closed policy)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const testCases = [
      null,
      undefined,
      "",
      "error",
      { message: "any error" },
      new Error("something"),
      { code: "42P01" },
      0,
    ];

    for (const err of testCases) {
      const result = shouldBlockOnQuotaError(err);
      expect(result.blocked).toBe(true);
    }
    consoleSpy.mockRestore();
  });

  it("логирует ошибку в console.error", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    shouldBlockOnQuotaError({ message: "test error" });

    expect(consoleSpy).toHaveBeenCalledWith("Quota RPC failed:", "test error");
    consoleSpy.mockRestore();
  });
});
