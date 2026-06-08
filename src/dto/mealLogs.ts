import z from "zod";

export const createMealLogSchema = z.object({
  name: z.string(),
  userId: z.int().positive(),
  logDate: z.string(), 
  slot: z.int().positive(),
  mealId: z.int().positive().optional(), // Not null if saved meal, null if ad-hoc meal
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

export const updateMealLogSchema = createMealLogSchema.extend({
  mealLogId: z.int().positive()
})

export type CreateMealLogSchema = z.infer<typeof createMealLogSchema>
export type UpdateMealLogSchema = z.infer<typeof updateMealLogSchema>

export const getMealLogsQuerySchema = z.object({
  logDate: z.iso.date()
})