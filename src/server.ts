import express, { json, Request, Response } from "express";
import {
  handleCreateRecipe,
  handleDeleteRecipe,
  handleGetRecipe,
  handleGetRecipes,
  handleGetUserRecipes,
  handleUpdateRecipe,
} from "./handlers/recipes";
import { handleSignup, handleLogin, handleLogout } from "./handlers/auth";
import {
  handleCreateMacroGoals,
  handleGetMacroGoals,
  handleUpdateMacroGoals,
  handleDeleteMacroGoals,
} from "./handlers/macroGoals";
import { requireAuth, requireUserMatch } from "./middleware/auth";
import { bodyValidator, idValidator } from "./middleware/validation";
import { signupSchema, loginSchema } from "./dto/auth";
import { createRecipeSchema, updateRecipeSchema } from "./dto/recipes";
import { createMealPlanSchema, updateMealPlanSchema } from "./dto/mealPlans";
import { macroGoalsSchema } from "./dto/macroGoals";

import {
  handleCreateMealLog,
  handleDeleteMealLog,
  handleGetMealLogs,
  handleUpdateMealLog,
} from "./handlers/mealLogs";
import { createMealLogSchema, updateMealLogSchema } from "./dto/mealLogs";
import {
  handleCreateMealPlan,
  handleDeleteMealPlan,
  handleGetMealPlan,
  handleGetSampleMealPlans,
  handleGetUserMealPlans,
  handleUpdateMealPlan,
} from "./handlers/mealPlans";
import { handleGetFoods, handleSearchFoods } from "./handlers/foods";
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
app.get("/foods", handleGetFoods)
app.get("/foods/search", handleSearchFoods)

// Recipes
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

// Meal plans
app.get("/meal-plans/samples", handleGetSampleMealPlans);
app.get("/users/:id/meal-plans", idValidator(), handleGetUserMealPlans);
app.get("/meal-plans/:id", idValidator(), handleGetMealPlan);
app.post(
  "/meal-plans",
  bodyValidator(createMealPlanSchema),
  handleCreateMealPlan,
);
app.put(
  "/meal-plans/:id",
  idValidator(),
  bodyValidator(updateMealPlanSchema),
  handleUpdateMealPlan,
);
app.delete("/meal-plans/:id", idValidator(), handleDeleteMealPlan);

// Meal logs
app.get("/users/:id/meal-logs", idValidator(), handleGetMealLogs); // ?date=
app.post("/meal-logs", bodyValidator(createMealLogSchema), handleCreateMealLog);
app.put(
  "/meal-logs/:id",
  idValidator(),
  bodyValidator(updateMealLogSchema),
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
app.use(errorHandler)

export default app;
