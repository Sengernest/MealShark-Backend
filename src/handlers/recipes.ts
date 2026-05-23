import { Request, Response } from "express";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  getRecipes,
  getUserRecipes,
  updateRecipe,
} from "../dataaccess/recipes";

export async function handleGetRecipes(req: Request, res: Response) {
  const recipes = await getRecipes();
  res.json(recipes);
}

export async function handleGetUserRecipes(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const recipes = await getUserRecipes(userId);
  res.json(recipes);
}

export async function handleGetRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  const recipe = await getRecipe(recipeId);
  res.json(recipe);
}

export async function handleCreateRecipe(req: Request, res: Response) {
  const recipe = await createRecipe(req.body);
  res.json(recipe);
}

export async function handleUpdateRecipe(req: Request, res: Response) {
  const updatedRecipe = await updateRecipe(req.body);
  res.json(updatedRecipe);
}

export async function handleDeleteRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  await deleteRecipe(recipeId);
  res.json({ message: `Deleted recipe: ${recipeId}` });
}
