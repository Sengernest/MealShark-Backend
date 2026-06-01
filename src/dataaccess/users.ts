import { eq } from "drizzle-orm";
import db from "../db/db";
import { usersTable } from "../db/schema";
import { UserInput, User } from "../types";
import bcrypt from "bcrypt";

export async function createUser(user: UserInput) {
  console.log("createUser called with:", user);
  const { name, email, password } = user;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();
    console.log("db insert result:", result);
    const [newUser] = result;
    return newUser;
  } catch (err) {
    console.error("createUser ERROR:", err);
    throw err;
  }
}

export async function getUsers(): Promise<User[]> {
  return await db.select().from(usersTable);
}

export async function getUser(userId: number): Promise<User> {
  return (
    await db.select().from(usersTable).where(eq(usersTable.id, userId))
  )[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user.length > 0 ? user[0] : null;
} 
