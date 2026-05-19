import {
  usersTable,
  foodsTable,
  recipesTable,
  foodsToRecipesTable,
  mealsTable,
} from "./db/schema";

export type User = typeof usersTable.$inferSelect;
export type UserInput = typeof usersTable.$inferInsert;

export type Food = typeof foodsTable.$inferSelect;
export type FoodInput = typeof foodsTable.$inferInsert;

export type Ingredient = {
  amountInGrams: number;
  food: Food | null;
};

export type IngredientInput = {
  amountInGrams: number;
  foodId: number;
};

export type Recipe = typeof recipesTable.$inferSelect & {
  ingredients: Ingredient[];
};
export type RecipeInput = typeof recipesTable.$inferInsert & {
  ingredients: IngredientInput[];
};

export type Meal = typeof mealsTable.$inferSelect;
export type MealInput = typeof mealsTable.$inferInsert;
