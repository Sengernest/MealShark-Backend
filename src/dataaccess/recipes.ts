import { eq } from "drizzle-orm";
import db from "../db/db";
import { foodsToRecipesTable, recipesTable } from "../db/schema";
import { RecipeSchema } from "../dto/recipes";
import { Recipe } from "../types";

async function getRecipes(): Promise<Recipe[]> {
  return await db.query.recipesTable.findMany({
    with: {
      ingredients: {
        with: {
          food: true,
        },
      },
    },
  });
}

// Get recipes created by a given user
async function getUserRecipes(userId: number): Promise<Recipe[]> {
  return await db.query.recipesTable.findMany({
    where: eq(recipesTable.creatorId, userId),
    with: {
      ingredients: {
        with: {
          food: true,
        },
      },
    },
  });
}

async function getRecipe(recipeId: number): Promise<Recipe | undefined> {
  return await db.query.recipesTable.findFirst({
    where: eq(recipesTable.id, recipeId),
    with: {
      ingredients: {
        with: {
          food: true,
        },
      },
    },
  });
}

async function createRecipe(
  recipe: RecipeSchema,
  creatorId: number | undefined,
): Promise<Recipe | undefined> {
  return await db.transaction(async (tx) => {
    const [newRecipe] = await tx
      .insert(recipesTable)
      .values({ name: recipe.name, creatorId })
      .returning();
    await tx
      .insert(foodsToRecipesTable)
      .values(
        recipe.ingredients.map((ingredient) => ({
          ...ingredient,
          recipeId: newRecipe.id,
        })),
      )
      .returning();
    return getRecipe(newRecipe.id);
  });
}

async function updateRecipe(
  recipeId: number,
  recipe: RecipeSchema,
): Promise<Recipe | undefined> {
  return await db.transaction(async (tx) => {
    await tx
      .update(recipesTable)
      .set({ name: recipe.name })
      .where(eq(recipesTable.id, recipeId));

    // Delete all existing ingredients
    await tx
      .delete(foodsToRecipesTable)
      .where(eq(foodsToRecipesTable.recipeId, recipeId));
    // Replace with updated ingredients
    await tx.insert(foodsToRecipesTable).values(
      recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        recipeId: recipeId,
      })),
    );

    return getRecipe(recipeId);
  });
}

async function deleteRecipe(recipeId: number) {
  return await db.delete(recipesTable).where(eq(recipesTable.id, recipeId));
}

export const recipesRepository = {
  getRecipes,
  getUserRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
