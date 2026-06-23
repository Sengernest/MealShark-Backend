import z from "zod";

export const recipeSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  instructions: z.string().nullish(),
  servings: z.int().positive(),
  prepTime: z.number().positive().nullish(),
  cookTime: z.number().positive().nullish(),
  ingredients: z.array(
    z.object({
      foodId: z.int().positive(),
      unitId: z.int().positive(),
      amount: z.number().positive(),
    }),
  ),
});

export type RecipeSchema = z.infer<typeof recipeSchema>;
