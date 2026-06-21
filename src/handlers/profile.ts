import { Request, Response } from "express";
import { usersService } from "../services/profile";

export async function handleUpdateProfile(req: Request, res: Response) {
    const userId = req.user?.id!;
    const updatedUser = await usersService.updateProfile(userId, req.body);
    res.json(updatedUser);
}


