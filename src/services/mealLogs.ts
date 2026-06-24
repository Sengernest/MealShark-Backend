import { mealLogsRepository } from "../dataaccess/mealLogs";
import { MealLog, MealSlot, MealWithNutrition } from "../types";
import { sumMealNutrition, sumNutrition } from "./nutrition";

// Returns the list of meals logged by the user on the given date, including total nutrition
async function getMealLog(userId: number, logDate: string): Promise<MealLog> {
  const breakfast = await getMeal(userId, logDate, "breakfast");
  const lunch = await getMeal(userId, logDate, "lunch");
  const dinner = await getMeal(userId, logDate, "dinner");
  const snack = await getMeal(userId, logDate, "snack");
  return {
    breakfast,
    lunch,
    dinner,
    snack,
    nutrition: sumNutrition(breakfast, lunch, dinner, snack),
  };
}

async function getMeal(
  userId: number,
  logDate: string,
  mealSlot: MealSlot,
): Promise<MealWithNutrition> {
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
  const meal = { foodEntries, recipeEntries };
  return {
    foodEntries,
    recipeEntries,
    nutrition: sumMealNutrition(meal),
  };
}

export const mealLogsService = {
  getMealLog,
};
