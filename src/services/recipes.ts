import { recipesRepository } from "../dataaccess/recipes";
import { RecipeSchema } from "../dto/recipes";
import {
  NotFoundError,
  UnauthorizedError
} from "../errors/errors";
import { Recipe, RecipeView } from "../types";
import { foodsService } from "./foods";
import { sumNutrition } from "./nutrition";

function withNutrition(recipe: Recipe): RecipeView {
  return {
    ...recipe,
    nutrition: sumNutrition(recipe.ingredients, recipe.servings),
  };
}

// Get all sample recipes together with recipes created by a given user
async function getAllRecipes(userId: number): Promise<RecipeView[]> {
  const recipes = await recipesRepository.getAllRecipes(userId);
  return recipes.map(withNutrition);
}

// Get sample recipes (accessible to any user)
async function getSampleRecipes(userId?: number): Promise<RecipeView[]> {
  const recipes = await recipesRepository.getSampleRecipes();
  return recipes.map(withNutrition);
}

// Get recipes created by a given user
async function getUserRecipes(userId: number): Promise<RecipeView[]> {
  const recipes = await recipesRepository.getUserRecipes(userId);
  return recipes.map(withNutrition);
}

// Get recipe with computed calories
async function getRecipe(
  recipeId: number,
  userId: number,
): Promise<RecipeView> {
  const recipe = await recipesRepository.getRecipe(recipeId);
  if (!recipe) {
    throw new NotFoundError();
  }
  if (!recipe.isSample && recipe.creatorId !== userId) {
    throw new UnauthorizedError();
  }
  return withNutrition(recipe);
}



async function createRecipe(
  recipe: RecipeSchema,
  userId: number,
): Promise<RecipeView> {
  // Check if ingredients have valid units
  for (const ingredient of recipe.ingredients) {
    await foodsService.assertValidUnit(ingredient.foodId, ingredient.unitId)
  }
  const newRecipe = await recipesRepository.createRecipe(recipe, userId);
  if (!newRecipe) {
    throw new NotFoundError();
  }
  return withNutrition(newRecipe);
}

async function updateRecipe(
  recipeId: number,
  recipeUpdateData: RecipeSchema,
  userId: number,
): Promise<RecipeView> {
  const recipe = await recipesRepository.getRecipe(recipeId);
  if (!recipe) {
    throw new NotFoundError();
  }
  // Ensure that the recipe can only be updated by its creator
  if (recipe.creatorId !== userId) {
    throw new UnauthorizedError();
  }
  // Check if ingredients have valid units
  for (const ingredient of recipeUpdateData.ingredients) {
    await foodsService.assertValidUnit(ingredient.foodId, ingredient.unitId);
  }

  const updatedRecipe = await recipesRepository.updateRecipe(
    recipeId,
    recipeUpdateData,
  );
  if (!updatedRecipe) {
    throw new NotFoundError();
  }
  return withNutrition(updatedRecipe);
}

async function deleteRecipe(recipeId: number, userId: number) {
  const recipe = await recipesRepository.getRecipe(recipeId);
  if (!recipe) {
    throw new NotFoundError();
  }
  // Ensure that the recipe can only be deleted by its creator
  if (recipe.creatorId !== userId) {
    throw new UnauthorizedError();
  }
  return recipesRepository.deleteRecipe(recipeId);
}

export const recipesService = {
  getAllRecipes,
  getSampleRecipes,
  getUserRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
