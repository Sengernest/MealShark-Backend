import { mealPlansRepository } from "../dataaccess/mealPlans";
import { MealPlanSchema } from "../dto/mealPlans";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import { MealPlan, MealPlanWithNutrition } from "../types";
import { foodsService } from "./foods";
import { sumMealNutrition, sumMealsNutrition, sumNutrition } from "./nutrition";

function withNutrition(mealPlan: MealPlan): MealPlanWithNutrition {
  return {
    ...mealPlan,
    nutrition: sumMealsNutrition(mealPlan.meals),
    meals: mealPlan.meals.map((meal) => ({
      ...meal,
      nutrition: sumMealNutrition(meal),

      recipeItems: meal.recipeItems.map((recipeItem) => ({
        ...recipeItem,
        nutrition: sumNutrition(recipeItem.recipe.ingredients),
      })),
    })),
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

async function getAllMealPlans(userId: number) {
  const mealPlans = await mealPlansRepository.getAllMealPlans(userId);
    if (!mealPlans) {
    throw new NotFoundError();
  }
  return mealPlans.map(withNutrition);
}

async function createMealPlan(schema: MealPlanSchema, userId: number) {
  // Check if food items have valid units
  for (const meal of schema.meals) {
    for (const foodItem of meal.foodItems) {
      await foodsService.assertValidUnit(foodItem.foodId, foodItem.unitId)
    }
  }
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
  // Check if food items have valid units
  for (const meal of schema.meals) {
    for (const foodItem of meal.foodItems) {
      await foodsService.assertValidUnit(foodItem.foodId, foodItem.unitId);
    }
  }
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

async function activateMealPlan(mealPlanId: number, userId: number): Promise<MealPlan | undefined> {
  const mealPlan = mealPlansRepository.activateMealPlan(mealPlanId, userId);
  return mealPlan;

}
export const mealPlansService = {
  getSampleMealPlans,
  getUserMealPlans,
  getMealPlan,
  getAllMealPlans,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  activateMealPlan
};
