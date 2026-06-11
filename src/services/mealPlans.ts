import { mealPlansRepository } from "../dataaccess/mealPlans";
import { CreateMealPlanSchema, UpdateMealPlanSchema } from "../dto/mealPlans";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import { MealPlan, MealPlanWithNutrition, Nutrition } from "../types";
import { sumMealNutrition } from "./nutrition";

function sumNutrition(mealPlan: MealPlan): Nutrition {
  return mealPlan.meals.reduce(
    (acc, meal) => {
      const mealNutrition = sumMealNutrition(meal);
      acc.calories += mealNutrition.calories;
      acc.macros.protein += mealNutrition.macros.protein;
      acc.macros.carbs += mealNutrition.macros.carbs;
      acc.macros.fat += mealNutrition.macros.fat;
      return acc;
    },
    {
      calories: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    },
  );
}

function withNutrition(mealPlan: MealPlan): MealPlanWithNutrition {
  return {
    ...mealPlan,
    nutrition: sumNutrition(mealPlan),
  };
}

async function getSampleMealPlans() {
  const mealPlans = await mealPlansRepository.getSampleMealPlans();
  return mealPlans.map(withNutrition);
}

async function getUserMealPlans(userId: number) {
  const mealPlans = await mealPlansRepository.getUserMealPlans(userId);
  return mealPlans.map(withNutrition);
}

async function getMealPlan(mealPlanId: number) {
  const mealPlan = await mealPlansRepository.getMealPlan(mealPlanId);
  return withNutrition(mealPlan);
}

async function createMealPlan(schema: CreateMealPlanSchema, userId: number) {
  const mealPlan = await mealPlansRepository.createMealPlan(schema, userId);
  return withNutrition(mealPlan);
}

async function updateMealPlan(schema: UpdateMealPlanSchema, userId: number) {
  const mealPlan = await mealPlansRepository.getMealPlan(schema.id);
  if (!mealPlan) {
    throw new NotFoundError();
  }
  // Ensure that the meal plan can only be updated by its creator
  if (mealPlan.creatorId !== userId) {
    throw new UnauthorizedError();
  }
  const updatedMealPlan = await mealPlansRepository.updateMealPlan(schema);
  return withNutrition(updatedMealPlan);
}

async function deleteMealPlan(mealPlanId: number, userId: number) {
  const mealPlan = await mealPlansRepository.getMealPlan(mealPlanId);
  if (!mealPlan) {
    throw new NotFoundError();
  }
  // Ensure that the meal plan can only be deleted by its creator
  if (mealPlan.creatorId !== userId) {
    throw new UnauthorizedError();
  }
  return mealPlansRepository.deleteMealPlan(mealPlanId);
}

export const mealPlansService = {
  getSampleMealPlans,
  getUserMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
};
