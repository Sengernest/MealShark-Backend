import express, { json, Request, Response } from "express";
import { loginSchema, signupSchema } from "./dto/auth";
import { macroGoalsSchema } from "./dto/macroGoals";
import { mealPlanSchema, updateMealPlanSchema } from "./dto/mealPlans";
import { recipeSchema } from "./dto/recipes";
import { handleLogin, handleLogout, handleSignup } from "./handlers/auth";
import {
  handleCreateMacroGoals,
  handleDeleteMacroGoals,
  handleGetMacroGoals,
  handleUpdateMacroGoals,
} from "./handlers/macroGoals";
import {
  handleCreateRecipe,
  handleDeleteRecipe,
  handleGetRecipe,
  handleGetRecipes,
  handleGetUserRecipes,
  handleUpdateRecipe,
} from "./handlers/recipes";
import { requireAuth, requireUserMatch } from "./middleware/auth";
import { bodyValidator, idValidator } from "./middleware/validation";

import { mealLogSchema } from "./dto/mealLogs";
import { handleGetFoods, handleSearchFoods } from "./handlers/foods";
import {
  handleCreateMealLog,
  handleDeleteMealLog,
  handleGetMealLogs,
  handleUpdateMealLog,
} from "./handlers/mealLogs";
import {
  handleCreateMealPlan,
  handleDeleteMealPlan,
  handleGetMealPlan,
  handleGetSampleMealPlans,
  handleGetUserMealPlans,
  handleUpdateMealPlan,
} from "./handlers/mealPlans";
import { errorHandler } from "./middleware/error";

const app = express();
const cookieParser = require("cookie-parser");

app.use(json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

// Auth
app.post("/signup", bodyValidator(signupSchema), handleSignup);
app.post("/login", bodyValidator(loginSchema), handleLogin);
app.post("/logout", handleLogout);

// Foods
app.get("/foods", handleGetFoods);
app.get("/foods/search", handleSearchFoods);

// Recipes
app.get("/recipes", handleGetRecipes);
app.get("/users/:id/recipes", idValidator(), handleGetUserRecipes);
app.get("/recipes/:id", idValidator(), handleGetRecipe);
app.post("/recipes", bodyValidator(recipeSchema), handleCreateRecipe);
app.put(
  "/recipes/:id",
  idValidator(),
  bodyValidator(recipeSchema),
  handleUpdateRecipe,
);
app.delete("/recipes/:id", idValidator(), handleDeleteRecipe);

// Meal plans
app.get("/meal-plans/samples", handleGetSampleMealPlans);
app.get("/users/:id/meal-plans", idValidator(), handleGetUserMealPlans);
app.get("/meal-plans/:id", idValidator(), handleGetMealPlan);
app.post("/meal-plans", bodyValidator(mealPlanSchema), handleCreateMealPlan);
app.put(
  "/meal-plans/:id",
  idValidator(),
  bodyValidator(updateMealPlanSchema),
  handleUpdateMealPlan,
);
app.delete("/meal-plans/:id", idValidator(), handleDeleteMealPlan);

// Meal logs
app.get("/users/:id/meal-logs", idValidator(), handleGetMealLogs); // ?date=
app.post("/meal-logs", bodyValidator(mealLogSchema), handleCreateMealLog);
app.put(
  "/meal-logs/:id",
  idValidator(),
  bodyValidator(mealLogSchema),
  handleUpdateMealLog,
);
app.delete("/meal-logs/:id", idValidator(), handleDeleteMealLog);

// Macro goals
app.post(
  "/users/:id/macro-goals",
  idValidator(),
  requireAuth,
  requireUserMatch,
  bodyValidator(macroGoalsSchema),
  handleCreateMacroGoals,
);
app.get(
  "/users/:id/macro-goals",
  idValidator(),
  requireAuth,
  requireUserMatch,
  handleGetMacroGoals,
);
app.put(
  "/users/:id/macro-goals",
  idValidator(),
  requireAuth,
  requireUserMatch,
  bodyValidator(macroGoalsSchema),
  handleUpdateMacroGoals,
);
app.delete(
  "/users/:id/macro-goals",
  idValidator(),
  requireAuth,
  requireUserMatch,
  handleDeleteMacroGoals,
);

// Error handling
app.use(errorHandler);

export default app;
