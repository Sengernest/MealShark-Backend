import { Request, Response } from "express";
import { mealPlansService } from "../services/mealPlans";

export async function handleGetSampleMealPlans(req: Request, res: Response) {
  const userId = req.user?.id!;
  const mealPlans = await mealPlansService.getSampleMealPlans(userId);
  res.json(mealPlans);
}

// Get meal plans created by the given user
export async function handleGetUserMealPlans(req: Request, res: Response) {
  const userId = req.user?.id!;
  const mealPlans = await mealPlansService.getUserMealPlans(userId);
  res.json(mealPlans);
}

export async function handleGetMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  const mealPlan = await mealPlansService.getMealPlan(mealPlanId, userId);
  res.json(mealPlan);
}

export async function handleGetAllMealPlans(req: Request, res: Response) {
  const userId = req.user?.id!;
  const mealPlans = await mealPlansService.getAllMealPlans(userId);
  res.json(mealPlans);
}

export async function handleGetSavedMealPlans(req: Request, res: Response) {
  const userId = req.user?.id!;
  const mealPlans = await mealPlansService.getSavedMealPlans(userId);
  res.json(mealPlans);
}

export async function handleCreateMealPlan(req: Request, res: Response) {
  const userId = req.user?.id!;
  const mealPlan = await mealPlansService.createMealPlan(req.body, userId);
  res.json(mealPlan);
}

export async function handleUpdateMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  const mealPlan = await mealPlansService.updateMealPlan(
    mealPlanId,
    req.body,
    userId,
  );
  res.json(mealPlan);
}

export async function handleDeleteMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  await mealPlansService.deleteMealPlan(mealPlanId, userId);
  res.json({ message: `Deleted meal plan: ${mealPlanId}` });
}

export async function handleActiveMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  await mealPlansService.activateMealPlan(mealPlanId, userId);
  res.json({ message: `Activated meal plan: ${mealPlanId}` });
}

export async function handleDeactivateMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  await mealPlansService.deactivateMealPlan(mealPlanId, userId);
  res.json({ message: `Deactivated meal plan: ${mealPlanId}` });
}

export async function handleSaveMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  await mealPlansService.saveMealPlan(mealPlanId, userId);
  res.json({ message: `Saved meal plan: ${mealPlanId}` });
}

export async function handleUnsaveMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  await mealPlansService.unsaveMealPlan(mealPlanId, userId);
  res.json({ message: `Unsaved meal plan: ${mealPlanId}` });
}
