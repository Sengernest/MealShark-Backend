import { relations } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";
import { pgTable, integer, text, primaryKey } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  email: text().notNull().unique(),
});

export type User = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;

export const foodsTable = pgTable("foods", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  caloriesPer100g: integer(),
});

export type Food = typeof foodsTable.$inferSelect;
export type FoodInsert = typeof foodsTable.$inferInsert;

export const recipesTable = pgTable("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  creatorId: integer("author_id").references(() => usersTable.id),
});

export const recipesRelations = relations(recipesTable, ({many}) => ({
  ingredients: many(foodsToRecipesTable)
}))

export type RecipeSelect = typeof recipesTable.$inferSelect;
export type RecipeInsert = typeof recipesTable.$inferInsert;

// Amount of a food item in a specific recipe, i.e. ingredients
export const foodsToRecipesTable = pgTable(
  "foods_to_recipes",
  {
    foodId: integer("food_id").references(() => foodsTable.id),
    recipeId: integer("recipe_id").references(() => recipesTable.id),
    amountInGrams: integer(),
  },
  (table) => [primaryKey({ columns: [table.foodId, table.recipeId] })],
);

export type Ingredient = Omit<
  typeof foodsToRecipesTable.$inferSelect,
  "recipeId"
>;
export type Recipe = RecipeSelect & { ingredients: Ingredient[] };

export const mealsTable = pgTable("meals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  creatorId: integer("author_id").references(() => usersTable.id),
});

export type Meal = typeof mealsTable.$inferSelect;
export type MealInsert = typeof mealsTable.$inferInsert;

// Amount of a recipe in a specific meal
export const recipesToMealsTable = pgTable(
  "recipes_to_meals",
  {
    recipeId: integer("recipe_id").references(() => recipesTable.id),
    mealId: integer("meal_id").references(() => mealsTable.id),
    quantity: integer(),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.mealId] })],
);

export const mealLogsTable = pgTable("meal_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mealId: integer("meal_id").references(() => mealsTable.id),
  consumerId: integer("consumer_id").references(() => usersTable.id),
  consumedAt: timestamp(),
});

export const mealPlansTable = pgTable("meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  creatorId: integer("author_id").references(() => usersTable.id),
  name: text().notNull(),
});

export const mealsToMealPlansTable = pgTable(
  "meals_to_meal_plans",
  {
    mealPlanId: integer("meal_plan_id").references(() => mealPlansTable.id),
    mealId: integer("meal_id").references(() => mealsTable.id),
    mealSlot: integer(), // e.g. Meal 1, Meal 2
  },
  (table) => [primaryKey({ columns: [table.mealPlanId, table.mealSlot] })],
);
