import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../dataaccess/users";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const createToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "3d" });
};

export async function handleSignup(req: Request, res: Response) {
    const user = await createUser(req.body);
    const token = createToken(user.id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 }); 
    res.json(user);
};

export async function handleLogin(req: Request, res: Response) {
    const user = await getUserByEmail(req.body.email);
    const isValid = user && await bcrypt.compare(req.body.password, user.password); 
    if (isValid) {
        const token = createToken(user.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 }); 
        res.json({ user });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};
