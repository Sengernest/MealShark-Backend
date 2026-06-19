import { inArray, sql } from "drizzle-orm";
import db from "../db/db";
import { foodsTable } from "../db/schema";
import { Food, SearchResult } from "../types";

async function getFoods(limit: number): Promise<Food[]> {
  const foods = await db.query.foodsTable.findMany({
    with: {
      units: {
        with: {
          unit: true,
        },
      },
    },
    limit,
  });
  return foods;
}

// Returns a list of foods with names matching the given search query
async function searchFood(query: string, limit: number): Promise<Food[]> {
  const results = await db
    .select({
      foodId: foodsTable.id,
      score: sql<number>`similarity(${foodsTable.name}, ${query})`,
    })
    .from(foodsTable)
    .where(sql`similarity(${foodsTable.name}, ${query}) > 0.1`)
    .orderBy(sql`similarity(${foodsTable.name}, ${query}) DESC`)
    .limit(limit);

  const foods = await db.query.foodsTable.findMany({
    where: inArray(
      foodsTable.id,
      results.map((res) => res.foodId),
    ),
    with: {
      units: {
        with: {
          unit: true,
        },
      },
    },
  });
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  return results.map((res) => foodMap.get(res.foodId)!);
}

export const foodsRepository = {
  getFoods,
  searchFood,
};
