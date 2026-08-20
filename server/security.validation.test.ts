import { describe, expect, it } from "vitest";
import { auditEventSchema } from "../shared/security";

describe("auditEventSchema", () => {
  it("accepts a valid note event", () => {
    const event = auditEventSchema.parse({
      actorUserId: 7,
      eventType: "note_created",
      targetType: "note",
      targetId: "42",
      metadata: JSON.stringify({ source: "dashboard" }),
    });

    expect(event.eventType).toBe("note_created");
    expect(event.actorUserId).toBe(7);
  });

  it("rejects unknown event types and unexpected fields", () => {
    expect(() =>
      auditEventSchema.parse({
        actorUserId: 7,
        eventType: "password_reset",
      }),
    ).toThrow();

    expect(() =>
      auditEventSchema.parse({
        actorUserId: 7,
        eventType: "logout",
        unexpected: "value",
      }),
    ).toThrow();
  });

  it("rejects oversized metadata", () => {
    expect(() =>
      auditEventSchema.parse({
        eventType: "login",
        metadata: "x".repeat(4001),
      }),
    ).toThrow();
  });
});
