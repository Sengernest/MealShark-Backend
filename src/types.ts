import {
  usersTable,
  foodsTable,
  recipesTable,
  foodsToRecipesTable,
  foodsToMealPlansTable,
  nutritionGoalsTable,
  recipeEntriesTable,
  foodEntriesTable,
  mealPlansTable,
  foodUnitsTable,
  unitsTable,
  mealSlotEnum,
  recipesToMealPlansTable,
} from "./db/schema";

export type User = typeof usersTable.$inferSelect;
export type AuthUser = {
  id: number;
};
export type UserInput = typeof usersTable.$inferInsert;

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type Profile = {
  name: string;
  email: string;
  birthDate?: string;
  height?: number;
  gender?: "male" | "female";
};

export type ProfileWithAge = Profile & {
  age?: number;
};

export type Food = typeof foodsTable.$inferSelect & {
  units: FoodUnit[];
};

export type Unit = typeof unitsTable.$inferSelect;

export type FoodUnit = typeof foodUnitsTable.$inferSelect & {
  unit?: Unit;
};

export type Nutrition = {
  calories: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
};

export type FoodItem = {
  foodId: number;
  food: Food;
  unitId: number;
  unit: Unit;
  amount: number;
};

export type FoodItemWithNutrition = FoodItem & {
  nutrition: Nutrition;
};

export type Ingredient = typeof foodsToRecipesTable.$inferSelect & {
  food: Food;
  unit: Unit;
};

export type IngredientWithNutrition = Ingredient & {
  nutrition: Nutrition;
};

export type Recipe = typeof recipesTable.$inferSelect & {
  ingredients: Ingredient[];
};

export type RecipeWithNutrition = typeof recipesTable.$inferSelect & {
  ingredients: IngredientWithNutrition[];
  nutrition: Nutrition;
};

export type RecipeItem = {
  recipeId: number;
  recipe: Recipe;
  servings: number;
};

export type RecipeItemWithNutrition = {
  recipeId: number;
  recipe: RecipeWithNutrition;
  nutrition: Nutrition;
};

export type FoodEntry = typeof foodEntriesTable.$inferSelect & {
  food: Food;
  unit: Unit;
};

export type FoodEntryWithNutrition = FoodEntry & {
  nutrition: Nutrition;
};

export type RecipeEntry = typeof recipeEntriesTable.$inferSelect & {
  recipe: Recipe;
};

export type RecipeEntryWithNutrition =
  typeof recipeEntriesTable.$inferSelect & {
    recipe: RecipeWithNutrition;
    nutrition: Nutrition;
  };

export type MealEntry = {
  foodItems: FoodEntry[];
  recipeItems: RecipeEntry[];
};

export type MealEntryWithNutrition = {
  foodEntries: FoodEntryWithNutrition[];
  recipeEntries: RecipeEntryWithNutrition[];
  nutrition: Nutrition;
};

export type MealLog = {
  nutrition: Nutrition;
  breakfast: MealEntryWithNutrition;
  lunch: MealEntryWithNutrition;
  dinner: MealEntryWithNutrition;
  snack: MealEntryWithNutrition;
};

export type MealSlot = (typeof mealSlotEnum.enumValues)[number];

export type Consumable = {
  nutrition: Nutrition;
};

export type Meal = {
  foodItems: FoodItem[];
  recipeItems: RecipeItem[];
};

export type MealPlanFood = typeof foodsToMealPlansTable.$inferSelect & {
  food: Food;
  unit: Unit;
};

export type MealPlanFoodWithNutrition = MealPlanFood & {
  nutrition: Nutrition;
};

export type MealPlanRecipe = typeof recipesToMealPlansTable.$inferSelect & {
  recipe: Recipe;
};

export type MealPlanRecipeWithNutrition =
  typeof recipesToMealPlansTable.$inferSelect & {
    recipe: RecipeWithNutrition;
    nutrition: Nutrition;
  };

export type MealPlanMeal = {
  foodItems: MealPlanFood[];
  recipeItems: MealPlanRecipe[];
};

export type MealPlanMealWithNutrition = {
  foodItems: MealPlanFoodWithNutrition[];
  recipeItems: MealPlanRecipeWithNutrition[];
  nutrition: Nutrition;
};

export type MealPlanBase = typeof mealPlansTable.$inferSelect;

export type MealPlan = MealPlanBase & {
  nutrition: Nutrition
  breakfast: MealPlanMealWithNutrition;
  lunch: MealPlanMealWithNutrition;
  dinner: MealPlanMealWithNutrition;
  snack: MealPlanMealWithNutrition;
};

export type NutritionGoals = typeof nutritionGoalsTable.$inferSelect;

export type NutritionGoalsInput = {
  age: number;
  gender: "male" | "female";
  height: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "bulk_0.5" | "bulk_0.25" | "maintenance" | "cut_0.25" | "cut_0.5";
};

export type NutritionGoalsInputWithNutrition = NutritionGoalsInput & {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  etaWeeks: number | null;
};
