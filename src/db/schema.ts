import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import {
  pgTable,
  integer,
  numeric,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
});

export const foodUnitsEnum = pgEnum("units", ["g", "ml"]);

export const foodsTable = pgTable("foods", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),

  unit: foodUnitsEnum().notNull(), // g or ml
  defaultServingSize: numeric("default_serving_size", { mode: "number" }), // amount in g or ml
  defaultServingDescription: text(), // e.g. 1 cup, 1 piece

  // Nutrition per 100g / 100ml
  calories: numeric({ mode: "number" }).notNull(),
  protein: numeric({ mode: "number" }).notNull(),
  fat: numeric({ mode: "number" }).notNull(),
  carb: numeric({ mode: "number" }).notNull(),
});

export const recipesTable = pgTable("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  creatorId: integer("creator_id").references(() => usersTable.id),
});

// Amount of a food item in a specific recipe, i.e. ingredients
export const foodsToRecipesTable = pgTable(
  "foods_to_recipes",
  {
    foodId: integer("food_id")
      .references(() => foodsTable.id)
      .notNull(),
    recipeId: integer("recipe_id")
      .references(() => recipesTable.id)
      .notNull(),
    amount: numeric({ mode: "number" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.foodId, table.recipeId] })],
);

export const recipesRelations = relations(recipesTable, ({ many }) => ({
  ingredients: many(foodsToRecipesTable),
}));

export const foodsToRecipesRelations = relations(
  foodsToRecipesTable,
  ({ one }) => ({
    food: one(foodsTable, {
      fields: [foodsToRecipesTable.foodId],
      references: [foodsTable.id],
    }),
  }),
);

export const mealsTable = pgTable("meals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  creatorId: integer("creator_id").references(() => usersTable.id),
});

// Number of servings of a recipe in a specific meal
export const recipesToMealsTable = pgTable("recipes_to_meal_items", {
  recipeId: integer("recipe_id")
    .references(() => recipesTable.id)
    .notNull(),
  mealId: integer("meal_id")
    .references(() => mealsTable.id)
    .notNull(),
  servings: integer().notNull(),
});

// Amount of a food in a specific meal
export const foodsToMealsTable = pgTable("foods_to_meal_items", {
  foodId: integer("food_id")
    .references(() => foodsTable.id)
    .notNull(),
  mealId: integer("meal_id")
    .references(() => mealsTable.id)
    .notNull(),
  amountInGrams: integer().notNull(),
});

export const mealsRelations = relations(mealsTable, ({ many }) => ({
  recipeItems: many(recipesToMealsTable),
  foodItems: many(foodsToMealsTable),
}));

export const recipesToMealsRelations = relations(
  recipesToMealsTable,
  ({ one }) => ({
    recipe: one(recipesTable, {
      fields: [recipesToMealsTable.recipeId],
      references: [recipesTable.id],
    }),
  }),
);

export const foodsToMealsRelations = relations(
  foodsToMealsTable,
  ({ one }) => ({
    food: one(foodsTable, {
      fields: [foodsToMealsTable.foodId],
      references: [foodsTable.id],
    }),
  }),
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
