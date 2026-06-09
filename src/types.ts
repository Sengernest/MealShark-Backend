import {
  usersTable,
  foodsTable,
  recipesTable,
  foodsToRecipesTable,
  mealsTable,
  recipesToMealsTable,
  foodsToMealsTable,
  macroGoalsTable,
  recipesToMealLogsTable,
  mealLogsTable,
  foodsToMealLogsTable,
  mealPlansTable,
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

export type MealWithNutrition = Meal & {
  nutrition: Nutrition
}

export type MealPlan = typeof mealPlansTable.$inferSelect & {
  meals: Meal[]
}

export type MealPlanWithNutrition = MealPlan & {
  nutrition: Nutrition
}

// Food with amount, corresponding to the recipe or meal in which it is contained
export type FoodItem = RecipeFood | MealFood | MealLogFood

export type MealLogRecipe = typeof recipesToMealLogsTable.$inferSelect & {
  recipe: Recipe;
};

export type MealLogFood = typeof foodsToMealLogsTable.$inferSelect & {
  food: Food;
};

export type MealLog = typeof mealLogsTable.$inferSelect & {
  recipeItems: MealLogRecipe[];
  foodItems: MealLogFood[];
};

export type MealLogWithNutrition = MealLog & {
  nutrition: Nutrition
}

export type MacroGoals = typeof macroGoalsTable.$inferSelect & {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type MacroGoalInput = {
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "cutting" | "maintain" | "bulking";
};
