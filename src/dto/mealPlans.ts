import z from "zod";

export const createMealSchema = z.object({
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
      amount: z.number().positive(),
    }),
  ),
});

export const createMealPlanSchema = z.object({
  name: z.string(),
  meals: z.array(createMealSchema),
});

export const updateMealPlanSchema = createMealPlanSchema.extend({
  id: z.int().positive(),
});

export type CreateMealSchema = z.infer<typeof createMealSchema>;
export type CreateMealPlanSchema = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanSchema = z.infer<typeof updateMealPlanSchema>;
