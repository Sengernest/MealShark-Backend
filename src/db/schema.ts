import { relations } from "drizzle-orm";
import { date } from "drizzle-orm/pg-core";
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
  carbs: numeric({ mode: "number" }).notNull(),
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

export const mealPlansTable = pgTable("meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  creatorId: integer("creator_id").references(() => usersTable.id),
  name: text().notNull(), // e.g. Bulking plan
});

export const mealsTable = pgTable("meals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  mealPlanId: integer("meal_plan_id")
    .references(() => mealPlansTable.id)
    .notNull(),
  mealPlanIndex: integer().notNull(),
});

// Number of servings of a recipe in a specific meal
export const recipesToMealsTable = pgTable(
  "recipes_to_meals",
  {
    recipeId: integer("recipe_id")
      .references(() => recipesTable.id)
      .notNull(),
    mealId: integer("meal_id")
      .references(() => mealsTable.id)
      .notNull(),
    servings: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.recipeId, table.mealId] })],
);

// Amount of a food in a specific meal
export const foodsToMealsTable = pgTable(
  "foods_to_meals",
  {
    foodId: integer("food_id")
      .references(() => foodsTable.id)
      .notNull(),
    mealId: integer("meal_id")
      .references(() => mealsTable.id)
      .notNull(),
    amount: numeric({ mode: "number" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.foodId, table.mealId] })],
);

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
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  logDate: date({ mode: "string" }),
  mealIndex: integer().notNull(), // e.g. Meal 1, Meal 2
});

export const recipesToMealLogsTable = pgTable(
  "recipes_to_meal_logs",
  {
    mealLogId: integer("meal_log_id")
      .references(() => mealLogsTable.id)
      .notNull(),
    recipeId: integer("recipe_id")
      .references(() => recipesTable.id)
      .notNull(),
    servings: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.mealLogId, table.recipeId] })],
);

export const foodsToMealLogsTable = pgTable(
  "foods_to_meal_logs",
  {
    mealLogId: integer("meal_log_id")
      .references(() => mealLogsTable.id)
      .notNull(),
    foodId: integer("food_id")
      .references(() => foodsTable.id)
      .notNull(),
    amount: numeric({ mode: "number" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.mealLogId, table.foodId] })],
);

export const mealLogsRelations = relations(mealLogsTable, ({ many }) => ({
  recipeItems: many(recipesToMealLogsTable),
  foodItems: many(foodsToMealLogsTable),
}));

export const recipesToMealLogsRelations = relations(
  recipesToMealLogsTable,
  ({ one }) => ({
    recipe: one(recipesTable, {
      fields: [recipesToMealLogsTable.recipeId],
      references: [recipesTable.id],
    }),
  }),
);

export const foodsToMealLogsRelations = relations(
  foodsToMealLogsTable,
  ({ one }) => ({
    food: one(foodsTable, {
      fields: [foodsToMealLogsTable.foodId],
      references: [foodsTable.id],
    }),
  }),
);

export const macroGoalsTable = pgTable("macro_goals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  creatorId: integer("creator_id").references(() => usersTable.id),
  gender: text().notNull(),
  age: integer().notNull(),
  height: numeric({ mode: "number" }).notNull(),
  weight: numeric({ mode: "number" }).notNull(),
  activityLevel: text().notNull(), // sedentary, light, moderate, active, very_active
  goal: text().notNull(), // cutting, maintain, bulking
  calories: integer().notNull(),
  carbs: integer().notNull(),
  protein: integer().notNull(),
  fat: integer().notNull(),
});
