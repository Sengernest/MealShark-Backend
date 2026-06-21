import {
  usersTable,
  foodsTable,
  recipesTable,
  foodsToRecipesTable,
  mealsTable,
  recipesToMealsTable,
  foodsToMealsTable,
  nutritionGoalsTable,
  recipesToMealLogsTable,
  mealLogsTable,
  foodsToMealLogsTable,
  mealPlansTable,
  foodUnitsTable,
  unitsTable,
} from "./db/schema";

export type User = typeof usersTable.$inferSelect;
export type AuthUser = {
  id: number;
};
export type UserInput = typeof usersTable.$inferInsert;

export type ChangePasswordInput = {
  currentPassword: string,
  newPassword: string, 
}

export type Profile = {
  name: string;
  email: string;
  birthDate?: string;
  height?: number;
  gender?: "male" | "female";
}

export type ProfileWithAge = Profile & {
  age?: number;
}

export type Food = typeof foodsTable.$inferSelect & {
  units: FoodUnit[];
};

export type Unit = typeof unitsTable.$inferSelect;

export type FoodUnit = typeof foodUnitsTable.$inferSelect & {
  unit?: Unit;
};

export type SearchResult<T> = {
  item: T;
  score: number; // Similarity score
};

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

export type RecipeView = Recipe & {
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
  nutrition: Nutrition;
};

export type MealPlan = typeof mealPlansTable.$inferSelect & {
  meals: Meal[];
};

export type MealPlanWithNutrition = typeof mealPlansTable.$inferSelect & {
  meals: MealWithNutrition[];
  nutrition: Nutrition;
};

// Food with amount, corresponding to the recipe or meal in which it is contained
export type FoodItem = RecipeFood | MealFood | MealLogFood;

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
  nutrition: Nutrition;
};

export type MealItem = Meal | MealLog;

export type MealSummary = {
  meals: MealLogWithNutrition[];
  nutrition: Nutrition;
};

export type NutritionGoals = typeof nutritionGoalsTable.$inferSelect;

export type NutritionGoalsInput = {
  age: number;
  gender: "male" | "female";
  height: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "bulk_0.5"
  | "bulk_0.25"
  | "maintenance"
  | "cut_0.25"
  | "cut_0.5";
};

export type NutritionGoalsInputWithNutrition = NutritionGoalsInput & {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  etaWeeks: number | null;
};