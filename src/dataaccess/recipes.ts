import { eq } from "drizzle-orm";
import db from "../db/db";
import { foodsToRecipesTable, recipesTable } from "../db/schema";
import { Recipe } from "../types";
import { CreateRecipeSchema, UpdateRecipeSchema } from "../api/schemas/recipes";

export async function getRecipes(): Promise<Recipe[]> {
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
export async function getUserRecipes(userId: number): Promise<Recipe[]> {
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

export async function getRecipe(recipeId: number): Promise<Recipe> {
  const recipe = await db.query.recipesTable.findFirst({
    where: eq(recipesTable.id, recipeId),
    with: {
      ingredients: {
        with: {
          food: true,
        },
      },
    },
  });
  if (!recipe) {
    throw new Error("Recipe not found");
  }
  return recipe;
}

export async function createRecipe(
  recipe: CreateRecipeSchema,
): Promise<Recipe> {
  return await db.transaction(async (tx) => {
    const [newRecipe] = await tx
      .insert(recipesTable)
      .values({
        name: recipe.name,
        creatorId: recipe.creatorId,
      })
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

export async function updateRecipe(
  recipe: UpdateRecipeSchema,
): Promise<Recipe> {
  return await db.transaction(async (tx) => {
    await tx
      .update(recipesTable)
      .set({
        name: recipe.name,
        creatorId: recipe.creatorId,
      })
      .where(eq(recipesTable.id, recipe.recipeId));

    // Delete all existing ingredients
    await tx
      .delete(foodsToRecipesTable)
      .where(eq(foodsToRecipesTable.recipeId, recipe.recipeId));
    // Replace with updated ingredients
    await tx.insert(foodsToRecipesTable).values(
      recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        recipeId: recipe.recipeId,
      })),
    );

    return getRecipe(recipe.recipeId);
  });
}

export async function deleteRecipe(recipeId: number) {
  return await db.delete(recipesTable).where(eq(recipesTable.id, recipeId));
}
