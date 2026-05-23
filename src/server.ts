import express, { json, Request, Response } from "express";
import {
  handleCreateRecipe,
  handleDeleteRecipe,
  handleGetRecipe,
  handleGetRecipes,
  handleGetUserRecipes,
  handleUpdateRecipe,
} from "./handlers/recipes";
import {
  handleGetMeals,
  handleGetMeal,
  handleCreateMeal,
  handleUpdateMeal,
  handleDeleteMeal,
} from "./handlers/meals";
import { validateBody } from "./api/validation";
import { createRecipeSchema, updateRecipeSchema } from "./api/schemas/recipes";

const app = express();
app.use(json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.get("/recipes", handleGetRecipes);
app.get("/users/:userId/recipes", handleGetUserRecipes);
app.get("/recipes/:id", handleGetRecipe);
app.post("/recipes", validateBody(createRecipeSchema), handleCreateRecipe);
app.put("/recipes/:id", validateBody(updateRecipeSchema), handleUpdateRecipe);
app.delete("/recipes/:id", handleDeleteRecipe);

app.get("/meals", handleGetMeals);
app.get("/meals/:id", handleGetMeal);
app.post("/meals", handleCreateMeal);
app.put("/meals/:id", handleUpdateMeal);
app.delete("/meals/:id", handleDeleteMeal);

export default app;
