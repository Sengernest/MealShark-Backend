import dotenv from "dotenv";
import { recipesRepository } from "../../dataaccess/recipes";
import { RecipeSchema } from "../../dto/recipes";
dotenv.config();

const sampleRecipes: RecipeSchema[] = [
  {
    name: "Chicken, Broccoli & Rice",
    description: "The holy trinity of bodybuilding diets",
    servings: 1,
    ingredients: [
      {
        foodId: 2727569,
        unitId: 1, 
        amount: 200,
      },
      {
        foodId: 2512381,
        unitId: 1,
        amount: 140,
      },
      {
        foodId: 747447,
        unitId: 1, 
        amount: 100,
      },
    ],
  },
];

export async function seedRecipes() {
  for (const recipe of sampleRecipes) {
    await recipesRepository.createRecipe(recipe);
  }
}

seedRecipes()