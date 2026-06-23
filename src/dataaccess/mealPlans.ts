import { and, eq, isNull, or, SQL } from "drizzle-orm";
import db from "../db/db";
import {
  foodsToMealsTable,
  mealPlansTable,
  mealsTable,
  recipesToMealsTable,
} from "../db/schema";
import { MealPlanSchema } from "../dto/mealPlans";
import { MealPlan } from "../types";

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
                      food: {
                        with: {
                          units: {
                            with: {
                              unit: true,
                            },
                          },
                        },
                      },
                      unit: true,
                    },
                  },
                },
              },
            },
          },
          foodItems: {
            with: {
              food: {
                with: {
                  units: {
                    with: {
                      unit: true,
                    },
                  },
                },
              },
              unit: true,
            },
          },
        },
      },
    },
  });
}

async function getMealPlans(filterCondition: SQL): Promise<MealPlan[]> {
  return db.query.mealPlansTable.findMany({
    where: filterCondition,
    with: {
      meals: {
        with: {
          recipeItems: {
            with: {
              recipe: {
                with: {
                  ingredients: {
                    with: {
                      food: {
                        with: {
                          units: {
                            with: {
                              unit: true,
                            },
                          },
                        },
                      },
                      unit: true,
                    },
                  },
                },
              },
            },
          },
          foodItems: {
            with: {
              food: {
                with: {
                  units: {
                    with: {
                      unit: true,
                    },
                  },
                },
              },
              unit: true,
            },
          },
        },
      },
    },
  });
}

async function getSampleMealPlans(): Promise<MealPlan[]> {
  return getMealPlans(isNull(mealPlansTable.creatorId));
}

async function getUserMealPlans(userId: number): Promise<MealPlan[]> {
  return getMealPlans(eq(mealPlansTable.creatorId, userId));
}

// Get all sample meal plans together with meal plans created by a given user
async function getAllMealPlans(userId: number): Promise<MealPlan[] | undefined> {
  return getMealPlans(
    or(
      eq(mealPlansTable.creatorId, userId),
      isNull(mealPlansTable.creatorId),
    )!,
  );
}


async function createMealPlan(
  mealPlan: MealPlanSchema,
  creatorId: number,
): Promise<MealPlan | undefined> {
  const newMealPlan = await db.transaction(async (tx) => {
    const [newMealPlan] = await tx
      .insert(mealPlansTable)
      .values({
        name: mealPlan.name,
        creatorId: creatorId,
        description: mealPlan.description,
        isActive: false,
        targetCalories: mealPlan.targetCalories
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
    return newMealPlan;
  });
  return getMealPlan(newMealPlan.id);
}

async function updateMealPlan(
  mealPlanId: number,
  mealPlan: MealPlanSchema,
): Promise<MealPlan | undefined> {
  await db.transaction(async (tx) => {
    const [updatedPlan] = await tx
      .update(mealPlansTable)
      .set({
        name: mealPlan.name,
        description: mealPlan.description,
        targetCalories: mealPlan.targetCalories
      })
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
  });
  return getMealPlan(mealPlanId);
}

async function deleteMealPlan(mealPlanId: number) {
  return await db
    .delete(mealPlansTable)
    .where(eq(mealPlansTable.id, mealPlanId));
}



async function activateMealPlan(
  mealPlanId: number,
  userId: number,
): Promise<MealPlan | undefined> {
  await db.transaction(async (tx) => {
    // Deactivate all user's meal plans
    await tx
      .update(mealPlansTable)
      .set({ isActive: false })
      .where(eq(mealPlansTable.creatorId, userId));

    // Activate the selected meal plan
    await tx
      .update(mealPlansTable)
      .set({ isActive: true })
      .where(
        and(
          eq(mealPlansTable.id, mealPlanId),
          eq(mealPlansTable.creatorId, userId),
        ),
      );
  });

  return getMealPlan(mealPlanId);
}

export const mealPlansRepository = {
  getSampleMealPlans,
  getUserMealPlans,
  getAllMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  activateMealPlan
};
