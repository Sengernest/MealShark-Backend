import express, { json, Request, Response } from "express";
import { loginSchema, signupSchema } from "./dto/auth";
import { macroGoalsSchema } from "./dto/macroGoals";
import { mealPlanSchema } from "./dto/mealPlans";
import { recipeSchema } from "./dto/recipes";
import { handleGetCurrentUser, handleLogin, handleLogout, handleSignup } from "./handlers/auth";
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
import { requireAuth } from "./middleware/auth";
import { bodyValidator, idValidator } from "./middleware/validation";

import { mealLogSchema } from "./dto/mealLogs";
import { handleGetFoods, handleSearchFoods } from "./handlers/foods";
import {
  handleCreateMealLog,
  handleDeleteMealLog,
  handleGetDailyMealSummary,
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
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

const app = express();
const cookieParser = require("cookie-parser");

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

// Auth
app.post("/signup", bodyValidator(signupSchema), handleSignup);
app.post("/login", bodyValidator(loginSchema), handleLogin);
app.post("/logout", handleLogout);
app.get("/me", handleGetCurrentUser)

// Foods
app.get("/foods", handleGetFoods);
app.get("/foods/search", handleSearchFoods);

// Recipes
app.get("/recipes", handleGetRecipes);
app.get("/me/recipes", requireAuth, handleGetUserRecipes);
app.get("/recipes/:id", requireAuth, idValidator(), handleGetRecipe);
app.post(
  "/recipes",
  requireAuth,
  bodyValidator(recipeSchema),
  handleCreateRecipe,
);
app.put(
  "/recipes/:id",
  requireAuth,
  idValidator(),
  bodyValidator(recipeSchema),
  handleUpdateRecipe,
);
app.delete("/recipes/:id", requireAuth, idValidator(), handleDeleteRecipe);

// Meal plans
app.get("/meal-plans/samples", handleGetSampleMealPlans);
app.get("/me/meal-plans", requireAuth, handleGetUserMealPlans);
app.get("/meal-plans/:id", requireAuth, idValidator(), handleGetMealPlan);
app.post(
  "/meal-plans",
  requireAuth,
  bodyValidator(mealPlanSchema),
  handleCreateMealPlan,
);
app.put(
  "/meal-plans/:id",
  requireAuth,
  idValidator(),
  bodyValidator(mealPlanSchema),
  handleUpdateMealPlan,
);
app.delete("/meal-plans/:id", requireAuth, idValidator(), handleDeleteMealPlan);

// Meal logs
app.get("/me/meal-logs/daily-summary", requireAuth, handleGetDailyMealSummary); // ?date=
app.post(
  "/meal-logs",
  requireAuth,
  bodyValidator(mealLogSchema),
  handleCreateMealLog,
);
app.put(
  "/meal-logs/:id",
  requireAuth,
  idValidator(),
  bodyValidator(mealLogSchema),
  handleUpdateMealLog,
);
app.delete("/meal-logs/:id", requireAuth, idValidator(), handleDeleteMealLog);

// Macro goals
app.post(
  "/me/macro-goals",
  requireAuth,
  bodyValidator(macroGoalsSchema),
  handleCreateMacroGoals,
);
app.get("/me/macro-goals", requireAuth, handleGetMacroGoals);
app.put(
  "/me/macro-goals",
  requireAuth,
  bodyValidator(macroGoalsSchema),
  handleUpdateMacroGoals,
);
app.delete("/me/macro-goals", requireAuth, handleDeleteMacroGoals);

// Error handling
app.use(errorHandler);

export default app;
