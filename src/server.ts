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
import { bodyValidator, idValidator } from "./api/validation";
import { createRecipeSchema, updateRecipeSchema } from "./api/schemas/recipes";
import { createMealSchema, updateMealSchema } from "./api/schemas/meals";

const app = express();
app.use(json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.get("/recipes", handleGetRecipes);
app.get("/users/:id/recipes", idValidator(), handleGetUserRecipes);
app.get("/recipes/:id", idValidator(), handleGetRecipe);
app.post("/recipes", bodyValidator(createRecipeSchema), handleCreateRecipe);
app.put(
  "/recipes/:id",
  idValidator(),
  bodyValidator(updateRecipeSchema),
  handleUpdateRecipe,
);
app.delete("/recipes/:id", idValidator(), handleDeleteRecipe);

app.get("/meals", handleGetMeals);
app.get("/meals/:id", idValidator(), handleGetMeal);
app.post("/meals", bodyValidator(createMealSchema), handleCreateMeal);
app.put(
  "/meals/:id",
  idValidator(),
  bodyValidator(updateMealSchema),
  handleUpdateMeal,
);
app.delete("/meals/:id", idValidator(), handleDeleteMeal);

export default app;
