import { foodsRepository } from "../dataaccess/foods";
import { Food, SearchResult } from "../types";

async function getFoods(limit = 40): Promise<Food[]> {
  return foodsRepository.getFoods(limit);
}

async function searchFood(query?: string, limit: number = 20): Promise<Food[]> {
  if (!query) {
    return foodsRepository.getFoods(limit);
  }
  return foodsRepository.searchFood(query, limit);
}

export const foodsService = {
  getFoods,
  searchFood,
};
