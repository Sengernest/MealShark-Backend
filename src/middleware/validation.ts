import { NextFunction, Request, Response } from "express";
import z, { ZodObject } from "zod";
import { ValidationError } from "../errors/errors";

// Validates request body
export function bodyValidator(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.issues)
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
      throw new ValidationError(result.error.issues)
    }
    req.params = result.data as any;
    next();
  };
}

// Validates the id field in request params
export function idValidator(idKey = "id") {
  return paramsValidator(
    z.object({
      [idKey]: z.coerce.number().int().positive(),
    }),
  );
}

// Validates request query
export function queryValidator(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw new ValidationError(result.error.issues)
    }
    req.query = result.data as any;
    next();
  };
}
