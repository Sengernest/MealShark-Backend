import { NextFunction, Request, Response } from "express";
import z, { ZodObject } from "zod";

// Validates request body
export function bodyValidator(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    req.body = result.data;
    next();
  };
}

// Validates request params
export function paramsValidator(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json(result.error);
    }
    req.params = result.data as any;
    next();
  };
}

// Validates the id field in request params
export function idValidator(idKey = "id") {
  return paramsValidator(z.object({
    [idKey]: z.int().positive()
  }))
}
