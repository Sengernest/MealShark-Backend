import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "../db";
import { usersTable } from "../schema";
dotenv.config()

const sampleUsers = [
  {
    name: "David Laid",
    email: "davidlaid@gymshark.com",
    password: "aesthetics",
  },
];

export async function seedUsers() {
  const sampleUsersHashed = await Promise.all(
    sampleUsers.map(async (user) => {
      const passwordHash = await bcrypt.hash(user.password, 10);
      return {
        ...user,
        password: passwordHash,
      };
    }),
  );
  await db.insert(usersTable).values(sampleUsersHashed);
}

seedUsers()