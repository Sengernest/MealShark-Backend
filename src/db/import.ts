import fs from "node:fs/promises";
import db from "./db";
import { foodsTable, foodUnitsTable } from "./schema";

async function main() {
  const baseFoodFile = await fs.readFile("data/foundation_food.json", "utf8");
  const baseFoods = JSON.parse(baseFoodFile)["FoundationFoods"];

  for (let i = 0; i < baseFoods.length; i++) {
    const food = baseFoods[i];

    const nutrients = food["foodNutrients"] ?? [];
    const calories =
      nutrients.find((nutrient: any) => nutrient.nutrient.id == 2047)?.amount ??
      0;
    const protein =
      nutrients.find((nutrient: any) => nutrient.nutrient.id == 1003)?.amount ??
      0;
    const fat =
      nutrients.find((nutrient: any) => nutrient.nutrient.id == 1004)?.amount ??
      0;
    const carbs = Math.max(
      nutrients.find((nutrient: any) => nutrient.nutrient.id == 1005)?.amount ??
        0,
      0,
    );

    const foodId = food["fdcId"];

    await db.insert(foodsTable).values({
      id: foodId,
      name: food["description"],
      defaultServingSize: food["foodPortions"]?.[0]?.["gramWeight"] ?? 0, // TODO: Fix this to find RACC
      calories,
      carbs,
      fat,
      protein,
    });

    // Food units
    for (const foodPortion of food["foodPortions"]) {
      const unitId = foodPortion.measureUnit.id;
      const gramsPerUnit = foodPortion.gramWeight / foodPortion.amount;
      await db.insert(foodUnitsTable).values({
        foodId,
        unitId,
        gramsPerUnit,
      });
    }
  }
}

main();
