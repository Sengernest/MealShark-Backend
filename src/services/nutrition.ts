import { InvariantError } from "../errors/errors";
import {
  Consumable,
  FoodItem,
  FoodItemWithNutrition,
  Nutrition,
  Recipe,
  RecipeWithNutrition
} from "../types";

function roundValue(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundNutrition(nutrition: Nutrition): Nutrition {
  return {
    calories: roundValue(nutrition.calories),
    macros: {
      protein: roundValue(nutrition.macros.protein),
      fat: roundValue(nutrition.macros.fat),
      carbs: roundValue(nutrition.macros.carbs),
    },
  };
}

// Calculate nutrition per serving given total nutrition
export function perServing(nutrition: Nutrition, servings: number): Nutrition {
  return {
    calories: nutrition.calories / servings,
    macros: {
      protein: nutrition.macros.protein / servings,
      fat: nutrition.macros.fat / servings,
      carbs: nutrition.macros.carbs / servings,
    },
  };
}

export function multiplyNutrition(
  nutrition: Nutrition,
  factor: number,
): Nutrition {
  return {
    calories: nutrition.calories * factor,
    macros: {
      protein: nutrition.macros.protein * factor,
      fat: nutrition.macros.fat * factor,
      carbs: nutrition.macros.carbs * factor,
    },
  };
}

// Sums up nutrition across multiple entities with a Nutrition
export function sumNutrition(...consumables: Consumable[]): Nutrition {
  return consumables.reduce(
    (acc, consumable) => {
      acc.calories += consumable.nutrition.calories;
      acc.macros.protein += consumable.nutrition.macros.protein;
      acc.macros.carbs += consumable.nutrition.macros.carbs;
      acc.macros.fat += consumable.nutrition.macros.fat;
      return acc;
    },
    {
      calories: 0,
      macros: {
        protein: 0,
        fat: 0,
        carbs: 0,
      },
    },
  );
}

// Computes nutrition of a food based on amount and units
export function foodItemToWithNutrition(
  foodItem: FoodItem,
): FoodItemWithNutrition {
  const foodUnit = foodItem.food.units.find(
    (foodUnit) => foodUnit.unitId === foodItem.unitId,
  );
  if (!foodUnit) {
    throw new InvariantError(
      `Food unit ${foodItem.unitId} is not supported for food ${foodItem.foodId}`,
    );
  }
  const amountInGrams = foodItem.amount * foodUnit.gramsPerUnit;
  const factor = amountInGrams / 100;
  const nutrition = {
    calories: factor * foodItem.food.calories,
    macros: {
      protein: factor * foodItem.food.protein,
      carbs: factor * foodItem.food.carbs,
      fat: factor * foodItem.food.fat,
    },
  };
  return { ...foodItem, nutrition };
}

export function recipeToWithNutrition(recipe: Recipe): RecipeWithNutrition {
  const ingredientsWithNutrition = recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    nutrition: foodItemToWithNutrition(ingredient).nutrition,
  }));
  const ingredientsNutrition = sumNutrition(...ingredientsWithNutrition);
  const nutrition = roundNutrition(
    perServing(ingredientsNutrition, recipe.servings),
  );
  return {
    ...recipe,
    ingredients: ingredientsWithNutrition,
    nutrition,
  };
}