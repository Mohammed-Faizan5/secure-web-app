import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => {
  const savedUser = {
    id: 9,
    openId: "oauth-user",
    name: "OAuth User",
    email: "oauth@example.com",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const insert = vi.fn()
    .mockImplementationOnce(() => ({
      values: vi.fn(() => ({ onDuplicateKeyUpdate: vi.fn().mockResolvedValue(undefined) })),
    }))
    .mockImplementationOnce(() => ({ values: vi.fn().mockResolvedValue(undefined) }));
  const db = {
    insert,
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([savedUser]) })),
      })),
    })),
  };
  return { db, insert, savedUser };
});

vi.mock("drizzle-orm/mysql2", () => ({ drizzle: vi.fn(() => dbMocks.db) }));

import { upsertUser } from "./db";

describe("OAuth login audit", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "mysql://test";
  });

  it("records a login event after the OAuth user is upserted", async () => {
    await upsertUser({ openId: "oauth-user", name: "OAuth User", email: "oauth@example.com", loginMethod: "manus" });
    expect(dbMocks.insert).toHaveBeenCalledTimes(2);
    expect(dbMocks.insert.mock.results[1]?.value.values).toHaveBeenCalledWith(expect.objectContaining({
      actorUserId: 9,
      eventType: "login",
      metadata: JSON.stringify({ loginMethod: "manus" }),
    }));
  });
});
