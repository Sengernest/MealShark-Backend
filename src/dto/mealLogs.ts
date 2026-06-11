import z from "zod";

export const mealLogSchema = z.object({
  name: z.string(),
  logDate: z.string(),
  mealIndex: z.int().positive(),
  mealId: z.int().positive().optional(), // Not null if meal is from meal plan, null if ad-hoc meal
  recipeItems: z.array(
    z.object({
      recipeId: z.int().positive(),
      servings: z.int().positive(),
    }),
  ),
  foodItems: z.array(
    z.object({
      foodId: z.int().positive(),
      amount: z.number().positive(),
    }),
  ),
});

export type MealLogSchema = z.infer<typeof mealLogSchema>;

export const getMealLogsQuerySchema = z.object({
  logDate: z.iso.date(),
});
