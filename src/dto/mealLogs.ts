import z from "zod";

export const recipeItemSchema = z.object({
  recipeId: z.int().positive(),
  servings: z.int().positive(),
});

export const foodItemSchema = z.object({
  foodId: z.int().positive(),
  unitId: z.int().positive(),
  amount: z.number().positive(),
});

export const mealLogSchema = z.object({
  logDate: z.coerce.date(),
  mealIndex: z.int().nonnegative(),
  mealId: z.int().positive().optional(), // Not null if meal is from meal plan, null if ad-hoc meal
  recipeItems: z.array(recipeItemSchema),
  foodItems: z.array(foodItemSchema),
});

export type RecipeItemSchema = z.infer<typeof recipeItemSchema>
export type FoodItemSchema = z.infer<typeof foodItemSchema>
export type MealLogSchema = z.infer<typeof mealLogSchema>;

export const mealLogsQuerySchema = z.object({
  date: z.coerce.date(),
});
