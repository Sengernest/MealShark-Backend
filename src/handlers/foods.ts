import { Request, Response } from "express";
import { foodsService } from "../services/foods";
import z from "zod";

export async function handleGetFoods(req: Request, res: Response) {
  const foods = await foodsService.getFoods();
  res.json(foods);
}

const searchFoodsQuerySchema = z.object({
  q: z.string(),
  limit: z.coerce.number().int().positive().default(20),
});

export async function handleSearchFoods(req: Request, res: Response) {
  const parseResult = searchFoodsQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json(parseResult.error);
  }
  const query = parseResult.data;
  const matches = await foodsService.searchFood(query.q, query.limit);
  res.json(matches);
}
