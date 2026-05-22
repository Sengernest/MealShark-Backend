import { eq } from "drizzle-orm";
import db from "../db/db";
import { foodsToRecipesTable, recipesTable } from "../db/schema";
import { RecipeCreateRequest, Recipe, RecipeUpdateRequest } from "../types";

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
  payload: RecipeCreateRequest,
): Promise<Recipe> {
  return await db.transaction(async (tx) => {
    const [newRecipe] = await tx
      .insert(recipesTable)
      .values(payload.recipeData)
      .returning();
    await tx
      .insert(foodsToRecipesTable)
      .values(
        payload.ingredients.map((ingredient) => ({
          ...ingredient,
          recipeId: newRecipe.id,
        })),
      )
      .returning();
    return getRecipe(newRecipe.id);
  });
}

export async function updateRecipe(
  payload: RecipeUpdateRequest,
): Promise<Recipe> {
  return await db.transaction(async (tx) => {
    await tx
      .update(recipesTable)
      .set(payload.recipeData)
      .where(eq(recipesTable.id, payload.recipeId));

    // Delete all existing ingredients
    await tx
      .delete(foodsToRecipesTable)
      .where(eq(foodsToRecipesTable.recipeId, payload.recipeId));
    // Replace with updated ingredients
    await tx.insert(foodsToRecipesTable).values(
      payload.ingredients.map((ingredient) => ({
        ...ingredient,
        recipeId: payload.recipeId,
      })),
    );

    return getRecipe(payload.recipeId);
  });
}

export async function deleteRecipe(recipeId: number) {
  return await db.delete(recipesTable).where(eq(recipesTable.id, recipeId));
}
