import { Request, Response } from "express";
import { recipesService } from "../services/recipes";

export async function handleGetAllRecipes(req: Request, res: Response) {
  const userId = req.user?.id!;
  const recipes = await recipesService.getAllRecipes(userId);
  res.json(recipes);
}

export async function handleGetSampleRecipes(req: Request, res: Response) {
  const recipes = await recipesService.getSampleRecipes();
  res.json(recipes);
}

export async function handleGetUserRecipes(req: Request, res: Response) {
  const userId = req.user?.id!;
  const recipes = await recipesService.getUserRecipes(userId);
  res.json(recipes);
}

export async function handleGetRecipe(req: Request, res: Response) {
  const userId = req.user?.id!;
  const recipeId = Number(req.params.id);
  const recipe = await recipesService.getRecipe(recipeId, userId);
  res.json(recipe);
}

export async function handleCreateRecipe(req: Request, res: Response) {
  const userId = req.user?.id!;
  const recipe = await recipesService.createRecipe(req.body, userId);
  res.json(recipe);
}

export async function handleUpdateRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  const userId = req.user?.id!;
  const updatedRecipe = await recipesService.updateRecipe(
    recipeId,
    req.body,
    userId,
  );
  res.json(updatedRecipe);
}

export async function handleDeleteRecipe(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  const userId = req.user?.id!;
  await recipesService.deleteRecipe(recipeId, userId);
  res.json({ message: `Deleted recipe: ${recipeId}` });
}
