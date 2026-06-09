import z from "zod";

export const createMealPlanSchema = z.object({
  name: z.string(),
  creatorId: z.int().positive(),
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

export const updateMealPlanSchema = createMealPlanSchema.extend({
  mealId: z.int().positive(),
});

export type CreateMealPlanSchema = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanSchema = z.infer<typeof updateMealPlanSchema>;
