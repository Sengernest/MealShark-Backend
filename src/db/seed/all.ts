import dotenv from "dotenv";
import { seedRecipes } from "./recipes";
import { seedUsers } from "./users";
dotenv.config()

export async function seedAll() {
  await seedUsers()
  await seedRecipes()
}

seedAll();
