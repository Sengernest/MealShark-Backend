import { Request, Response } from "express";
import { mealLogsService } from "../services/mealLogs";
import { getMealLogsQuerySchema } from "../dto/mealLogs";

export async function handleGetMealLogs(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const result = getMealLogsQuerySchema.safeParse(req.query)
  if (!result.success) {
    return res.status(400).json(result.error)
  }
  const mealLogs = await mealLogsService.getMealLogs(userId, result.data.logDate)
  res.json(mealLogs)
}

export async function handleCreateMealLog(req: Request, res: Response) {
  const mealLog = await mealLogsService.createMealLog(req.body);
  res.json(mealLog);
}

export async function handleUpdateMealLog(req: Request, res: Response) {
  const updatedMealLog = await mealLogsService.updateMealLog(req.body);
  res.json(updatedMealLog);
}

export async function handleDeleteMealLog(req: Request, res: Response) {
  const mealLogId = Number(req.params.id);
  await mealLogsService.deleteMealLog(mealLogId);
  res.json({ message: `Deleted meal log: ${mealLogId}` });
}
