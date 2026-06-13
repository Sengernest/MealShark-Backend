import { mealPlansRepository } from "../dataaccess/mealPlans";
import { MealPlanSchema } from "../dto/mealPlans";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import { MealPlan, MealPlanWithNutrition } from "../types";
import { sumMealPlanNutrition } from "./nutrition";

function withNutrition(mealPlan: MealPlan): MealPlanWithNutrition {
  return {
    ...mealPlan,
    nutrition: sumMealPlanNutrition(mealPlan),
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
  if (!mealPlan) {
    throw new NotFoundError();
  }
  return withNutrition(mealPlan);
}

async function createMealPlan(schema: MealPlanSchema, userId: number) {
  const mealPlan = await mealPlansRepository.createMealPlan(schema, userId);
  if (!mealPlan) {
    throw new NotFoundError();
  }
  return withNutrition(mealPlan);
}

async function updateMealPlan(
  mealPlanId: number,
  schema: MealPlanSchema,
  userId: number,
) {
  const mealPlan = await mealPlansRepository.getMealPlan(mealPlanId);
  if (!mealPlan) {
    throw new NotFoundError();
  }
  // Ensure that the meal plan can only be updated by its creator
  if (mealPlan.creatorId !== userId) {
    throw new UnauthorizedError();
  }
  const updatedMealPlan = await mealPlansRepository.updateMealPlan(
    mealPlanId,
    schema,
  );
  if (!updatedMealPlan) {
    throw new NotFoundError();
  }
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
