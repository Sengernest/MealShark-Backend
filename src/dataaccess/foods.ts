import db from "../db/db";
import {  foodsTable } from "../db/schema";
import { FoodInput, Food } from "../types";

export async function createFood(food: FoodInput) {
  return await db.insert(foodsTable).values(food)
}

export async function getFoods(): Promise<Food[]> {
  return await db.select().from(foodsTable)
}

