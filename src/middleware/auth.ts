import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.jwt
    if (token) { 
        jwt.verify(token, process.env.JWT_SECRET!, (err: any, decodedToken: any) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            }
            else {
                console.log("Decoded JWT:", decodedToken);
                next();
            }
        });
    } else {
        console.log("No token found in cookies");
        res.status(401).json({ error: "Unauthorized" });
        res.redirect('/login');
    }
}

                


 