import { Request, Response } from "express";
import { macroGoalsService } from "../services/macroGoals";

export async function handleGetMacroGoals(req: Request, res: Response) {
  const userId = req.user?.id!;
  const macroGoals = await macroGoalsService.getMacroGoalsByUserId(userId);
  if (!macroGoals) {
    return res.json(null);
  }
  res.json(macroGoals);
}

export async function handleCreateMacroGoals(req: Request, res: Response) {
  const userId = req.user?.id!;
  const macroGoals = await macroGoalsService.createMacroGoals(userId, req.body);
  res.json(macroGoals);
}

export async function handleUpdateMacroGoals(req: Request, res: Response) {
  const userId = req.user?.id!;
  const updatedMacroGoals = await macroGoalsService.updateMacroGoals(
    userId,
    req.body,
  );
  res.json(updatedMacroGoals);
}

export async function handleDeleteMacroGoals(req: Request, res: Response) {
  const userId = req.user?.id!;
  await macroGoalsService.deleteMacroGoals(userId);
  res.json({ message: `Deleted macro goals` });
}
