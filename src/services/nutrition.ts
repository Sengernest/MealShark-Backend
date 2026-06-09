import { FoodItem, Meal, MealLog, Nutrition } from "../types";

// Sums up the nutrition content in a list of foods, such as in a recipe or meal log
export function sumNutrition(foodItems: FoodItem[]): Nutrition {
  return foodItems.reduce(
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
}

export function sumMealNutrition(meal: Meal | MealLog): Nutrition {
  const nutritionFromRecipes = meal.recipeItems.reduce(
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
