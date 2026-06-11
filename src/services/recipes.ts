import { recipesRepository } from "../dataaccess/recipes";
import { CreateRecipeSchema, UpdateRecipeSchema } from "../dto/recipes";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import {
  Recipe,
  RecipeWithNutrition
} from "../types";
import { sumNutrition } from "./nutrition";

function withNutrition(recipe: Recipe): RecipeWithNutrition {
  return {
    ...recipe,
    nutrition: sumNutrition(recipe.ingredients),
  };
}

async function getRecipes(): Promise<RecipeWithNutrition[]> {
  const recipes = await recipesRepository.getRecipes();
  return recipes.map(withNutrition);
}

// Get recipes created by a given user
async function getUserRecipes(userId: number): Promise<RecipeWithNutrition[]> {
  const recipes = await recipesRepository.getUserRecipes(userId);
  return recipes.map(withNutrition);
}

// Get recipe with computed calories
async function getRecipe(recipeId: number): Promise<RecipeWithNutrition> {
  const recipe = await recipesRepository.getRecipe(recipeId);
  return withNutrition(recipe);
}

async function createRecipe(
  recipe: CreateRecipeSchema, userId: number | undefined
): Promise<RecipeWithNutrition> {
  const newRecipe = await recipesRepository.createRecipe(recipe, userId);
  return withNutrition(newRecipe);
}

async function updateRecipe(
  recipeUpdateData: UpdateRecipeSchema, userId: number | undefined
): Promise<RecipeWithNutrition> {
  const recipe = await recipesRepository.getRecipe(recipeUpdateData.recipeId)
  if (!recipe) {
    throw new NotFoundError()
  }
  // Ensure that the recipe can only be updated by its creator
  if (recipe.creatorId !== userId) {
    throw new UnauthorizedError()
  }
  const updatedRecipe = await recipesRepository.updateRecipe(recipeUpdateData);
  return withNutrition(updatedRecipe);
}

async function deleteRecipe(recipeId: number, userId: number | undefined) {
  const recipe = await recipesRepository.getRecipe(recipeId);
  if (!recipe) {
    throw new NotFoundError()
  }
  // Ensure that the recipe can only be deleted by its creator
  if (recipe.creatorId !== userId) {
    throw new UnauthorizedError()
  }
  return recipesRepository.deleteRecipe(recipeId);
}

export const recipesService = {
  getRecipes,
  getUserRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
