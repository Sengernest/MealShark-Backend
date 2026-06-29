import { recipesRepository } from "../dataaccess/recipes";
import { RecipeSchema } from "../dto/recipes";
import {
  BusinessError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors";
import { RecipeView, RecipeWithNutrition } from "../types";
import { foodsService } from "./foods";
import { recipeToWithNutrition } from "./nutrition";

const withNutrition = recipeToWithNutrition;

async function withIsSaved(
  recipe: RecipeWithNutrition,
  userId?: number,
): Promise<RecipeView> {
  if (!userId) {
    return { ...recipe, isSaved: false };
  }
  const savedRecipes = await recipesRepository.getUserSavedRecipes(userId);
  const savedRecipeIds = new Set(savedRecipes.map((recipe) => recipe.id));
  return { ...recipe, isSaved: savedRecipeIds.has(recipe.id) };
}

// Get all sample recipes together with recipes created by a given user
async function getAllRecipes(userId: number): Promise<RecipeWithNutrition[]> {
  const recipes = await recipesRepository.getAllRecipes(userId);
  return Promise.all(
    recipes.map((recipe) => withIsSaved(withNutrition(recipe), userId)),
  );
}

// Get sample recipes (accessible to any user)
async function getSampleRecipes(
  userId?: number,
): Promise<RecipeWithNutrition[]> {
  const recipes = await recipesRepository.getSampleRecipes();
  return Promise.all(
    recipes.map((recipe) => withIsSaved(withNutrition(recipe), userId)),
  );
}

// Get recipes created by user
async function getUserRecipes(userId: number): Promise<RecipeWithNutrition[]> {
  const recipes = await recipesRepository.getUserRecipes(userId);
  return Promise.all(
    recipes.map((recipe) => withIsSaved(withNutrition(recipe), userId)),
  );
}

// Get recipes saved by user
async function getUserSavedRecipes(userId: number): Promise<RecipeView[]> {
  const recipes = await recipesRepository.getUserSavedRecipes(userId);
  return recipes.map((recipe) => ({ ...withNutrition(recipe), isSaved: true }));
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
  return withIsSaved(withNutrition(recipe), userId);
}

async function createRecipe(
  recipe: RecipeSchema,
  userId: number,
): Promise<RecipeWithNutrition> {
  // Check if ingredients have valid units
  for (const ingredient of recipe.ingredients) {
    await foodsService.assertValidUnit(ingredient.foodId, ingredient.unitId);
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
): Promise<RecipeWithNutrition> {
  const recipe = await recipesRepository.getRecipe(recipeId);
  if (!recipe) {
    throw new NotFoundError();
  }
  if (recipe.isSample) {
    throw new BusinessError("Cannot edit sample recipe");
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
  getUserSavedRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
