import { and, eq, inArray, isNull, or, SQL } from "drizzle-orm";
import db from "../db/db";
import {
  activeMealPlansTable,
  foodsToMealPlansTable,
  mealPlansTable,
  recipesToMealPlansTable,
  savedMealPlansTable,
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

// Get all sample meal plans together with meal plans created by a given user
async function getAllMealPlans(userId: number): Promise<MealPlan[]> {
  return getMealPlans(
    or(eq(mealPlansTable.creatorId, userId), isNull(mealPlansTable.creatorId))!,
  );
}

async function getActiveMealPlan(
  userId: number,
): Promise<MealPlan | undefined> {
  const activeMealPlan = await db.query.activeMealPlansTable.findFirst({
    where: eq(activeMealPlansTable.userId, userId),
  });
  if (!activeMealPlan) return undefined;
  return getMealPlan(activeMealPlan.mealPlanId);
}

async function getUserSavedMealPlans(userId: number): Promise<MealPlan[]> {
  const savedMealPlans = await db.query.savedMealPlansTable.findMany({
    where: eq(savedMealPlansTable.userId, userId),
  });
  const savedMealPlanIds = savedMealPlans.map(
    (savedMealPlan) => savedMealPlan.mealPlanId,
  );
  return getMealPlans(inArray(mealPlansTable.id, savedMealPlanIds));
}

async function createMealPlan(
  mealPlan: MealPlanSchema,
  creatorId?: number,
): Promise<MealPlan | undefined> {
  const mealPlanId = await db.transaction(async (tx) => {
    const [newMealPlan] = await tx
      .insert(mealPlansTable)
      .values({
        name: mealPlan.name,
        creatorId: creatorId,
        description: mealPlan.description,
        isSample: !creatorId,
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

async function activateMealPlan(mealPlanId: number, userId: number) {
  await db.insert(activeMealPlansTable).values({ mealPlanId, userId });
}

async function deactivateMealPlan(mealPlanId: number, userId: number) {
  await db
    .delete(activeMealPlansTable)
    .where(
      and(
        eq(activeMealPlansTable.mealPlanId, mealPlanId),
        eq(activeMealPlansTable.userId, userId),
      ),
    );
}

async function deactivateAllMealPlans(userId: number) {
  await db
    .delete(activeMealPlansTable)
    .where(and(eq(activeMealPlansTable.userId, userId)));
}

async function saveMealPlan(mealPlanId: number, userId: number) {
  return db
    .insert(savedMealPlansTable)
    .values({ mealPlanId, userId })
    .onConflictDoNothing();
}

async function unsaveMealPlan(mealPlanId: number, userId: number) {
  return db
    .delete(savedMealPlansTable)
    .where(
      and(
        eq(savedMealPlansTable.mealPlanId, mealPlanId),
        eq(savedMealPlansTable.userId, userId),
      ),
    );
}

export const mealPlansRepository = {
  getSampleMealPlans,
  getUserMealPlans,
  getAllMealPlans,
  getUserSavedMealPlans,
  getMealPlan,
  getActiveMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  activateMealPlan,
  deactivateMealPlan,
  deactivateAllMealPlans,
  saveMealPlan,
  unsaveMealPlan,
};
