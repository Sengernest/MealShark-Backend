import { mealLogsRepository } from "../dataaccess/mealLogs";
import { mealPlansRepository } from "../dataaccess/mealPlans";
import {
  FoodEntrySchema,
  ImportAllFromMealPlanSchema,
  ImportFromMealPlanSchema,
  RecipeEntrySchema,
  recipeEntrySchema,
} from "../dto/mealLogs";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import {
  FoodEntry,
  MealEntryWithNutrition,
  MealLog,
  MealSlot,
  RecipeEntry,
  RecipeEntryWithNutrition,
} from "../types";
import {
  foodItemToWithNutrition,
  multiplyNutrition,
  recipeToWithNutrition,
  sumNutrition,
} from "./nutrition";

// Returns the list of meals logged by the user on the given date, including total nutrition for the day
async function getMealLog(userId: number, logDate: string): Promise<MealLog> {
  const breakfast = await getMealEntry(userId, logDate, "breakfast");
  const lunch = await getMealEntry(userId, logDate, "lunch");
  const dinner = await getMealEntry(userId, logDate, "dinner");
  const snack = await getMealEntry(userId, logDate, "snack");
  return {
    breakfast,
    lunch,
    dinner,
    snack,
    nutrition: sumNutrition(breakfast, lunch, dinner, snack),
  };
}

// Returns the food and recipe items logged for this meal slot, with total nutrition for this meal
async function getMealEntry(
  userId: number,
  logDate: string,
  mealSlot: MealSlot,
): Promise<MealEntryWithNutrition> {
  const foodEntries = await mealLogsRepository.getFoodEntries(
    userId,
    logDate,
    mealSlot,
  );
  const recipeEntries = await mealLogsRepository.getRecipeEntries(
    userId,
    logDate,
    mealSlot,
  );

  const foodEntriesWithNutrition = foodEntries.map((foodEntry) => ({
    ...foodEntry,
    nutrition: foodItemToWithNutrition(foodEntry).nutrition,
  }));

  const recipeEntriesWithNutrition = recipeEntries.map((recipeEntry) => {
    const recipe = recipeToWithNutrition(recipeEntry.recipe);
    return {
      ...recipeEntry,
      recipe,
      nutrition: multiplyNutrition(recipe.nutrition, recipeEntry.servings),
    };
  });

  return {
    foodEntries: foodEntriesWithNutrition,
    recipeEntries: recipeEntriesWithNutrition,
    nutrition: sumNutrition(
      ...foodEntriesWithNutrition,
      ...recipeEntriesWithNutrition,
    ),
  };
}

async function addFoodEntry(
  schema: FoodEntrySchema,
  userId: number,
): Promise<FoodEntry> {
  const foodEntry = await mealLogsRepository.addFoodEntry(userId, schema);
  if (!foodEntry) {
    throw new NotFoundError();
  }
  return foodEntry;
}

async function addRecipeEntry(
  schema: RecipeEntrySchema,
  userId: number,
): Promise<RecipeEntry> {
  const recipeEntry = await mealLogsRepository.addRecipeEntry(userId, schema);
  if (!recipeEntry) {
    throw new NotFoundError();
  }
  return recipeEntry;
}

async function updateFoodEntry(
  entryId: number,
  schema: FoodEntrySchema,
  userId: number,
): Promise<FoodEntry> {
  const entry = await mealLogsRepository.getFoodEntry(entryId);
  if (!entry) {
    throw new NotFoundError();
  }
  if (entry.userId !== userId) {
    throw new UnauthorizedError();
  }
  const updatedEntry = await mealLogsRepository.updateFoodEntry(
    entryId,
    schema,
  );
  if (!updatedEntry) {
    throw new NotFoundError();
  }
  return updatedEntry;
}

async function updateRecipeEntry(
  entryId: number,
  schema: RecipeEntrySchema,
  userId: number,
): Promise<RecipeEntry> {
  const entry = await mealLogsRepository.getRecipeEntry(entryId);
  if (!entry) {
    throw new NotFoundError();
  }
  if (entry.userId !== userId) {
    throw new UnauthorizedError();
  }
  const updatedEntry = await mealLogsRepository.updateRecipeEntry(
    entryId,
    schema,
  );
  if (!updatedEntry) {
    throw new NotFoundError();
  }
  return updatedEntry;
}

async function removeFoodEntry(
  entryId: number,
  userId: number,
): Promise<FoodEntry> {
  const entry = await mealLogsRepository.getFoodEntry(entryId);
  if (!entry) {
    throw new NotFoundError();
  }
  if (entry.userId !== userId) {
    throw new UnauthorizedError();
  }
  await mealLogsRepository.removeFoodEntry(entryId);
  return entry;
}

async function removeRecipeEntry(
  entryId: number,
  userId: number,
): Promise<RecipeEntry> {
  const entry = await mealLogsRepository.getRecipeEntry(entryId);
  if (!entry) {
    throw new NotFoundError();
  }
  if (entry.userId !== userId) {
    throw new UnauthorizedError();
  }
  await mealLogsRepository.removeRecipeEntry(entryId);
  return entry;
}

async function importFromMealPlan(
  userId: number,
  schema: ImportFromMealPlanSchema,
): Promise<MealEntryWithNutrition> {
  const activeMealPlan = await mealPlansRepository.getActiveMealPlan(userId);

  if (!activeMealPlan) {
    throw new NotFoundError(
      "No active meal plan. Please set a meal plan as active or create one.",
    );
  }

  await mealLogsRepository.importFromMealPlan(userId, schema, activeMealPlan);

  const mealEntry = await getMealEntry(userId, schema.logDate, schema.mealSlot);
  return mealEntry;
}

async function importAllFromMealPlan(
  userId: number,
  schema: ImportAllFromMealPlanSchema,
): Promise<MealLog> {

  const mealSlots: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

  for (const mealSlot of mealSlots) {
    await importFromMealPlan(
      userId,
      {
        logDate: schema.logDate,
        mealSlot,
      },
    );
  }

  return await getMealLog(userId, schema.logDate);
}

export const mealLogsService = {
  getMealLog,
  addFoodEntry,
  addRecipeEntry,
  updateFoodEntry,
  updateRecipeEntry,
  removeFoodEntry,
  removeRecipeEntry,
  importFromMealPlan,
  importAllFromMealPlan
};
