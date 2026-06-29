import dotenv from "dotenv";
import { mealPlansRepository } from "../../dataaccess/mealPlans";
import { MealPlanSchema } from "../../dto/mealPlans";

dotenv.config();

const sampleMealPlans: MealPlanSchema[] = [
  {
    name: "High Protein Meal Plan",
    description: "Simple daily meal plan for muscle building.",
    targetCalories: 2200,

    foodItems: [
      {
        mealSlot: "breakfast",
        foodId: 2512381, // Rice
        unitId: 1,
        amount: 100,
      },
      {
        mealSlot: "snack",
        foodId: 747447, // Broccoli
        unitId: 1,
        amount: 150,
      },
    ],

    recipeItems: [],
  },
];

export async function seedMealPlans() {
  for (const mealPlan of sampleMealPlans) {
    await mealPlansRepository.createMealPlan(mealPlan);
  }
}

seedMealPlans();
