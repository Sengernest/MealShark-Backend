import { recipesRepository } from "../dataaccess/recipes";
import { CreateRecipeSchema, UpdateRecipeSchema } from "../dto/recipes";
import { Nutrition, Recipe, RecipeFood, RecipeWithNutrition } from "../types";

function accumulateNutrition(recipe: Recipe): Nutrition {
  return recipe.ingredients.reduce(
    (acc, ingredient) => {
      const factor = ingredient.amount / 100;

      acc.calories += factor * ingredient.food.calories;
      acc.macros.protein += factor * ingredient.food.protein;
      acc.macros.carbs += factor * ingredient.food.carb;
      acc.macros.fat += factor * ingredient.food.fat;

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

function withNutrition(recipe: Recipe): RecipeWithNutrition {
  return {
    ...recipe,
    nutrition: accumulateNutrition(recipe),
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
  recipe: CreateRecipeSchema,
): Promise<RecipeWithNutrition> {
  const newRecipe = await recipesRepository.createRecipe(recipe);
  return withNutrition(newRecipe);
}

async function updateRecipe(
  recipe: UpdateRecipeSchema,
): Promise<RecipeWithNutrition> {
  const updatedRecipe = await recipesRepository.updateRecipe(recipe);
  return withNutrition(updatedRecipe);
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
