import { foodsRepository } from "../dataaccess/foods";
import { BusinessError } from "../errors/errors";
import { Food, FoodUnit } from "../types";

async function getFoods(limit = 40): Promise<Food[]> {
  return foodsRepository.getFoods(limit);
}

async function searchFood(query?: string, limit: number = 20): Promise<Food[]> {
  if (!query) {
    return foodsRepository.getFoods(limit);
  }
  return foodsRepository.searchFood(query, limit);
}

async function assertValidUnit(foodId: number, unitId: number) {
  const foodUnit = await foodsRepository.getFoodUnit(foodId, unitId);
  if (!foodUnit) {
    throw new BusinessError(
      `Food unit ${unitId} is not supported for food ${foodId}`,
    );
  }
}

export const foodsService = {
  getFoods,
  searchFood,
  assertValidUnit
};
