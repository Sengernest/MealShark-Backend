import bcrypt from "bcrypt";
import db from "./db";
import { usersTable } from "./schema";
import dotenv from "dotenv"
dotenv.config()

const sampleUsers = [
  {
    name: "David Laid",
    email: "davidlaid@gymshark.com",
    password: "aesthetics",
  },
];

export async function seedDb() {
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

seedDb();
