import z from "zod";

export const createRecipeSchema = z.object({
  name: z.string(),
  creatorId: z.int(),
  ingredients: z.array(
    z.object({
      foodId: z.int(),
      amountInGrams: z.number().positive(),
    }),
  ),
});

export const updateRecipeSchema = z.object({
  recipeId: z.int(),
  name: z.string(),
  creatorId: z.int(),
  ingredients: z.array(
    z.object({
      foodId: z.int(),
      amountInGrams: z.number().positive(),
    }),
  ),
});

export type CreateRecipeSchema = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeSchema = z.infer<typeof updateRecipeSchema>;
