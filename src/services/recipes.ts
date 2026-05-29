import { recipesRepository } from "../dataaccess/recipes";
import { CreateRecipeSchema, UpdateRecipeSchema } from "../dto/recipes";
import { Recipe, RecipeWithCalories } from "../types";

async function getRecipes(): Promise<RecipeWithCalories[]> {
  const recipes = await recipesRepository.getRecipes();
  return recipes.map(withCalories);
}

// Get recipes created by a given user
async function getUserRecipes(userId: number): Promise<RecipeWithCalories[]> {
  const recipes = await recipesRepository.getUserRecipes(userId);
  return recipes.map(withCalories);
}

// Get recipe with computed calories
async function getRecipe(recipeId: number): Promise<RecipeWithCalories> {
  const recipe = await recipesRepository.getRecipe(recipeId);
  return withCalories(recipe);
}

function withCalories(recipe: Recipe): RecipeWithCalories {
  return {
    ...recipe,
    calories: recipe.ingredients.reduce(
      (acc, ingredient) =>
        acc + (ingredient.amount / 100) * ingredient.food.calories,
      0,
    ),
  };
}

async function createRecipe(
  recipe: CreateRecipeSchema,
): Promise<RecipeWithCalories> {
  const newRecipe = await recipesRepository.createRecipe(recipe);
  return withCalories(newRecipe);
}

async function updateRecipe(
  recipe: UpdateRecipeSchema,
): Promise<RecipeWithCalories> {
  const updatedRecipe = await recipesRepository.updateRecipe(recipe);
  return withCalories(updatedRecipe);
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
