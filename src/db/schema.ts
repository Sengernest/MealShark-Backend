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
  category: text(),
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

export const savedRecipesTable = pgTable(
  "saved_recipes",
  {
    userId: integer("user_id")
      .references(() => usersTable.id)
      .notNull(),
    recipeId: integer("recipe_id")
      .references(() => recipesTable.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.recipeId] })],
);

export const savedRecipesRelations = relations(
  savedRecipesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [savedRecipesTable.userId],
      references: [usersTable.id],
    }),
    recipe: one(recipesTable, {
      fields: [savedRecipesTable.recipeId],
      references: [recipesTable.id],
    }),
  }),
);

export const recipesRelations = relations(recipesTable, ({ many }) => ({
  ingredients: many(foodsToRecipesTable),
  savedByUsers: many(savedRecipesTable),
}));

export const mealPlansTable = pgTable("meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  creatorId: integer("creator_id").references(() => usersTable.id), // Null if sample meal
  name: text().notNull(), // e.g. Bulking plan
  description: text(),
  isActive: boolean().notNull(),
  targetCalories: integer().notNull(),
});

export const mealSlotEnum = pgEnum("meal_slot", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

export const foodsToMealPlansTable = pgTable("foods_to_meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  foodId: integer("food_id")
    .references(() => foodsTable.id)
    .notNull(),
  mealPlanId: integer("meal_plan_id")
    .references(() => mealPlansTable.id, { onDelete: "cascade" })
    .notNull(),
  mealSlot: mealSlotEnum("meal_slot").notNull(),
  amount: numeric({ mode: "number" }).notNull(),
  unitId: integer("unit_id")
    .references(() => unitsTable.id)
    .notNull(),
});

export const foodsToMealPlansRelations = relations(
  foodsToMealPlansTable,
  ({ one }) => ({
    food: one(foodsTable, {
      fields: [foodsToMealPlansTable.foodId],
      references: [foodsTable.id],
    }),
    unit: one(unitsTable, {
      fields: [foodsToMealPlansTable.unitId],
      references: [unitsTable.id],
    }),
    mealPlan: one(mealPlansTable, {
      fields: [foodsToMealPlansTable.mealPlanId],
      references: [mealPlansTable.id],
    }),
  }),
);

export const recipesToMealPlansTable = pgTable("recipes_to_meal_plans", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  recipeId: integer("recipe_id")
    .references(() => recipesTable.id)
    .notNull(),
  mealPlanId: integer("meal_plan_id")
    .references(() => mealPlansTable.id, { onDelete: "cascade" })
    .notNull(),
  mealSlot: mealSlotEnum("meal_slot").notNull(),
  servings: integer().notNull(),
});

export const recipesToMealPlansRelations = relations(
  recipesToMealPlansTable,
  ({ one }) => ({
    recipe: one(recipesTable, {
      fields: [recipesToMealPlansTable.recipeId],
      references: [recipesTable.id],
    }),
    mealPlan: one(mealPlansTable, {
      fields: [recipesToMealPlansTable.mealPlanId],
      references: [mealPlansTable.id],
    }),
  }),
);

export const mealPlansRelations = relations(mealPlansTable, ({ many }) => ({
  foodItems: many(foodsToMealPlansTable),
  recipeItems: many(recipesToMealPlansTable),
}));

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
    }),
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
