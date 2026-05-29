import {
  usersTable,
  foodsTable,
  recipesTable,
  foodsToRecipesTable,
  mealsTable,
  recipesToMealsTable,
  foodsToMealsTable,
} from "./db/schema";

export type User = typeof usersTable.$inferSelect;
export type UserInput = typeof usersTable.$inferInsert;

export type Food = typeof foodsTable.$inferSelect;
export type FoodInput = typeof foodsTable.$inferInsert;

export type RecipeFood = typeof foodsToRecipesTable.$inferSelect & {
  food: Food;
};

export type Recipe = typeof recipesTable.$inferSelect & {
  ingredients: RecipeFood[];
};

export type Nutrition = {
  calories: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
};

export type RecipeWithNutrition = Recipe & {
  nutrition: Nutrition;
};

export type MealRecipe = typeof recipesToMealsTable.$inferSelect & {
  recipe: Recipe;
};

export type MealFood = typeof foodsToMealsTable.$inferSelect & {
  food: Food;
};

export type Meal = typeof mealsTable.$inferSelect & {
  recipeItems: MealRecipe[];
  foodItems: MealFood[];
};
