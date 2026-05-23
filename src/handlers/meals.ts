import { Request, Response } from "express";
import {
  createMeal,
  deleteMeal,
  getMeal,
  getMeals,
  getUserMeals,
  updateMeal,
} from "../dataaccess/meals";

export async function handleGetMeals(req: Request, res: Response) {
  const meals = await getMeals();
  res.json(meals);
}

export async function handleGetUserMeals(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const meals = await getUserMeals(userId);
  res.json(meals);
}

export async function handleGetMeal(req: Request, res: Response) {
  const mealId = Number(req.params.id);
  const meal = await getMeal(mealId);
  res.json(meal);
}

export async function handleCreateMeal(req: Request, res: Response) {
  const meal = await createMeal(req.body);
  res.json(meal);
}

export async function handleUpdateMeal(req: Request, res: Response) {
  const updatedMeal = await updateMeal(req.body);
  res.json(updatedMeal);
}

export async function handleDeleteMeal(req: Request, res: Response) {
  const mealId = Number(req.params.id);
  await deleteMeal(mealId);
  res.json({ message: `Deleted meal: ${mealId}` });
}
