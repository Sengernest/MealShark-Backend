import { eq } from "drizzle-orm";
import db from "../db/db";
import { mealsTable } from "../db/schema";
import { MealInput, Meal } from "../types";

export async function createMeal(meal: MealInput) {
  return await db.insert(mealsTable).values(meal);
}

export async function getMeals(): Promise<Meal[]> {
  return await db.select().from(mealsTable);
}

export async function getMeal(mealId: number): Promise<Meal> {
  return (
    await db.select().from(mealsTable).where(eq(mealsTable.id, mealId))
  )[0];
}

export async function updateMeal(mealId: number, newMeal: MealInput) {
  return await db
    .update(mealsTable)
    .set(newMeal)
    .where(eq(mealsTable.id, mealId));
}

export async function deleteMeal(mealId: number) {
  return await db.delete(mealsTable).where(eq(mealsTable.id, mealId));
}
