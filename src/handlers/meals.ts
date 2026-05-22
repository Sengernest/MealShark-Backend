import { Request, Response } from "express";
import {
  createMeal,
  deleteMeal,
  getMeal,
  getMeals,
  updateMeal,
} from "../dataaccess/meals";

export async function handleGetMeals(req: Request, res: Response) {
  const meals = await getMeals();
  res.json(meals);
}

export async function handleGetMeal(req: Request, res: Response) {
  const mealId = req.params.id;
  // TODO: Parameter validation
  const meal = await getMeal(Number(mealId));
  res.json(meal);
}

export async function handleCreateMeal(req: Request, res: Response) {
  const meal = await createMeal(req.body);
  // TODO: Parameter validation
  res.json(meal);
}

export async function handleUpdateMeal(req: Request, res: Response) {
  const updatedMeal = await updateMeal(req.body);
  // TODO: Parameter validation
  res.json(updatedMeal);
}

export async function handleDeleteMeal(req: Request, res: Response) {
  const mealId = req.params.id;
  await deleteMeal(Number(mealId));
  res.json({ message: `Deleted meal: ${mealId}` });
}
