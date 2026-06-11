import z from "zod";

export const recipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(
    z.object({
      foodId: z.int().positive(),
      amount: z.number().positive(),
    }),
  ),
});

export type RecipeSchema = z.infer<typeof recipeSchema>;
