import { recipesRepository } from "../dataaccess/recipes";
import { CreateRecipeSchema, UpdateRecipeSchema } from "../dto/recipes";
import { Recipe } from "../types";

async function getRecipes(): Promise<Recipe[]> {
  return recipesRepository.getRecipes();
}

// Get recipes created by a given user
async function getUserRecipes(userId: number): Promise<Recipe[]> {
  return recipesRepository.getUserRecipes(userId);
}

async function getRecipe(recipeId: number): Promise<Recipe> {
  return recipesRepository.getRecipe(recipeId);
}

async function createRecipe(recipe: CreateRecipeSchema): Promise<Recipe> {
  return recipesRepository.createRecipe(recipe);
}

async function updateRecipe(recipe: UpdateRecipeSchema): Promise<Recipe> {
  return recipesRepository.updateRecipe(recipe);
}

async function deleteRecipe(recipeId: number) {
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
