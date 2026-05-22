import { eq } from "drizzle-orm";
import db from "../db/db";
import { mealsTable } from "../db/schema";
import { Meal } from "../types";

export async function getMeals(): Promise<Meal[]> {
  return await db.query.mealsTable.findMany({
    with: {
      recipeItems: {
        with: {
          recipe: true,
        },
      },
      foodItems: {
        with: {
          food: true,
        },
      },
    },
  });
}

export async function getMeal(mealId: number): Promise<Meal> {
  const meal = await db.query.mealsTable.findFirst({
    where: eq(mealsTable.id, mealId),
    with: {
      recipeItems: {
        with: {
          recipe: true,
        },
      },
      foodItems: {
        with: {
          food: true,
        },
      },
    },
  });
  if (!meal) {
    throw new Error("Meal not found");
  }
  return meal;
}

// export async function createMeal(meal: ) {
//   return await db.insert(mealsTable).values(meal);
// }

// export async function updateMeal(mealId: number, newMeal: ) {
//   return await db
//     .update(mealsTable)
//     .set(newMeal)
//     .where(eq(mealsTable.id, mealId));
// }

export async function deleteMeal(mealId: number) {
  return await db.delete(mealsTable).where(eq(mealsTable.id, mealId));
}
