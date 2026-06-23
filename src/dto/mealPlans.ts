import z from "zod";

export const mealSchema = z.object({
  mealPlanIndex: z.int().positive(),
  recipeItems: z.array(
    z.object({
      recipeId: z.int().positive(),
      servings: z.int().positive(),
    }),
  ),
  foodItems: z.array(
    z.object({
      foodId: z.int().positive(),
      unitId: z.int().positive(),
      amount: z.number().positive(),
    }),
  ),
});

export const mealPlanSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  targetCalories: z.int().positive(),
  meals: z.array(mealSchema),
});

export type MealSchema = z.infer<typeof mealSchema>;
export type MealPlanSchema = z.infer<typeof mealPlanSchema>;
