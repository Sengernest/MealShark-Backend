import express, { json, Request, Response } from "express";
import { changePasswordSchema, loginSchema, signupSchema } from "./dto/auth";
import { nutritionGoalsSchema } from "./dto/nutritionGoals";
import { mealPlanSchema } from "./dto/mealPlans";
import { recipeSchema } from "./dto/recipes";
import { profileSchema } from "./dto/profile";
import {
  handleChangePassword,
  handleGetCurrentUser,
  handleLogin,
  handleLogout,
  handleSignup,
} from "./handlers/auth";
import { handleUpdateProfile } from "./handlers/profile";
import {
  handleCreateNutritionGoals,
  handleDeleteNutritionGoals,
  handleGetNutritionGoals,
  handleUpdateNutritionGoals,
} from "./handlers/nutritionGoals";
import {
  handleCreateRecipe,
  handleDeleteRecipe,
  handleGetRecipe,
  handleGetAllRecipes,
  handleGetUserRecipes,
  handleUpdateRecipe,
  handleGetSampleRecipes,
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
  handleActiveMealPlan,
  handleCreateMealPlan,
  handleDeleteMealPlan,
  handleGetAllMealPlans,
  handleGetMealPlan,
  handleGetSampleMealPlans,
  handleGetUserMealPlans,
  handleUpdateMealPlan,
} from "./handlers/mealPlans";
import { errorHandler } from "./middleware/error";
import cors from "cors";
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
app.patch("/me/password", requireAuth, bodyValidator(changePasswordSchema), handleChangePassword);
app.post("/logout", handleLogout);
app.get("/me", requireAuth, handleGetCurrentUser);


// Profile
app.put(
  "/me/profile",
  requireAuth,
  bodyValidator(profileSchema),
  handleUpdateProfile,
);

// Foods
app.get("/foods", handleGetFoods);
app.get("/foods/search", handleSearchFoods);

// Recipes
app.get("/recipes", requireAuth, handleGetAllRecipes);
app.get("/recipes/samples", handleGetSampleRecipes);
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
app.get("/meal-plans", requireAuth, handleGetAllMealPlans);
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
app.patch("/meal-plans/:id", requireAuth, idValidator(), handleActiveMealPlan);

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

// Nutrition goals
app.post(
  "/me/nutrition-goals",
  requireAuth,
  bodyValidator(nutritionGoalsSchema),
  handleCreateNutritionGoals,
);
app.get("/me/nutrition-goals", requireAuth, handleGetNutritionGoals);
app.put(
  "/me/nutrition-goals",
  requireAuth,
  bodyValidator(nutritionGoalsSchema),
  handleUpdateNutritionGoals,
);
app.delete("/me/nutrition-goals", requireAuth, handleDeleteNutritionGoals);

// Error handling
app.use(errorHandler);

export default app;
