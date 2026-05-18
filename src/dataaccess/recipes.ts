import { eq } from "drizzle-orm";
import db from "../db/db";
import { Recipe, RecipeInsert, recipesTable } from "../db/schema";

export async function createRecipe(recipe: RecipeInsert) {
  return await db.insert(recipesTable).values(recipe);
}

export async function getRecipes(): Promise<Recipe[]> {
  return await db.select().from(recipesTable);
}

export async function getRecipe(recipeId: number): Promise<Recipe> {
  return (
    await db.select().from(recipesTable).where(eq(recipesTable.id, recipeId))
  )[0];
}

export async function updateRecipe(recipeId: number, newRecipe: RecipeInsert) {
  return await db
    .update(recipesTable)
    .set(newRecipe)
    .where(eq(recipesTable.id, recipeId));
}

export async function deleteRecipe(recipeId: number) {
  return await db.delete(recipesTable).where(eq(recipesTable.id, recipeId));
}
