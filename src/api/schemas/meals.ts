import z from "zod";

export const createMealSchema = z.object({
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
      amountInGrams: z.number().positive(),
    }),
  ),
});

export const updateMealSchema = createMealSchema.extend({
  mealId: z.int().positive()
})

export type CreateMealSchema = z.infer<typeof createMealSchema>
export type UpdateMealSchema = z.infer<typeof updateMealSchema>
