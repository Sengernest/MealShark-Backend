import z from "zod";

export const createRecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(
    z.object({
      foodId: z.int().positive(),
      amount: z.number().positive(),
    }),
  ),
});

export const updateRecipeSchema = createRecipeSchema.extend({
  recipeId: z.int().positive(),
});

export type CreateRecipeSchema = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeSchema = z.infer<typeof updateRecipeSchema>;
