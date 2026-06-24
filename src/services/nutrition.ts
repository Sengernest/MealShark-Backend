import { InvariantError } from "../errors/errors";
import { Consumable, FoodItem, MealItem, Nutrition } from "../types";

function roundValue(value: number) {
  return Math.round(value * 10) / 10;
}

function roundNutrition(nutrition: Nutrition): Nutrition {
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
function perServing(nutrition: Nutrition, servings: number): Nutrition {
  return {
    calories: nutrition.calories / servings,
    macros: {
      protein: nutrition.macros.protein / servings,
      fat: nutrition.macros.fat / servings,
      carbs: nutrition.macros.carbs / servings,
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

// Sums up the nutrition content in a list of foods, such as in a recipe or meal log
export function sumFoodsNutrition(
  foodItems: FoodItem[],
  servings?: number,
): Nutrition {
  const nutrition = foodItems.reduce(
    (acc, foodItem) => {
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

      acc.calories += factor * foodItem.food.calories;
      acc.macros.protein += factor * foodItem.food.protein;
      acc.macros.carbs += factor * foodItem.food.carbs;
      acc.macros.fat += factor * foodItem.food.fat;

      return acc;
    },
    {
      calories: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    },
  );
  return roundNutrition(servings ? perServing(nutrition, servings) : nutrition);
}

export function sumMealNutrition(meal: MealItem): Nutrition {
  const nutritionFromRecipes = roundNutrition(
    meal.recipeItems.reduce(
      (acc, recipeItem) => {
        const recipeNutrition = sumFoodsNutrition(
          recipeItem.recipe.ingredients,
        );
        acc.calories += recipeItem.servings * recipeNutrition.calories;
        acc.macros.protein +=
          recipeItem.servings * recipeNutrition.macros.protein;
        acc.macros.carbs += recipeItem.servings * recipeNutrition.macros.carbs;
        acc.macros.fat += recipeItem.servings * recipeNutrition.macros.fat;

        return acc;
      },
      {
        calories: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      },
    ),
  );
  const nutritionFromFoods = sumFoodsNutrition(meal.foodItems);

  return {
    calories: nutritionFromRecipes.calories + nutritionFromFoods.calories,
    macros: {
      protein:
        nutritionFromRecipes.macros.protein + nutritionFromFoods.macros.protein,
      carbs:
        nutritionFromRecipes.macros.carbs + nutritionFromFoods.macros.carbs,
      fat: nutritionFromRecipes.macros.fat + nutritionFromFoods.macros.fat,
    },
  };
}

export function sumMealsNutrition(meals: MealItem[]): Nutrition {
  return roundNutrition(
    meals.reduce(
      (acc, meal) => {
        const mealNutrition = sumMealNutrition(meal);
        acc.calories += mealNutrition.calories;
        acc.macros.protein += mealNutrition.macros.protein;
        acc.macros.carbs += mealNutrition.macros.carbs;
        acc.macros.fat += mealNutrition.macros.fat;
        return acc;
      },
      {
        calories: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      },
    ),
  );
}
