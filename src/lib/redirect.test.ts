import { describe, it, expect } from "vitest";
import { getSafeRedirectPath } from "./redirect";

describe("getSafeRedirectPath", () => {
  // --- Безопасные пути ---
  it("пропускает /dashboard", () => {
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
  });

  it("пропускает / (корень)", () => {
    expect(getSafeRedirectPath("/")).toBe("/");
  });

  it("пропускает /pricing?ref=upgrade", () => {
    expect(getSafeRedirectPath("/pricing?ref=upgrade")).toBe("/pricing?ref=upgrade");
  });

  it("пропускает /dashboard/settings", () => {
    expect(getSafeRedirectPath("/dashboard/settings")).toBe("/dashboard/settings");
  });

  // --- Open redirect атаки ---
  it("блокирует //evil.com (protocol-relative)", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/dashboard");
  });

  it("блокирует //evil.com/path", () => {
    expect(getSafeRedirectPath("//evil.com/path")).toBe("/dashboard");
  });

  it("блокирует https://evil.com", () => {
    expect(getSafeRedirectPath("https://evil.com")).toBe("/dashboard");
  });

  it("блокирует http://evil.com/callback", () => {
    expect(getSafeRedirectPath("http://evil.com/callback")).toBe("/dashboard");
  });

  it("блокирует javascript:alert(1)", () => {
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("блокирует пустую строку", () => {
    expect(getSafeRedirectPath("")).toBe("/dashboard");
  });

  it("блокирует null", () => {
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
  });

  it("блокирует undefined", () => {
    expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
  });

  it("блокирует строку без /", () => {
    expect(getSafeRedirectPath("evil.com")).toBe("/dashboard");
  });

  it("блокирует /\\evil.com (backslash trick)", () => {
    expect(getSafeRedirectPath("/\\evil.com")).toBe("/dashboard");
  });

  // --- Хитрые обходы ---
  it("блокирует /%2f/evil.com (encoded slash)", () => {
    const result = getSafeRedirectPath("/%2f/evil.com");
    expect(result).toBe("/dashboard");
  });

  it("блокирует ///evil.com (triple slash)", () => {
    expect(getSafeRedirectPath("///evil.com")).toBe("/dashboard");
  });

  it("убирает fragment из пути", () => {
    const result = getSafeRedirectPath("/dashboard#section");
    expect(result).toBe("/dashboard");
  });
});
