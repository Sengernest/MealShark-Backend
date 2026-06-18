import z from "zod";

export const recipeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  servings: z.int().positive(),
  prepTime: z.number().positive().optional(),
  cookTime: z.number().positive().optional(),
  ingredients: z.array(
    z.object({
      foodId: z.int().positive(),
      amount: z.number().positive(),
    }),
  ),
});

export type RecipeSchema = z.infer<typeof recipeSchema>;
