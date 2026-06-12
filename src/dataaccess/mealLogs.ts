import { and, eq } from "drizzle-orm";
import db from "../db/db";
import {
  foodsToMealLogsTable,
  mealLogsTable,
  recipesToMealLogsTable,
} from "../db/schema";
import { MealLogSchema } from "../dto/mealLogs";
import { MealLog } from "../types";

// Get meal logs by a user on a given date
async function getMealLogs(
  userId: number,
  logDate: string,
): Promise<MealLog[]> {
  return await db.query.mealLogsTable.findMany({
    where: and(
      eq(mealLogsTable.userId, userId),
      eq(mealLogsTable.logDate, logDate),
    ),
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

async function getMealLog(mealLogId: number): Promise<MealLog | undefined> {
  return db.query.mealLogsTable.findFirst({
    where: eq(mealLogsTable.id, mealLogId),
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

async function createMealLog(mealLog: MealLogSchema, userId: number): Promise<MealLog | undefined> {
  return await db.transaction(async (tx) => {
    const [newMealLog] = await tx
      .insert(mealLogsTable)
      .values({
        userId,
        logDate: mealLog.logDate,
        mealIndex: mealLog.mealIndex,
        mealId: mealLog.mealId,
      })
      .returning();
    if (mealLog.recipeItems.length > 0) {
      await tx.insert(recipesToMealLogsTable).values(
        mealLog.recipeItems.map((recipeItem) => ({
          ...recipeItem,
          mealLogId: newMealLog.id,
        })),
      );
    }
    if (mealLog.foodItems.length > 0) {
      await tx.insert(foodsToMealLogsTable).values(
        mealLog.foodItems.map((foodItem) => ({
          ...foodItem,
          mealLogId: newMealLog.id,
        })),
      );
    }
    return getMealLog(newMealLog.id);
  });
}

async function updateMealLog(mealLogId: number, mealLog: MealLogSchema): Promise<MealLog | undefined> {
  return await db.transaction(async (tx) => {
    await tx
      .update(mealLogsTable)
      .set({
        logDate: mealLog.logDate,
        mealIndex: mealLog.mealIndex,
        mealId: mealLog.mealId,
      })
      .where(eq(mealLogsTable.id, mealLogId));

    // Delete all existing recipe items in the meal log
    await tx
      .delete(recipesToMealLogsTable)
      .where(eq(recipesToMealLogsTable.mealLogId, mealLogId));
    // Delete all existing food items in the meal log
    await tx
      .delete(foodsToMealLogsTable)
      .where(eq(foodsToMealLogsTable.mealLogId, mealLogId));

    if (mealLog.recipeItems.length > 0) {
      await tx.insert(recipesToMealLogsTable).values(
        mealLog.recipeItems.map((recipeItem) => ({
          ...recipeItem,
          mealLogId: mealLogId,
        })),
      );
    }
    if (mealLog.foodItems.length > 0) {
      await tx.insert(foodsToMealLogsTable).values(
        mealLog.foodItems.map((foodItem) => ({
          ...foodItem,
          mealLogId: mealLogId,
        })),
      );
    }

    return getMealLog(mealLogId);
  });
}

async function deleteMealLog(mealLogId: number) {
  return await db.delete(mealLogsTable).where(eq(mealLogsTable.id, mealLogId));
}

export const mealLogsRepository = {
  getMealLog,
  getMealLogs,
  createMealLog,
  updateMealLog,
  deleteMealLog,
};
