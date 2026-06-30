import { mealPlansRepository } from "../dataaccess/mealPlans";
import { MealPlanSchema } from "../dto/mealPlans";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import {
  MealPlan,
  MealPlanMeal,
  MealPlanMealWithNutrition,
  MealPlanView,
  MealSlot,
  Nutrition,
} from "../types";
import { foodsService } from "./foods";
import {
  foodItemToWithNutrition,
  multiplyNutrition,
  recipeToWithNutrition,
  roundNutrition,
  sumNutrition,
} from "./nutrition";

// function withNutrition(mealPlan: MealPlan): MealPlanWithNutrition {
//   return {
//     ...mealPlan,
//     nutrition: sumMealsNutrition(mealPlan.meals),
//     meals: mealPlan.meals.map((meal) => ({
//       ...meal,
//       nutrition: sumMealNutrition(meal),

//       recipeItems: meal.recipeItems.map((recipeItem) => ({
//         ...recipeItem,
//         nutrition: computeFoodItemsNutrition(recipeItem.recipe.ingredients),
//       })),
//     })),
//   };
// }

function getMealPlanMeal(
  mealPlan: MealPlan,
  mealSlot: MealSlot,
): MealPlanMealWithNutrition {
  const foodItems = mealPlan.foodItems.filter(
    (foodItem) => foodItem.mealSlot === mealSlot,
  );
  const recipeItems = mealPlan.recipeItems.filter(
    (recipeItem) => recipeItem.mealSlot === mealSlot,
  );

  const foodItemsWithNutrition = foodItems.map((foodItem) => ({
    ...foodItem,
    nutrition: foodItemToWithNutrition(foodItem).nutrition,
  }));

  const recipeItemsWithNutrition = recipeItems.map((recipeItem) => {
    const recipe = recipeToWithNutrition(recipeItem.recipe);
    return {
      ...recipeItem,
      recipe,
      nutrition: multiplyNutrition(recipe.nutrition, recipeItem.servings),
    };
  });

  return {
    foodItems: foodItemsWithNutrition,
    recipeItems: recipeItemsWithNutrition,
    nutrition: roundNutrition(
      sumNutrition(...foodItemsWithNutrition, ...recipeItemsWithNutrition),
    ),
  };
}

async function getMealPlan(
  mealPlanId: number,
  userId?: number,
): Promise<MealPlanView> {
  const mealPlan = await mealPlansRepository.getMealPlan(mealPlanId);
  if (!mealPlan) {
    throw new NotFoundError();
  }

  const breakfast = getMealPlanMeal(mealPlan, "breakfast");
  const lunch = getMealPlanMeal(mealPlan, "lunch");
  const dinner = getMealPlanMeal(mealPlan, "dinner");
  const snack = getMealPlanMeal(mealPlan, "snack");

  const { foodItems, recipeItems, ...baseMealPlan } = mealPlan;

  const isSaved = userId ? await isSavedByUser(mealPlanId, userId) : false;

  return {
    ...baseMealPlan,
    breakfast,
    lunch,
    dinner,
    snack,
    nutrition: roundNutrition(sumNutrition(breakfast, lunch, dinner, snack)),
    isSaved,
  };
}

async function isSavedByUser(
  mealPlanId: number,
  userId: number,
): Promise<boolean> {
  const savedMealPlans =
    await mealPlansRepository.getUserSavedMealPlans(userId);
  const savedMealPlanIds = new Set(
    savedMealPlans.map((mealPlan) => mealPlan.id),
  );
  return savedMealPlanIds.has(mealPlanId);
}

async function getSampleMealPlans(userId: number): Promise<MealPlanView[]> {
  const mealPlans = await mealPlansRepository.getSampleMealPlans();
  return Promise.all(
    mealPlans.map((mealPlan) => getMealPlan(mealPlan.id, userId)),
  );
}

async function getUserMealPlans(userId: number): Promise<MealPlanView[]> {
  const mealPlans = await mealPlansRepository.getUserMealPlans(userId);
  return Promise.all(
    mealPlans.map((mealPlan) => getMealPlan(mealPlan.id, userId)),
  );
}

async function getAllMealPlans(userId: number): Promise<MealPlanView[]> {
  const mealPlans = await mealPlansRepository.getAllMealPlans(userId);
  return Promise.all(
    mealPlans.map((mealPlan) => getMealPlan(mealPlan.id, userId)),
  );
}

async function getSavedMealPlans(userId: number): Promise<MealPlanView[]> {
  const mealPlans = await mealPlansRepository.getUserSavedMealPlans(userId);
  return Promise.all(
    mealPlans.map((mealPlan) => getMealPlan(mealPlan.id, userId)),
  );
}

async function createMealPlan(schema: MealPlanSchema, userId: number) {
  // Check if food items have valid units
  for (const foodItem of schema.foodItems) {
    await foodsService.assertValidUnit(foodItem.foodId, foodItem.unitId);
  }
  const mealPlan = await mealPlansRepository.createMealPlan(schema, userId);
  if (!mealPlan) {
    throw new NotFoundError();
  }
  return mealPlan;
}

async function updateMealPlan(
  mealPlanId: number,
  schema: MealPlanSchema,
  userId: number,
) {
  // Check if food items have valid units
  for (const foodItem of schema.foodItems) {
    await foodsService.assertValidUnit(foodItem.foodId, foodItem.unitId);
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
  return updatedMealPlan;
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

async function activateMealPlan(mealPlanId: number, userId: number) {
  // Deactivate all meal plans
  await mealPlansRepository.deactivateAllMealPlans(userId);
  // Activate selected plan
  await mealPlansRepository.activateMealPlan(mealPlanId, userId);
}

async function deactivateMealPlan(mealPlanId: number, userId: number) {
  await mealPlansRepository.deactivateMealPlan(mealPlanId, userId);
}

async function saveMealPlan(mealPlanId: number, userId: number) {
  await mealPlansRepository.saveMealPlan(mealPlanId, userId);
}

async function unsaveMealPlan(mealPlanId: number, userId: number) {
  await mealPlansRepository.unsaveMealPlan(mealPlanId, userId);
}

export const mealPlansService = {
  getSampleMealPlans,
  getUserMealPlans,
  getMealPlan,
  getSavedMealPlans,
  getAllMealPlans,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  activateMealPlan,
  deactivateMealPlan,
  saveMealPlan,
  unsaveMealPlan,
};
