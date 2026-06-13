import { Request, Response, NextFunction } from "express";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/errors";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: "Not found", message: err });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(403).json({ error: "Unauthorized", message: err });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: "Invalid request", message: err.issues });
  }

  return res.status(500).json({ error: "Internal server error", message: err });
}
