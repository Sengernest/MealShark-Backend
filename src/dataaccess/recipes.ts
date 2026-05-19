import { eq } from "drizzle-orm";
import db from "../db/db";
import { foodsToRecipesTable, recipesTable } from "../db/schema";
import { Ingredient, IngredientInput, Recipe, RecipeInput } from "../types";

export async function createRecipe(
  recipe: RecipeInput,
  ingredients: IngredientInput[],
): Promise<Recipe> {
  return await db.transaction(async (tx) => {
    const [newRecipe] = await tx
      .insert(recipesTable)
      .values(recipe)
      .returning();
    await tx
      .insert(foodsToRecipesTable)
      .values(
        ingredients.map((ingredient) => ({
          ...ingredient,
          recipeId: newRecipe.id,
        })),
      )
      .returning();
    return await getRecipe(newRecipe.id);
  });
}

export async function getRecipes(): Promise<Recipe[]> {
  return await db.query.recipesTable.findMany({
    with: {
      ingredients: {
        columns: {
          amountInGrams: true,
        },
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
        columns: {
          amountInGrams: true,
        },
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

export async function updateRecipeIngredients(
  recipeId: number,
  ingredients: IngredientInput[],
) {
  return await db
    .insert(foodsToRecipesTable)
    .values(
      ingredients.map((ingredient) => ({
        ...ingredient,
        recipeId,
      })),
    )
    .returning();
}

export async function deleteRecipe(recipeId: number) {
  return await db.delete(recipesTable).where(eq(recipesTable.id, recipeId));
}
