import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../dataaccess/users";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const createToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "3d" });
};

export async function handleSignup(req: Request, res: Response) {
  console.log("handleSignup called");
  console.log("request body:", req.body);

  try {
    console.log("calling createUser...");
    const user = await createUser(req.body);
    console.log("user created:", user);

    console.log("creating token...");
    const token = createToken(user.id);

    console.log("setting cookie...");
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    console.log("signup success");
    res.json(user);
  } catch (err) {
    console.error("SIGNUP FAILED:", err);

    res.status(400).json({
      error: "Signup failed (check server logs)",
    });
  }
}

export async function handleLogin(req: Request, res: Response) {
    console.log("handleLogin called");
    console.log("request body:", req.body);
    
    console.log("calling getUserByEmail...");
    const user = await getUserByEmail(req.body.email);
    console.log("user found:", user);
    const isValid = user && await bcrypt.compare(req.body.password, user.password); 
    if (isValid) {
        console.log("password valid, creating token...");
        const token = createToken(user.id);
        console.log("setting cookie...");
        res.cookie('jwt', token, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 }); 
        console.log("login success");
        res.json({ user });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};

export async function handleLogout(req: Request, res: Response) {
    console.log("handleLogout called");
    res.clearCookie("jwt");
    console.log("logout success");
    res.json({ message: "Logged out successfully" });
}