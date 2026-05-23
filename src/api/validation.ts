import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

// Validates request body
export function validateBody(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json(result.error.flatten())
    }
    req.body = result.data.body
    next()
  }
}
