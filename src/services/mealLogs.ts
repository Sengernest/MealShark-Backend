import { mealLogsRepository } from "../dataaccess/mealLogs";
import { CreateMealLogSchema, UpdateMealLogSchema } from "../dto/mealLogs";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import { MealLog, MealLogWithNutrition } from "../types";
import { sumMealNutrition } from "./nutrition";

function withNutrition(mealLog: MealLog): MealLogWithNutrition {
  return {
    ...mealLog,
    nutrition: sumMealNutrition(mealLog),
  };
}

async function getMealLogs(
  userId: number,
  logDate: string,
): Promise<MealLogWithNutrition[]> {
  const mealLogs = await mealLogsRepository.getMealLogs(userId, logDate);
  return mealLogs.map(withNutrition);
}

async function createMealLog(
  mealLog: CreateMealLogSchema,
  userId: number,
): Promise<MealLogWithNutrition> {
  const newLog = await mealLogsRepository.createMealLog(mealLog, userId);
  return withNutrition(newLog);
}

async function updateMealLog(
  mealLogUpdateData: UpdateMealLogSchema,
  userId: number,
): Promise<MealLogWithNutrition> {
  const mealLog = await mealLogsRepository.getMealLog(
    mealLogUpdateData.mealLogId,
  );
  if (!mealLog) {
    throw new NotFoundError();
  }
  // Ensure that the meal log can only be updated by the same user
  if (mealLog.userId !== userId) {
    throw new UnauthorizedError();
  }
  const updatedLog = await mealLogsRepository.updateMealLog(mealLogUpdateData);
  return withNutrition(updatedLog);
}

async function deleteMealLog(mealLogId: number, userId: number) {
  const mealLog = await mealLogsRepository.getMealLog(mealLogId);
  if (!mealLog) {
    throw new NotFoundError();
  }
  // Ensure that the meal log can only be deleted by the same user
  if (mealLog.userId !== userId) {
    throw new UnauthorizedError();
  }
  return mealLogsRepository.deleteMealLog(mealLogId);
}

export const mealLogsService = {
  getMealLogs,
  createMealLog,
  updateMealLog,
  deleteMealLog,
};
