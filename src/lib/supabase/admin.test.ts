import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("createAdminClient", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("выбрасывает ошибку при отсутствии SUPABASE_SERVICE_ROLE_KEY", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { createAdminClient } = await import("./admin");
    expect(() => createAdminClient()).toThrowError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  });

  it("выбрасывает ошибку при отсутствии NEXT_PUBLIC_SUPABASE_URL", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

    const { createAdminClient } = await import("./admin");
    expect(() => createAdminClient()).toThrowError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  });

  it("выбрасывает ошибку при отсутствии обеих переменных", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { createAdminClient } = await import("./admin");
    expect(() => createAdminClient()).toThrowError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  });

  it("создаёт клиент при наличии обеих переменных", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key-1234567890";

    const { createAdminClient } = await import("./admin");
    const client = createAdminClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
    expect(typeof client.rpc).toBe("function");
  });

  it("возвращает один и тот же экземпляр (singleton)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key-1234567890";

    const { createAdminClient } = await import("./admin");
    const client1 = createAdminClient();
    const client2 = createAdminClient();
    expect(client1).toBe(client2);
  });
});
