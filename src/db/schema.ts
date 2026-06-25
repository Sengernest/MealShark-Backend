import { relations } from "drizzle-orm";
import { date, foreignKey } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core";
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
  birthDate: date(),
  age: integer(),
  height: integer(),
  gender: text(),
});

export const foodsTable = pgTable("foods", {
  id: integer().primaryKey(),
  name: text().notNull(),
  defaultServingSize: numeric("default_serving_size", { mode: "number" }), // in grams
  // Nutrition per 100g
  calories: numeric({ mode: "number" }).notNull(),
  protein: numeric({ mode: "number" }).notNull(),
  fat: numeric({ mode: "number" }).notNull(),
  carbs: numeric({ mode: "number" }).notNull(),
});

export const unitsTable = pgTable("units", {
  id: integer().primaryKey(),
  name: text().notNull(),
});

// Stores conversions of grams to other units for each food
export const foodUnitsTable = pgTable(
  "food_units",
  {
    foodId: integer("food_id")
      .references(() => foodsTable.id)
      .notNull(),
    unitId: integer("unit_id")
      .references(() => unitsTable.id)
      .notNull(),
    gramsPerUnit: numeric({ mode: "number" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.foodId, table.unitId] })],
);

export const recipesTable = pgTable("recipes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  creatorId: integer("creator_id").references(() => usersTable.id), // Null if sample
  isSample: boolean().notNull(),
  description: text(),
  instructions: text(),
  servings: integer().notNull(),
  prepTime: integer(),
  cookTime: integer(),
  category: text()
});

// Amount of a food item in a specific recipe, i.e. ingredients
export const foodsToRecipesTable = pgTable(
  "foods_to_recipes",
  {
    foodId: integer("food_id")
      .references(() => foodsTable.id)
      .notNull(),
    recipeId: integer("recipe_id")
      .references(() => recipesTable.id, { onDelete: "cascade" })
      .notNull(),
    amount: numeric({ mode: "number" }).notNull(),
    unitId: integer("unit_id")
      .references(() => unitsTable.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.foodId, table.recipeId] }),
    foreignKey({
      columns: [table.foodId, table.unitId],
      foreignColumns: [foodUnitsTable.foodId, foodUnitsTable.unitId],
    }),
  ],
);

export const foodsRelations = relations(foodsTable, ({ many }) => ({
  units: many(foodUnitsTable),
}));

export const foodsToUnitsRelations = relations(foodUnitsTable, ({ one }) => ({
  food: one(foodsTable, {
    fields: [foodUnitsTable.foodId],
    references: [foodsTable.id],
  }),
  unit: one(unitsTable, {
    fields: [foodUnitsTable.unitId],
    references: [unitsTable.id],
  }),
}));

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
    recipe: one(recipesTable, {
      fields: [foodsToRecipesTable.recipeId],
      references: [recipesTable.id],
    }),
    unit: one(unitsTable, {
      fields: [foodsToRecipesTable.unitId],
      references: [unitsTable.id],
    }),
  }),
);

export const mealPlansTable = pgTable("meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  creatorId: integer("creator_id").references(() => usersTable.id), // Null if sample meal
  name: text().notNull(), // e.g. Bulking plan
  description: text(),
  isActive: boolean().notNull(),
  targetCalories: integer().notNull(),
});

export const mealsTable = pgTable(
  "meals",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    mealPlanId: integer("meal_plan_id")
      .references(() => mealPlansTable.id, { onDelete: "cascade" })
      .notNull(),
    mealPlanIndex: integer().notNull(),
  },
  (table) => [unique().on(table.mealPlanId, table.mealPlanIndex)],
);

// Number of servings of a recipe in a specific meal
export const recipesToMealsTable = pgTable(
  "recipes_to_meals",
  {
    recipeId: integer("recipe_id")
      .references(() => recipesTable.id)
      .notNull(),
    mealId: integer("meal_id")
      .references(() => mealsTable.id, { onDelete: "cascade" })
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
      .references(() => mealsTable.id, { onDelete: "cascade" })
      .notNull(),
    amount: numeric({ mode: "number" }).notNull(),
    unitId: integer("unit_id")
      .references(() => unitsTable.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.foodId, table.mealId] })],
);

export const mealPlansRelations = relations(mealPlansTable, ({ many }) => ({
  meals: many(mealsTable),
}));

export const mealsRelations = relations(mealsTable, ({ many, one }) => ({
  mealPlan: one(mealPlansTable, {
    fields: [mealsTable.mealPlanId],
    references: [mealPlansTable.id],
  }),
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
    meal: one(mealsTable, {
      fields: [recipesToMealsTable.mealId],
      references: [mealsTable.id],
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
    unit: one(unitsTable, {
      fields: [foodsToMealsTable.unitId],
      references: [unitsTable.id],
    }),
    meal: one(mealsTable, {
      fields: [foodsToMealsTable.mealId],
      references: [mealsTable.id],
    }),
  }),
);

export const mealSlotEnum = pgEnum("meal_slot", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

export const foodEntriesTable = pgTable("food_entries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  logDate: date("log_date", { mode: "string" }).notNull(),
  mealSlot: mealSlotEnum("meal_slot").notNull(),
  foodId: integer("food_id")
    .references(() => foodsTable.id)
    .notNull(),
  amount: numeric({ mode: "number" }).notNull(),
  unitId: integer("unit_id")
    .references(() => unitsTable.id)
    .notNull(),
});

export const foodEntriesRelations = relations(foodEntriesTable, ({ one }) => ({
  food: one(foodsTable, {
    fields: [foodEntriesTable.foodId],
    references: [foodsTable.id],
  }),
  unit: one(unitsTable, {
    fields: [foodEntriesTable.unitId],
    references: [unitsTable.id],
  }),
}));

export const recipeEntriesTable = pgTable("recipe_entries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  logDate: date("log_date", { mode: "string" }).notNull(),
  mealSlot: mealSlotEnum("meal_slot").notNull(),
  recipeId: integer("recipe_id")
    .references(() => recipesTable.id)
    .notNull(),
  servings: integer().notNull(),
});

export const recipeEntriesRelations = relations(
  recipeEntriesTable,
  ({ one }) => ({
    recipe: one(recipesTable, {
      fields: [recipeEntriesTable.recipeId],
      references: [recipesTable.id],
    })
  }),
);

export const nutritionGoalsTable = pgTable("nutrition_goals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  creatorId: integer("creator_id")
    .references(() => usersTable.id)
    .notNull()
    .unique(),
  gender: text().notNull(),
  age: integer().notNull(),
  height: numeric({ mode: "number" }).notNull(),
  currentWeight: numeric({ mode: "number" }).notNull(),
  goalWeight: numeric({ mode: "number" }).notNull(),
  activityLevel: text().notNull(), // sedentary, light, moderate, active, very_active
  goal: text().notNull(), // "bulk_0.5", "bulk_0.25", "maintenance", "cut_0.25", "cut_0.5";
  calories: integer().notNull(),
  carbs: integer().notNull(),
  protein: integer().notNull(),
  fat: integer().notNull(),
  etaWeeks: integer(),
});
