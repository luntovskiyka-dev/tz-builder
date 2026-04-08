import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("разрешает запросы в пределах лимита", () => {
    const key = `test-allow-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      const result = rateLimit(key, 3, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3 - i - 1);
    }
  });

  it("блокирует запрос сверх лимита", () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60_000);
    }
    const result = rateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("разные ключи не влияют друг на друга", () => {
    const key1 = `test-iso-a-${Date.now()}`;
    const key2 = `test-iso-b-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(key1, 3, 60_000);
    }
    const result = rateLimit(key2, 3, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("разрешает после истечения окна", () => {
    const key = `test-expire-${Date.now()}`;
    // Окно в 1мс — мгновенно истечёт
    rateLimit(key, 1, 1);
    // Ждём 5мс
    const start = Date.now();
    while (Date.now() - start < 5) { /* busy wait */ }
    const result = rateLimit(key, 1, 1);
    expect(result.allowed).toBe(true);
  });

  it("retryAfterMs > 0 при блокировке", () => {
    const key = `test-retry-${Date.now()}`;
    rateLimit(key, 1, 10_000);
    const result = rateLimit(key, 1, 10_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(10_000);
  });
});
