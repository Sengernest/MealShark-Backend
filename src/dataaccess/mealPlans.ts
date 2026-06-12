import { eq, isNull } from "drizzle-orm";
import db from "../db/db";
import {
  foodsToMealsTable,
  mealPlansTable,
  mealsTable,
  recipesToMealsTable,
} from "../db/schema";
import { MealPlanSchema } from "../dto/mealPlans";
import { MealPlan } from "../types";

async function getSampleMealPlans(): Promise<MealPlan[]> {
  const mealPlans = await db.query.mealPlansTable.findMany({
    where: isNull(mealPlansTable.creatorId),
    with: {
      meals: {
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
      },
    },
  });
  return mealPlans;
}

async function getUserMealPlans(userId: number): Promise<MealPlan[]> {
  const mealPlans = await db.query.mealPlansTable.findMany({
    where: eq(mealPlansTable.creatorId, userId),
    with: {
      meals: {
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
      },
    },
  });
  return mealPlans;
}

async function getMealPlan(mealPlanId: number): Promise<MealPlan | undefined> {
  return db.query.mealPlansTable.findFirst({
    where: eq(mealPlansTable.id, mealPlanId),
    with: {
      meals: {
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
      },
    },
  });
}

async function createMealPlan(
  mealPlan: MealPlanSchema,
  creatorId: number,
): Promise<MealPlan | undefined> {
  return await db.transaction(async (tx) => {
    const [newMealPlan] = await tx
      .insert(mealPlansTable)
      .values({
        name: mealPlan.name,
        creatorId: creatorId,
      })
      .returning();

    for (const meal of mealPlan.meals) {
      const [newMeal] = await tx
        .insert(mealsTable)
        .values({
          mealPlanId: newMealPlan.id,
          mealPlanIndex: meal.mealPlanIndex,
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
    }

    return getMealPlan(newMealPlan.id);
  });
}

async function updateMealPlan(mealPlanId: number, mealPlan: MealPlanSchema): Promise<MealPlan | undefined> {
  return await db.transaction(async (tx) => {
    const [updatedPlan] = await tx
      .update(mealPlansTable)
      .set({ name: mealPlan.name })
      .where(eq(mealPlansTable.id, mealPlanId))
      .returning();

    for (const meal of mealPlan.meals) {
      // Delete all previous meals in this meal plan
      // Meal recipes and meal foods are cascade deleted
      await tx.delete(mealsTable).where(eq(mealsTable.mealPlanId, mealPlanId));

      // Insert updated meal
      const [newMeal] = await tx
        .insert(mealsTable)
        .values({
          mealPlanId: updatedPlan.id,
          mealPlanIndex: meal.mealPlanIndex,
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
    }

    return getMealPlan(updatedPlan.id);
  });
}

async function deleteMealPlan(mealPlanId: number) {
  return await db
    .delete(mealPlansTable)
    .where(eq(mealPlansTable.id, mealPlanId));
}

export const mealPlansRepository = {
  getSampleMealPlans,
  getUserMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
};
