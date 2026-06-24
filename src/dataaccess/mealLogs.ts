import { and, eq } from "drizzle-orm";
import db from "../db/db";
import { foodEntriesTable, recipeEntriesTable } from "../db/schema";
import { FoodEntrySchema, RecipeEntrySchema } from "../dto/mealLogs";
import { FoodEntry, MealSlot, RecipeEntry } from "../types";

// Gets all food entries logged by the user on this date for this meal slot
async function getFoodEntries(
  userId: number,
  logDate: string,
  mealSlot: MealSlot,
): Promise<FoodEntry[]> {
  return db.query.foodEntriesTable.findMany({
    where: and(
      eq(foodEntriesTable.userId, userId),
      eq(foodEntriesTable.logDate, logDate),
      eq(foodEntriesTable.mealSlot, mealSlot),
    ),
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
    },
  });
}

async function getFoodEntry(id: number): Promise<FoodEntry | undefined> {
  return db.query.foodEntriesTable.findFirst({
    where: eq(foodEntriesTable.id, id),
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
    },
  });
}

// Gets all recipe entries logged by the user on the given date
async function getRecipeEntries(
  userId: number,
  logDate: string,
  mealSlot: MealSlot,
): Promise<RecipeEntry[]> {
  return db.query.recipeEntriesTable.findMany({
    where: and(
      eq(recipeEntriesTable.userId, userId),
      eq(recipeEntriesTable.logDate, logDate),
      eq(foodEntriesTable.mealSlot, mealSlot),
    ),
    with: {
      recipe: {
        with: {
          ingredients: {
            with: {
              unit: true,
              food: {
                with: {
                  units: {
                    with: {
                      unit: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

async function getRecipeEntry(id: number): Promise<RecipeEntry | undefined> {
  return db.query.recipeEntriesTable.findFirst({
    where: eq(foodEntriesTable.id, id),
    with: {
      recipe: {
        with: {
          ingredients: {
            with: {
              unit: true,
              food: {
                with: {
                  units: {
                    with: {
                      unit: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

// Logs a food entry for the user on the given date
async function addFoodEntry(
  userId: number,
  schema: FoodEntrySchema,
): Promise<FoodEntry | undefined> {
  const [foodEntry] = await db
    .insert(foodEntriesTable)
    .values({ ...schema, userId })
    .returning();
  return getFoodEntry(foodEntry.id);
}

// Logs a recipe entry for the user on the given date
async function addRecipeEntry(
  userId: number,
  schema: RecipeEntrySchema,
): Promise<RecipeEntry | undefined> {
  const [recipeEntry] = await db
    .insert(recipeEntriesTable)
    .values({ ...schema, userId })
    .returning();
  return getRecipeEntry(recipeEntry.id);
}

async function updateFoodEntry(
  entryId: number,
  schema: FoodEntrySchema,
): Promise<FoodEntry | undefined> {
  const [foodEntry] = await db.update(foodEntriesTable).set(schema).returning();
  return getFoodEntry(foodEntry.id);
}

async function updateRecipeEntry(
  entryId: number,
  schema: RecipeEntrySchema,
): Promise<RecipeEntry | undefined> {
  const [recipeEntry] = await db
    .update(recipeEntriesTable)
    .set(schema)
    .returning();
  return getRecipeEntry(recipeEntry.id);
}

// Removes a food entry from the user's log
async function removeFoodEntry(entryId: number) {
  return db.delete(foodEntriesTable).where(eq(foodEntriesTable.id, entryId));
}

// Removes a recipe entry from the user's log
async function removeRecipeEntry(entryId: number) {
  return db
    .delete(recipeEntriesTable)
    .where(eq(recipeEntriesTable.id, entryId));
}

export const mealLogsRepository = {
  getFoodEntries,
  getRecipeEntries,
  addFoodEntry,
  addRecipeEntry,
  updateFoodEntry,
  updateRecipeEntry,
  removeFoodEntry,
  removeRecipeEntry,
};
