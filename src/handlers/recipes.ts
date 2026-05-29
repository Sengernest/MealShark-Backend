import { Request, Response } from "express";
import { recipesService } from "../services/recipes";

export async function handleGetRecipes(req: Request, res: Response) {
  const recipes = await recipesService.getRecipes();
  res.json(recipes);
}

export async function handleGetUserRecipes(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const recipes = await recipesService.getUserRecipes(userId);
  res.json(recipes);
}

export async function handleGetRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  const recipe = await recipesService.getRecipe(recipeId);
  res.json(recipe);
}

export async function handleCreateRecipe(req: Request, res: Response) {
  const recipe = await recipesService.createRecipe(req.body);
  res.json(recipe);
}

export async function handleUpdateRecipe(req: Request, res: Response) {
  const updatedRecipe = await recipesService.updateRecipe(req.body);
  res.json(updatedRecipe);
}

export async function handleDeleteRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  await recipesService.deleteRecipe(recipeId);
  res.json({ message: `Deleted recipe: ${recipeId}` });
}
