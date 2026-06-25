import { mealLogsRepository } from "../dataaccess/mealLogs";
import { MealEntryWithNutrition, MealLog, MealSlot } from "../types";
import {
  foodItemToWithNutrition,
  multiplyNutrition,
  recipeToWithNutrition,
  sumNutrition
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

export const mealLogsService = {
  getMealLog,
};
