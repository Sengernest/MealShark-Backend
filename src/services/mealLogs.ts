import { mealLogsRepository } from "../dataaccess/mealLogs";
import { CreateMealLogSchema, UpdateMealLogSchema } from "../dto/mealLogs";
import { MealLog } from "../types";

async function getMealLogs(userId: number, logDate: string): Promise<MealLog[]> {
  return mealLogsRepository.getMealLogs(userId, logDate);
}

async function createMealLog(mealLog: CreateMealLogSchema): Promise<MealLog> {
  return mealLogsRepository.createMealLog(mealLog);
}

async function updateMealLog(mealLog: UpdateMealLogSchema): Promise<MealLog> {
  return mealLogsRepository.updateMealLog(mealLog);
}

async function deleteMealLog(id: number) {
  return mealLogsRepository.deleteMealLog(id);
}

export const mealLogsService = {
  getMealLogs,
  createMealLog,
  updateMealLog,
  deleteMealLog,
};
