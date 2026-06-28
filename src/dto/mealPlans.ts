import z from "zod";
import { mealSlotEnum } from "../db/schema";

export const mealPlanSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  targetCalories: z.int().positive(),
  foodItems: z.array(
    z.object({
      mealSlot: z.enum(mealSlotEnum.enumValues),
      foodId: z.int().positive(),
      unitId: z.int().positive(),
      amount: z.number().positive(),
    }),
  ),
  recipeItems: z.array(
    z.object({
      mealSlot: z.enum(mealSlotEnum.enumValues),
      recipeId: z.int().positive(),
      servings: z.int().positive(),
    }),
  ),
});

export type MealPlanSchema = z.infer<typeof mealPlanSchema>;
