import { eq } from "drizzle-orm";
import db from "../db/db";
import {
  foodsTable,
  foodsToRecipesTable,
  Ingredient,
  Recipe,
  RecipeInsert,
  recipesTable,
} from "../db/schema";

export async function createRecipe(
  recipe: RecipeInsert,
  ingredients: Ingredient[],
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
    return {
      ...newRecipe,
      ingredients,
    };
  });
}

// export async function getRecipes(): Promise<Recipe[]> {
//   return await db.select().from(recipesTable);
// }

// export async function getRecipe(recipeId: number): Promise<Recipe> {
//   return (
//     await db.select().from(recipesTable).where(eq(recipesTable.id, recipeId))
//   )[0];
// }

export async function updateRecipe(recipeId: number, newRecipe: RecipeInsert) {
  return await db
    .update(recipesTable)
    .set(newRecipe)
    .where(eq(recipesTable.id, recipeId));
}

export async function deleteRecipe(recipeId: number) {
  return await db.delete(recipesTable).where(eq(recipesTable.id, recipeId));
}
