import { Request, Response } from "express";
import { mealLogsService } from "../services/mealLogs";
import { mealLogsQuerySchema } from "../dto/mealLogs";
import { ValidationError } from "../errors/errors";

export async function handleGetMealLog(req: Request, res: Response) {
  const userId = req.user?.id!;
  const result = mealLogsQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  const mealLogs = await mealLogsService.getMealLog(userId, result.data.date);
  res.json(mealLogs);
}

export async function handleAddFoodEntry(req: Request, res: Response) {
  const userId = Number(req.user?.id);
  const entry = await mealLogsService.addFoodEntry(req.body, userId);
  res.json(entry);
}

export async function handleAddRecipeEntry(req: Request, res: Response) {
  const userId = Number(req.user?.id);
  const entry = await mealLogsService.addRecipeEntry(req.body, userId);
  res.json(entry);
}

export async function handleUpdateFoodEntry(req: Request, res: Response) {
  const entryId = Number(req.params.id);
  const userId = Number(req.user?.id);
  const entry = await mealLogsService.updateFoodEntry(
    entryId,
    req.body,
    userId,
  );
  res.json(entry);
}

export async function handleUpdateRecipeEntry(req: Request, res: Response) {
  const entryId = Number(req.params.id);
  const userId = Number(req.user?.id);
  const entry = await mealLogsService.updateRecipeEntry(
    entryId,
    req.body,
    userId,
  );
  res.json(entry);
}

export async function handleRemoveFoodEntry(req: Request, res: Response) {
  const entryId = Number(req.params.id);
  const userId = Number(req.user?.id);
  const entry = await mealLogsService.removeFoodEntry(entryId, userId);
  res.json(entry);
}

export async function handleRemoveRecipeEntry(req: Request, res: Response) {
  const entryId = Number(req.params.id);
  const userId = Number(req.user?.id);
  const entry = await mealLogsService.removeRecipeEntry(entryId, userId);
  res.json(entry);
}
