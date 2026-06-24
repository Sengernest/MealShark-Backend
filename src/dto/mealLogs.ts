import z from "zod";
import { mealSlotEnum } from "../db/schema";

export const foodEntrySchema = z.object({
  logDate: z.string(),
  mealSlot: z.enum(mealSlotEnum.enumValues),
  foodId: z.int().positive(),
  unitId: z.int().positive(),
  amount: z.number().positive(),
});

export const recipeEntrySchema = z.object({
  logDate: z.string(),
  mealSlot: z.enum(mealSlotEnum.enumValues),
  recipeId: z.int().positive(),
  servings: z.int().positive(),
});

export type FoodEntrySchema = z.infer<typeof foodEntrySchema>;
export type RecipeEntrySchema = z.infer<typeof recipeEntrySchema>;

export const mealLogsQuerySchema = z.object({
  date: z.coerce.date(),
});
