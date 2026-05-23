import z from "zod";
import { createMealSchema } from "./meals";

export const createRecipeSchema = z.object({
  name: z.string(),
  creatorId: z.int().positive(),
  ingredients: z.array(
    z.object({
      foodId: z.int().positive(),
      amountInGrams: z.number().positive(),
    }),
  ),
});

export const updateRecipeSchema = createMealSchema.extend({
  recipeId: z.int().positive(),
});

export type CreateRecipeSchema = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeSchema = z.infer<typeof updateRecipeSchema>;
