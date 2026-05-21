import express, { json, Request, Response } from "express";
import {
  handleCreateRecipe,
  handleDeleteRecipe,
  handleGetRecipe,
  handleGetRecipes,
  handleUpdateRecipe,
} from "./handlers/recipes";

const app = express();
app.use(json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.get("/recipes", handleGetRecipes);
app.get("/recipes/:id", handleGetRecipe);
app.post("/recipes", handleCreateRecipe);
app.put("/recipes/:id", handleUpdateRecipe);
app.delete("/recipes/:id", handleDeleteRecipe);

export default app;
