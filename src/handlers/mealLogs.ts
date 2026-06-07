import { Request, Response } from "express";
import { getMealLogs } from "../dataaccess/mealLogs";

export async function handleGetMealLogs(req: Request, res: Response) {
  const userId = Number(req.params.id)
}

export async function handleCreateMealLog(req: Request, res: Response) {
  
}

export async function handleUpdateMealLog(req: Request, res: Response) {
  
}

export async function handleDeleteMealLog(req: Request, res: Response) {
  
}
