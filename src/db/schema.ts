import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
});

export type User = typeof usersTable.$inferSelect;
export type UserPostData = typeof usersTable.$inferInsert;
