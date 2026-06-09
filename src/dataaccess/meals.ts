import { eq } from "drizzle-orm";
import db from "../db/db";
import {
  foodsToMealsTable,
  mealsTable,
  recipesToMealsTable,
} from "../db/schema";
import { Meal } from "../types";
import { CreateMealPlanSchema, UpdateMealPlanSchema } from "../dto/mealPlans";

async function getMeals(): Promise<Meal[]> {
  return await db.query.mealsTable.findMany({
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
}

// Get meals created by a given user
async function getUserMeals(userId: number): Promise<Meal[]> {
  return await db.query.mealsTable.findMany({
    where: eq(mealsTable.creatorId, userId),
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
}

async function getMeal(mealId: number): Promise<Meal> {
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

async function createMeal(meal: CreateMealPlanSchema) {
  return await db.transaction(async (tx) => {
    const [newMeal] = await tx
      .insert(mealsTable)
      .values({
        name: meal.name,
        creatorId: meal.creatorId,
      })
      .returning();
    if (meal.recipeItems.length > 0) {
      await tx.insert(recipesToMealsTable).values(
        meal.recipeItems.map((recipeItem) => ({
          ...recipeItem,
          mealId: newMeal.id,
        })),
      );
    }
    if (meal.foodItems.length > 0) {
      await tx.insert(foodsToMealsTable).values(
        meal.foodItems.map((foodItem) => ({
          ...foodItem,
          mealId: newMeal.id,
        })),
      );
    }
    return getMeal(newMeal.id);
  });
}

async function updateMeal(meal: UpdateMealPlanSchema) {
  return await db.transaction(async (tx) => {
    await tx
      .update(mealsTable)
      .set({
        name: meal.name,
        creatorId: meal.creatorId,
      })
      .where(eq(mealsTable.id, meal.mealId));

    // Delete all existing recipe items in the meal
    await tx
      .delete(recipesToMealsTable)
      .where(eq(recipesToMealsTable.mealId, meal.mealId));
    // Delete all existing food items in the meal
    await tx
      .delete(foodsToMealsTable)
      .where(eq(foodsToMealsTable.mealId, meal.mealId));

    // Replace with updated recipe items
    if (meal.recipeItems.length > 0) {
      await tx.insert(recipesToMealsTable).values(
        meal.recipeItems.map((recipeItem) => ({
          ...recipeItem,
          mealId: meal.mealId,
        })),
      );
    }
    // Replace with updated meal items
    if (meal.foodItems.length > 0) {
      await tx.insert(foodsToMealsTable).values(
        meal.foodItems.map((foodItem) => ({
          ...foodItem,
          mealId: meal.mealId,
        })),
      );
    }

    return getMeal(meal.mealId);
  });
}

async function deleteMeal(mealId: number) {
  return await db.delete(mealsTable).where(eq(mealsTable.id, mealId));
}

export const mealsRepository = {
  getMeals,
  getUserMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
};
