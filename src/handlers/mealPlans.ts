import { Request, Response } from "express";
import { mealPlansService } from "../services/mealPlans";

export async function handleGetSampleMealPlans(req: Request, res: Response) {
  const mealPlans = await mealPlansService.getSampleMealPlans();
  res.json(mealPlans);
}

// Get meal plans created by the given user
export async function handleGetUserMealPlans(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const mealPlans = await mealPlansService.getUserMealPlans(userId);
  res.json(mealPlans);
}

export async function handleGetMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const mealPlan = await mealPlansService.getMealPlan(mealPlanId);
  res.json(mealPlan);
}

export async function handleCreateMealPlan(req: Request, res: Response) {
  const userId = req.user?.id!
  const mealPlan = await mealPlansService.createMealPlan(req.body, userId);
  res.json(mealPlan);
}

export async function handleUpdateMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  const mealPlan = await mealPlansService.updateMealPlan(req.body, userId);
  res.json(mealPlan);
}

export async function handleDeleteMealPlan(req: Request, res: Response) {
  const mealPlanId = Number(req.params.id);
  const userId = req.user?.id!;
  await mealPlansService.deleteMealPlan(mealPlanId, userId);
  res.json({ message: `Deleted meal plan: ${mealPlanId}` });
}
