import { Request, Response } from "express";
import { mealLogsService } from "../services/mealLogs";
import { mealLogsQuerySchema } from "../dto/mealLogs";
import { ValidationError } from "../errors/errors";

export async function handleGetDailyMealSummary(req: Request, res: Response) {
  const userId = req.user?.id!;
  const result = mealLogsQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  const mealLogs = await mealLogsService.getDailyMealSummary(
    userId,
    result.data.date,
  );
  res.json(mealLogs);
}

export async function handleCreateMealLog(req: Request, res: Response) {
  const userId = req.user?.id!;
  const mealLog = await mealLogsService.createMealLog(req.body, userId);
  res.json(mealLog);
}

export async function handleUpdateMealLog(req: Request, res: Response) {
  const mealLogId = Number(req.params.id);
  const userId = req.user?.id!;
  const updatedMealLog = await mealLogsService.updateMealLog(
    mealLogId,
    req.body,
    userId,
  );
  res.json(updatedMealLog);
}

export async function handleAddFoodToEntry(req: Request, res: Response) {
  const entryId = Number(req.params.entryId)
}

export async function handleAddRecipeToEntry(req: Request, res: Response) {
  const entryId = Number(req.params.entryId);
  
}

export async function handleRemoveFoodFromEntry(req: Request, res: Response) {
  const itemId = Number(req.params.itemId)

}

export async function handleRemoveRecipeFromEntry(req: Request, res: Response) {
  const itemId = Number(req.params.itemId);

}

export async function handleDeleteMealLog(req: Request, res: Response) {
  const mealLogId = Number(req.params.id);
  const userId = req.user?.id!;
  const deletedLog = await mealLogsService.deleteMealLog(mealLogId, userId);
  res.json(deletedLog);
}
