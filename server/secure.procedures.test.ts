import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  createNote: vi.fn(),
  deleteNoteOwned: vi.fn(),
  getAllUsers: vi.fn(),
  getAuditLogs: vi.fn(),
  getNoteByIdOwned: vi.fn(),
  getNotesByUserId: vi.fn().mockResolvedValue([]),
  updateNoteOwned: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const regularUser = {
  id: 42,
  openId: "regular-user",
  email: "user@example.com",
  name: "Regular User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const adminUser = { ...regularUser, id: 1, openId: "admin-user", role: "admin" as const };

function context(user: typeof regularUser | typeof adminUser | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("secure procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes the notes list to the authenticated user", async () => {
    await appRouter.createCaller(context(regularUser)).notes.list();
    expect(dbMocks.getNotesByUserId).toHaveBeenCalledWith(42);
  });

  it("rejects malformed note input before persistence", async () => {
    await expect(appRouter.createCaller(context(regularUser)).notes.create({ title: "", content: "secret" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.createNote).not.toHaveBeenCalled();
  });

  it("creates a note and records its audit event", async () => {
    const note = { id: 7, userId: 42, title: "Private", content: "Protected content", createdAt: new Date(), updatedAt: new Date() };
    dbMocks.createNote.mockResolvedValueOnce(note);
    const result = await appRouter.createCaller(context(regularUser)).notes.create({ title: " Private ", content: " Protected content " });
    expect(result).toEqual(note);
    expect(dbMocks.createNote).toHaveBeenCalledWith({ userId: 42, title: "Private", content: "Protected content" });
    expect(dbMocks.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ actorUserId: 42, eventType: "note_created", targetId: "7" }));
  });

  it("updates an owned note and records its audit event", async () => {
    dbMocks.getNoteByIdOwned.mockResolvedValueOnce({ id: 7, userId: 42 });
    const updated = { id: 7, userId: 42, title: "Updated", content: "Changed" };
    dbMocks.updateNoteOwned.mockResolvedValueOnce(updated);
    const result = await appRouter.createCaller(context(regularUser)).notes.update({ id: 7, title: "Updated", content: "Changed" });
    expect(result).toEqual(updated);
    expect(dbMocks.updateNoteOwned).toHaveBeenCalledWith(7, 42, { title: "Updated", content: "Changed" });
    expect(dbMocks.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ eventType: "note_updated", targetId: "7" }));
  });

  it("deletes an owned note and records its audit event", async () => {
    dbMocks.getNoteByIdOwned.mockResolvedValueOnce({ id: 7, userId: 42 });
    const result = await appRouter.createCaller(context(regularUser)).notes.remove({ id: 7 });
    expect(result).toEqual({ success: true });
    expect(dbMocks.deleteNoteOwned).toHaveBeenCalledWith(7, 42);
    expect(dbMocks.createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ eventType: "note_deleted", targetId: "7" }));
  });

  it("records a logout audit event before clearing the session", async () => {
    const result = await appRouter.createCaller(context(regularUser)).auth.logout();
    expect(result).toEqual({ success: true });
    expect(dbMocks.createAuditLog).toHaveBeenCalledWith({ actorUserId: 42, eventType: "logout" });
  });

  it("rejects cross-user note updates", async () => {
    dbMocks.getNoteByIdOwned.mockResolvedValueOnce(null);
    await expect(appRouter.createCaller(context(regularUser)).notes.update({ id: 99, title: "Changed", content: "No access" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(dbMocks.updateNoteOwned).not.toHaveBeenCalled();
  });

  it("blocks regular users from admin procedures", async () => {
    await expect(appRouter.createCaller(context(regularUser)).admin.users()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getAllUsers).not.toHaveBeenCalled();
  });

  it("allows admins to read the user directory", async () => {
    dbMocks.getAllUsers.mockResolvedValueOnce([adminUser]);
    const result = await appRouter.createCaller(context(adminUser)).admin.users();
    expect(result).toEqual([adminUser]);
    expect(dbMocks.getAllUsers).toHaveBeenCalledOnce();
  });
});
