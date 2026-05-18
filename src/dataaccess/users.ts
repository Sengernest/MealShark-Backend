import { eq } from "drizzle-orm";
import db from "../db/db";
import { User, UserInsert, usersTable } from "../db/schema";

export async function createUser(user: UserInsert) {
  return await db.insert(usersTable).values(user);
}

export async function getUsers(): Promise<User[]> {
  return await db.select().from(usersTable);
}

export async function getUser(userId: number): Promise<User> {
  return (
    await db.select().from(usersTable).where(eq(usersTable.id, userId))
  )[0];
}
