import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertAuditLog,
  InsertNote,
  InsertUser,
  auditLogs,
  notes,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { auditEventSchema } from "../shared/security";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
    const savedUser = await getUserByOpenId(user.openId);
    if (savedUser) {
      await createAuditLog({
        actorUserId: savedUser.id,
        eventType: "login",
        metadata: JSON.stringify({ loginMethod: savedUser.loginMethod ?? "oauth" }),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createNote(note: InsertNote) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(notes).values(note);
  return getNoteByIdOwned(Number(result[0].insertId), note.userId);
}

export async function getNotesByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
}

export async function getNoteByIdOwned(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateNoteOwned(id: number, userId: number, values: Partial<Pick<InsertNote, "title" | "content">>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(notes).set(values).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  return getNoteByIdOwned(id, userId);
}

export async function deleteNoteOwned(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function createAuditLog(event: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const validated = auditEventSchema.parse(event);
  await db.insert(auditLogs).values(validated);
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, lastSignedIn: users.lastSignedIn })
    .from(users)
    .orderBy(desc(users.lastSignedIn));
}
