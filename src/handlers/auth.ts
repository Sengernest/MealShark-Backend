import { Request, Response } from "express";
import { authService } from "../services/auth";
import { el } from "zod/locales";

export async function handleSignup(req: Request, res: Response) {
  const { user, token } = await authService.signup(req.body);
  res.cookie("jwt", token, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 });
  res.json(user);
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { user, token } = await authService.login(req.body);
    res.cookie("jwt", token, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
}

export async function handleLogout(req: Request, res: Response) {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully" });
}

export async function handleGetCurrentUser(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.id);
  res.json(user);
}

export async function handleChangePassword(req: Request, res: Response) {
  try {
    const user = await authService.changePassword(req.user!.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Wrong Current Password." });
  }
}

