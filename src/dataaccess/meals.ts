import { eq } from "drizzle-orm";
import db from "../db/db";
import {
  foodsToMealsTable,
  mealsTable,
  recipesToMealsTable,
} from "../db/schema";
import { MealSchema } from "../dto/mealPlans";
import { MealPlanMeal } from "../types";

// e.g. Bulking Meal 1
async function getMeal(mealId: number): Promise<MealPlanMeal> {
  const meal = await db.query.mealsTable.findFirst({
    where: eq(mealsTable.id, mealId),
    with: {
      recipeItems: {
        with: {
          recipe: {
            with: {
              ingredients: {
                with: {
                  food: true,
                },
              },
            },
          },
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

export const mealsRepository = {
  getMeal,
};
