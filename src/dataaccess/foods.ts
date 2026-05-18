import db from "../db/db";
import { Food, FoodInsert, foodsTable } from "../db/schema";

export async function createFood(food: FoodInsert) {
  return await db.insert(foodsTable).values(food)
}

export async function getFoods(): Promise<Food[]> {
  return await db.select().from(foodsTable)
}

