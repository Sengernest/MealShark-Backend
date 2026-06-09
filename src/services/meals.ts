import { mealsRepository } from "../dataaccess/meals";
import { CreateMealPlanSchema, UpdateMealPlanSchema } from "../dto/mealPlans";
import { Meal, MealWithNutrition } from "../types";
import { sumMealNutrition } from "./nutrition";

function withNutrition(meal: Meal): MealWithNutrition {
  return {
    ...meal,
    nutrition: sumMealNutrition(meal),
  };
}

async function getMeals(): Promise<MealWithNutrition[]> {
  const meals = await mealsRepository.getMeals();
  return meals.map(withNutrition);
}

// Get meals created by a given user
async function getUserMeals(userId: number): Promise<MealWithNutrition[]> {
  const meals = await mealsRepository.getUserMeals(userId);
  return meals.map(withNutrition);
}

// Get meal with computed calories
async function getMeal(mealId: number): Promise<MealWithNutrition> {
  const meal = await mealsRepository.getMeal(mealId);
  return withNutrition(meal);
}

async function createMeal(
  meal: CreateMealPlanSchema,
): Promise<MealWithNutrition> {
  const newMeal = await mealsRepository.createMeal(meal);
  return withNutrition(newMeal);
}

async function updateMeal(
  meal: UpdateMealPlanSchema,
): Promise<MealWithNutrition> {
  const updatedMeal = await mealsRepository.updateMeal(meal);
  return withNutrition(updatedMeal);
}

async function deleteMeal(mealId: number) {
  return mealsRepository.deleteMeal(mealId);
}

export const mealsService = {
  sumMealNutrition,
  getMeals,
  getUserMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
};
