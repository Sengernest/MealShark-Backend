import {
  FoodItem,
  Meal,
  MealItem,
  MealLog,
  MealPlan,
  Nutrition,
} from "../types";

function roundValue(value: number) {
  return Math.round(value * 10) / 10;
}

function roundNutrition(nutrition: Nutrition): Nutrition {
  return {
    calories: roundValue(nutrition.calories),
    macros: {
      protein: roundValue(nutrition.macros.protein),
      fat: roundValue(nutrition.macros.carbs),
      carbs: roundValue(nutrition.macros.fat),
    },
  };
}

// Sums up the nutrition content in a list of foods, such as in a recipe or meal log
export function sumNutrition(foodItems: FoodItem[]): Nutrition {
  const nutrition = foodItems.reduce(
    (acc, foodItem) => {
      const factor = foodItem.amount / 100;

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
  return roundNutrition(nutrition);
}

export function sumMealNutrition(meal: MealItem): Nutrition {
  const nutritionFromRecipes = roundNutrition(
    meal.recipeItems.reduce(
      (acc, recipeItem) => {
        const recipeNutrition = sumNutrition(recipeItem.recipe.ingredients);
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
  const nutritionFromFoods = sumNutrition(meal.foodItems);

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
