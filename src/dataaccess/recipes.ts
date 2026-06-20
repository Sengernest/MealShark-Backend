import { eq, or, SQL } from "drizzle-orm";
import db from "../db/db";
import { foodsToRecipesTable, recipesTable } from "../db/schema";
import { RecipeSchema } from "../dto/recipes";
import { Recipe } from "../types";

async function getRecipes(filterCondition: SQL): Promise<Recipe[]> {
  return await db.query.recipesTable.findMany({
    where: filterCondition,
    with: {
      ingredients: {
        with: {
          unit: true,
          food: {
            with: {
              units: {
                with: {
                  unit: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// Get all sample recipes together with recipes created by a given user
async function getAllRecipes(userId: number): Promise<Recipe[]> {
  return getRecipes(
    or(eq(recipesTable.creatorId, userId), recipesTable.isSample)!,
  );
}

async function getSampleRecipes(): Promise<Recipe[]> {
  return getRecipes(eq(recipesTable.isSample, true));
}

// Get recipes created by a given user
async function getUserRecipes(userId: number): Promise<Recipe[]> {
  return getRecipes(eq(recipesTable.creatorId, userId));
}

async function getRecipe(recipeId: number): Promise<Recipe | undefined> {
  return await db.query.recipesTable.findFirst({
    where: eq(recipesTable.id, recipeId),
    with: {
      ingredients: {
        with: {
          unit: true,
          food: {
            with: {
              units: {
                with: {
                  unit: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function createRecipe(
  recipe: RecipeSchema,
  creatorId: number,
): Promise<Recipe | undefined> {
  const newRecipe = await db.transaction(async (tx) => {
    const [newRecipe] = await tx
      .insert(recipesTable)
      .values({ ...recipe, name: recipe.name, creatorId, isSample: false })
      .returning();
    await tx.insert(foodsToRecipesTable).values(
      recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        recipeId: newRecipe.id,
      })),
    );
    return newRecipe;
  });
  return getRecipe(newRecipe.id);
}

async function updateRecipe(
  recipeId: number,
  recipe: RecipeSchema,
): Promise<Recipe | undefined> {
  await db.transaction(async (tx) => {
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
  });
  return getRecipe(recipeId);
}

async function deleteRecipe(recipeId: number) {
  return await db.delete(recipesTable).where(eq(recipesTable.id, recipeId));
}

export const recipesRepository = {
  getAllRecipes,
  getSampleRecipes,
  getUserRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
