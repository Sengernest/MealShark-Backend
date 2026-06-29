import { and, eq, isNull, or, SQL } from "drizzle-orm";
import db from "../db/db";
import {
  foodsToMealPlansTable,
  mealPlansTable,
  recipesToMealPlansTable,
} from "../db/schema";
import { MealPlanSchema } from "../dto/mealPlans";
import { MealPlan } from "../types";

async function getMealPlan(mealPlanId: number): Promise<MealPlan | undefined> {
  return db.query.mealPlansTable.findFirst({
    where: eq(mealPlansTable.id, mealPlanId),
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
  });
}

async function getMealPlans(filterCondition: SQL): Promise<MealPlan[]> {
  return db.query.mealPlansTable.findMany({
    where: filterCondition,
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
  });
}

async function getSampleMealPlans(): Promise<MealPlan[]> {
  return getMealPlans(isNull(mealPlansTable.creatorId));
}

async function getUserMealPlans(userId: number): Promise<MealPlan[]> {
  return getMealPlans(eq(mealPlansTable.creatorId, userId));
}

async function getActiveMealPlan(
  userId: number,
): Promise<MealPlan | undefined> {
  const mealPlans = await getUserMealPlans(userId);
  return mealPlans.find((mealPlan) => mealPlan.isActive);
}

// Get all sample meal plans together with meal plans created by a given user
async function getAllMealPlans(
  userId: number,
): Promise<MealPlan[] | undefined> {
  return getMealPlans(
    or(eq(mealPlansTable.creatorId, userId), isNull(mealPlansTable.creatorId))!,
  );
}

async function createMealPlan(
  mealPlan: MealPlanSchema,
  creatorId: number,
): Promise<MealPlan | undefined> {
  const mealPlanId = await db.transaction(async (tx) => {
    const [newMealPlan] = await tx
      .insert(mealPlansTable)
      .values({
        name: mealPlan.name,
        creatorId: creatorId,
        description: mealPlan.description,
        isActive: false,
        targetCalories: mealPlan.targetCalories,
      })
      .returning();

    if (mealPlan.foodItems.length > 0) {
      await tx.insert(foodsToMealPlansTable).values(
        mealPlan.foodItems.map((foodItem) => ({
          ...foodItem,
          mealPlanId: newMealPlan.id,
        })),
      );
    }
    if (mealPlan.recipeItems.length > 0) {
      await tx.insert(recipesToMealPlansTable).values(
        mealPlan.recipeItems.map((recipeItem) => ({
          ...recipeItem,
          mealPlanId: newMealPlan.id,
        })),
      );
    }

    return newMealPlan.id;
  });
  return getMealPlan(mealPlanId);
}

async function updateMealPlan(
  mealPlanId: number,
  mealPlan: MealPlanSchema,
): Promise<MealPlan | undefined> {
  await db.transaction(async (tx) => {
    await tx
      .update(mealPlansTable)
      .set({
        name: mealPlan.name,
        description: mealPlan.description,
        targetCalories: mealPlan.targetCalories,
      })
      .where(eq(mealPlansTable.id, mealPlanId));

    // Delete existing food items in meal plan
    await tx
      .delete(foodsToMealPlansTable)
      .where(eq(foodsToMealPlansTable.mealPlanId, mealPlanId));

    // Delete existing recipe items in meal plan
    await tx
      .delete(recipesToMealPlansTable)
      .where(eq(recipesToMealPlansTable.mealPlanId, mealPlanId));

    // Replace with new food items
    if (mealPlan.foodItems.length > 0) {
      await tx.insert(foodsToMealPlansTable).values(
        mealPlan.foodItems.map((foodItem) => ({
          ...foodItem,
          mealPlanId,
        })),
      );
    }

    // Replace with new recipe items
    if (mealPlan.recipeItems.length > 0) {
      await tx.insert(recipesToMealPlansTable).values(
        mealPlan.recipeItems.map((recipeItem) => ({
          ...recipeItem,
          mealPlanId,
        })),
      );
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
  getActiveMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  activateMealPlan,
};
